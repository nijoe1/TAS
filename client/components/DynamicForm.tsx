import React, { useEffect, useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import TagSelect from "@/components/TagSelect";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { validateInput, transformFormData } from "@/lib/utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";

type DynamicFormModalProps = {
  schema: string;
  schemaUID?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaData: any) => void; // Replace 'any' with the actual type of your event data
};

const DynamicForm: React.FC<DynamicFormModalProps> = ({
  schema,
  schemaUID,
  isOpen,
  onClose,
  onCreate,
}) => {
  const encoder = new SchemaEncoder(schema);
  const schemaArray = schema.split(",").map((item) => {
    const [type, name] = item.trim().split(" ");
    return { type, name };
  });

  const [formData, setFormData] = useState({});
  const [data, setData] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [open, setOpen] = useState(isOpen);
  const [recipient, setRecipient] = useState(
    "0x0000000000000000000000000000000000000000"
  );
  const [referencedAttestation, setReferencedAttestation] = useState(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  const { config } = usePrepareContractWrite({
    address: CONTRACTS.TAS[5].contract,
    abi: CONTRACTS.TAS[5].abi,
    functionName: "attest",
    args: [[schemaUID, [recipient, 0, true, referencedAttestation, data, 0]]],
    value: BigInt(0),
  });
  const { write, isLoading, isSuccess, isError } = useContractWrite(config);

  useEffect(() => {

    try {
      prepareData();
    } catch {
      // Handle errors
    }
  }, [formData]);

  const handleInputChange = (newValue, attributeName, attributeType) => {
    let newFormData = (prevData: any) => {
      // Create a copy of the existing formData
      const updatedFormData = { ...prevData };

      // Update the specific attribute based on its type
      if (attributeType.endsWith("[]")) {
        // For array attributes, update the attribute directly within the array
        updatedFormData[attributeName] = newValue;
      } else {
        // For non-array attributes, update as before
        updatedFormData[attributeName] = newValue.target.value;
      }

      return updatedFormData;
    };
    // Use the functional form of setFormData to ensure the latest state
    setFormData(newFormData);
    try {
      prepareData();
    } catch {  };
  }

  const prepareData = () => {
    const errors = {};
    let empty;
    schemaArray.forEach((attribute) => {
      const error = validateInput(formData[attribute.name], attribute.type);
      console.log(error, formData);
      if (error) {
        errors[attribute.name] = error;
      }
      if (formData[attribute.name] === undefined) {
        empty = true;
      }
    });

    if (!empty) {
      console.log("Form data:", formData); // Move the logging here
      let encodedData = encoder.encodeData(transformFormData(formData, schema));
      setData(encodedData);
      console.log(formData, "  ", data);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 ${
        open ? "block" : "hidden"
      }`}
    >
      <Card
        color="white"
        shadow={false}
        className="mb-4 p-4 border border-black rounded-xl"
      >
        <Typography color="gray" className="mt-1 font-normal">
          Enter your details to attest.
        </Typography>
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-4 flex flex-col gap-6">
            {schemaArray.map((attribute, index) => (
              <div key={index}>
                {formErrors[attribute.name] && (
                  <Typography color="red" className="mt-1">
                    {formErrors[attribute.name]}
                  </Typography>
                )}
                {attribute.type.endsWith("[]") ? (
                  <TagSelect
                    name={attribute.name}
                    onChange={(tags) => {
                      // Handle array inputs directly with an array of tags
                      handleInputChange(tags, attribute.name, attribute.type);
                    }}
                    placeholder={`Enter ${attribute.name} tags`}
                    tags={formData[attribute.name] || []}
                    setTags={(tags) => {
                      // Update tags directly with the array
                      setFormData((prevData) => ({
                        ...prevData,
                        [attribute.name]: tags,
                      }));
                    }}
                    formErrors={formErrors}
                    setFormErrors={setFormErrors}
                    attributeType={attribute.type}
                  />
                ) : (
                  <Input
                    size="lg"
                    placeholder={`${attribute.name} (${attribute.type})`}
                    name={attribute.name}
                    value={formData[attribute.name] || ""}
                    onChange={(e) =>
                      handleInputChange(e, attribute.name, attribute.type)
                    }
                    error={formErrors[attribute.name]}
                  />
                )}
              </div>
            ))}
            <Input
              size="lg"
              placeholder={`${"recipient"} (${"address"})`}
              name={"recipient"}
              value={recipient || ""}
              onChange={() => setRecipient(recipient)}
              error={formErrors["recipient"]}
            />
            <Input
              size="lg"
              placeholder={`${"ReferencedAttestation"} (${"bytes32"})`}
              name={"ReferencedAttestation"}
              value={referencedAttestation || ""}
              onChange={() => setReferencedAttestation(referencedAttestation)}
              error={formErrors["ReferencedAttestation"]}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              
              // @ts-ignore
              onClick={()=> {write(); onClose() }}
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
            >
              Submit
            </button>
            <button
              type="button"
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DynamicForm;
