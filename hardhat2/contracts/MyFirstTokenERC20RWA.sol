// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.6.0 and Community Contracts commit b0ddd27
pragma solidity ^0.8.27;

import {ERC20Freezable} from "@openzeppelin/community-contracts/contracts/token/ERC20/extensions/ERC20Freezable.sol";
import {ERC20Restricted} from "@openzeppelin/community-contracts/contracts/token/ERC20/extensions/ERC20Restricted.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC1363} from "@openzeppelin/contracts/token/ERC20/extensions/ERC1363.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MyFirstTokenERC20RWA is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC1363, ERC20Permit, ERC20Freezable, ERC20Restricted {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");
    bytes32 public constant LIMITER_ROLE = keccak256("LIMITER_ROLE");
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");

    constructor(address defaultAdmin, address pauser, address minter, address freezer, address limiter, address recoveryAdmin)
        ERC20("MyFirstTokenERC20RWA", "1stRWA")
        ERC20Permit("MyFirstTokenERC20RWA")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(FREEZER_ROLE, freezer);
        _grantRole(LIMITER_ROLE, limiter);
        _grantRole(RECOVERY_ROLE, recoveryAdmin);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function freeze(address user, uint256 amount) public onlyRole(FREEZER_ROLE) {
        _setFrozen(user, amount);
    }

    function isUserAllowed(address user) public view returns (bool) {
        return getRestriction(user) == Restriction.ALLOWED;
    }

    function allowUser(address user) public onlyRole(LIMITER_ROLE) {
        _allowUser(user);
    }

    function disallowUser(address user) public onlyRole(LIMITER_ROLE) {
        _resetUser(user);
    }

    function forcedTransfer(address from, address to, uint256 amount) public onlyRole(RECOVERY_ROLE) {
        _transfer(from, to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable, ERC20Freezable, ERC20Restricted)
    {
        super._update(from, to, value);
    }

    function canTransact(address user) public view override returns (bool) {
        return getRestriction(user) == Restriction.ALLOWED;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC1363)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}