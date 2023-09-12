import React, { useEffect, useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import TagSelect from "@/components/TagSelect";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { validateInput, transformFormData } from "@/lib/utils";
import { useContractWrite, usePrepareContractWrite, useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { useAccount } from "wagmi";
import { signMessage } from "@wagmi/core";
import lighthouse, { applyAccessCondition } from "@lighthouse-web3/sdk";
import axios from "axios";
import {
  uploadFile,
  decrypt,
  uploadFileEncrypted,
  applyAccessConditions,
  generateLighthouseJWT,
} from "@/lib/lighthouse";
import { getGroupPrice } from "@/lib/tableland";
type DynamicFormModalProps = {
  schemaUID?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaData: any) => void; // Replace 'any' with the actual type of your event data
};

const SubscriptionForm: React.FC<DynamicFormModalProps> = ({
  schemaUID,
  isOpen,
  onClose,
  onCreate,
}) => {
  const chainID = useChainId();

  const [formData, setFormData] = useState({});
  const [months, setMonths] = useState(1);
  const [price, setPrice] = useState(0);

  const [formErrors, setFormErrors] = useState({});
  const [open, setOpen] = useState(isOpen);

  const { config } = usePrepareContractWrite({
    address: CONTRACTS.SubscriptionResolver[chainID].contract,
    abi: CONTRACTS.SubscriptionResolver[chainID].abi,
    functionName: "subscribe",
    args: [schemaUID, months],
    value: BigInt(price * months),
  });
  const { write, isLoading, isSuccess, isError } = useContractWrite(config);

  const { address } = useAccount();

  useEffect(() => {
    const fetch = async () => {
      setPrice(Number(await getGroupPrice(chainID, schemaUID)));
    };
    fetch();
  }, []);

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
          Subscribe to get Access.
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          {`Price per month: ${price}`}
        </Typography>
        <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-4 flex flex-col gap-6">
            <Input
              type="number"
              size="lg"
              placeholder="Subscribe for x months"
              name={"Months"}
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              // @ts-ignore
              onClick={write}
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
            >
              Subscribe
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

export default SubscriptionForm;
