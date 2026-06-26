// scripts/test-full-flow.mjs
/**
 * Full end-to-end test script:
 * 1. Admin creates a market and deploys an FPMM
 * 2. Admin seeds the FPMM with initial liquidity
 * 3. Four test wallets are funded with USDC
 * 4. Two wallets buy YES, two buy NO
 * 5. Admin resolves to YES
 * 6. Winners claim, losers get nothing
 *
 * Usage:
 *   node scripts/test-full-flow.mjs
 *
 * Environment variables required:
 *   MONGODB_URI          MongoDB connection string (optional, we skip DB for simplicity)
 *   ADMIN_PRIVATE_KEY    Admin wallet private key
 *   FPMM_FACTORY_ADDRESS Deployed FPMM factory address
 *   RPC_URL              RPC URL (default: https://sepolia.base.org)
 *
 * Optional:
 *   USDC_FAUCET_ENABLED  Set to "true" to use faucet function on USDC (if available)
 */

import { createWalletClient, createPublicClient, http, keccak256, encodePacked, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celoSepolia, baseSepolia } from 'viem/chains';
import { config as dotenvConfig } from 'dotenv';
import {FPMM_FACTORY_ABI} from '@lib/contracts'

dotenvConfig();

// ── Contract addresses (Base Sepolia) ────────────────────────────────────────
// Replace with your actual deployed addresses
const CONTRACT_ADDRESSES = {
  CONDITIONAL_TOKEN: '0x8aeE7E81AEeB6E7B02131F4A000eb892316cd67A', // your CT address
  SIMPLE_RESOLVER: '0x31d977337255CA15f2537CC5652758e5b087Dfa1',    // your resolver
  USDC: '0xb4bfe80FF3d32663F376E52b2C913b7474194d40', // Your test USDC address, must have faucet function or admin holds some
};

// ── ABIs ────────────────────────────────────────────────────────────────────
const PREPARE_CONDITION_ABI = [
  {
    inputs: [
      { name: 'oracle', type: 'address' },
      { name: 'questionId', type: 'bytes32' },
      { name: 'outcomeSlotCount', type: 'uint256' },
    ],
    name: 'prepareCondition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const CONDITIONAL_TOKEN_ABI = [
  {
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'indexSets', type: 'uint256[]' },
    ],
    name: 'redeemPositions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const USDC_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'faucet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const SIMPLE_RESOLVER_ABI = [
  {
    inputs: [
      { name: 'questionId', type: 'bytes32' },
      { name: 'payouts', type: 'uint256[]' },
    ],
    name: 'resolve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// const FPMM_FACTORY_ABI = [
//   {
//     inputs: [
//       { name: 'conditionalTokens', type: 'address' },
//       { name: 'collateralToken', type: 'address' },
//       { name: 'conditionIds', type: 'bytes32[]' },
//       { name: 'fee', type: 'uint256' },
//     ],
//     name: 'createFixedProductMarketMaker',
//     outputs: [{ name: '', type: 'address' }],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, name: 'creator', type: 'address' },
//       { indexed: false, name: 'fixedProductMarketMaker', type: 'address' },
//       { indexed: true, name: 'conditionalTokens', type: 'address' },
//       { indexed: true, name: 'collateralToken', type: 'address' },
//       { indexed: false, name: 'conditionIds', type: 'bytes32[]' },
//       { indexed: false, name: 'fee', type: 'uint256' },
//     ],
//     name: 'FixedProductMarketMakerCreation',
//     type: 'event',
//   },
// ];

const FPMM_ABI = [
  {
    inputs: [
      { name: 'investmentAmount', type: 'uint256' },
      { name: 'outcomeIndex', type: 'uint256' },
      { name: 'minOutcomeTokensToBuy', type: 'uint256' },
    ],
    name: 'buy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'addedFunds', type: 'uint256' },
      { name: 'distributionHint', type: 'uint256[]' },
    ],
    name: 'addFunding',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'investmentAmount', type: 'uint256' },
      { name: 'outcomeIndex', type: 'uint256' },
    ],
    name: 'calcBuyAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ── Helper: derive conditionId ──────────────────────────────────────────────
function deriveConditionId(resolver, questionId, outcomeSlotCount) {
  return keccak256(
    encodePacked(
      ['address', 'bytes32', 'uint256'],
      [resolver, questionId, BigInt(outcomeSlotCount)]
    )
  );
}

function deriveQuestionId(title) {
  return keccak256(encodePacked(['string'], [title]));
}

// ── Wait for tx ──────────────────────────────────────────────────────────────
async function waitForTx(client, hash) {
  console.log(`    ⏳ Waiting for tx ${hash.slice(0, 10)}...`);
  const receipt = await client.waitForTransactionReceipt({ hash });
  console.log(`    ✅ Confirmed at block ${receipt.blockNumber}`);
  return receipt;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
//   const FACTORY_ADDR = process.env.FPMM_FACTORY_ADDRESS;
const FACTORY_ADDR = "0x95cEB195a598f9ad66ff983A59C5573555e9d3AD" //  deployed
  const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';
  const MONGODB_URI = process.env.MONGODB_URI; // optional, we don't use DB here

  if (!PRIVATE_KEY) {
    console.error('❌ ADMIN_PRIVATE_KEY is required');
    process.exit(1);
  }
  if (!FACTORY_ADDR) {
    console.error('❌ FPMM_FACTORY_ADDRESS is required');
    process.exit(1);
  }

  console.log('\n🧪 Starting full flow test...\n');

  // ── Admin wallet ──────────────────────────────────────────────────────────
  const adminAccount = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);
  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http(RPC_URL),
  });
  const adminClient = createWalletClient({
    account: adminAccount,
    chain: celoSepolia,
    transport: http(RPC_URL),
  });

  console.log(`👤 Admin: ${adminAccount.address}`);

  // ── 1. Create market ─────────────────────────────────────────────────────
  const title = 'Test Market: Will YES win?';
  const outcomes = ['Yes', 'No'];
  const questionId = deriveQuestionId(title);
  const conditionId = deriveConditionId(
    CONTRACT_ADDRESSES.SIMPLE_RESOLVER,
    questionId,
    outcomes.length
  );

  console.log(`\n📝 Creating market: "${title}"`);
  console.log(`   conditionId: ${conditionId}`);

  // Check if condition already exists (optional)
  // We'll just send tx

  const prepareHash = await adminClient.writeContract({
    address: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN,
    abi: PREPARE_CONDITION_ABI,
    functionName: 'prepareCondition',
    args: [
      CONTRACT_ADDRESSES.SIMPLE_RESOLVER,
      questionId,
      BigInt(outcomes.length),
    ],
  });
  await waitForTx(publicClient, prepareHash);
  console.log('✅ Market condition prepared');

  // ── 2. Deploy FPMM via factory ──────────────────────────────────────────
  console.log('\n🏭 Deploying FPMM...');
  const factoryClient = adminClient; // admin calls factory

  const fpmmDeployHash = await factoryClient.writeContract({
    address: FACTORY_ADDR,
    abi: FPMM_FACTORY_ABI,
    functionName: 'createFixedProductMarketMaker',
    args: [
      CONTRACT_ADDRESSES.CONDITIONAL_TOKEN,
      CONTRACT_ADDRESSES.USDC,
      [conditionId],
      parseUnits('0.01', 18), // 1% fee
    ],
  });

  const receipt = await waitForTx(publicClient, fpmmDeployHash);

  // Parse event to get FPMM address
  const eventAbi = FPMM_FACTORY_ABI.find((item) => item.name === 'FixedProductMarketMakerCreation');
  const log = receipt.logs.find((l) => l.topics[0] === eventAbi?.topic);
  if (!log) {
    console.error('❌ FPMM creation event not found');
    process.exit(1);
  }
  // Decode manually using viem's decodeEventLog
  const { decodeEventLog } = await import('viem');
  const decoded = decodeEventLog({
    abi: [eventAbi],
    data: log.data,
    topics: log.topics,
  });
  const fpmmAddress = decoded.args.fixedProductMarketMaker;
  console.log(`✅ FPMM deployed at: ${fpmmAddress}`);

  // ── 3. Admin seeds liquidity ────────────────────────────────────────────
  console.log('\n💧 Seeding FPMM with initial liquidity (100 USDC)...');
  const seedAmount = parseUnits('100', 6); // USDC has 6 decimals

  // Approve USDC for FPMM
  await adminClient.writeContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: USDC_ABI,
    functionName: 'approve',
    args: [fpmmAddress, seedAmount],
  });
  console.log('   Approved USDC for FPMM');

  // Add funding
  await adminClient.writeContract({
    address: fpmmAddress,
    abi: FPMM_ABI,
    functionName: 'addFunding',
    args: [seedAmount, []], // empty hint = equal split
  });
  console.log('   Added funding (split equally)');
  console.log('✅ FPMM seeded');

  // ── 4. Generate 4 test wallets ──────────────────────────────────────────
  // We'll use deterministic private keys for reproducibility (do NOT use in production)
  const testWallets = [];
  for (let i = 0; i < 4; i++) {
    // Use a predictable private key for testing
    const pk = `0x${'1'.repeat(64 - 2 - i)}${(i + 1).toString(16).padStart(2, '0')}`; // not secure, just for test
    const account = privateKeyToAccount(pk);
    testWallets.push({
      account,
      client: createWalletClient({
        account,
        chain: baseSepolia,
        transport: http(RPC_URL),
      }),
    });
  }

  // ── 5. Fund wallets with native gas and USDC ────────────────────────────
  console.log('\n💰 Funding test wallets with gas and USDC...');

  // Transfer native gas from admin (need to have enough)
  const gasAmount = parseUnits('0.01', 18); // 0.01 ETH (or CELO)
  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    console.log(`   Funding wallet ${i+1}: ${wallet.account.address}`);
    // Send native
    await adminClient.sendTransaction({
      to: wallet.account.address,
      value: gasAmount,
    });
    console.log(`      Sent ${formatUnits(gasAmount, 18)} native for gas`);

    // Send USDC (we'll mint from faucet if available, otherwise transfer from admin)
    const usdcAmount = parseUnits('100', 6); // 100 USDC each
    // Try faucet if available
    try {
      await wallet.client.writeContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: USDC_ABI,
        functionName: 'faucet',
        args: [wallet.account.address, usdcAmount],
      });
      console.log(`      Minted ${formatUnits(usdcAmount, 6)} USDC via faucet`);
    } catch (e) {
      // If faucet fails, transfer from admin (must have enough USDC)
      console.log(`      Faucet not available, transferring from admin`);
      await adminClient.writeContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [wallet.account.address, usdcAmount],
      });
      console.log(`      Transferred ${formatUnits(usdcAmount, 6)} USDC from admin`);
    }
  }
  console.log('✅ All wallets funded');

  // ── 6. Trade: 2 buy YES, 2 buy NO ──────────────────────────────────────
  console.log('\n📈 Executing trades...');
  // We'll buy 10 USDC each
  const buyAmount = parseUnits('10', 6);
  // Approve USDC for FPMM for each wallet and buy
  const tradeGroups = [
    { walletIndex: 0, outcomeIndex: 0, label: 'YES' },
    { walletIndex: 1, outcomeIndex: 0, label: 'YES' },
    { walletIndex: 2, outcomeIndex: 1, label: 'NO' },
    { walletIndex: 3, outcomeIndex: 1, label: 'NO' },
  ];

  for (const trade of tradeGroups) {
    const wallet = testWallets[trade.walletIndex];
    const client = wallet.client;
    const address = wallet.account.address;
    console.log(`   Wallet ${trade.walletIndex+1} (${address.slice(0,8)}) buying ${trade.label} with 10 USDC`);

    // Approve
    await client.writeContract({
      address: CONTRACT_ADDRESSES.USDC,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [fpmmAddress, buyAmount],
    });

    // Estimate expected outcome tokens (for slippage tolerance)
    const expected = await publicClient.readContract({
      address: fpmmAddress,
      abi: FPMM_ABI,
      functionName: 'calcBuyAmount',
      args: [buyAmount, BigInt(trade.outcomeIndex)],
    });
    const minOutcome = (BigInt(expected) * 995n) / 1000n; // 0.5% slippage

    // Buy
    const txHash = await client.writeContract({
      address: fpmmAddress,
      abi: FPMM_ABI,
      functionName: 'buy',
      args: [buyAmount, BigInt(trade.outcomeIndex), minOutcome],
    });
    await waitForTx(publicClient, txHash);
    console.log(`      Bought ${trade.label} tokens`);
  }

  console.log('✅ All trades executed');

  // ── 7. Admin resolves to YES ────────────────────────────────────────────
  console.log('\n⚖️ Admin resolving market to YES...');
  const payouts = [1n, 0n]; // YES wins

  const resolveHash = await adminClient.writeContract({
    address: CONTRACT_ADDRESSES.SIMPLE_RESOLVER,
    abi: SIMPLE_RESOLVER_ABI,
    functionName: 'resolve',
    args: [questionId, payouts],
  });
  await waitForTx(publicClient, resolveHash);
  console.log('✅ Market resolved to YES');

  // ── 8. Check balances and claim ─────────────────────────────────────────
  console.log('\n💰 Checking redemption...');

  // Helper: get USDC balance
  async function getUSDCBalance(address) {
    const bal = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.USDC,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    return bal;
  }

  // Helper: get outcome token balance (position id)
  async function getOutcomeBalance(address, outcomeIndex) {
    // We need to get the collectionId and positionId
    const collectionId = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN,
      abi: CONDITIONAL_TOKEN_ABI,
      functionName: 'getCollectionId',
      args: [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        conditionId,
        BigInt(1 << outcomeIndex), // indexSet: YES=1, NO=2
      ],
    });
    const positionId = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN,
      abi: CONDITIONAL_TOKEN_ABI,
      functionName: 'getPositionId',
      args: [CONTRACT_ADDRESSES.USDC, collectionId],
    });
    const bal = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN,
      abi: CONDITIONAL_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address, positionId],
    });
    return bal;
  }

  // Redeem for each wallet
  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    const address = wallet.account.address;
    const outcomeIndex = i < 2 ? 0 : 1; // first two bought YES, last two NO
    const label = outcomeIndex === 0 ? 'YES' : 'NO';

    console.log(`\n   Wallet ${i+1} (${address.slice(0,8)}) - bought ${label}`);

    // Check balance before redemption
    const usdcBefore = await getUSDCBalance(address);
    const outcomeBal = await getOutcomeBalance(address, outcomeIndex);
    console.log(`      Outcome token balance: ${formatUnits(outcomeBal, 6)} ${label} tokens`);

    // Redeem
    const redeemHash = await wallet.client.writeContract({
      address: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN,
      abi: CONDITIONAL_TOKEN_ABI,
      functionName: 'redeemPositions',
      args: [
        CONTRACT_ADDRESSES.USDC,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        conditionId,
        [BigInt(1 << outcomeIndex)], // only redeem their side
      ],
    });
    await waitForTx(publicClient, redeemHash);
    console.log(`      Redeemed`);

    // Check USDC after redemption
    const usdcAfter = await getUSDCBalance(address);
    const gained = Number(usdcAfter - usdcBefore) / 1e6;
    console.log(`      USDC gained: ${gained.toFixed(2)}`);

    // Expected: YES holders get ~10 USDC (minus fees), NO holders get 0
    const isYes = outcomeIndex === 0;
    if (isYes) {
      if (gained > 9.5) {
        console.log(`      ✅ YES wallet successfully claimed winnings`);
      } else {
        console.error(`      ❌ YES wallet did not receive expected payout (got ${gained.toFixed(2)})`);
      }
    } else {
      if (gained < 0.01) {
        console.log(`      ✅ NO wallet correctly got nothing`);
      } else {
        console.error(`      ❌ NO wallet unexpectedly received payout (${gained.toFixed(2)})`);
      }
    }
  }

  console.log('\n✅ Test completed');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});