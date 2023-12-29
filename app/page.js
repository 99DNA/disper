"use client";
import React, { useState, useEffect } from "react";
import Recipients from "./components/Recipients";
import { BoxLoader } from "./components/Loader";

import {
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { CSVLink } from "react-csv";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAccount,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMintToInstruction,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { getOrCreateAssociatedTokenAccount } from "./utils/solana/getOrCreateAssociatedTokenAccount";
// import { createTransferInstruction } from "./utils/solana/createTransferInstructions";
import BigNumber from "bignumber.js";
import { base58 } from "ethers/lib/utils";
import * as mpl from "@metaplex-foundation/mpl-token-metadata";

export default function Home() {
  const [dataImport, setDataImport] = useState([]);
  const [isSendEther, setIsSendEther] = useState(true);
  const [values, setValues] = useState();
  const [total, setTotal] = useState();
  const { sendTransaction, publicKey, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();
  const [tokenAddress, setTokenAddress] = useState("");
  const [decimalsToken, setDecimalsToken] = useState(0);
  const [loadingToken, setLoadingToken] = useState(false);
  const [errorLoadToken, setErrorLoadToken] = useState("");
  const [numberCreateWallet, setNumberCreateWallet] = useState(10);
  const [balance, setBalance] = useState(null);
  const [balanceToken, setBalanceToken] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const [nameTokenFill, setNameTokenFill] = useState("");
  const [symbolTokenFill, setSymbolTokenFill] = useState("");
  const [decimalsTokenFill, setDecimalsTokenFill] = useState(9);

  const [uriTokenFill, setUriTokenFill] = useState("");
  const [mintAmountFill, setMintAmountFill] = useState(10000000);
  const [defaultChecked, setDefaultChecked] = useState(false);

  console.log(
    "data token fill",
    nameTokenFill,
    symbolTokenFill,
    decimalsTokenFill,
    uriTokenFill,
    mintAmountFill,
    defaultChecked
  );

  // useEffect(() => {
  //   const _values = dataImport.map((r) => r.amount);
  //   let _total = 0;
  //   for (let i = 0; i < _values.length; i++) {
  //     _total += Number(_values[i]);
  //   }
  //   console.log("_total: ", _total);
  //   setTotal(_total);

  //   console.log("values: ", _values);

  //   setValues(_values);
  // }, [dataImport]);

  const createWallet = (numberCreateWallet_) => {
    const accounts = [];
    for (let i = 0; i < numberCreateWallet_; i++) {
      let keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();
      const secretKey = base58.encode(keypair.secretKey);
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
        const balanceToken_ = await getTokenBalanceWeb3();
        setBalanceToken(balanceToken_);
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
          if (!dataImport[i][1] || !dataImport[i][0]) return;
          const toPubkey = new PublicKey(dataImport[i][0]);
          if (isNaN(dataImport[i][1])) return;
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
  async function getTokenBalanceWeb3() {
    try {
      const associatedToken = await getAssociatedTokenAddress(
        new PublicKey(tokenAddress),
        publicKey
      );
      const tokenAccount = await getAccount(connection, associatedToken);
      const info = await connection.getTokenAccountBalance(
        tokenAccount.address
      );
      if (!info.value.uiAmount) throw new Error("No balance found");
      return info.value.uiAmount;
    } catch {
      return 0;
    }
  }

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

  const createMint = async (event) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }
    try {
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      console.log(" mpl.PROGRAM_ID", mpl.PROGRAM_ID);
      const createMetadataInstruction =
        mpl.createCreateMetadataAccountV3Instruction(
          {
            metadata: PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                mpl.PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
              ],
              mpl.PROGRAM_ID
            )[0],
            mint: mintKeypair.publicKey,
            mintAuthority: publicKey,
            payer: publicKey,
            updateAuthority: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: "abcdef",
                symbol: "abc",
                uri: "uri example",
                creators: null,
                sellerFeeBasisPoints: 0,
                uses: null,
                collection: null,
              },
              isMutable: false,
              collectionDetails: null,
            },
          }
        );
      console.log("createMetadataInstruction", createMetadataInstruction);
      const decimals = 6;
      const associatedToken = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const createNewTokenTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedToken,
          publicKey,
          mintKeypair.publicKey
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          publicKey,
          1000000 * Math.pow(10, decimals)
        ),
        createMetadataInstruction
      );
      const signature = await sendTransaction(
        createNewTokenTransaction,
        connection,
        { signers: [mintKeypair] }
      );
      await connection.confirmTransaction(signature, "confirmed");
      alert("Create mint success!.");
    } catch (e) {
      console.log("create mint fail", e);
    }
  };
  const handleShowCreate = () => {
    setShowCreate(true);
  };
  return (
    <div style={{ marginTop: 16 }}>
      {balance && `Balance: ${balance} SOL`}
      <section className="mx-30 px-30 pt-4">
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
          <CSVLink
            data={createWallet(numberCreateWallet)}
            filename={"wallet.csv"}
            headers={[
              { label: "Public Key", key: "publicKey" },
              { label: "Secret Key", key: "secretKey" },
            ]}
          >
            <button className="createWallet">Create Wallet</button>
          </CSVLink>

          <button className="buy">buy</button>
          <button className="sell">sell</button>
          <button
            className="sell"
            onClick={async (e) => setShowCreate(!showCreate)}
          >
            Show Create Mint
          </button>
        </div>
        {showCreate && (
          <div
            style={{
              alignItems: "center",
              marginTop: 16,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 2,
                background: "aquamarine",
                marginBottom: 32,
              }}
            />
            <div>
              <h5>Fill metadata:</h5>
              <span>Name</span>
              <input
                placeholder="solana"
                className="inputFill"
                value={nameTokenFill}
                onChange={(e) => {
                  setNameTokenFill(e.target.value);
                }}
              />
            </div>
            <div>
              <span>Symbol</span>
              <input
                placeholder="SOL"
                className="inputFill"
                value={symbolTokenFill}
                onChange={(e) => {
                  setSymbolTokenFill(e.target.value);
                }}
              />
            </div>
            <div>
              <span>Decimals</span>
              <input
                type="number"
                placeholder="9"
                className="inputFill"
                value={decimalsTokenFill}
                onChange={(e) => {
                  setDecimalsTokenFill(Number(e.target.value));
                }}
              />
            </div>
            <div>
              <span>Uri</span>

              <input
                placeholder="https://...."
                className="inputFill"
                value={uriTokenFill}
                onChange={(e) => {
                  setUriTokenFill(e.target.value);
                }}
              />
            </div>
            <div>
              <span>Mint amount</span>
              <input
                type="number"
                placeholder="10000000"
                className="inputFill"
                value={mintAmountFill}
                onChange={(e) => {
                  setMintAmountFill(Number(e.target.value));
                }}
              />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  defaultChecked={defaultChecked}
                  onChange={(e) => setDefaultChecked(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Freeze mint
              </label>
            </div>

            <button
              className="sell"
              onClick={async (e) => await createMint(e)}
              style={{ marginTop: 16 }}
            >
              Create Mint
            </button>
            <div
              style={{
                width: "100%",
                height: 2,
                background: "aquamarine",
                marginTop: 32,
              }}
            />
          </div>
        )}

        <div
          className="flex"
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 50,
            marginTop: 16,
          }}
        >
          <h5>Number wallet create:</h5>
          <input
            type="number"
            placeholder="10"
            className="inputCreate"
            value={numberCreateWallet}
            onChange={(e) => {
              setNumberCreateWallet(Number(e.target.value));
              console.log("Number(e.target.value)", Number(e.target.value));
            }}
          />
        </div>

        <div className="mt-6">
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
              placeholder="Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGhKJr"
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
              `load success! \n Balance Token : ${balanceToken}`
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
