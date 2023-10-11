"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as A from "./index";
import Web3 from "web3";

import logo from "./assets/ethereum.svg";
import Image from "next/image";
import Recipients from "./components/Recipients";

export default function Home() {
  const createWallet = () => {
    const web3 = new Web3();
    const accounts = [];
    for (let i = 0; i < 10; i++) {
      const account = web3.eth.accounts.create();
      accounts.push(account);
    }
    console.log(accounts);
    download(csvMaker(accounts));
  };

  const download = function (data) {
    const blob = new Blob([data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);

    a.setAttribute("download", "wallets.csv");

    a.click();
  };

  const csvMaker = function (data) {
    const csvRows = [];

    const values = Object.values(data).join(",");
    let val = "";
    for (const w of data) {
      val = `${val}${w.privateKey}\n`;
    }
    csvRows.push(val);
    return csvRows.join("\n");
  };

  const loadToken = async () => {};

  return (
    <div className="mx-30 px-30 pt-28">
      <section>
        <div>
          <div className="flex space-between">
            <Image
              src={logo}
              width={30}
              height={30}
              className="img"
              alt="logo"
            />
            <h2 className="mt-8 text-4xl font-light">disperse</h2>
          </div>
          <div></div>
          <p className="pt-8 text-l font-light">
            <i>verb</i> distribute ether or tokens to multiple addresses
          </p>
        </div>
        <div className="button">
          <button className="createWallet" onClick={createWallet}>
            Create Wallet
          </button>
          <button className="buy">buy</button>
          <button className="sell">sell</button>
        </div>
        <div className="button">
          <div className="connectButton">
            {" "}
            <ConnectButton />
          </div>
        </div>
        <div>
          <div className="token">Token Address</div>
          <input
            tile="text"
            placeholder="0x73978a2ce9bd30d0a84471d16f02d32913f88c23"
            className="input"
          />
          <button className="load" onClick={loadToken}>
            load
          </button>
        </div>
        <div>
          <Recipients />
        </div>
      </section>
    </div>
  );
}
