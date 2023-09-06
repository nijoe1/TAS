import React from "react";
import { Typography } from "@material-tailwind/react";



const Field: React.FC<{ label: string; value: string | React.ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <div className="mb-2 mx-auto">
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
};

export default Field;