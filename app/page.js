"use client";
import React, { useState, useEffect } from "react";

import logo from "./assets/ethereum.svg";
import Image from "next/image";
import Recipients from "./components/Recipients";

const {
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
import { CSVLink } from "react-csv";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  // getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  //   getAccount,
  //   createAssociatedTokenAccount,
  //   getAssociatedTokenAddressSync,
  //createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { getOrCreateAssociatedTokenAccount } from "./utils/solana/getOrCreateAssociatedTokenAccount";
// import { createTransferInstruction } from "./utils/solana/createTransferInstructions";
import BigNumber from "bignumber.js";
export default function Home() {
  const [dataImport, setDataImport] = useState([]);
  const [isSendEther, setIsSendEther] = useState(true);
  const [values, setValues] = useState();
  const [total, setTotal] = useState();
  const { sendTransaction, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [tokenAddress, setTokenAddress] = useState("");
  const [decimalsToken, setDecimalsToken] = useState(0);

  useEffect(() => {
    const _values = dataImport.map((r) => r.amount);
    let _total = 0;
    for (let i = 0; i < _values.length; i++) {
      _total += Number(_values[i]);
    }
    console.log("_total: ", _total);
    setTotal(_total);

    console.log("values: ", _values);

    setValues(_values);
  }, [dataImport]);

  const createWallet = () => {
    const accounts = [];
    for (let i = 0; i < 10; i++) {
      let keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();
      const secretKey = keypair.secretKey;
      // console.log("bs58.encode", bs58.encode(secretKey));
      accounts.push({ publicKey, secretKey });
    }
    return accounts;
  };
  const loadToken = async () => {
    try {
      if (tokenAddress) {
        const decimalsToken_ = await getNumberDecimals(tokenAddress);
        setDecimalsToken(decimalsToken_);
      }
    } catch (error) {
      console.log("error loadToken", error);
    }
  };

  const handleSetAddresses = (data) => {
    console.log("data", data);
    setDataImport(data);
  };

  const disperseEther = async () => {
    if (!publicKey) alert("Please connect wallet.");
    try {
      let transactions = new Transaction();
      if (isSendEther) {
        dataImport.map((e) => {
          transactions.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey(e[0]),
              lamports: new BigNumber(LAMPORTS_PER_SOL)
                .multipliedBy(e[1])
                .toString(),
            })
          );
        });
      } else {
        // const associatedToken = getAssociatedTokenAddressSync(mint, publicKey);
        // const associatedTokenTo = getAssociatedTokenAddressSync(
        //   mint,
        //   toPublicKey
        // );

        // try {
        //   const fromTokenAccount = await getAccount(
        //     connection,
        //     associatedToken
        //   );
        //   console.log(
        //     "fromTokenAccount",
        //     fromTokenAccount.address.toString(),
        //     publicKey.toString()
        //   );
        // } catch {
        //   transactions.add(
        //     createAssociatedTokenAccountInstruction(
        //       publicKey,
        //       associatedToken,
        //       publicKey,
        //       mint
        //     )
        //   );
        // }

        // try {
        //   const toTokenAccount = await getAccount(
        //     connection,
        //     associatedTokenTo
        //   );
        // } catch {
        //   transactions.add(
        //     createAssociatedTokenAccountInstruction(
        //       publicKey,
        //       associatedTokenTo,
        //       toPublicKey,
        //       mint
        //     )
        //   );
        // }
        // console.log("transactions", transactions);
        // const fromTokenAccount = await getAccount(connection, associatedToken);
        // console.log("fromTokenAccount", fromTokenAccount);
        // const toTokenAccount = await getAccount(connection, associatedTokenTo);
        for (var i = 0; i < dataImport.length; i++) {
          const toPublicKey = new PublicKey(dataImport[i][0]);
          const mint = new PublicKey(tokenAddress);
          const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            publicKey,
            mint,
            publicKey,
            signTransaction
          );
          console.log(
            "fromTokenAccount",
            fromTokenAccount,
            toPublicKey.toString()
          );
          const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            publicKey,
            mint,
            toPublicKey,
            signTransaction
          );
          console.log("toTokenAccount", toTokenAccount);

          transactions.add(
            createTransferInstruction(
              fromTokenAccount.address, // source
              toTokenAccount.address, // dest
              publicKey,
              new BigNumber(10)
                .exponentiatedBy(decimalsToken)
                .multipliedBy(dataImport[i][1])
                .toString(),
              []
            )
          );
        }
      }
      console.log("send transaction");
      const signature = await sendTransaction(transactions, connection);
      await connection.confirmTransaction(signature, "processed");
      alert("Completed dispersing coins/tokens");
    } catch (error) {
      console.log("error: ", error);
    }
  };
  const handleChangeToken = (text) => {
    setTokenAddress(text);
  };
  async function getNumberDecimals(mintAddress) {
    const info = await connection.getParsedAccountInfo(
      new PublicKey(mintAddress)
    );
    console.log("info", info);
    const result = (info.value?.data).parsed.info.decimals;
    return result;
  }
  return (
    <div className="mx-30 px-30 pt-20">
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
          <CSVLink data={createWallet()} filename={"wallet.csv"}>
            <button className="createWallet">Create Wallet</button>
          </CSVLink>

          <button className="buy">buy</button>
          <button className="sell">sell</button>
        </div>
        <div className="mt-10">
          <i>
            send <u onClick={() => setIsSendEther(true)}>ether</u> or{" "}
            <u onClick={() => setIsSendEther(false)}>token</u>
          </i>
        </div>
        {!isSendEther ? (
          <div>
            <div className="token">Token Address</div>
            <input
              tile="text"
              placeholder="0x73978a2ce9bd30d0a84471d16f02d32913f88c23"
              className="input"
              onChange={(e) => handleChangeToken(e.target.value)}
            />
            <button
              className="load"
              onClick={loadToken}
              style={{ marginBottom: 10, display: "flex" }}
            >
              load
            </button>
            {decimalsToken !== 0 && "load success!"}
          </div>
        ) : (
          <div></div>
        )}

        <div>
          <Recipients handleSetAddresses={handleSetAddresses} />
        </div>
        <div>
          <button
            className="load"
            onClick={disperseEther}
            style={{ margin: "16px 0px" }}
          >
            {"send"}
          </button>
          {/* {isSuccess && (
            <div>
              Successfully send ETH
              <div>
                <a href="">{data?.hash}</a>
              </div>
            </div>
          )} */}
        </div>
      </section>
    </div>
  );
}
