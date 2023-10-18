"use client";
import React, { useState } from "react";
import Web3 from "web3";

function Recipients({ tokenSymbol, handleSetAddresses }) {
  const [file, setFile] = useState();
  const [listAddress, setListAddress] = useState()


  const fileReader = new FileReader();

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        csvFileToArray(csvOutput);
      };
      fileReader.readAsText(file);
    }
  };
  const csvFileToArray = (string) => {
    // const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const web3 = new Web3()
    console.log("string: ", string)
    //setListAddress(string)
    const csvRows = string.split("\n");
    csvRows.pop()
    console.log("csv row: ", csvRows)
    const listPrivateKey = csvRows.map((i) => {
      const values = i.split(" ");
      return values;
    });
  
    console.log("listPrivateKey: ", listPrivateKey);

    const listPubkey = csvRows.map((i) => {
      console.log("key: ", i)
      const publicKey = web3.eth.accounts.privateKeyToAccount(i)
      return publicKey.address
    })

    const listPubkeyStr = listPubkey.join("\r\n")
    setListAddress(listPubkeyStr)


    console.log("listPubkey: ", listPubkey);
    // const listAdd = array.map((e) => {
    //   return e[0];
    // });
    // const listAmount = array.map((e) => {
    //   return e[1];
    // });
    0x4aB6301bB3d1d5928E0C3e18BDDC2e50fD9504de
    
  };

  const handleChange = (e) => {
    //console.log("input",e.target.value)
    setListAddress(e.target.value)
    const strSplit = e.target.value.toString().split("\n")
    //console.log("list: ", strSplit)
    const listRecipients = strSplit.map((i) => {
      return {address: i.substring(0, 42), amount: i.substring(43) ? i.substring(43) : "0"}
    })

    //console.log("listRecipients: ", listRecipients)

    handleSetAddresses(listRecipients)
  }
    return (
    <div className="pt-16">
      <h3 className="text-2xl font-light italic">recipients and amounts</h3>
      <p className="pt-3 text-l font-light">
        enter one address and amount in {tokenSymbol} on each line. supports any
        format.
      </p>
      <textarea
        style={{ backgroundColor: "aquamarine", padding: '0.5rem', borderBottom: '2px solid #111111'}}
        rows={5}
        cols={65}
        maxLength={9999}
        value={listAddress}
        onChange={handleChange}
        placeholder={"0x2b1F577230F4D72B3818895688b66abD9701B4dC=1.41421" + "\n" + "0x2b1F577230F4D72B3818895688b66abD9701B4dC 1.41421" + "\n" + "0x2b1F577230F4D72B3818895688b66abD9701B4dC,1.41421"}
      >
        
      </textarea>
      <form>
        <input
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
          style={{ marginTop: 16 }}
        />

        <button
          onClick={(e) => {
            handleOnSubmit(e);
          }}
          className="load"
        >
          LOAD ADDRESS
        </button>
      </form>
    </div>
  );
}

export default Recipients;
