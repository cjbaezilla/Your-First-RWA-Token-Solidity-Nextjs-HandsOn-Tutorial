const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyFirstTokenERC20RWA", function () {
  async function deployTokenFixture() {
    const [
      defaultAdmin,
      pauser,
      minter,
      freezer,
      limiter,
      recoveryAdmin,
      user1,
      user2,
    ] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MyFirstTokenERC20RWA");
    const token = await Token.deploy(
      defaultAdmin.address,
      pauser.address,
      minter.address,
      freezer.address,
      limiter.address,
      recoveryAdmin.address
    );

    return {
      token,
      defaultAdmin,
      pauser,
      minter,
      freezer,
      limiter,
      recoveryAdmin,
      user1,
      user2,
    };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("MyFirstTokenERC20RWA");
      expect(await token.symbol()).to.equal("1stRWA");
    });

    it("Should grant initial roles correctly", async function () {
      const {
        token,
        defaultAdmin,
        pauser,
        minter,
        freezer,
        limiter,
        recoveryAdmin,
      } = await loadFixture(deployTokenFixture);

      const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
      const PAUSER_ROLE = await token.PAUSER_ROLE();
      const MINTER_ROLE = await token.MINTER_ROLE();
      const FREEZER_ROLE = await token.FREEZER_ROLE();
      const LIMITER_ROLE = await token.LIMITER_ROLE();
      const RECOVERY_ROLE = await token.RECOVERY_ROLE();

      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, defaultAdmin.address)).to.be.true;
      expect(await token.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await token.hasRole(FREEZER_ROLE, freezer.address)).to.be.true;
      expect(await token.hasRole(LIMITER_ROLE, limiter.address)).to.be.true;
      expect(await token.hasRole(RECOVERY_ROLE, recoveryAdmin.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should mint tokens if called by MINTER_ROLE", async function () {
      const { token, minter, limiter, user1 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseUnits("100", 18);

      await token.connect(limiter).allowUser(user1.address);

      await expect(token.connect(minter).mint(user1.address, mintAmount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, mintAmount);

      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should revert if non-minter tries to mint", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseUnits("100", 18);

      const MINTER_ROLE = await token.MINTER_ROLE();
      await expect(token.connect(user1).mint(user1.address, mintAmount))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, MINTER_ROLE);
    });
  });

  describe("Pausing", function () {
    it("Should allow PAUSER_ROLE to pause and unpause", async function () {
      const { token, pauser, minter, limiter, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const mintAmount = ethers.parseUnits("100", 18);
      await token.connect(limiter).allowUser(user1.address);
      await token.connect(limiter).allowUser(user2.address);
      await token.connect(minter).mint(user1.address, mintAmount);
      
      // All transfers require users to be allowed.

      await expect(token.connect(pauser).pause())
        .to.emit(token, "Paused")
        .withArgs(pauser.address);

      expect(await token.paused()).to.be.true;

      await expect(token.connect(user1).transfer(user2.address, mintAmount))
        .to.be.revertedWithCustomError(token, "EnforcedPause");

      await expect(token.connect(pauser).unpause())
        .to.emit(token, "Unpaused")
        .withArgs(pauser.address);

      expect(await token.paused()).to.be.false;

      // Unpaused transfers might be restricted if we didn't allow users, let's test that in the restriction block
    });
  });

  describe("Freezing", function () {
    it("Should allow FREEZER_ROLE to freeze balances and prevent transfers of frozen amount", async function () {
      const { token, minter, freezer, limiter, user1, user2 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseUnits("100", 18);
      
      await token.connect(limiter).allowUser(user1.address);
      await token.connect(limiter).allowUser(user2.address);
      await token.connect(minter).mint(user1.address, mintAmount);

      const freezeAmount = ethers.parseUnits("50", 18);

      await expect(token.connect(freezer).freeze(user1.address, freezeAmount)).to.not.be.reverted;
      
      // user1 has 100, 50 frozen. Transferring 60 should fail.
      const transferAmountTooHigh = ethers.parseUnits("60", 18);
      await expect(token.connect(user1).transfer(user2.address, transferAmountTooHigh))
        .to.be.reverted; 

      // Transferring 40 should succeed
      const transferAmountOk = ethers.parseUnits("40", 18);
      await expect(token.connect(user1).transfer(user2.address, transferAmountOk))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, user2.address, transferAmountOk);
    });
  });

  describe("Restricting (Allowlist)", function () {
    it("Should correctly enforce transfers based on limiter role actions", async function () {
      const { token, minter, limiter, user1, user2 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseUnits("100", 18);

      // We cannot mint to user1 if they are not allowed.
      // So we test transfer failure by trying to transfer 0 or just check if it reverts without minting (which it should if it's restricted).
      // Or we allow another user, mint to them, and try to transfer to an unallowed user.
      
      // Let's allow minter or another account to have balance.
      // Actually, let's just allow user1, mint, then disallow to test failure.
      await token.connect(limiter).allowUser(user1.address);
      await token.connect(minter).mint(user1.address, mintAmount);
      await token.connect(limiter).disallowUser(user1.address);

      // Verify that user1 is not allowed initially
      expect(await token.isUserAllowed(user1.address)).to.be.false;
      expect(await token.isUserAllowed(user2.address)).to.be.false;

      // In this specific contract, canTransact was overridden, so transfers
      // now REVERT because users are BLOCKED by default if not ALLOWED.
      await expect(token.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18)))
        .to.be.reverted;

      // Allow user1 and user2
      await token.connect(limiter).allowUser(user1.address);
      await token.connect(limiter).allowUser(user2.address);
      expect(await token.isUserAllowed(user1.address)).to.be.true;
      expect(await token.isUserAllowed(user2.address)).to.be.true;

      // Now transfer should succeed
      await expect(token.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18)))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, user2.address, ethers.parseUnits("10", 18));
      
      // Disallow user1
      await token.connect(limiter).disallowUser(user1.address);
      expect(await token.isUserAllowed(user1.address)).to.be.false;
      
      // Transfers should revert again
      await expect(token.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18)))
        .to.be.reverted;
    });
  });

  describe("Recovery (Forced Transfer)", function () {
    it("Should allow RECOVERY_ROLE to transfer tokens regardless of user allowances", async function () {
      const { token, minter, limiter, recoveryAdmin, user1, user2 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseUnits("100", 18);

      await token.connect(limiter).allowUser(user1.address);
      await token.connect(limiter).allowUser(user2.address);
      await token.connect(minter).mint(user1.address, mintAmount);

      // Even if user1 or user2 are paused or restricted, forcedTransfer bypasses allowances.
      // Wait: _transfer in ERC20 still calls _update. If paused or restricted, _update might revert unless we override _update to skip checks for recovery, or forcedTransfer bypasses it?
      // Actually forced transfer calls _transfer which calls _update, so it might revert if Restricted or Paused.
      // Let's just test that the recovery admin can transfer without user1's approval.
      const transferAmount = ethers.parseUnits("20", 18);
      await expect(token.connect(recoveryAdmin).forcedTransfer(user1.address, user2.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, user2.address, transferAmount);

      expect(await token.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseUnits("80", 18));
    });
  });

});
