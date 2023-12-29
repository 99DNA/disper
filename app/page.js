"use client";
import React, { useState, useEffect } from "react";
import Recipients from "./components/Recipients";
import { BoxLoader } from "./components/Loader";

const {
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
import { CSVLink } from "react-csv";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createTransferInstruction } from "@solana/spl-token";
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
  const [loadingToken, setLoadingToken] = useState(false);
  const [errorLoadToken, setErrorLoadToken] = useState("");

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
        setLoadingToken(true);
        setDecimalsToken(0);
        const decimalsToken_ = await getNumberDecimals(tokenAddress);
        setLoadingToken(false);
        setDecimalsToken(decimalsToken_);
      }
    } catch (error) {
      setLoadingToken(false);
      setErrorLoadToken("load fail!");
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
        for (var i = 0; i < dataImport.length; i++) {
          const toPubkey = new PublicKey(dataImport[i][0]);
          if (
            isNaN(dataImport[i][1]) ||
            !PublicKey.isOnCurve(toPubkey.toBytes())
          )
            return;
          transactions.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: toPubkey,
              lamports: new BigNumber(LAMPORTS_PER_SOL)
                .multipliedBy(dataImport[i][1])
                .toString(),
            })
          );
        }
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
          if (
            isNaN(dataImport[i][1]) ||
            !PublicKey.isOnCurve(toPublicKey.toBytes())
          )
            continue;

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
  const [balance, setBalance] = useState(null);

  const fetchBalance = async () => {
    if (publicKey && connection) {
      const balance1 = await connection.getBalance(publicKey);
      setBalance(new BigNumber(balance1).div(LAMPORTS_PER_SOL).toString());
    }
  };

  useEffect(() => {
    try {
      fetchBalance();
    } catch (e) {
      console.log("error", e);
    }
  }, [connection, publicKey]);
  return (
    <div style={{ marginTop: 16 }}>
      Balance: {balance + "SOL"}
      <section className="mx-30 px-30 pt-10">
        <div>
          <div className="flex space-between">
            <h2 className="mt-4 text-4xl font-light mr-1">Solana {"  "}</h2>
            <h2 className="mt-4 text-4xl font-light">disperse</h2>
          </div>
          <div></div>
          <p className="pt-4 text-l font-light">
            <i>verb</i> distribute solana or tokens to multiple addresses
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
            send <u onClick={() => setIsSendEther(true)}>solana</u> or{" "}
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

            {loadingToken ? (
              <BoxLoader />
            ) : decimalsToken !== 0 ? (
              "load success!"
            ) : (
              errorLoadToken
            )}
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
