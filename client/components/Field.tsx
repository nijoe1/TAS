import React from "react";
import { Typography } from "@material-tailwind/react";

type FieldProps = {
  label: string;
  value: React.ReactNode;
  isAddress?: boolean; // Specify if the value is an Ethereum address
  className?:string
};

const Field: React.FC<FieldProps> = ({ label, value, isAddress,className }) => {
  return (
    <div className={`mb-2 flex items-center ${className}`}>
      <Typography variant="h6" color="black" className={`w-1/4 flex space-x-1 ${isAddress ? "w-1/5" : ""}`}>
        {label}:
      </Typography>
      <div className={`w-3/4 flex space-x-1 ${isAddress ? "w-3/4" : ""}`}>
        {value}
      </div>
    </div>
  );
};

export default Field;