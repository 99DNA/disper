"use client";
import React, { useState } from "react";
import Web3 from "web3";

function Recipients({ tokenSymbol, handleSetAddresses }) {
  const [file, setFile] = useState();
  const [listAddress, setListAddress] = useState();

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
    console.log("string: ", string);
    const csvRows = string.split("\n");
    csvRows.pop();
    console.log("csv row: ", csvRows);

    const listPubkey = csvRows.map((i) => {
      return i[0];
    });

    const listPubkeyStr = listPubkey.join("\r\n");
    setListAddress(listPubkeyStr);
    console.log("listPubkey: ", listPubkey);

    console.log("listPubkeyStr: ", listPubkeyStr);
  };

  const handleChange = (str) => {
    console.log("input", str);
    setListAddress(str);
    var separateLines = str.split(/\r?\n|\r|\n/g);
    console.log("separateLines", separateLines);

    // const strSplit = e.target.value.toString().split("\n")
    // //console.log("list: ", strSplit)
    // const listRecipients = strSplit.map((i) => {
    //   return {address: i.substring(0, 42), amount: i.substring(43) ? i.substring(43) : "0"}
    // })

    // //console.log("listRecipients: ", listRecipients)

    handleSetAddresses(separateLines.map((e) => e.split(" ")));
  };
  return (
    <div className="pt-8">
      <h3 className="text-2xl font-light italic">recipients and amounts</h3>
      <p className="pt-3 text-l font-light">
        enter one address and amount in {tokenSymbol} on each line. supports any
        format.
      </p>
      <textarea
        style={{
          backgroundColor: "aquamarine",
          padding: "0.5rem",
          borderBottom: "2px solid #111111",
        }}
        rows={5}
        cols={65}
        maxLength={9999}
        value={listAddress}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={
          "0x2b1F577230F4D72B3818895688b66abD9701B4dC 1.41421" +
          "\n" +
          "0x2b1F577230F4D72B3818895688b66abD9701B4dC 1.41421" +
          "\n"
        }
      ></textarea>
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
