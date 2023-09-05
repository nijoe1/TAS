import React from "react";
import EthereumAddress from "@/components/EthereumAddress"; // Assuming your EthereumAddress component is in a separate file
import Field from "./Field";
import DecodedSchema from "./DecodedSchema";

type SchemaDataProps = {
  schemaData: {
    schemaUID: string;
    name: string;
    description: string;
    created: string;
    creator: string;
    resolverContract: string;
    revocable: boolean;
    attestationCount: {
      onchain: number;
      offchain: number;
    };
    decodedSchema: Array<{ type: string; name: string }>;
    rawSchema: string;
  };
};

const SchemaProfile: React.FC<SchemaDataProps> = ({ schemaData }) => {
  return (
    <div className={`flex-grow mx-auto`}>
      <div className="bg-white rounded-xl p-4">
        {/* Header */}
        <div className="mb-4 mt-3 w-3/4">
          <Field
            label="SchemaUID"
            value={<EthereumAddress address={schemaData.schemaUID} />}
            isAddress={true}

          />
          <Field label="Name" value={"Name"} />
          <Field label="Description" value={"jhtffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"} />
        </div>

        <div className="flex justify-between">
          {/* Left Box */}
          <div className="w-3/5 flex flex-col">
            <Field label="Created" value={schemaData.created} />
            <Field
              label="Creator"
              value={<EthereumAddress address={schemaData.creator} />}
              isAddress={true}
            />
            <Field
              label="Resolver"
              value={<EthereumAddress address={schemaData.resolverContract} />}
              isAddress={true}
            />
          </div>

          {/* Right Box */}

          <div className="w-2/5 ml-5 mt-7 border rounded-xl p-4">
            <Field
              label="Decoded Schema"
              value={<DecodedSchema schema={schemaData.decodedSchema} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SchemaProfile;
