import React from "react";
import { Typography } from "@material-tailwind/react";

const Field: React.FC<{
  notshow?: boolean;
  label: string;
  value: string | React.ReactNode;
}> = ({ label, value, notshow }) => {
  return (
    <div>
      {!notshow ? (
        <div className="flex text-black flex-wrap justify-left mx-auto items-center p-1">
          <span className="font-semibold text-black">{label}:</span> {value}
        </div>
      ) : (
        <div className="flex text-black flex-wrap justify-left mx-auto items-center p-1">
          <span className="font-semibold text-black">{label}</span> {value}
        </div>
      )}
    </div>
  );
};

export default Field;
