import React, { useState } from "react";
import EthereumAddress from "@/components/EthereumAddress";
import DecodedData from "@/components/DecodedData";
import TimeCreated from "./TimeCreated";
import Field from "@/components/Field";
import { Typography } from "@material-tailwind/react";
import AccessBox from "./AccessBox";
import {
  useContractWrite,
  usePrepareContractWrite,
  useChainId,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import Notification from "./Notification";
import SubscriptionItem from "./SubscriptionItem";
type AttestationProfileProps = {
  attestationData: {
    attestationUID: string;
    context: string;
    created: string;
    expiration: string;
    revoked: boolean;
    revocable: boolean;
    resolver: string;
    schemaUID: string;
    from: string;
    to: string;
    decodedData: Array<{
      type: string;
      name: string;
      value: string;
    }>;
    data: string;
    referencedAttestation: string;
    referencingAttestations: number;
  };
  type: string;
};

const AttestationProfile: React.FC<AttestationProfileProps> = ({
  attestationData,
  type,
}) => {
  const [accessInfo, setAccessInfo] = useState({
    attestAccess: false,
    revokeAccess: false,
    viewAccess: false,
  });

  // Define a function to update the accessInfo state
  const handleAccessInfoChange = (newAccessInfo: any) => {
    setAccessInfo(newAccessInfo);
  };
  const chainID = useChainId();

  const { address } = useAccount();

  const { config } = usePrepareContractWrite({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "revoke",
    args: [[attestationData.schemaUID, [attestationData.attestationUID, 0]]],
    value: BigInt(0),
  });
  const {
    write,
    data: txdata1,
    isError,
    isLoading,
    isSuccess,
  } = useContractWrite(config);

  const { config: OFFCHAIN } = usePrepareContractWrite({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "revokeOffchain",
    args: [attestationData.attestationUID],
    value: BigInt(0),
  });
  const { write: RevokeOffChain, data: txdata } = useContractWrite(OFFCHAIN);

  const {
    data: res,
    isError: err,
    isLoading: wait,
    isSuccess: succ,
  } = useWaitForTransaction({
    confirmations: 2,
    hash: txdata ? txdata?.hash : txdata1?.hash,
  });

  return (
    <div className={`flex-grow mx-auto`}>
      <div className="bg-white rounded-xl p-4">
        <div className="border rounded-lg text-white rounded-lg bg-black mt-3 mx-auto flex flex-col items-center">
          <Typography variant="h6">attestation Details</Typography>
          <Typography className=" bold text-white rounded-lg mb-2 mt-1">{`${type}`}</Typography>
        </div>
        <div className="items-center flex flex-col text-center border rounded-lg mx-auto">
          <Typography variant="h4">attestationUID</Typography>
          <EthereumAddress address={attestationData.attestationUID} />
        </div>
        <div className="flex justify-between">
          {/* Header */}
          <div className="mb-4 mt-3 w-4/6 flex-col flex border rounded-lg items-center text-center">
            <Field
              label="schemaUID"
              value={
                <EthereumAddress
                  address={attestationData.schemaUID}
                  link={`/schema?schemaUID=${attestationData.schemaUID}`}
                />
              }
            />
            <Field
              label="attester"
              value={
                <EthereumAddress
                  address={attestationData.from}
                  link={`/dashboard?address=${attestationData.from}`}
                />
              }
            />
            <Field
              label="recipient"
              value={
                attestationData.to ==
                "0x0000000000000000000000000000000000000000" ? (
                  <EthereumAddress address={attestationData.to} />
                ) : (
                  <EthereumAddress
                    address={attestationData.to}
                    link={`/dashboard?address=${attestationData.from}`}
                  />
                )
              }
            />
            <Field
              label="resolver"
              value={<EthereumAddress address={attestationData.resolver} />}
            />
          </div>
          <div className="w-2/6 mb-4 mt-3 items-center text-center border rounded-xl p-4">
            <Field
              label="created"
              value={<TimeCreated createdAt={attestationData.created} />}
            />
            <Field label="expiration" value={attestationData.expiration} />
            <Field
              label="revoked"
              value={attestationData.revoked ? "Yes" : "No"}
            />
            <Field
              label="revocable"
              value={attestationData.revocable ? "Yes" : "No"}
            />
          </div>
        </div>

        {/* Left Box */}
        <div className="items-center rounded-lg border mx-auto text-center flex flex-col">
          <Field label="Referencing Attestations" value={0} />
          <Field
            label="Referenced Attestation"
            value={attestationData.referencedAttestation}
          />
        </div>

        {/* Right Box */}
        <AccessBox
          uid={attestationData.schemaUID}
          isSchema={false}
          isRevocable={attestationData.revocable}
          onAccessInfoChange={handleAccessInfoChange}
          resolverContract={attestationData.resolver}
        />

        {
          // @ts-ignore
          CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase() ==
            attestationData?.resolver && accessInfo.viewAccess ? (
            <div className="mx-auto flex flex-col items-center justify-center">
              {" "}
              {/* Adjust the grid layout */}
              <SubscriptionItem
                key={0}
                itemData={{
                  // @ts-ignore
                  address: address,
                  // @ts-ignore
                  data: attestationData.data,
                  // @ts-ignore
                  context: attestationData.uid,
                  // @ts-ignore
                  from: attestationData.from,
                  // @ts-ignore
                  age: attestationData.created,
                  // @ts-ignore
                  type: type,
                }}
              />
            </div>
          ) : // @ts-ignore
          CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase() !=
            attestationData?.resolver ? (
            <div className="mx-auto text-center items-center border rounded-xl p-4">
              <div className="text-xl font-semibold">Decoded Data</div>
              <DecodedData decodedData={attestationData.decodedData} />
            </div>
          ) : (
            <div className="text-center mt-3">No access</div>
          )
        }
        {attestationData.revocable && (
          <div className="items-center flex flex-col ">
            <button
              disabled={attestationData.revoked}
              onClick={() => {
                if (type == "ONCHAIN") {
                  // @ts-ignore
                  write();
                } else {
                  // @ts-ignore
                  RevokeOffChain();
                }
              }}
              className={`text-white rounded-lg px-6 py-2 ${
                !attestationData.revoked
                  ? "hover:bg-white hover:text-black border bg-black border-black"
                  : "bg-gray-600"
              } mt-3`}
            >
              {attestationData.revoked
                ? "already revoked"
                : attestationData.revocable && type == "ONCHAIN"
                ? "revoke"
                : attestationData.revocable && type == "OFFCHAIN"
                ? "revoke off-chain"
                : "nonRevocable"}
            </button>
            <Notification
              isLoading={isLoading}
              isSuccess={isSuccess}
              isError={isError}
              wait={wait}
              error={err}
              success={succ}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttestationProfile;
