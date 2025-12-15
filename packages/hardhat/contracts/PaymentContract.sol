// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentContract {
    address public owner;
    uint256 public totalReceived;

    // События для отслеживания операций
    event PaymentReceived(address indexed from, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed to, uint256 amount, uint256 timestamp);

    // Модификатор для проверки владельца
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Конструктор: устанавливаем владельца контракта
    constructor() {
        owner = msg.sender;
    }

    // Функция для приема платежей
    receive() external payable {
        totalReceived += msg.value;
        emit PaymentReceived(msg.sender, msg.value, block.timestamp);
    }

    // Функция для вывода средств владельцем
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount, block.timestamp);
    }

    // Функция для получения баланса контракта
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Функция для получения информации о владельце и балансе
    function getContractInfo() external view returns (address, uint256) {
        return (owner, address(this).balance);
    }
}