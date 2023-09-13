import React, { useEffect, useState } from "react";
import { useContractRead, useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";

interface TimeCreatedProps {
  createdAt: any;
}

const TimeCreated: React.FC<TimeCreatedProps> = ({ createdAt }) => {
  const chainID = useChainId();
  const [displayTime, setDisplayTime] = useState(null);
  const { data: currentTimestamp } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "getTime",
  });

  useEffect(() => {
    if (currentTimestamp) {
      const currentTimestampNumber = Number(currentTimestamp.toString()); // Convert BigInt to number
      const createdAtNumber = parseInt(createdAt, 10); // Parse the createdAt string to a number

      // Calculate the elapsed seconds
      const secondsElapsed = Math.floor(
        currentTimestampNumber - createdAtNumber
      ); // Convert milliseconds to seconds
      // Create a new Date by subtracting the elapsed seconds
      const createdDate = new Date();
      createdDate.setSeconds(createdDate.getSeconds() - secondsElapsed);

      // Format the date as a string without seconds
      const displayText = createdDate.toLocaleString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true, // Use 12-hour format
      });
      // @ts-ignore
      setDisplayTime(displayText);
    }
  }, [currentTimestamp, createdAt]);

  return (
    <div>{displayTime !== null ? <p>{displayTime}</p> : <p>Loading...</p>}</div>
  );
};

export default TimeCreated;
