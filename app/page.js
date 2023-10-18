"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as A from "./index";
import Web3 from "web3";

import logo from "./assets/ethereum.svg";
import Image from "next/image";
import Recipients from "./components/Recipients";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import contractAbi from "./assets/abi/contract.json";
import contractERC20Abi from "./assets/abi/erc20.json";
import { parseEther } from "ethers/lib/utils";
import erc20Abi from './assets/abi/erc20.json'

export default function Home() {
  const [dataImport, setDataImport] = useState([]);
  const [isSendEther, setIsSendEther] = useState(true)
  const [recipients, setRecipients] = useState()
  const [values, setValues] = useState()
  const [total, setTotal] = useState()

  useEffect(() => {
    
    const _values = dataImport.map((r) => r.amount)
    let _total = 0
    for (let i = 0; i < _values.length; i++) {
      _total += Number(_values[i])
    }
    console.log("_total: ", _total)
    setTotal(_total)

    console.log("values: ", _values)
   
    setValues(_values)
  },[dataImport])

  const { config } = usePrepareContractWrite({
    address: "0xD152f549545093347A162Dce210e7293f1452150",
    abi: contractAbi,
    functionName: "disperseEther",
    args: [
      ["0xdAC17F958D2ee523a2206206994597C13D831ec7"],
      [parseEther("0.001").toString()],
    ],
    value: "1000000000000000",
    //enabled: Boolean(!dataImport),
  });
  const { data, write } = useContractWrite(config);
  //console.log("error", onError);

  const {isLoading, isSuccess} = useWaitForTransaction({hash: data?.hash})


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

  const loadToken = async () => {
    try {
      
      
    } catch (error) {
      
    }
  };

  const handleSetAddresses = (data) => {
    console.log("data", data);
    setDataImport(data);
  };

  const disperseEther = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const disperseContract = new ethers.Contract(
          "0xD152f549545093347A162Dce210e7293f1452150",
          contractAbi,
          signer
        );
        console.log("=======")
        console.log("data import : ", dataImport)

        const recipients = dataImport.map((recipient) => recipient.address);
        const values = dataImport.map((recipient) => parseEther(recipient.amount));

        console.log('++++++++++++')

        console.log("Dispersing ETH now");
        console.log(total);
        const txn = await disperseContract.disperseEther(recipients, values, {
          value: parseEther(total.toString()).toString(),
        });
        
        await txn.wait();

        console.log("txn: ", txn?.hash)
        
        console.log("Completed dispersing ether");
      }
    } catch (error) {
      console.log("error: ", error)
    }
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
        <div className="mt-10"><i>send <u onClick={() => setIsSendEther(true)}>ether</u> or <u onClick={() => setIsSendEther(false)}>token</u></i></div>
        {!isSendEther ?
        (
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
        ) : <div></div>}
        

        <div>
          <Recipients handleSetAddresses={handleSetAddresses} />
        </div>
        <div>
          <button
            className="load"
            onClick={disperseEther}
            style={{ margin: '16px 0px' }}
          >
            {isLoading ? 'sending' : 'send'}
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
