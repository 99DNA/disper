"use client";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  UnsafeBurnerWalletAdapter,
  TrustWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import React, { useMemo, useState } from "react";
require("@solana/wallet-adapter-react-ui/styles.css");
const options = [
  { value: "mainnet", label: "Mainnet" },
  { value: "testnet", label: "Testnet" },
];
const Context = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Testnet;
  const [selectedOption, setSelectedOption] = useState(options[0]);

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new UnsafeBurnerWalletAdapter(),
      new TrustWalletAdapter(),
      new MathWalletAdapter(),
      new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
        {/* <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options}
        /> */}
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content = () => {
  return <WalletMultiButton style={{ background: "aquamarine" }} />;
};
function Providers({ children }) {
  return (
    <Context>
      <Content />
      {children}
    </Context>
  );
}

export default Providers;
