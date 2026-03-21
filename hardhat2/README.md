# MyFirstTokenERC20RWA - RWA Token Implementation

A production-ready Real World Asset (RWA) token built on Ethereum using OpenZeppelin contracts and Hardhat. This token implements comprehensive compliance features including freezing, restrictions, pausing, and recovery mechanisms suitable for regulated assets.

## Token Overview

- **Name:** MyFirstTokenERC20RWA
- **Symbol:** 1stRWA
- **Standard:** ERC20 with multiple extensions
- **Network:** Sepolia (Testnet)
- **Token Address:** [`0x4E717ea5F91Afd031D6CFbb1165Eee346D11E30D`](https://sepolia.etherscan.io/address/0x4E717ea5F91Afd031D6CFbb1165Eee346D11E30D)

## Features

This RWA token implements enterprise-grade features:

### Core Functionality
- ✅ Standard ERC20 transfers and allowances
- ✅ EIP-2612 Permit (gasless approvals)
- ✅ ERC1363 transfer-and-call functionality
- ✅ Mintable and burnable tokens

### Compliance & Control
- ✅ **Pausable** - Global pause mechanism for emergency stops
- ✅ **Freezable** - Freeze specific amounts in user accounts
- ✅ **Restricted** - User allowlist/disallowlist system
- ✅ **Role-Based Access Control** - Granular permission management
- ✅ **Recovery** - Force transfer capability for legal compliance

### Role System

Six distinct roles with specific permissions:

| Role | Role Hash (keccak256) | Permissions |
|------|----------------------|-------------|
| `DEFAULT_ADMIN_ROLE` | `0x0000000000000000000000000000000000000000000000000000000000000000` | Full system administration, manages all other roles |
| `PAUSER_ROLE` | `keccak256("PAUSER_ROLE")` | `pause()`, `unpause()` - Control contract pause state |
| `MINTER_ROLE` | `keccak256("MINTER_ROLE")` | `mint(address,uint256)` - Create new tokens |
| `FREEZER_ROLE` | `keccak256("FREEZER_ROLE")` | `freeze(address,uint256)` - Freeze/unfreeze token amounts |
| `LIMITER_ROLE` | `keccak256("LIMITER_ROLE")` | `allowUser()`, `disallowUser()` - Manage user restrictions |
| `RECOVERY_ROLE` | `keccak256("RECOVERY_ROLE")` | `forcedTransfer()` - Execute emergency clawbacks |

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Git
- **Sepolia Testnet ETH** - A funded wallet on Sepolia testnet for contract deployment
- **Etherscan API Key** - Required for contract verification (get from https://sepolia.etherscan.io/apis)

## Installation

1. Clone the repository and navigate to `hardhat2` directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   # Required: Your wallet private key (with 0x prefix) for contract deployment
   PRIVATE_KEY=0xYourPrivateKeyHere
   
   # Required: RPC endpoint for Sepolia testnet (Infura, Alchemy, or public RPC)
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   
   # Required: Etherscan API key for contract verification
   # Get from: https://sepolia.etherscan.io/apis
   ETHERSCAN_API_KEY=YourEtherscanAPIKey
   ```
   
   **⚠️ Important:**
   - Your wallet must be **funded with Sepolia testnet ETH** to pay for gas fees
   - Get test ETH from a faucet: https://sepoliafaucet.com/
   - Never share or commit your `.env` file - it contains sensitive keys

## Configuration

The project uses Hardhat with Solidity 0.8.28 and optimizer settings:
- **Solidity Version:** ^0.8.27
- **Optimizer:** Enabled with 200 runs
- **EVM Version:** Cancun

Network configurations are defined in `hardhat.config.js` for localhost and Sepolia testnet.

## Usage

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

With coverage report:
```bash
npx hardhat coverage
```

### Local Development Node
```bash
npx hardhat node
```

### Deploy to Sepolia

1. **Ensure your `.env` file is properly configured** with:
   - `SEPOLIA_RPC_URL` - Your RPC endpoint (Infura, Alchemy, or public RPC)
   - `PRIVATE_KEY` - Your wallet private key (with 0x prefix)
   - `ETHERSCAN_API_KEY` - Your Etherscan API key

2. **Fund your wallet** with Sepolia testnet ETH from a faucet:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://infura.io/faucet/sepolia

3. **Deploy the contract**:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

   The deployment script will output the deployed contract address.

4. **Copy the contract address** from the deployment output.

### Verify Contract on Etherscan

1. **Verify the contract** using the deployed address and constructor arguments:

   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <DEFAULT_ADMIN> <PAUSER> <MINTER> <FREEZER> <LIMITER> <RECOVERY_ADMIN>
   ```

   Replace `<CONTRACT_ADDRESS>` with your deployed contract address and the role addresses with the actual addresses used in deployment.

2. **Alternative method with automatic etherscan** (if configured in `hardhat.config.js`):

   The verify plugin can automatically detect verification when using:

   ```bash
   npx hardhat run scripts/deploy.js --network sepolia --verify
   ```

   Note: This requires proper configuration in `hardhat.config.js`.

### Deploy with Ignition (Alternative)
```bash
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

Generate gas report:
```bash
REPORT_GAS=true npx hardhat test
```

## Project Structure

```
hardhat2/
├── contracts/
│   └── MyFirstTokenERC20RWA.sol    # Main RWA token contract
├── test/
│   └── MyFirstTokenERC20RWA.test.js # Comprehensive test suite
├── ignition/
│   └── modules/                     # Hardhat Ignition deployment modules
├── artifacts/                        # Compiled contract artifacts
├── cache/                            # Hardhat cache
├── coverage/                         # Coverage reports
├── node_modules/                     # Dependencies
├── hardhat.config.js                 # Hardhat configuration
├── package.json                      # Project dependencies
├── .env.example                      # Environment template
└── README.md                         # This file
```

## Contract Architecture

The `MyFirstTokenERC20RWA` contract combines multiple OpenZeppelin components:

```
MyFirstTokenERC20RWA
├── ERC20 (standard token interface)
├── ERC20Burnable (token burning)
├── ERC20Pausable (emergency pause)
├── AccessControl (role management)
├── ERC1363 (transfer-and-call)
├── ERC20Permit (EIP-2612 gasless approvals)
├── ERC20Freezable (balance freezing)
└── ERC20Restricted (user restrictions)
```

### Custom Functions

- `pause()` / `unpause()` - Global pause control (PAUSER_ROLE)
- `mint(address to, uint256 amount)` - Create new tokens (MINTER_ROLE)
- `freeze(address user, uint256 amount)` - Freeze tokens (FREEZER_ROLE)
- `allowUser(address user)` / `disallowUser(address user)` - Manage allowlist (LIMITER_ROLE)
- `forcedTransfer(address from, address to, uint256 amount)` - Emergency recovery (RECOVERY_ROLE)
- `isUserAllowed(address user)` - Check user restriction status

## Documentation

Detailed documentation is available in the `docs/` directory:

- **[RWA_TOKEN_FUNCTIONS_REFERENCE.md](../docs/RWA_TOKEN_FUNCTIONS_REFERENCE.md)** - Complete function reference with inheritance details, events, and usage examples
- **[RWA_TOKEN_TESTS_REFERENCE.md](../docs/RWA_TOKEN_TESTS_REFERENCE.md)** - Test suite documentation with coverage analysis

## Testing

The test suite provides 93.75% statement coverage and validates:

- ✅ Deployment and role initialization
- ✅ Minting with proper access control
- ✅ Pausing/unpausing functionality
- ✅ Freezing logic and balance locks
- ✅ User restriction system
- ✅ Recovery/forced transfers

Run tests:
```bash
npx hardhat test test/MyFirstTokenERC20RWA.test.js
```

## Deployment

The contract has been deployed to Sepolia testnet:

**Contract Address:** [`0x4E717ea5F91Afd031D6CFbb1165Eee346D11E30D`](https://sepolia.etherscan.io/address/0x4E717ea5F91Afd031D6CFbb1165Eee346D11E30D)

**Deployment Transaction:** [`0x925291f1ad358abeed92b694b783ab56eeaa55ed4f7df9e4c5688011ced1e2a1b696772`](https://sepolia.etherscan.io/tx/0x925291f1ad358abeed92b694b783ab56eeaa55ed4f7df9e4c5688011ced1e2a1b696772)

View on Etherscan: https://sepolia.etherscan.io/address/0x4E717ea5F91Afd031D6CFbb1165Eee346D11E30D

## Security Considerations

- ✅ Uses battle-tested OpenZeppelin contracts
- ✅ Role-based access control prevents unauthorized actions
- ✅ All privileged functions emit events for auditability
- ✅ Comprehensive test coverage
- ✅ Pausable for emergency response
- ✅ Recovery mechanism for lost tokens or legal requirements

## Development Scripts

Example deployment script (`scripts/deploy.js`) should initialize the token with appropriate role assignments:

```javascript
const token = await Token.deploy(
  defaultAdmin.address,
  pauser.address,
  minter.address,
  freezer.address,
  limiter.address,
  recoveryAdmin.address
);
```

## Dependencies

### Production
- `@openzeppelin/contracts` ^5.6.1
- `@openzeppelin/community-contracts` (for RWA extensions)

### Development
- `hardhat` ^2.28.6
- `@nomicfoundation/hardhat-toolbox` ^6.1.2
- `@nomicfoundation/hardhat-verify` ^2.1.3
- `solidity-coverage` ^0.8.17
- `typechain` ecosystem for TypeScript bindings

## License

MIT

## Support

For issues, questions, or contributions, please open an issue in the repository.