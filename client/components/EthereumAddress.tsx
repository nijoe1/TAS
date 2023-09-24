import React, { useState } from "react";
import { FiCopy } from "react-icons/fi";
import { HiExternalLink } from "react-icons/hi";
import { Tooltip } from "@material-tailwind/react";
import Link from "next/link"; // Import Link from Next.js

type EthereumAddressProps = {
  address: string;
  className?: string; // Allow the className prop to be optional
  link?: string;
  stringLength?: number;
  copy?: boolean;
};

const EthereumAddress: React.FC<EthereumAddressProps> = ({
  address,
  className,
  link,
  stringLength,
  copy,
}) => {
  const formattedAddress = `${address}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  };

  function shortenString(inputString: any, maxLength: any, dots: boolean) {
    if (inputString == "0x0000000000000000000000000000000000000000") {
      inputString = "ZERO_ADDRESS";
    }
    if (
      inputString ==
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      inputString = "ZERO_BYTES32";
    }
    if (inputString.length <= maxLength) {
      return inputString; // No need to shorten if it's already shorter than maxLength.
    }

    const firstPart = inputString.slice(0, maxLength);
    if (dots) {
      return firstPart + "...";
    } else {
      return firstPart;
    }
  }

  return (
    <span
      className={` flex  text-bolder text-black ml-2 p-1 rounded-full text-xxs whitespace-nowrap ${className}`}
    >
      {copied ? (
        <div>
          <p>copied!</p>{" "}
          <p>
            {stringLength
              ? shortenString(formattedAddress, stringLength, false)
              : shortenString(formattedAddress, 30, true)}
          </p>
        </div>
      ) : stringLength ? (
        shortenString(formattedAddress, stringLength, false)
      ) : (
        shortenString(formattedAddress, 30, true)
      )}

      <div className="flex ">
        {!copy && (
          <Tooltip
            placement="right-start"
            content="add a relevant name to your schema"
          >
            <FiCopy
              className="cursor-pointer ml-1"
              onClick={copyToClipboard}
            ></FiCopy>
          </Tooltip>
        )}
        {link && (
          <Link href={`${link}`}>
            <HiExternalLink className="cursor-pointer ml-1"></HiExternalLink>
          </Link>
        )}
      </div>
    </span>
  );
};

export default EthereumAddress;
