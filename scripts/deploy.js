// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
const CrowdFundToken=await ethers.getContractFactory("CrowdFundToken");
const crowdfundtoken=await CrowdFundToken.deploy();
await crowdfundtoken.deployed();

console.log("CrowdFundToken deployed at " + crowdfundtoken.address);

const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
const crowdfunding = await upgrades.deployProxy(CrowdFunding, [crowdfundtoken.address]);
await crowdfunding.deployed();

console.log("Proxy deployed at " + crowdfunding.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
