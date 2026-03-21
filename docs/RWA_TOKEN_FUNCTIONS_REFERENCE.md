# MyFirstTokenERC20RWA Contract - Public Functions Reference

## Overview

This document provides a detailed reference of all public functions available in the `MyFirstTokenERC20RWA` contract, categorized by their operation type (reading vs writing), with clear indication of which parent contract provides each function.

---

## Inheritance Structure

The `MyFirstTokenERC20RWA` contract inherits from the following OpenZeppelin contracts:

```solidity
contract MyFirstTokenERC20RWA is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC1363,
    ERC20Permit,
    ERC20Freezable,
    ERC20Restricted
```

**Custom Functions:** The contract also implements its own custom functions: `pause()`, `unpause()`, `mint()`, `freeze()`, `isUserAllowed()`, `allowUser()`, `disallowUser()`, `forcedTransfer()`

**Role Constants:** Custom role constants: `PAUSER_ROLE`, `MINTER_ROLE`, `FREEZER_ROLE`, `LIMITER_ROLE`, `RECOVERY_ROLE`

---

## Reading Functions (View/Pure)

These functions read data from the contract without modifying state.

### Token Metadata *(ERC20)*

#### `name() → string`
**Parent:** `ERC20`
Returns the name of the token (e.g., "MyFirstTokenERC20RWA").

#### `symbol() → string`
**Parent:** `ERC20`
Returns the symbol/ticker of the token (e.g., "1stRWA").

#### `decimals() → uint8`
**Parent:** `ERC20`
Returns the number of decimal places the token uses (typically 18 for most ERC20 tokens).

#### `totalSupply() → uint256`
**Parent:** `ERC20`
Returns the total token supply in circulation.

### Balance & Allowance Queries *(ERC20)*

#### `balanceOf(address account) → uint256`
**Parent:** `ERC20`
Returns the token balance of a specific account. Includes both liquid and frozen tokens.

**Parameters:**
- `account`: The address to query balance for

#### `allowance(address owner, address spender) → uint256`
**Parent:** `ERC20`
Returns the remaining allowance that `spender` is approved to spend from `owner`'s account.

**Parameters:**
- `owner`: The token owner address
- `spender`: The address authorized to spend tokens

#### `available(address account) → uint256`
**Parent:** `ERC20Freezable`
Returns the available (liquid/unfrozen) token balance for an account. This excludes any frozen amounts.

**Parameters:**
- `account`: The address to query available balance for

### User Restrictions & Status *(ERC20Restricted / ERC20Freezable)*

#### `canTransact(address account) → bool`
**Parent:** `ERC20Restricted`
Checks if an account is allowed to transact (not restricted/frozen). Returns `true` if the account can perform transactions.

**Parameters:**
- `account`: The address to check

#### `frozen(address account) → uint256`
**Parent:** `ERC20Freezable`
Returns the amount of frozen tokens for an account.

**Parameters:**
- `account`: The address to query frozen amount for

#### `getRestriction(address account) → uint8`
**Parent:** `ERC20Restricted`
Gets the current restriction level for an account. Returns a numeric value representing the `ERC20Restricted.Restriction` enum:
- 0: No restriction
- 1: Restricted (cannot transact)

**Parameters:**
- `account`: The address to query

#### `isUserAllowed(address account) → bool`
**Parent:** `MyFirstTokenERC20RWA` (Custom)
Checks if an account is explicitly allowed to transact (bypasses restrictions). Returns `true` if allowed.

**Parameters:**
- `account`: The address to check

### Access Control & Roles *(AccessControl)*

#### `hasRole(bytes32 role, address account) → bool`
**Parent:** `AccessControl`
Checks if a specific address has a given role.

**Parameters:**
- `role`: The role to check (use role constants like `MINTER_ROLE`, `PAUSER_ROLE`, etc.)
- `account`: The address to check

#### `getRoleAdmin(bytes32 role) → bytes32`
**Parent:** `AccessControl`
Returns the admin role for a given role. Used for role management hierarchy.

**Parameters:**
- `role`: The role to query

#### Role Constants (View Functions)
**Parent:** `MyFirstTokenERC20RWA` (Custom constants)

These are constant getter functions that return role bytes32 values:

- `DEFAULT_ADMIN_ROLE() → bytes32`: The default admin role (0x0000000000000000000000000000000000000000000000000000000000000000) - from `AccessControl`
- `MINTER_ROLE() → bytes32`: Role for token minting authority - Custom
- `PAUSER_ROLE() → bytes32`: Role for pausing/unpausing the contract - Custom
- `FREEZER_ROLE() → bytes32`: Role for freezing/unfreezing accounts - Custom
- `LIMITER_ROLE() → bytes32`: Role for setting transfer limits - Custom
- `RECOVERY_ROLE() → bytes32`: Role for recovering tokens (clawbacks) - Custom

### Pause Status *(ERC20Pausable)*

#### `paused() → bool`
**Parent:** `ERC20Pausable` / `Pausable`
Returns `true` if the contract is currently paused, `false` otherwise.

### EIP-712 Domain *(ERC20Permit)*

#### `DOMAIN_SEPARATOR() → bytes32`
**Parent:** `ERC20Permit`
Returns the EIP-712 domain separator used for typed data hashing (for `permit` function). Computed from `eip712Domain()`.

#### `eip712Domain() → (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)`
**Parent:** `ERC20Permit`
Returns the EIP-712 domain information for signature verification.

### Nonces *(ERC20Permit)*

#### `nonces(address owner) → uint256`
**Parent:** `ERC20Permit`
Returns the current nonce for an address (used in `permit` signature verification to prevent replay attacks).

**Parameters:**
- `owner`: The address to get nonce for

### Interface Support *(ERC165)*

#### `supportsInterface(bytes4 interfaceId) → bool`
**Parent:** `AccessControl` + `ERC1363` (multiple inheritance)
Checks if the contract supports a given interface identifier (following ERC165 standard).

**Parameters:**
- `interfaceId`: The interface ID to check

---

## Writing Functions (State-Changing)

These functions modify contract state and typically require proper authorization/roles.

### Token Transfers *(ERC20)*

#### `transfer(address to, uint256 value) → bool`
**Parent:** `ERC20`
Transfers `value` tokens from the caller's account to `to`. This is the standard ERC20 transfer function.

**Parameters:**
- `to`: The recipient address
- `value`: Amount of tokens to transfer

#### `transferFrom(address from, address to, uint256 value) → bool`
**Parent:** `ERC20`
Transfers `value` tokens from `from` to `to` using an allowance. The caller must have sufficient allowance from `from`.

**Parameters:**
- `from`: The sender address
- `to`: The recipient address
- `value`: Amount of tokens to transfer

### ERC1363 Token Transfer Extensions *(ERC1363)*

#### `transferAndCall(address to, uint256 value) → bool`
**Parent:** `ERC1363`
Transfers tokens and triggers `onTransferReceived` on the recipient if it's a contract. Overload 1 (without data).

**Parameters:**
- `to`: The recipient address
- `value`: Amount of tokens to transfer

#### `transferAndCall(address to, uint256 value, bytes data) → bool`
**Parent:** `ERC1363`
Transfers tokens with additional data payload and triggers `onTransferReceived`.

**Parameters:**
- `to`: The recipient address
- `value`: Amount of tokens to transfer
- `data`: Additional data to pass to recipient

#### `transferFromAndCall(address from, address to, uint256 value) → bool`
**Parent:** `ERC1363`
Transfers tokens from another account using allowance and triggers `onTransferReceived`. Overload 1 (without data).

**Parameters:**
- `from`: The sender address
- `to`: The recipient address
- `value`: Amount of tokens to transfer

#### `transferFromAndCall(address from, address to, uint256 value, bytes data) → bool`
**Parent:** `ERC1363`
Transfers with allowance and data payload.

**Parameters:**
- `from`: The sender address
- `to`: The recipient address
- `value`: Amount of tokens to transfer
- `data`: Additional data to pass to recipient

### Approval & Spending Authorization *(ERC20 + ERC1363 + ERC20Permit)*

#### `approve(address spender, uint256 value) → bool`
**Parent:** `ERC20`
Approves `spender` to spend up to `value` tokens from the caller's account.

**Parameters:**
- `spender`: The address to approve
- `value`: Maximum amount that can be spent

#### `approveAndCall(address spender, uint256 value) → bool`
**Parent:** `ERC1363`
Approves a spender and calls `onApprovalReceived` on the spender contract. Overload 1 (without data).

**Parameters:**
- `spender`: The address to approve
- `value`: Maximum amount that can be spent

#### `approveAndCall(address spender, uint256 value, bytes data) → bool`
**Parent:** `ERC1363`
Approves a spender with additional data and triggers `onApprovalReceived`.

**Parameters:**
- `spender`: The address to approve
- `value`: Maximum amount that can be spent
- `data`: Additional data to pass to spender

#### `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`
**Parent:** `ERC20Permit`
Approves spending using a signed message (EIP-2612). Allows token approvals via off-chain signatures, eliminating the need for an on-chain approval transaction.

**Parameters:**
- `owner`: The token owner who signs the permit
- `spender`: The address to approve
- `value`: The allowance amount
- `deadline`: Timestamp after which the permit expires (0 for no expiry)
- `v`, `r`, `s`: The ECDSA signature components

### Token Minting & Burning *(ERC20Burnable + Custom)*

#### `mint(address to, uint256 amount) → bool`
**Parent:** `MyFirstTokenERC20RWA` (Custom wrapper)
Mints new tokens and assigns them to `to`. Requires `MINTER_ROLE`.

**Parameters:**
- `to`: The recipient address
- `amount`: Amount of tokens to mint

#### `burn(uint256 value) → bool`
**Parent:** `ERC20Burnable`
Burns `value` tokens from the caller's account permanently.

**Parameters:**
- `value`: Amount of tokens to burn

#### `burnFrom(address account, uint256 value) → bool`
**Parent:** `ERC20Burnable`
Burns `value` tokens from `account` using allowance. Caller must have sufficient allowance from `account`.

**Parameters:**
- `account`: The address to burn from
- `value`: Amount of tokens to burn

### Freezing & User Restrictions *(Custom + ERC20Freezable + ERC20Restricted)*

#### `freeze(address account, uint256 amount) → bool`
**Parent:** `MyFirstTokenERC20RWA` (Custom wrapper)
Freezes a specific amount of tokens in an account. Frozen tokens cannot be transferred. Requires `FREEZER_ROLE`.

**Parameters:**
- `account`: The account to freeze
- `amount`: Amount of tokens to freeze

#### `allowUser(address user)`
**Parent:** `MyFirstTokenERC20RWA` (Custom)
Allows a user to transact even if they are restricted. The user is added to an allowlist. Requires `LIMITER_ROLE`.

**Parameters:**
- `user`: The address to allow

#### `disallowUser(address user)`
**Parent:** `MyFirstTokenERC20RWA` (Custom)
Removes a user from the allowlist, restricting them from transacting. Requires `LIMITER_ROLE`.

**Parameters:**
- `user`: The address to disallow

### Recovery & Clawbacks

#### `forcedTransfer(address from, address to, uint256 amount)`
**Parent:** `MyFirstTokenERC20RWA` (Custom)
Allows a permitted authority to forcefully transfer tokens from one account to another, bypassing standard allowances. Essential for RWA tokens to handle legal court orders or lost private keys. Requires `RECOVERY_ROLE`.

**Parameters:**
- `from`: The account to recover tokens from
- `to`: The account receiving the recovered tokens
- `amount`: Amount of tokens to transfer

### Pause Control *(Custom + ERC20Pausable)*

#### `pause()`
**Parent:** `MyFirstTokenERC20RWA` (Custom)
Pauses all token transfers, approvals, minting, and burning. The contract enters a paused state where no state-changing functions can be called. Requires `PAUSER_ROLE`.

#### `unpause()`
**Parent:** `MyFirstTokenERC20RWA` (Custom)
Unpauses the contract, restoring normal operations. Requires `PAUSER_ROLE`.

### Access Control (Roles) *(AccessControl)*

#### `grantRole(bytes32 role, address account)`
**Parent:** `AccessControl`
Grants `role` to `account`. Requires the caller to have the admin role for the given role.

**Parameters:**
- `role`: The role to grant
- `account`: The address to grant the role to

#### `revokeRole(bytes32 role, address account)`
**Parent:** `AccessControl`
Revokes `role` from `account`. Requires the caller to have the admin role for the given role, or be the account being revoked from (if using `renounceRole`).

**Parameters:**
- `role`: The role to revoke
- `account`: The address to revoke the role from

#### `renounceRole(bytes32 role, address callerConfirmation)`
**Parent:** `AccessControl`
Renounces a role from the caller. The `callerConfirmation` parameter is typically used for cross-chain or additional security confirmation. This function allows an account to voluntarily give up a role.

**Parameters:**
- `role`: The role to renounce
- `callerConfirmation`: Confirmation address (usually the caller itself)

---

## Constructor Parameters

When deploying the contract, the constructor takes 6 addresses:

1. `defaultAdmin` - The initial admin with full control over roles (granted `DEFAULT_ADMIN_ROLE`)
2. `pauser` - Address with pausing/unpausing capabilities (granted `PAUSER_ROLE`)
3. `minter` - Address with token minting authority (granted `MINTER_ROLE`)
4. `freezer` - Address with freezing capabilities (granted `FREEZER_ROLE`)
5. `limiter` - Address with transfer limit/user allowlist capabilities (granted `LIMITER_ROLE`)
6. `recoveryAdmin` - Address with forced transfer capabilities for clawbacks (granted `RECOVERY_ROLE`)

The contract also initializes `ERC20` with name "MyFirstTokenERC20RWA" and symbol "1stRWA", and sets up `ERC20Permit` for EIP-2612 support.

---

## Complete Contract Hierarchy

```
MyFirstTokenERC20RWA
├── ERC20 (OpenZeppelin)
│   ├── Context (basic)
│   ├── IERC20 (interface)
│   └── _ERC20Token (internal implementation)
├── ERC20Burnable (OpenZeppelin)
│   └── inherits ERC20
├── ERC20Pausable (OpenZeppelin)
│   ├── inherits ERC20
│   └── Pausable (OpenZeppelin)
│       └── Context
├── AccessControl (OpenZeppelin)
│   ├── IAccessControl (interface)
│   ├── Context
│   └── Enumerable (from AccessControlEnumerable)
├── ERC1363 (OpenZeppelin)
│   └── inherits ERC20
├── ERC20Permit (OpenZeppelin)
│   ├── inherits ERC20
│   └── EIP712 (OpenZeppelin)
├── ERC20Freezable (OpenZeppelin Community)
│   └── inherits ERC20
└── ERC20Restricted (OpenZeppelin Community)
    ├── inherits ERC20
    └── Enumerable (from AccessControlEnumerable)
```

---

## Events

The MyFirstTokenERC20RWA contract emits events from its parent contracts to provide off-chain visibility into state changes. All events are triggered by state-changing functions and are indexed for efficient filtering.

### Standard ERC20 Events

#### Transfer
- **Signature:** `event Transfer(address indexed from, address indexed to, uint256 value)`
- **Triggered by:** `transfer()`, `transferFrom()`, `mint()`, `burn()`, `burnFrom()`, and ERC1363 `transferAndCall()`, `transferFromAndCall()`
- **When:** Whenever tokens move between accounts
  - Normal transfers: `from` is sender, `to` is recipient
  - Minting: `from` is `address(0)`, `to` is minting recipient
  - Burning: `from` is burning address, `to` is `address(0)`

#### Approval
- **Signature:** `event Approval(address indexed owner, address indexed spender, uint256 value)`
- **Triggered by:** `approve()`, `permit()`, and ERC1363 `approveAndCall()`
- **When:** When an allowance is set or updated for a spender
  - Standard `approve()`: emitted with the new allowance value
  - `permit()` signature approval: also emits `Approval` with the approved amount
  - Note: `transferFrom()` does NOT emit `Approval` because it only spends allowance

### Pausable Events

#### Paused
- **Signature:** `event Paused(address account)`
- **Triggered by:** `pause()` function
- **Who:** Only accounts with `PAUSER_ROLE` can trigger this
- **When:** When the contract enters a paused state (all transfers/approvals stopped)

#### Unpaused
- **Signature:** `event Unpaused(address account)`
- **Triggered by:** `unpause()` function
- **Who:** Only accounts with `PAUSER_ROLE` can trigger this
- **When:** When the contract exits a paused state (normal operations resume)

### Access Control Events

#### RoleGranted
- **Signature:** `event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)`
- **Triggered by:** `grantRole()` and constructor initialization
- **When:** When a role is assigned to an account (via `_grantRole()`)
- **Who:** Caller must have admin role for the role being granted

#### RoleRevoked
- **Signature:** `event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)`
- **Triggered by:** `revokeRole()` and `renounceRole()`
- **When:** When a role is removed from an account (via `_revokeRole()`)
- **Who:** Caller must have admin role, or be the account itself when renouncing

#### RoleAdminChanged
- **Signature:** `event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)`
- **Triggered by:** Changes to role administration (via `_setRoleAdmin()`)
- **When:** When the admin role for a specific role is modified
- **Notes:** Does NOT fire for initial role assignments in constructor

### Restriction & Freezing Events

#### UserRestrictionsUpdated
- **Signature:** `event UserRestrictionsUpdated(address indexed account, Restriction restriction)`
- **Triggered by:** `allowUser()`, `disallowUser()` (which call `_allowUser()`, `_resetUser()`)
- **When:** When a user's restriction status changes
- **Who:** Only accounts with `LIMITER_ROLE` can change restrictions
- **Values:** `Restriction.DEFAULT` (0), `Restriction.BLOCKED` (1), `Restriction.ALLOWED` (2)

#### Frozen
- **Signature:** `event Frozen(address indexed account, uint256 amount)`
- **Triggered by:** `freeze()` function
- **Who:** Only accounts with `FREEZER_ROLE` can trigger this
- **When:** When the frozen token amount for an account is set/updated (via `_setFrozen()`)
- **Notes:** Setting `amount` to 0 effectively unfreezes tokens

---

## Notes

- **Restricted Token (RWA) Features**: This contract extends ERC20 with:
  - Account freezing capability (`ERC20Freezable`, `ERC20Restricted`)
  - Pausable functionality (`ERC20Pausable`)
  - Role-based access control (`AccessControl`)
  - User allowlist/disallowlist system (`ERC20Restricted`)
  - ERC1363 transfer-and-call functionality
  - EIP-2612 permit for gasless approvals (`ERC20Permit`)
  - Burnable tokens (`ERC20Burnable`)

- **View vs Nonpayable**: Reading functions (`view`) can be called without a transaction (no gas cost). Writing functions (`nonpayable`) require transactions and gas fees.

- **Role Management**: Always check role assignments using `hasRole()` before calling privileged functions to understand authorization requirements.

- **State Change Events**: All state-changing functions emit events (like `Transfer`, `Approval`, `Frozen`, `Paused`, etc.) that can be monitored off-chain.

- **Function Overrides**: Some functions like `_update()` are internal overrides that combine multiple parent behaviors (pausing, freezing, restrictions).

- **Contract Address**: Deployed at: (to be filled after deployment)

---

*Document generated from compiled artifacts: `MyFirstTokenERC20RWA.json` and source file: `MyFirstTokenERC20RWA.sol`*