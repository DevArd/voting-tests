const Voting = artifacts.require("Voting");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Voting);
};
