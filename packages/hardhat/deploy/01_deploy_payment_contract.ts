import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "PaymentContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployPaymentContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("PaymentContract", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  const paymentContract = await hre.ethers.getContract("PaymentContract", deployer);

  console.log("🎉 PaymentContract deployed to:", await paymentContract.getAddress());
  console.log("👑 Contract owner:", await paymentContract.owner());
};

export default deployPaymentContract;

// This sets up a tag so you can execute the script via `yarn deploy --tags PaymentContract`
deployPaymentContract.tags = ["PaymentContract"];