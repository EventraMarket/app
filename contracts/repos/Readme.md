1. collateral-token-CTF repo: https://github.com/gnosis/conditional-tokens-contracts.git
2. CTF-EXchange repo: https://github.com/Polymarket/ctf-exchange.git
3. Neg-Cft: https://github.com/Polymarket/neg-risk-ctf-adapter.git
4. Mock USDC /MockUSDC.sol
5. SimpleResolver.sol
6. FPMM: https://github.com/gnosis/conditional-tokens-market-makers.git


celo faucet link for usdc: https://faucet.circle.com/
Celo faucet  for CELO: 
Celo docs: 
Your first milestones:

Set up your dev environment and deploy a contract to Alfajores (testnet) this week
Get a working Mini App rendering inside the MiniPay test page
Deploy to Celo Mainnet and prep for the grant + distribution review
Everything you need to start building:

Smart contracts & deployment

Celo build quickstart → https://docs.celo.org/build/quickstart
Celo Composer starter kit (MiniPay template) → https://github.com/celo-org/celo-composer
MiniPay project template → https://github.com/celo-org/minipay-template
Alfajores testnet overview → https://docs.celo.org/network/alfajores
Testnet faucet (fund your deploy wallet) → https://faucet.celo.org
Going live on MiniPay

Build on MiniPay — quickstart → https://docs.celo.org/build/build-on-minipay/quickstart
MiniPay code library (sign, transact, fee abstraction, SocialConnect) → https://docs.celo.org/build/build-on-minipay/code-library
Deploying on MiniPay (full docs) → https://docs.minipay.xyz/
Go deeper on Celo

Celopedia — explore verticals & ecosystem → https://celopedia.celo.org
Two quick technical notes that trip up most teams: MiniPay only accepts legacy transactions (no EIP-1559), and it uses fee abstraction — so use viem or wagmi, which support setting feeCurrency natively. Build for mobile-first from the start.

Minipay doc: https://docs.celo.org/build-on-celo/build-on-minipay/quickstart#helpful-tips-to-make-your-mini-app-minipay-compatible