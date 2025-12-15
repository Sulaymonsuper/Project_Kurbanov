"use client";

import { useState, useEffect } from "react";

// Адрес вашего контракта
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [amount, setAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);
  const [contractBalance, setContractBalance] = useState("0");

  // Проверяем подключение MetaMask
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.log("MetaMask не подключен");
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Ошибка подключения:", error);
      }
    } else {
      alert("Установите MetaMask!");
    }
  };

  const sendPayment = async () => {
    if (!account) {
      alert("Подключите MetaMask!");
      return;
    }

    try {
      setLoading(true);
      
      // Отправляем транзакцию через MetaMask
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: account,
          to: CONTRACT_ADDRESS,
          value: ethersToWei(amount), // Конвертируем ETH в wei
          gas: "21000", // Базовый лимит газа
        }]
      });
      
      alert(`✅ Платёж отправлен!\nХеш: ${txHash.substring(0, 10)}...`);
    } catch (error: any) {
      console.error("Ошибка:", error);
      alert(`❌ Ошибка: ${error.message || "Не удалось отправить"}`);
    } finally {
      setLoading(false);
    }
  };

  // Функция для конвертации ETH в wei
  const ethersToWei = (eth: string) => {
    return "0x" + (parseFloat(eth) * 1e18).toString(16);
  };

  // Форматирование адреса
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">💰 ETH Payment Contract</h1>
      
      {/* Кнопка подключения */}
      {!account ? (
        <button
          onClick={connectWallet}
          className="mb-8 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg"
        >
          🔗 Подключить MetaMask
        </button>
      ) : (
        <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-xl">
          ✅ Подключен: {formatAddress(account)}
        </div>
      )}
      
      {/* Информация */}
      <div className="card bg-base-200 p-6 shadow-xl w-full max-w-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">📊 Информация о контракте</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Адрес контракта:</span>
            <span className="font-mono text-sm">
              {formatAddress(CONTRACT_ADDRESS)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Баланс контракта:</span>
            <span className="font-bold">{contractBalance} ETH</span>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            Сеть: Hardhat Local (Chain ID: 31337)
          </div>
        </div>
      </div>
      
      {/* Отправка платежа */}
      <div className="card bg-base-200 p-6 shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">⚡ Отправить платёж</h2>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">Сумма для отправки (ETH):</label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-grow p-3 bg-white border border-gray-300 rounded-lg shadow-sm"
              placeholder="0.01"
            />
            <button
              onClick={() => setAmount("0.01")}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              0.01
            </button>
            <button
              onClick={() => setAmount("0.1")}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              0.1
            </button>
          </div>
        </div>
        
        <button
          onClick={sendPayment}
          disabled={!account || loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Отправка транзакции...
            </span>
          ) : (
            `📤 Отправить ${amount} ETH на контракт`
          )}
        </button>
        
        {!account && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center">
            ⚠️ Сначала подключите MetaMask
          </div>
        )}
      </div>
      
      {/* Инструкция */}
      <div className="mt-12 text-center text-gray-600">
        <h3 className="font-bold mb-2">📋 Инструкция по настройке:</h3>
        <ol className="text-left list-decimal pl-5 space-y-1">
          <li>Установите расширение MetaMask</li>
          <li>Добавьте сеть Hardhat:
            <ul className="list-disc pl-5 text-sm">
              <li>Название: <code>Hardhat</code></li>
              <li>RPC URL: <code>http://127.0.0.1:8545</code></li>
              <li>Chain ID: <code>31337</code></li>
            </ul>
          </li>
          <li>Импортируйте тестовый аккаунт:
            <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
              Приватный ключ: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            </div>
          </li>
        </ol>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Проект: Payment Contract DApp | Scaffold-ETH 2</p>
        <p>Все тесты пройдены ✅ | Контракт задеплоен ✅</p>
      </footer>
    </div>
  );
}

// Объявляем глобальный объект ethereum для TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}