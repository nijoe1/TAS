import React, { useState } from "react";

type EthereumAddressProps = {
  address: string;
  className?: string; // Allow the className prop to be optional
};

const EthereumAddress: React.FC<EthereumAddressProps> = ({
  address,
  className,
}) => {
  const formattedAddress =  `${address}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  };

  return (
    <span
      className={`bg-black  text-white px-2 py-1 rounded-full text-xs whitespace-nowrap ${className} ${
        copied ? "bg-gradient-to-r from-blue-gray-10000 to-black-10000 text-black" : ""
      }`}
      onClick={copyToClipboard}
    >
      {copied ? "Copied!" : formattedAddress}
    </span>
  );
};

export default EthereumAddress;