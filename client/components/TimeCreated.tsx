import React, { useEffect, useState } from "react";
import { useContractRead, useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import moment from "moment";

interface TimeCreatedProps {
  createdAt: any;
  subscription?: boolean;
  realTime?: boolean;
}

const TimeCreated: React.FC<TimeCreatedProps> = ({
  createdAt,
  subscription,
  realTime,
}) => {
  const chainID = useChainId();
  const [displayTime, setDisplayTime] = useState(null);
  const { data: currentTimestamp } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "getTime",
  });

  function calculateTimeDifference(passedTimestamp: number) {
    const currentTimestamp = Date.now();
    const difference = currentTimestamp - passedTimestamp;

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else {
      return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    }
  }

  useEffect(() => {
    if (realTime) {
      let res = calculateTimeDifference(createdAt);
      // @ts-ignore
      setDisplayTime(res);
      return;
    }
    if (currentTimestamp) {
      const currentTimestampNumber = Number(currentTimestamp.toString()); // Convert BigInt to number
      const createdAtNumber = parseInt(createdAt, 10); // Parse the createdAt string to a number

      // Calculate the elapsed milliseconds
      const elapsedMilliseconds = currentTimestampNumber - createdAtNumber;

      if (elapsedMilliseconds < 0) {
        // If the elapsed time is negative, display "Time Passed" with the formatted time
        const duration = moment.duration(-elapsedMilliseconds * 1000);
        const formattedTime =
          duration.years() > 0
            ? `${duration.years()} years`
            : duration.months() > 0
            ? `${duration.months()} months`
            : duration.days() > 0
            ? `${duration.days()} days`
            : duration.hours() > 0
            ? `${duration.hours()} hours`
            : duration.minutes() > 0
            ? `${duration.minutes()} minutes`
            : "less than a minute";
        // @ts-ignore
        setDisplayTime(`in : ${formattedTime}`);
      } else {
        // If the elapsed time is positive, display it in the original format
        const duration = moment.duration(elapsedMilliseconds * 1000);
        const formattedTime =
          duration.years() > 0
            ? subscription
              ? `expired : ${duration.years()} years ago`
              : `${duration.years()} years ago`
            : duration.months() > 0
            ? subscription
              ? `expired : ${duration.months()} years ago`
              : `${duration.months()} months ago`
            : duration.days() > 0
            ? subscription
              ? `expired : ${duration.days()} years ago`
              : `${duration.days()} days ago`
            : duration.hours() > 0
            ? subscription
              ? `expired : ${duration.hours()} years ago`
              : `${duration.hours()} hours ago`
            : duration.minutes() > 0
            ? subscription
              ? `expired : ${duration.minutes()} years ago`
              : `${duration.minutes()} minutes ago`
            : "now";
        // @ts-ignore
        setDisplayTime(formattedTime);
      }
    }
  }, [currentTimestamp, createdAt]);

  return (
    <div className="flex text-bolder text-black px-2 py-1  rounded-full text-sm whitespace-nowrap">
      {displayTime !== null ? <p>{displayTime}</p> : <p>Loading...</p>}
    </div>
  );
};

export default TimeCreated;
