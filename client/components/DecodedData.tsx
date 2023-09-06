import React from "react";
import EthereumAddress from "./EthereumAddress";

const DecodedData = ({ decodedData }) => {
  return (
    <div className="flex ">
      {decodedData.map((item, index) => (
        <div className="flex-col flex border text-center rounded-xl p-4 mx-1"key={index}>
          <span className="font-semibold">{item.type.toUpperCase()}</span>
          <span className="font-semibold">{item.name}</span>
          <EthereumAddress address={item.value}/>
        </div>
      ))}
    </div>
  );
};

export default DecodedData;