import React from 'react';
import { Typography } from "@material-tailwind/react";

interface CategoriesContainerProps {
  strings: string[];
}

const CategoriesContainer: React.FC<CategoriesContainerProps> = ({ strings }) => {
  return (
    <div className='mx-auto flex flex-col items-center'>
      <Typography variant="h6" color="black" className="mt-2 text-center">
        Categories
      </Typography>
      <div className="border border-black p-4 rounded-md flex flex-wrap gap-2 mx-auto">
        {strings.map((category, index) => (
          <div key={index} className="flex flex-col mx-auto">
            <span
              className="bg-black rounded-md text-center text-white font-bold p-1"
              style={{ flex: "1 0 30%", minWidth: "100px" }}
            >
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesContainer;
