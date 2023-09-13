import React from "react";
import EthereumAddress from "./EthereumAddress";
type DecodedDataProps = {
  decodedData: any;
};

const DecodedData: React.FC<DecodedDataProps> = ({ decodedData }) => {
  const checkName = (name: string) => {
    if (name.endsWith("CID")) {
      return true;
    }
    return false;
  };
  return (
    <div className="flex flex-wrap ">
      {decodedData.map((item: any, index: any) => (
        <div
          className="bg-black flex flex-col font-bold text-white mx-auto rounded-lg px-2 py-1 text-xs m-1  "
          key={index}
        >
          <span className="font-bold border rounded-lg mt-1 mb-1 ">
            {item.type.toUpperCase()}
          </span>
          <span className="font-bold border rounded-lg mb-1">{item.name}</span>
          {!checkName(item.name) ? (
            <EthereumAddress
              className="border-white text-center items-center bg-white"
              address={item.value}
            />
          ) : (
            <EthereumAddress
              className="border-white bg-white"
              address={item.value}
              link={`https://gateway.lighthouse.storage/ipfs/${item.value}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default DecodedData;
