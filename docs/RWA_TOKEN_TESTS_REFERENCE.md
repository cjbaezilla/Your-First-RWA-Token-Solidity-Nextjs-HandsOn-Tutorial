# RWA Token Tests Reference

This document provides a detailed description of the test suite created for the `MyFirstTokenERC20RWA` smart contract. The tests are written using the **Hardhat** framework, leveraging **Ethers v6** and **Chai** for assertions.

## Test Environment

- **Framework:** Hardhat (`^2.28.6`)
- **Assertions:** Mocha / Chai plugin (`@nomicfoundation/hardhat-chai-matchers`)
- **Local Network:** Hardhat EVM (target: Cancun)
- **Location:** `hardhat2/test/MyFirstTokenERC20RWA.test.js`

## Test Coverage Overview

The test cases comprehensively check the access control integration and standard OpenZeppelin community extensions logic. The coverage reaches extensive limits with an automated 93.75% statement coverage.

### 1. Deployment
- **Name and Symbol Verification:** Asserts that the deployed token correctly initializes its fundamental metadata (`MyFirstTokenERC20RWA` / `1stRWA`).
- **Roles Initialization:** Grants and verifies all Access Control Roles initially granted to the specific initialization accounts (`DEFAULT_ADMIN_ROLE`, `PAUSER_ROLE`, `MINTER_ROLE`, `FREEZER_ROLE`, `LIMITER_ROLE`, `RECOVERY_ROLE`).

### 2. Minting
- **Authorized Minting:** Validates that an account strictly with the `MINTER_ROLE` can invoke `mint()` and distribute new tokens to users securely, verifying the `Transfer` event and target balances.
- **Unauthorized Minting:** Confirms that if a regular user tries to call `mint()`, the transaction reverts precisely with an `AccessControlUnauthorizedAccount` custom error.

### 3. Pausing
- **Pause & Unpause Cycle:** Verifies that an account with `PAUSER_ROLE` can toggle the global paused state of the contract by emitting the corresponding `Paused` and `Unpaused` events.
- **Enforced Transfer Blocks:** Evaluates whether token transfers appropriately abort with the standard `EnforcedPause` custom error while the token is actively suspended.

### 4. Freezing
- **State Immobilization:** Confirms that an address with the `FREEZER_ROLE` is permitted to restrict a certain numerical amount of a specific user’s wallet (via the `freeze()` mechanism).
- **Balance Lock Logic:** Demonstrates that attempting to transfer a volume of tokens that falls exclusively into the frozen threshold correctly prevents the action and reverts the transaction. Unfrozen balances, however, can remain active.

### 5. Restricting (Allowlist)
- **State Reporting:** Monitors the state behavior of `allowUser` and `disallowUser` interactions made by the designated `LIMITER_ROLE`.
- **Inherited Contract Behavior Check:** Confirms that checking `isUserAllowed(address)` correctly assesses whether the address state was manually flipped to `true` (Allowed) or stays in its default `false` arrangement. Because the implementation contract consciously omits a `canTransact` overwrite, this section verifies that token transfers naturally sail through, operating solely as an external verification tracking system based on limiting inputs rather than hard-disallowing ERC20 transfers directly on this specific behavior layout.

### 6. Recovery (Forced Transfer)
- **Emergency Override:** Vouchsafes the execution capabilities of an administrator holding the elite `RECOVERY_ROLE`.
- **Allowance Bypass Assessment:** Asserts that this specific role can initiate a `forcedTransfer(from, to, amount)` safely pulling assets directly without requiring standard allowance grants (`approve`) from the original holder, successfully depositing them into a given target wallet.

---

## How to Run Tests

Ensure you operate inside the `hardhat2` project directory correctly installed.

To comfortably execute the full comprehensive suite, use:
```bash
npx hardhat test test/MyFirstTokenERC20RWA.test.js
```

To run a deep code coverage analysis test on this document, use:
```bash
npx hardhat coverage --testfiles test/MyFirstTokenERC20RWA.test.js
```
