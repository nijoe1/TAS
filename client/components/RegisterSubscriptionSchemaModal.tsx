import React, { useState, useEffect } from "react";
import { Card, Input, Typography, Tooltip } from "@material-tailwind/react";
import { BsTrash3Fill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import { CgAddR } from "react-icons/cg";
import { FaInfoCircle } from "react-icons/fa";
// @ts-ignore
import TagsInput from "react-tagsinput";
import { useContractWrite, usePrepareContractWrite, useChainId, useWaitForTransaction } from "wagmi";
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
  const [isRevocable, setIsRevocable] = useState(false);
  const [resolver, setResolver] = useState(
    "0x0000000000000000000000000000000000000000"
  );
  const [monthlySubscriptionPrice, setMonthlySubscriptionPrice] = useState(0);
  const [categories, setCategories] = useState({ tags: [] });
  const [attributes, setAttributes] = useState([
    { address: "creator address", shares: 0 },
  ]);
  const [creators, setCreators] = useState([]);
  const [shares, setShares] = useState([]);

  const { config } = usePrepareContractWrite({
    // @ts-ignore
    address: CONTRACTS.SubscriptionResolver[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.SubscriptionResolver[chainID].abi,
    functionName: "registerSubscriptionSchema",
    args: [
      creators,
      shares,
      monthlySubscriptionPrice,
      schemaName,
      schemaDescription,
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
  }, [attributes]);

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
        className="mb-4 p-4 border border-black rounded-xl"
      >
        <div className="mb-4">
          <Typography variant="h4" color="black">
            Create Schema
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
            <div className="mb-1 flex">
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
              className="background-color-white"
              value={categories.tags}
              onChange={handleTagChange}
            />
          </div>
          <div className="mb-4 items-center">
            <div className="mb-1 flex">
              <Tooltip
                placement="right-start"
                content="Optional smart contract.
(Can be used to verify, limit, act upon any attestation)"
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
              onChange={(e) => setMonthlySubscriptionPrice(e.target.value)}
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
          <div className="flex justify-end">
            <button
              type="button"
              // @ts-ignore
              onClick={() => {
                // @ts-ignore
                write();
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
          <Notification
            isLoading={isLoading}
            isSuccess={isSuccess}
            isError={isError}
            wait={wait}
            error={err}
            success={succ}
          />
        </form>
      </Card>
    </div>
  );
};

export default RegisterSubscriptionSchemaModal;
