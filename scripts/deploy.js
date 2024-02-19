const { ethers } = require("hardhat");

async function main() {
  const initBalance = ethers.utils.parseEther("1"); // Convert 1 ETH to Wei
  const Assessment = await ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy(initBalance);
  await assessment.deployed();

  console.log(`Contract deployed to address: ${assessment.address}`);
  console.log(`Initial balance: ${initBalance.toString()} wei`);

  // Optionally, you can verify the contract on Etherscan if needed
  await hre.run("verify:verify", {
    address: assessment.address,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
