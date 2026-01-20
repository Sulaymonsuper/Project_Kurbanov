"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { Address } from "@scaffold-ui/components";
import { useScaffoldContract, useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [paymentAmount, setPaymentAmount] = useState("0.001");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [contractBalance, setContractBalance] = useState("0");
  const [contractOwner, setContractOwner] = useState("");
  const [totalReceived, setTotalReceived] = useState("0");

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const { data: deployedContractData } =
    useDeployedContractInfo("PaymentContract");

  const { data: readContract } = useScaffoldContract({
    contractName: "PaymentContract",
  });

  const { data: writeContract } = useScaffoldContract({
    contractName: "PaymentContract",
    walletClient: walletClient || undefined,
  });

  /** Загрузка данных контракта */
  useEffect(() => {
    const load = async () => {
      if (!readContract) return;
      try {
        const balance = await readContract.read.getBalance();
        const owner = await readContract.read.owner();
        const total = await readContract.read.totalReceived();

        setContractBalance((Number(balance) / 1e18).toFixed(6));
        setTotalReceived((Number(total) / 1e18).toFixed(6));
        setContractOwner(owner as string);
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, [readContract, txHash]);

  /** Отправка платежа */
  const handlePayment = async () => {
    setError("");
    setTxHash("");

    if (!isConnected) {
      setError("Подключите кошелёк");
      return;
    }

    if (!walletClient) {
      setError("MetaMask недоступен");
      return;
    }

    if (+paymentAmount <= 0) {
      setError("Введите корректную сумму");
      return;
    }

    setIsLoading(true);

    try {
      const value = BigInt(Math.floor(+paymentAmount * 1e18));

      const hash = await walletClient.sendTransaction({
        to: deployedContractData?.address as `0x${string}`,
        value,
      });

      setTxHash(hash);
      setPaymentAmount("0.001");
    } catch (e: any) {
      if (e.code === 4001) setError("Транзакция отменена пользователем");
      else if (e.message?.includes("insufficient"))
        setError("Недостаточно средств");
      else setError("Ошибка отправки транзакции");
    } finally {
      setIsLoading(false);
    }
  };

  /** Вывод средств */
  const handleWithdraw = async () => {
    setError("");
    setTxHash("");

    if (!writeContract) {
      setError("Контракт не загружен");
      return;
    }

    if (+withdrawAmount <= 0) {
      setError("Введите сумму для вывода");
      return;
    }

    setIsLoading(true);

    try {
      const value = BigInt(Math.floor(+withdrawAmount * 1e18));
      const hash = await writeContract.write.withdraw([value]);
      setTxHash(hash);
      setWithdrawAmount("");
    } catch (e: any) {
      if (e.message?.includes("Only owner"))
        setError("Только владелец может выводить средства");
      else setError("Ошибка вывода средств");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner =
    connectedAddress &&
    contractOwner &&
    connectedAddress.toLowerCase() === contractOwner.toLowerCase();

  return (
    <div className="flex flex-col items-center pt-10">
      <div className="w-full max-w-2xl px-4">

        <h1 className="text-center mb-10">
          <div className="text-4xl font-bold text-primary">
            Смарт-контракт приёма платежей
          </div>
          <div className="text-sm mt-2">
            {isConnected ? "🟢 Кошелёк подключён" : "🔴 Подключите кошелёк"}
          </div>
        </h1>

        {/* Инфо */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body space-y-2">
            <p><b>Контракт:</b> <Address address={deployedContractData?.address} /></p>
            <p><b>Владелец:</b> <Address address={contractOwner} /></p>
            <p><b>Баланс контракта:</b> {contractBalance} ETH</p>
            <p><b>Всего получено:</b> {totalReceived} ETH</p>
            {connectedAddress && (
              <p>
                <b>Ваш адрес:</b> <Address address={connectedAddress} />
                {isOwner && <span className="badge badge-success ml-2">Владелец</span>}
              </p>
            )}
          </div>
        </div>

        {/* Ошибки */}
        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        {/* Платёж */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-2">Отправить ETH</h2>

            <input
              type="number"
              className="input input-bordered w-full"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              min="0.001"
              step="0.001"
            />

            <button
              className="btn btn-primary mt-4"
              onClick={handlePayment}
              disabled={isLoading || !isConnected}
            >
              {isLoading ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </div>

        {/* Вывод */}
        {isOwner && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-2">Вывод средств</h2>

              <input
                type="number"
                className="input input-bordered w-full"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                max={contractBalance}
              />

              <button
                className="btn btn-success mt-4"
                onClick={handleWithdraw}
                disabled={isLoading}
              >
                Вывести
              </button>
            </div>
          </div>
        )}

        {txHash && (
          <div className="mt-6 text-sm text-center">
            ✅ Транзакция отправлена  
            <div className="font-mono break-all">{txHash}</div>
          </div>
        )}
      </div>
    </div>
  );
}
