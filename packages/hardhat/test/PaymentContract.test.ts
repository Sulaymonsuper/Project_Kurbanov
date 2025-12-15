import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymentContract } from "../typechain-types";

describe("PaymentContract", function () {
  let paymentContract: PaymentContract;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const PaymentContractFactory = await ethers.getContractFactory("PaymentContract");
    paymentContract = await PaymentContractFactory.deploy();
    await paymentContract.waitForDeployment();
  });

  it("Should set the right owner", async function () {
    expect(await paymentContract.owner()).to.equal(owner.address);
  });

  it("Should receive payments and emit event", async function () {
    const tx = await user1.sendTransaction({
      to: await paymentContract.getAddress(),
      value: ethers.parseEther("0.5"),
    });
    await tx.wait();

    expect(await paymentContract.totalReceived()).to.equal(ethers.parseEther("0.5"));
  });

  it("Should allow owner to withdraw", async function () {
    // Сначала отправляем деньги на контракт
    await user1.sendTransaction({
      to: await paymentContract.getAddress(),
      value: ethers.parseEther("1"),
    });

    const initialBalance = await ethers.provider.getBalance(owner.address);
    const withdrawAmount = ethers.parseEther("0.5");

    const tx = await paymentContract.connect(owner).withdraw(withdrawAmount);
    await tx.wait();

    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.gt(initialBalance); // баланс увеличился
  });

  it("Should not allow non-owner to withdraw", async function () {
    await expect(
      paymentContract.connect(user1).withdraw(ethers.parseEther("0.1"))
    ).to.be.revertedWith("Only owner can call this function");
  });
});