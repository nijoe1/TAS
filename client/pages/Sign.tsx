import { useSignTypedData } from "wagmi";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import { recoverTypedDataAddress, hashTypedData } from "viem";

export const account = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

const Sign = () => {
  // const domain = {
  //   name: "TAS",
  //   version: "0.0.1",
  //   chainId: 80001, // Ethereum chain ID
  //   verifyingContract:
  //     "0x7797761F5dF176c4Df8583f34B656E9f5AF6C740" as `0x${string}`, // Contract address
  // };

  // const message = {
  //   version: 1, // Specify the version
  //   schema:
  //     "0xe038cd96af4cfe0ab2b4b2218a1f3fd3a7c67b65a5de538fa2cf445b9ceab681",
  //   recipient: "0x84656be33Fa1B05eC62D7A059f75C0DE233F1530",
  //   time: "1693961858", // Unix timestamp as a string
  //   expirationTime: 0, // Specify the expiration time
  //   revocable: true, // Specify whether it's revocable or not
  //   refUID:
  //     "0x0000000000000000000000000000000000000000000000000000000000000000",
  //   data: "0xa8293d6629af621d040f5015426cfd80b2fb749092e0ac01f00908d4a8ee6d3900000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000007646973636f72640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000077a616672616e6e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000077z",
  // };

  // const primaryType = "Attest"; // Specify the primary type

  // const types = {
  //   Attest: [
  //     { name: "version", type: "uint16" },
  //     { name: "schema", type: "bytes32" },
  //     { name: "recipient", type: "address" },
  //     { name: "time", type: "uint64" },
  //     { name: "expirationTime", type: "uint64" },
  //     { name: "revocable", type: "bool" },
  //     { name: "refUID", type: "bytes32" },
  //     { name: "data", type: "bytes" },
  //   ],
  // };
  const primaryType = "Mail";

  // All properties on a domain are optional
  const domain = {
    name: "Ether Mail",
    version: "1",
    chainId: 80001,
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  } as const;

  // The named list of all type definitions
  const types = {
    Person: [
      { name: "name", type: "string" },
      { name: "wallet", type: "address" },
    ],
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "string" },
    ],
  } as const;

  const message = {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  } as const;

  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain: domain,
      message: message,
      primaryType: primaryType,
      types: types,
    });
  const sig =
    "0x50ede5188e5d19a1502d541b348536a0efa1d5999437e847d875b91705be44a473c1c1a6ab3fba8b7d79ec801b2f1454a06535d0ca386f5195086e368efce8861c" as `0x${string}`;

  const [address, setAddress] = useState("0x00");
  const recover = async (data: any) => {
    let res = await recoverTypedDataAddress({
      // @ts-ignore
      domain: domain,
      message: message,
      primaryType: primaryType,
      types: types,
      signature: data as `0x${string}`,
    });
    console.log(res);
  };
  return (
    <div
      className={`flex flex-col min-h-screen bg-blue-gray-100 w-full rounded-lg`}
    >
      <Navbar />
      {/* @ts-ignore */}
      <button
        disabled={isLoading}
        onClick={() => {
          signTypedData();
        }}
      >
        Sign typed data
      </button>
      {isSuccess && <div>Signature: {data}</div>}
      {isError && <div>Error signing message</div>}

      <button
        onClick={async () => {
          //   let hash = hashTypedData({
          //     // @ts-ignore
          //     domain,
          //     message,
          //     primaryType: primaryType,
          //     types,
          //     // @ts-ignore
          //   });
          //   console.log(hash);
          //   @ts-ignore
          await recover(data);
        }}
      >
        recover
      </button>
      <div>{address}</div>
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
};

export default Sign;
