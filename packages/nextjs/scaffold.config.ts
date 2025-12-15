import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const DEFAULT_ALCHEMY_API_KEY = "cR4WnXePioePZ5fFrnSiR";

const scaffoldConfig = {
  // Сети, на которых работает твое DApp
  targetNetworks: [chains.hardhat], // Только локальная сеть Hardhat

  // Интервал опроса RPC (в миллисекундах)
  pollingInterval: 30000,

  // Ключ API Alchemy (можно оставить дефолтный для локальной разработки)
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // Переопределение RPC URL для конкретных сетей
  rpcOverrides: {
    // Пример:
    // [chains.mainnet.id]: "https://mainnet.rpc.buidlguidl.com",
  },

  // Project ID для WalletConnect
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Показывать Burner Wallet только в локальной сети
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
