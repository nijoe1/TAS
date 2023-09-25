import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useContractRead } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { BsTrash3Fill } from "react-icons/bs";

interface CalendarBlockProps {
  chainID: number;
  onExpirationTimeChange: (timeInSeconds: BigInt) => void;
}

const CalendarBlock: React.FC<CalendarBlockProps> = ({
  chainID,
  onExpirationTimeChange,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const expirationTimeInSeconds = BigInt(
    selectedDate
      ? Math.floor((selectedDate.getTime() - new Date().getTime()) / 1000)
      : 0
  );

  const handleDateChange = (date: Date | Date[]) => {
    if (date instanceof Date && date > new Date()) {
      setSelectedDate(date);
      setShowCalendar(false);

      const expirationTimeInSeconds = Math.floor(
        (date.getTime() - new Date().getTime()) / 1000
      );
      onExpirationTimeChange(
        // @ts-ignore
        BigInt(BigInt(expirationTimeInSeconds) + currentTimestamp)
      );
    } else {
      alert("Please select a future date.");
    }
  };

  const { data: currentTimestamp } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "getTime",
  });

  return (
    <div className="mt-3 p-3" style={{ display: "flex", alignItems: "center" }}>
      <span>
        {`${
          selectedDate
            ? "Expiration in :" +
              selectedDate.getDate() +
              "/" +
              selectedDate.getMonth() +
              "/" +
              selectedDate.getFullYear()
            : "Select Expiration Time (Optional):"
        }`}{" "}
      </span>
      <div className="flex flex-wrap gap-2">
        <FaRegCalendarAlt
          style={{ marginLeft: "10px", cursor: "pointer" }}
          onClick={() => setShowCalendar(!showCalendar)}
        />
        <BsTrash3Fill
          style={{ marginLeft: "10px", cursor: "pointer" }}
          onClick={() => {
            setSelectedDate(null);
            onExpirationTimeChange(BigInt(0));
          }}
        />
      </div>

      {showCalendar && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Calendar onChange={(value) => handleDateChange(value as Date)} />
        </div>
      )}
    </div>
  );
};

export default CalendarBlock;
