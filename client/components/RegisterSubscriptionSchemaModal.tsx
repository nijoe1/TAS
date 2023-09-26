import React, { useState, useEffect } from "react";
import { Card, Input, Typography, Tooltip } from "@material-tailwind/react";
import { BsTrash3Fill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import { CgAddR } from "react-icons/cg";
import { FaInfoCircle } from "react-icons/fa";
// @ts-ignore
import TagsInput from "react-tagsinput";
import {
  useContractWrite,
  usePrepareContractWrite,
  useChainId,
  useWaitForTransaction,
} from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import Notification from "./Notification";
type RegisterSchemaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaData: any) => void; // Replace 'any' with the actual address of your event data
};

const RegisterSubscriptionSchemaModal: React.FC<RegisterSchemaModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const chainID = useChainId();
  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");

  const [monthlySubscriptionPrice, setMonthlySubscriptionPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(1);
  const [categories, setCategories] = useState({ tags: [] });
  const [attributes, setAttributes] = useState([
    { address: "creator address", shares: 0 },
  ]);

  const [schemaAttributes, setSchemaAttributes] = useState([
    { type: "Select Type", name: "", isArray: false, readonly: false },
  ]);

  const [rawSchema, setRawSchema] = useState();

  const [creators, setCreators] = useState([]);
  const [shares, setShares] = useState([]);
  const solidityTypes = [
    "string",
    "address",
    "bool",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "uint128",
    "uint256",
    "bytes",
    "bytes32",
  ];

  const generateAttributeString = () => {
    setRawSchema(
      // @ts-ignore
      schemaAttributes
        .map((attr: any) => {
          const type = attr.isArray ? `${attr.type}[]` : attr.type;
          return `${type} ${attr.name}`;
        })
        .join(", ")
    );
    return rawSchema;
  };

  const handleSchemaAttributeChange = (index: any, key: any, value: any) => {
    const updatedAttributes = [...schemaAttributes];
    // @ts-ignore
    updatedAttributes[index][key] = value;

    if (value === "videoCID" || value === "imageCID" || value === "jsonCID") {
      updatedAttributes[index]["type"] = "string";
      updatedAttributes[index]["name"] = value;
      updatedAttributes[index]["readonly"] = true;
      updatedAttributes[index]["isArray"] = false;
    } else if (
      value === "videoCIDs" ||
      value === "imageCIDs" ||
      value === "jsonCIDs"
    ) {
      updatedAttributes[index]["type"] = "string";
      updatedAttributes[index]["isArray"] = true;

      updatedAttributes[index]["name"] = value;
      updatedAttributes[index]["readonly"] = true;
    } else {
      updatedAttributes[index]["type"] = value;
      updatedAttributes[index]["name"] = "";
      updatedAttributes[index]["readonly"] = false;
    }

    setSchemaAttributes(updatedAttributes);
  };

  const addSchemaAttribute = () => {
    setSchemaAttributes([
      ...schemaAttributes,
      { type: "Select Type", name: "", isArray: false, readonly: false },
    ]);
    generateAttributeString();
  };

  const handleAttributeNameChange = (index: any, key: any, value: any) => {
    const updatedAttributes = [...schemaAttributes];
    // @ts-ignore
    updatedAttributes[index][key] = value;
    setSchemaAttributes(updatedAttributes);
  };

  const removeSchemaAttribute = (index: any) => {
    const updatedAttributes = [...schemaAttributes];
    updatedAttributes.splice(index, 1);
    setSchemaAttributes(updatedAttributes);
    generateAttributeString();
  };

  const { config, error } = usePrepareContractWrite({
    // @ts-ignore
    address: CONTRACTS.SubscriptionResolver[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.SubscriptionResolver[chainID].abi,
    functionName: "registerSubscriptionSchema",
    args: [
      creators,
      shares,
      BigInt(monthlySubscriptionPrice * 10 ** 18),
      [
        rawSchema,
        schemaName,
        schemaDescription,
        categories.tags,
        "0x0000000000000000000000000000000000000000",
        false,
      ],
    ],
  });
  const { write, data, isLoading, isSuccess, isError } =
    useContractWrite(config);

  const {
    data: res,
    isError: err,
    isLoading: wait,
    isSuccess: succ,
  } = useWaitForTransaction({
    confirmations: 2,
    hash: data?.hash,
  });

  useEffect(() => {
    let creatorsList = [];
    let sharesList = [];
    for (const attr of attributes) {
      creatorsList.push(attr.address);
      sharesList.push(attr.shares);
    }
    // @ts-ignore
    setCreators(creatorsList);
    // @ts-ignore
    setShares(sharesList);
    generateAttributeString();
    console.log(rawSchema);
    console.log(monthlySubscriptionPrice);
  }, [attributes, monthlySubscriptionPrice, schemaAttributes, rawSchema]);

  const handleTagChange = (tags: any) => {
    setCategories({ tags });
    console.log(tags);
  };

  const handleAttributeChange = (index: any, key: any, value: any) => {
    const updatedAttributes = [...attributes];
    // @ts-ignore
    updatedAttributes[index][key] = value;
    setAttributes(updatedAttributes);
  };

  const handleCheckboxChange = (index: any) => {
    const updatedAttributes = [...schemaAttributes];
    updatedAttributes[index]["isArray"] = !updatedAttributes[index]["isArray"];
    setSchemaAttributes(updatedAttributes);
    generateAttributeString();
  };

  const handleAttributeAddressChange = (index: any, key: any, value: any) => {
    const updatedAttributes = [...attributes];
    // @ts-ignore
    updatedAttributes[index][key] = value;
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { address: "Select address", shares: 0 }]);
  };

  const removeAttribute = (index: any) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    setAttributes(updatedAttributes);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <Card
        color="white"
        shadow={false}
        className="mb-4 p-4 border border-black rounded-xl card-container" // Added card-container class
        style={{ maxHeight: "80vh", overflowY: "auto" }} // Added style for max height and scroll
      >
        <div className="mb-4">
          <Typography variant="h4" color="black">
            Create Subscription Schema
          </Typography>
          <Typography variant="h6" color="black">
            Add fields below that are relevant to your use case.
          </Typography>
        </div>
        <form className="mt-4">
          <div className="mb-1 ">
            <div className="mb-1 flex">
              <Tooltip
                placement="right-start"
                content="add a relevant name to your schema"
              >
                <label className="text-black font-medium">Schema Name</label>
              </Tooltip>

              <FaInfoCircle className="mt-1 ml-2" />
            </div>
            <Input
              type="text"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              className="rounded-full px-4 py-2 border border-black"
            />
          </div>
          <div className="mb-4">
            <div className="mb-1 flex">
              <Tooltip
                placement="right-start"
                content="describe your schema useCase"
              >
                <label className="text-black font-medium">
                  Schema Description
                </label>
              </Tooltip>

              <FaInfoCircle className="mt-1 ml-2" />
            </div>
            <Input
              type="text"
              value={schemaDescription}
              onChange={(e) => setSchemaDescription(e.target.value)}
              className="rounded-full px-4 py-2 border border-black"
            />
          </div>
          <div className="mb-4">
            <div className="mb-1 flex ">
              <Tooltip
                placement="right-start"
                content="describe your schema useCase"
              >
                <label htmlFor="picture" className="text-black font-medium">
                  Categories
                </label>
              </Tooltip>

              <FaInfoCircle className="mt-1 ml-2" />
            </div>
            <TagsInput
              inputProps={{ placeholder: "Add category" }}
              onlyUnique={true}
              className="background-color-white flex"
              value={categories.tags}
              onChange={handleTagChange}
            />
          </div>
          <div className="mb-4 items-center">
            <div className="mb-1 flex">
              <Tooltip
                placement="right-start"
                content="Optional smart contract."
              >
                <label className="text-black font-medium">
                  Monthly Subscription Price
                </label>
              </Tooltip>
              <FaInfoCircle className="mt-1 ml-2" />
            </div>
            <Input
              type="number"
              value={monthlySubscriptionPrice}
              // @ts-ignore
              onChange={(e) => {
                setMonthlySubscriptionPrice(
                  parseFloat(e.target.value) as unknown as number
                );
                // console.log(getWEI(adjustedPrice.toString()));
              }}
              min={1 / 10 ** 17}
              placeholder="Monthly Subscription Price"
              className="rounded-full flex-grow px-4 py-2 border border-black"
            />
          </div>
          <div className="mb-1 flex">
            <Tooltip
              placement="right-start"
              content="Optional smart contract.
(Can be used to verify, limit, act upon any attestation)"
            >
              <label className="text-black font-medium">Content Creators</label>
            </Tooltip>

            <FaInfoCircle className="mt-1 ml-2" />
          </div>
          {attributes.map((attr, index) => (
            <div
              key={index}
              className="mb-4 flex border border-black p-4 rounded-xl flex items-center mx-2 gap-7"
            >
              <div className="w-1/7">
                <div className="flex-shrink-0">
                  <SlOptionsVertical className="text-gray-500" />
                </div>
              </div>
              <div className="w-4/7">
                <Input
                  type="text"
                  // @ts-ignore
                  value={attr.name}
                  onChange={(e) =>
                    handleAttributeAddressChange(
                      index,
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="creator address"
                  className="rounded-full px-4 py-2 border border-black"
                />
              </div>
              <div className="w-1/7">
                <Input
                  type="number"
                  // @ts-ignore
                  value={attr.name}
                  onChange={(e) =>
                    handleAttributeChange(index, "shares", e.target.value)
                  }
                  placeholder="creator shares"
                  className="rounded-full px-4 py-2 border border-black "
                />
              </div>

              <div className="w-1/7 text-right">
                {index > 0 && (
                  <BsTrash3Fill
                    onClick={() => removeAttribute(index)}
                    className="cursor-pointer text-gray-600 hover:text-black"
                  />
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-center items-center gap-2 ">
            <CgAddR
              onClick={addAttribute}
              className="cursor-pointer text-gray-600 hover:text-black size-lg"
            />
            <Typography
              onClick={addAttribute}
              className="cursor-pointer"
              color="black"
            >
              add creator
            </Typography>
          </div>
          <div className="mb-1 flex">
            <Tooltip
              placement="right-start"
              content="describe your schema useCase"
            >
              <label htmlFor="picture" className="text-black font-medium">
                Schema Fields
              </label>
            </Tooltip>

            <FaInfoCircle className="mt-1 ml-2" />
          </div>
          {schemaAttributes.map((attr, index) => (
            <div
              key={index}
              className="mb-4 mt-3 flex border border-black p-4 rounded-xl flex items-center mx-2 gap-7"
            >
              <div className="w-1/4">
                <div className="flex-shrink-0">
                  <SlOptionsVertical className="text-gray-500" />
                </div>
              </div>
              <div className="w-full">
                <Input
                  type="text"
                  value={attr.name}
                  onChange={(e) =>
                    handleAttributeNameChange(index, "name", e.target.value)
                  }
                  placeholder="field name"
                  // @ts-ignore
                  readOnly={attr.readonly}
                  className="rounded-full px-4 py-2 border border-black"
                />
              </div>
              <div className="w-1/4">
                <select
                  value={attr.type}
                  onChange={(e) =>
                    handleSchemaAttributeChange(index, "type", e.target.value)
                  }
                  className="attribute-select rounded-full px-4 py-2 border border-black mr-20"
                >
                  <option value="Select Type">Select Type</option>
                  {solidityTypes.map((type, typeIndex) => (
                    <option key={typeIndex} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="imageCID">imageCID</option>
                  <option value="imageCIDs">imageCIDs</option>

                  <option value="videoCID">videoCID</option>
                  <option value="videoCIDs">videoCIDs</option>

                  <option value="jsonCID">jsonCID</option>
                  <option value="jsonCIDs">jsonCIDs</option>
                </select>
              </div>
              <div className="flex justify-center items-center gap-2 ">
                <input
                  type="checkbox"
                  readOnly={schemaAttributes[index]["readonly"]}
                  checked={attr.isArray}
                  onChange={() => {
                    if (!schemaAttributes[index]["readonly"])
                      handleCheckboxChange(index);
                  }}
                  className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ml-2 cursor-pointer"
                />
                <Typography
                  className="cursor-pointer focus:ring-blue-500 focus:ring-2 "
                  color="black"
                  onClick={() => {
                    if (!schemaAttributes[index]["readonly"])
                      handleCheckboxChange(index);
                  }}
                >
                  Array
                </Typography>{" "}
              </div>

              <div className="w-1/4 text-right">
                {index > 0 && (
                  <BsTrash3Fill
                    onClick={() => removeSchemaAttribute(index)}
                    className="cursor-pointer text-gray-600 hover:text-black"
                  />
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-center items-center gap-2 ">
            <CgAddR
              onClick={addSchemaAttribute}
              className="cursor-pointer text-gray-600 hover:text-black size-lg"
            />
            <Typography
              onClick={addSchemaAttribute}
              className="cursor-pointer"
              color="black"
            >
              add field
            </Typography>
          </div>
          <div className="mt-4">
            <Typography variant="h6" color="black">
              Generated schema :
            </Typography>
            <Typography color="black">{rawSchema}</Typography>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              // @ts-ignore
              onClick={() => {
                setFinalPrice(monthlySubscriptionPrice * 10 ** 18),
                  console.log(finalPrice);

                // @ts-ignore
                write();
              }}
              className="bg-black text-white rounded-md px-6 py-2 hover:bg-white hover:text-black border border-black"
            >
              Submit
            </button>
            <button
              type="button"
              className="bg-black text-white rounded-md px-6 py-2 hover:bg-white hover:text-black border border-black"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          <Notification
            isLoading={isLoading}
            isSuccess={isSuccess}
            isError={
              error?.message
                ? error.message.indexOf(".") !== -1
                  ? error.message.substring(0, error.message.indexOf("."))
                  : error.message
                : undefined
            }
            wait={wait}
            error={err}
            success={
              succ ? "Subscription schema created successfully" : undefined
            }
          />
        </form>
      </Card>
    </div>
  );
};

export default RegisterSubscriptionSchemaModal;
