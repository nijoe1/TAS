import React from "react";

type DecodedSchemaProps = {
  schema: Array<{ type: string; name: string }>;
};

const DecodedSchema: React.FC<DecodedSchemaProps> = ({ schema }) => {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {schema.map((field, index) => (
        <div
          key={index}
          className="bg-black font-bold text-white rounded-md px-2 py-1 text-xs m-1  "
        >
          <div>{field.type.toUpperCase()}</div>
          <div>{field.name}</div>
        </div>
      ))}
    </div>
  );
};

export default DecodedSchema;
