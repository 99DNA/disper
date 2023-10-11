"use client";

import React from "react";
import {
  getDefaultWallets,
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  polygonMumbai,
  sepolia,
  lineaTestnet,
  mainnet,
  bsc,
  bscTestnet,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const projectId = "31cd2832f46b53f329a3af2404215127";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, sepolia, lineaTestnet, mainnet, bsc, bscTestnet],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "Rainbowkit demo",
  projectId,
  chains,
});

const demoAppInfo = {
  appName: "Rainbowkit demo",
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function Providers({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={demoAppInfo}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default Providers;
