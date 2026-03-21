const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MyFirstTokenERC20RWAModule", (m) => {
  const deployer = m.getAccount(0);

  // defaultAdmin, pauser, minter, freezer, limiter, recoveryAdmin
  const token = m.contract("MyFirstTokenERC20RWA", [
    deployer,
    deployer,
    deployer,
    deployer,
    deployer,
    deployer
  ]);

  return { token };
});
