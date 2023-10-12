"use client";
import React, { useState } from "react";

function Recipients({ tokenSymbol, handleSetAddresses }) {
  const [file, setFile] = useState();

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
    const csvRows = string.split("\n");
    const array = csvRows.map((i) => {
      const values = i.split(" ");
      return values;
    });

    console.log("array", array);
    const listAdd = array.map((e) => {
      return e[0];
    });
    const listAmount = array.map((e) => {
      return e[1];
    });
    handleSetAddresses([listAdd, listAmount]);
  };
  return (
    <div className="pt-16">
      <h3 className="text-2xl font-light italic">recipients and amounts</h3>
      <p className="pt-3 text-l font-light">
        enter one address and amount in {tokenSymbol} on each line. supports any
        format.
      </p>
      <p className="pt-1 text-l font-light">
        0x2b1F577230F4D72B3818895688b66abD9701B4dC=1.41421
      </p>
      <p className="pt-1 text-l font-light">
        0x2b1F577230F4D72B3818895688b66abD9701B4dC 1.41421
      </p>
      <p className="pt-1 text-l font-light">
        0x2b1F577230F4D72B3818895688b66abD9701B4dC,1.41421
      </p>
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
          IMPORT ADDRESS
        </button>
      </form>
    </div>
  );
}

export default Recipients;
