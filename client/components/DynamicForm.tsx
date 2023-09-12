import React, { useEffect, useState } from "react";
import { Card, Input, Progress, Typography } from "@material-tailwind/react";
import TagSelect from "@/components/TagSelect";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { validateInput, transformFormData } from "@/lib/utils";
import { useContractWrite, usePrepareContractWrite, useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { useAccount } from "wagmi";
import {
  uploadFileEncrypted,
  applyAccessConditions,
  uploadFile,
} from "@/lib/lighthouse";
type DynamicFormModalProps = {
  schema: string;
  schemaUID?: string;
  isSubscription: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaData: any) => void; // Replace 'any' with the actual type of your event data
};

const DynamicForm: React.FC<DynamicFormModalProps> = ({
  schema,
  schemaUID,
  isSubscription,
  isOpen,
  onClose,
  onCreate,
}) => {
  const chainID = useChainId();
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
  const [onProgress, setOnProgress] = useState(-1);
  const { config } = usePrepareContractWrite({
    address: CONTRACTS.TAS[chainID].contract,
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "attest",
    args: [[schemaUID, [recipient, 0, false, referencedAttestation, data, 0]]],
    value: BigInt(0),
  });
  const { write, isLoading, isSuccess, isError } = useContractWrite(config);

  const { address } = useAccount();
  const [formDataJson, setFormDataJson] = useState({
    name: "",
    description: "",
    fileType: "image",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormDataJson({
      ...formDataJson,
      [name]: value,
    });
  };

  function getAcceptedFileTypes(fileType) {
    const allowedFileTypes = {
      image: "image/jpeg, image/png, image/gif",
      video: "video/mp4, video/webm, video/ogg",
      pdf: "application/pdf",
      csv: "text/csv",
    };

    return allowedFileTypes[fileType] || "";
  }

  const handleFileUpload = async (file) => {
    if (isSubscription) {
      handleEncryptedUpload(file);
    } else {
      handleUpload(file);
    }
  };
  const handleUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    // Upload file and get encrypted CID
    const CID = await uploadFile(file, key, setOnProgress);

    // Create JSON object
    const json = {
      name: formDataJson.name,
      description: formDataJson.description,
      file: {
        name: CID.Name,
        type: file[0].type,
        CID: CID.Hash,
      },
    };

    const jsonBlob = new Blob([JSON.stringify(json)], {
      type: "application/json",
    });

    // Create a File object from the Blob
    const jsonFile = new File([jsonBlob], `${formDataJson.name}.json`, {
      type: "application/json",
    });
    // Upload JSON
    let data = await uploadFile([jsonFile], key, setOnProgress);
    setOnProgress(100);
    // Update state
    // setFileURL(await decrypt(encryptedCID, address, signedEncryption));
    handleInputChange(data.Hash, "jsonCID", "string");
  };

  const handleEncryptedUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    let token = localStorage.getItem(`lighthouse-jwt-${address}`);
    // Upload file and get encrypted CID
    const CID = await uploadFileEncrypted(file, key, address, token);

    // Create JSON object
    const json = {
      name: formDataJson.name,
      description: formDataJson.description,
      file: {
        name: CID[0].Name,
        type: file[0].type,
        CID: CID[0].Hash,
      },
    };

    const jsonBlob = new Blob([JSON.stringify(json)], {
      type: "application/json",
    });

    // Create a File object from the Blob
    const jsonFile = new File([jsonBlob], `${formDataJson.name}.json`, {
      type: "application/json",
    });
    // Upload JSON
    let jsonCID = await uploadFileEncrypted([jsonFile], key, address, token);
    console.log(jsonCID[0].Hash);

    await applyAccessConditions(
      jsonCID[0].Hash,
      chainID,
      schemaUID,
      address,
      token
    );
    let res = await applyAccessConditions(
      CID[0].Hash,
      chainID,
      schemaUID,
      address,
      token
    );
    // Update state
    // setFileURL(await decrypt(encryptedCID, address, signedEncryption));
    handleInputChange(jsonCID[0].Hash, "jsonCID", "string");
  };

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
        if (attributeName == "jsonCID") {
          updatedFormData[attributeName] = newValue;
        } else {
          // For non-array attributes, update as before
          updatedFormData[attributeName] = newValue.target.value;
        }
      }

      return updatedFormData;
    };
    // Use the functional form of setFormData to ensure the latest state
    setFormData(newFormData);
    try {
      prepareData();
    } catch {}
  };

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
                ) : attribute.name == "jsonCID" ? (
                  <div className=" mx-auto p-4 border rounded-lg bg-white shadow-lg flex flex-col">
                    <label className="flex flex-col text-center">
                      Name
                      <input
                        className="ml-2 border rounded-full"
                        type="text"
                        name="name"
                        value={formDataJson.name}
                        onChange={handleChange}
                      />
                    </label>
                    <br />
                    <label className="flex flex-col text-center">
                      Description:
                      <input
                        className="ml-2 border rounded-full"
                        type="text"
                        name="description"
                        value={formDataJson.description}
                        onChange={handleChange}
                      />
                    </label>
                    <br />
                    <label className="flex flex-col text-center mx-auto">
                      File Type:
                      <select
                        className="ml-2  rounded-lg text-center"
                        name="fileType"
                        value={formDataJson.fileType}
                        onChange={handleChange}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="csv">CSV</option>
                      </select>
                    </label>
                    <br />
                    {onProgress < 0 ? (
                      <input
                        className="rounded-lg"
                        type="file"
                        accept={getAcceptedFileTypes(formDataJson.fileType)}
                        onChange={async (e) => {
                          if (e.target.files) {
                            handleFileUpload(e.target.files);
                          }
                        }}
                      />
                    ) : (
                      <div className="items-center text-center">
                        <Progress className="text-white bg-black rounded-lg"  value={onProgress} label="Completed" />
                      </div>
                    )}
                  </div>
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
              onClick={() => {
                write();
                onClose();
              }}
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
