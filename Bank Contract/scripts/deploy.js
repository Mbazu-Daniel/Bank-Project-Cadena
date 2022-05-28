const  hre  = require("hardhat");

async function main() {

  const [owner] = await hre.ethers.getSigners()

const BankContractFactory = await hre.ethers.getContractFactory('Bank')
const BankContract = await BankContractFactory.deploy()
await BankContract.deployed()

console.log('BankContract deployed to:', BankContract.address)
console.log('BankContract owner address:', owner.address)

}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });