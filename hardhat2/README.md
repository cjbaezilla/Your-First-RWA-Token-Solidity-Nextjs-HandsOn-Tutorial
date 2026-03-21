# MyFirstTokenERC20RWA - RWA Token Implementation

A production-ready Real World Asset (RWA) token built on Ethereum using OpenZeppelin contracts and Hardhat. This token implements comprehensive compliance features including freezing, restrictions, pausing, and recovery mechanisms suitable for regulated assets.

## Token Overview

- **Name:** MyFirstTokenERC20RWA
- **Symbol:** 1stRWA
- **Standard:** ERC20 with multiple extensions
- **Network:** Sepolia (Testnet)
- **Token Address:** [`0x4AA130C5deBA46C3b1CBd63372567eda2D506aB4`](https://sepolia.etherscan.io/address/0x4AA130C5deBA46C3b1CBd63372567eda2D506aB4)

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
- `DEFAULT_ADMIN_ROLE` - Full system administration
- `PAUSER_ROLE` - Control contract pause state
- `MINTER_ROLE` - Mint new tokens
- `FREEZER_ROLE` - Freeze/unfreeze token amounts
- `LIMITER_ROLE` - Manage user restrictions (allowlist)
- `RECOVERY_ROLE` - Execute forced transfers (clawbacks)

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Git

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
   SEPOLIA_RPC_URL=your_rpc_endpoint
   PRIVATE_KEY=your_private_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

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
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify Contract on Etherscan
```bash
npx hardhat verify --network sepolia <contract_address> <constructor_args>
```

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

**Contract Address:** [`0x4AA130C5deBA46C3b1CBd63372567eda2D506aB4`](https://sepolia.etherscan.io/address/0x4AA130C5deBA46C3b1CBd63372567eda2D506aB4)

**Deployment Transaction:** [`0xc8a5fa41e1f8a5b257fd96457dd1efc530c50b5aa5c252633c2b7e0496139906`](https://sepolia.etherscan.io/tx/0xc8a5fa41e1f8a5b257fd96457dd1efc530c50b5aa5c252633c2b7e0496139906)

View on Etherscan: https://sepolia.etherscan.io/address/0x4AA130C5deBA46C3b1CBd63372567eda2D506aB4

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