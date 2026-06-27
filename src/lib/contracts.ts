// Contract ABIs for Conditional Token Finance protocol
import { celo, baseSepolia, celoSepolia } from "wagmi/chains";

export const CONDITIONAL_TOKEN_ABI = [
  {
    inputs: [
      { name: "oracle", type: "address" },
      { name: "questionId", type: "bytes32" },
      { name: "outcomeSlotCount", type: "uint256" },
    ],
    name: "prepareCondition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "oracle", type: "address" },
      { name: "questionId", type: "bytes32" },
      { name: "outcomeSlotCount", type: "uint256" },
    ],
    name: "getConditionId",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { name: "collateralToken", type: "address" },
      { name: "parentCollectionId", type: "bytes32" },
      { name: "conditionId", type: "bytes32" },
      { name: "partition", type: "uint256[]" },
      { name: "amount", type: "uint256" },
    ],
    name: "splitPosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "collateralToken", type: "address" },
      { name: "parentCollectionId", type: "bytes32" },
      { name: "conditionId", type: "bytes32" },
      { name: "partition", type: "uint256[]" },
      { name: "amount", type: "uint256" },
    ],
    name: "mergePositions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "collateralToken", type: "address" },
      { name: "parentCollectionId", type: "bytes32" },
      { name: "conditionId", type: "bytes32" },
      { name: "indexSets", type: "uint256[]" },
    ],
    name: "redeemPositions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "parentCollectionId", type: "bytes32" },
      { name: "conditionId", type: "bytes32" },
      { name: "indexSet", type: "uint256" },
    ],
    name: "getCollectionId",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "collateralToken", type: "address" },
      { name: "collectionId", type: "bytes32" },
    ],
    name: "getPositionId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "accounts", type: "address[]" },
      { name: "ids", type: "uint256[]" },
    ],
    name: "balanceOfBatch",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "conditionId", type: "bytes32" },
      { name: "index", type: "uint256" },
    ],
    name: "payoutNumerators",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "conditionId", type: "bytes32" }],
    name: "payoutDenominator",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const CTF_EXCHANGE_ABI = [
  {
    inputs: [
      { name: "token1", type: "uint256" },
      { name: "token2", type: "uint256" },
      { name: "conditionId", type: "bytes32" },
    ],
    name: "registerToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "isRegistered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { name: "salt", type: "uint256" },
          { name: "maker", type: "address" },
          { name: "signer", type: "address" },
          { name: "taker", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "makerAmount", type: "uint256" },
          { name: "takerAmount", type: "uint256" },
          { name: "expiration", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "feeRateBps", type: "uint256" },
          { name: "side", type: "uint8" },
          { name: "signatureType", type: "uint8" },
          { name: "signature", type: "bytes" },
        ],
        name: "order",
        type: "tuple",
      },
      { name: "fillAmount", type: "uint256" },
    ],
    name: "fillOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { name: "salt", type: "uint256" },
          { name: "maker", type: "address" },
          { name: "signer", type: "address" },
          { name: "taker", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "makerAmount", type: "uint256" },
          { name: "takerAmount", type: "uint256" },
          { name: "expiration", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "feeRateBps", type: "uint256" },
          { name: "side", type: "uint8" },
          { name: "signatureType", type: "uint8" },
          { name: "signature", type: "bytes" },
        ],
        name: "order",
        type: "tuple",
      },
    ],
    name: "cancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const USDC_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner_",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "FAUCET_LIMIT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "faucet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const;

export const SIMPLE_RESOLVER_ABI = [
  // resolve(questionId, payouts) — matches the deployed SimpleResolver contract
  // payouts = [1e18, 0] for Yes wins, [0, 1e18] for No wins
  {
    inputs: [
      { name: "questionId", type: "bytes32" },
      { name: "payouts", type: "uint256[]" },
    ],
    name: "resolve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const FPMM_FACTORY_ABI = [
	{
		"constant": true,
		"inputs": [],
		"name": "implementationMaster",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "conditionalTokens",
				"type": "address"
			},
			{
				"name": "collateralToken",
				"type": "address"
			},
			{
				"name": "conditionIds",
				"type": "bytes32[]"
			},
			{
				"name": "fee",
				"type": "uint256"
			}
		],
		"name": "createFixedProductMarketMaker",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "consData",
				"type": "bytes"
			}
		],
		"name": "cloneConstructor",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "fixedProductMarketMaker",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "conditionalTokens",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "collateralToken",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "conditionIds",
				"type": "bytes32[]"
			},
			{
				"indexed": false,
				"name": "fee",
				"type": "uint256"
			}
		],
		"name": "FixedProductMarketMakerCreation",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "funder",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amountsAdded",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"name": "sharesMinted",
				"type": "uint256"
			}
		],
		"name": "FPMMFundingAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "funder",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amountsRemoved",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"name": "collateralRemovedFromFeePool",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "sharesBurnt",
				"type": "uint256"
			}
		],
		"name": "FPMMFundingRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "investmentAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "feeAmount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "outcomeIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "outcomeTokensBought",
				"type": "uint256"
			}
		],
		"name": "FPMMBuy",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "returnAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "feeAmount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "outcomeIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "outcomeTokensSold",
				"type": "uint256"
			}
		],
		"name": "FPMMSell",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "target",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "clone",
				"type": "address"
			}
		],
		"name": "CloneCreated",
		"type": "event"
	}
] as const
export const FPMM_ABI =[
	{
		"constant": true,
		"inputs": [
			{
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "spender",
				"type": "address"
			},
			{
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "account",
				"type": "address"
			}
		],
		"name": "withdrawFees",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "account",
				"type": "address"
			}
		],
		"name": "feesWithdrawableBy",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "sender",
				"type": "address"
			},
			{
				"name": "recipient",
				"type": "address"
			},
			{
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "spender",
				"type": "address"
			},
			{
				"name": "addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseAllowance",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "investmentAmount",
				"type": "uint256"
			},
			{
				"name": "outcomeIndex",
				"type": "uint256"
			},
			{
				"name": "minOutcomeTokensToBuy",
				"type": "uint256"
			}
		],
		"name": "buy",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "returnAmount",
				"type": "uint256"
			},
			{
				"name": "outcomeIndex",
				"type": "uint256"
			}
		],
		"name": "calcSellAmount",
		"outputs": [
			{
				"name": "outcomeTokenSellAmount",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "conditionalTokens",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "collectedFees",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "spender",
				"type": "address"
			},
			{
				"name": "subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseAllowance",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "recipient",
				"type": "address"
			},
			{
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "collateralToken",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "operator",
				"type": "address"
			},
			{
				"name": "from",
				"type": "address"
			},
			{
				"name": "ids",
				"type": "uint256[]"
			},
			{
				"name": "values",
				"type": "uint256[]"
			},
			{
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "onERC1155BatchReceived",
		"outputs": [
			{
				"name": "",
				"type": "bytes4"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "returnAmount",
				"type": "uint256"
			},
			{
				"name": "outcomeIndex",
				"type": "uint256"
			},
			{
				"name": "maxOutcomeTokensToSell",
				"type": "uint256"
			}
		],
		"name": "sell",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "addedFunds",
				"type": "uint256"
			},
			{
				"name": "distributionHint",
				"type": "uint256[]"
			}
		],
		"name": "addFunding",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "conditionIds",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "owner",
				"type": "address"
			},
			{
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "fee",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "sharesToBurn",
				"type": "uint256"
			}
		],
		"name": "removeFunding",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "operator",
				"type": "address"
			},
			{
				"name": "from",
				"type": "address"
			},
			{
				"name": "id",
				"type": "uint256"
			},
			{
				"name": "value",
				"type": "uint256"
			},
			{
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "onERC1155Received",
		"outputs": [
			{
				"name": "",
				"type": "bytes4"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "investmentAmount",
				"type": "uint256"
			},
			{
				"name": "outcomeIndex",
				"type": "uint256"
			}
		],
		"name": "calcBuyAmount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "funder",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amountsAdded",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"name": "sharesMinted",
				"type": "uint256"
			}
		],
		"name": "FPMMFundingAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "funder",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amountsRemoved",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"name": "collateralRemovedFromFeePool",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "sharesBurnt",
				"type": "uint256"
			}
		],
		"name": "FPMMFundingRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "investmentAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "feeAmount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "outcomeIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "outcomeTokensBought",
				"type": "uint256"
			}
		],
		"name": "FPMMBuy",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "returnAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "feeAmount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "outcomeIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "outcomeTokensSold",
				"type": "uint256"
			}
		],
		"name": "FPMMSell",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	}
] as const

export const CONTRACT_ADDRESSES = {
	
[celo.id]: {
    CONDITIONAL_TOKEN: "0xf9d6ac744f7489153ea95ebb3bc3c31de9fb652e", // To be deployed
    USDC: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",             // To be deployed
    CTF_EXCHANGE: "",     // To be deployed
    SIMPLE_RESOLVER: "0x619D9A2bA74F47988CeA600CD2d012FB91D94E08", 
	FPMMFACTORY: "0x7aD3FF9348e33229b4b338CAE3622aCbBCA9811D" // To be deployed
  },
  [celoSepolia.id]: {
    CONDITIONAL_TOKEN: "0x8aeE7E81AEeB6E7B02131F4A000eb892316cd67A", // To be deployed
    USDC: "0xb4bfe80FF3d32663F376E52b2C913b7474194d40",             // To be deployed
    CTF_EXCHANGE: "0xf04EFE45801D6e59775a26BBdf643Cc2529B7d1a",     // To be deployed
    SIMPLE_RESOLVER: "0x31d977337255CA15f2537CC5652758e5b087Dfa1", 
	FPMMFACTORY: "0x95cEB195a598f9ad66ff983A59C5573555e9d3AD" // To be deployed
  },

[baseSepolia.id]: {
    CONDITIONAL_TOKEN: "0xEf457f01CBF71EBd9DF6f00dC6862B830dC187CD",
    USDC: "0x390BF67966Eb8afcA25D7515441a77AE6CD4E039",
    CTF_EXCHANGE: "0xb6f367f54856856Dec71D92802A9d194Dfde77aB",
    SIMPLE_RESOLVER: "0x14E2Da779C2d497271B0e873397Dbd6927db70f9",
	FPMMFACTORY: "0xf7aF17a6e8230bb692b57485994332f7DFbC2290"
  },
  
}

export function getContracts(chainId: number | undefined) {
  if (chainId === celo.id) {
    return CONTRACT_ADDRESSES[celo.id];
  }
     if (chainId === celoSepolia.id) {
    return CONTRACT_ADDRESSES[celoSepolia.id];
  }
  if (chainId === baseSepolia.id) {
    return CONTRACT_ADDRESSES[baseSepolia.id];
  }
  // Default to celo mainnet
  return CONTRACT_ADDRESSES[celo.id];
}