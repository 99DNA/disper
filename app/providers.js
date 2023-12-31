"use client";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  ConnectionContextState,
  useWallet,
  useConnection,
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
import React, { useMemo, useState, useEffect } from "react";
require("@solana/wallet-adapter-react-ui/styles.css");
import Select from "react-select";

const options = [
  { value: "mainnet-beta", label: "Mainnet" },
  { value: "testnet", label: "Testnet" },
  { value: "devnet", label: "Devnet" },
];

const Context = ({ children, endpoint }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.

  const wallets = useMemo(
    () => [
      new UnsafeBurnerWalletAdapter(),
      new TrustWalletAdapter(),
      new MathWalletAdapter(),
      new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint]
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

function Providers({ children }) {
  const [selectedOption, setSelectedOption] = useState(options[2]);

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(
    () => clusterApiUrl(selectedOption.value),
    [selectedOption]
  );

  return (
    <Context endpoint={endpoint}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <WalletMultiButton
          style={{
            background: "aquamarine",
            boxShadow: "6px 6px crimson",
            color: "black",
          }}
        />
        <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options}
        />
      </div>
      {children}
    </Context>
  );
}

export default Providers;
