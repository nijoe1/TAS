import React, { useEffect, useState } from "react";
import { useContractRead, useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import moment from "moment";

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

      // Calculate the elapsed milliseconds
      const elapsedMilliseconds = currentTimestampNumber - createdAtNumber;

      // Convert milliseconds to different time units
      const duration = moment.duration(elapsedMilliseconds * 1000);

      // Format the elapsed time
      const formattedTime =
        duration.years() > 0
          ? `${duration.years()} years ago`
          : duration.months() > 0
          ? `${duration.months()} months ago`
          : duration.days() > 0
          ? `${duration.days()} days ago`
          : duration.hours() > 0
          ? `${duration.hours()} hours ago`
          : duration.minutes() > 0
          ? `${duration.minutes()} minutes ago`
          : "now";
      // @ts-ignore
      setDisplayTime(formattedTime);
    }
  }, [currentTimestamp, createdAt]);

  return (
    <div>{displayTime !== null ? <p>{displayTime}</p> : <p>Loading...</p>}</div>
  );
};

export default TimeCreated;
