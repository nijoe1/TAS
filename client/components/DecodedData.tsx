import React from "react";
import EthereumAddress from "./EthereumAddress";

const DecodedData = ({ decodedData }) => {
  return (
    <div className="flex flex-col">
      {decodedData.map((item, index) => (
        <div key={index}>
          <span className="font-semibold">{item.type}</span>
          <br />
          {item.name}: {<EthereumAddress address={item.value}/>}
        </div>
      ))}
    </div>
  );
};

export default DecodedData;