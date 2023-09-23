import React from "react";
import { Typography } from "@material-tailwind/react";



const Field: React.FC<{ label: string; value: string | React.ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <div className="flex text-black flex-wrap justify-left mx-auto items-center p-1">
      <span className="font-semibold text-black">{label}:</span> {value}
    </div>
  );
};

export default Field;