import { ethers } from "hardhat";

async function main() {
  const PromrawERC7007 = await ethers.getContractFactory("PromrawERC7007");
  const promraw = await PromrawERC7007.deploy();
  await promraw.waitForDeployment();

  console.log("PromrawERC7007 deployed to:", await promraw.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });