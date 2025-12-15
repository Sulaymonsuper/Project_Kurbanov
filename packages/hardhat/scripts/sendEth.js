const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // ваш адрес
  const amount = hre.ethers.parseEther("100"); // 100 ETH
  
  console.log(`Отправка ${hre.ethers.formatEther(amount)} ETH на ${recipient}`);
  
  const tx = await signer.sendTransaction({
    to: recipient,
    value: amount,
  });
  
  await tx.wait();
  console.log(`✅ Успешно! Хеш транзакции: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});