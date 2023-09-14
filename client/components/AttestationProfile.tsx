import React, { useState } from "react";
import EthereumAddress from "@/components/EthereumAddress";
import DecodedData from "@/components/DecodedData";
import TimeCreated from "./TimeCreated";
import Field from "@/components/Field";
import { Typography } from "@material-tailwind/react";
import AccessBox from "./AccessBox";
import { useContractWrite, usePrepareContractWrite, useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import Notification from "./Notification";
type AttestationProfileProps = {
  attestationData: {
    attestationUID: string;
    created: string;
    expiration: string;
    revoked: boolean;
    revocable: boolean;
    resolver: string;
    schemaUID: string;
    from: string;
    to: string;
    decodedData: Array<{ type: string; name: string; value: string }>;
    referencedAttestation: string;
    referencingAttestations: number;
  };
};

const AttestationProfile: React.FC<AttestationProfileProps> = ({
  attestationData,
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

  const { config } = usePrepareContractWrite({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "revoke",
    args: [[attestationData.schemaUID, [attestationData.attestationUID, 0]]],
    value: BigInt(0),
  });
  const { write, isError, isLoading, isSuccess } = useContractWrite(config);

  return (
    <div className={`flex-grow mx-auto`}>
      <div className="bg-white rounded-xl p-4">
        <Typography variant="h6">attestation Details</Typography>

        <div className="items-center flex flex-col text-center border rounded-lg mx-auto">
          <Typography variant="h4">attestationUID</Typography>
          <EthereumAddress address={attestationData.attestationUID} />
        </div>
        <div className="flex justify-between">
          {/* Header */}
          <div className="mb-4 mt-3 w-4/6 flex-col flex border rounded-lg items-center text-center">
            <Field
              label="schemaUID"
              value={<EthereumAddress address={attestationData.schemaUID} />}
            />
            <Field
              label="attester"
              value={<EthereumAddress address={attestationData.from} />}
            />
            <Field
              label="recipient"
              value={<EthereumAddress address={attestationData.to} />}
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
          <Field
            label="Referencing Attestations"
            value={attestationData.referencingAttestations.toString()}
          />
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
        <div className="mx-auto text-center items-center border rounded-xl p-4">
          <div className="text-xl font-semibold">Decoded Data</div>
          <DecodedData decodedData={attestationData.decodedData} />
        </div>
        {attestationData.revocable && (
          <div className="items-center flex flex-col ">
            <button
              disabled={attestationData.revoked || !attestationData.revocable}
              onClick={write}
              className={`text-white rounded-lg px-6 py-2 ${!attestationData.revoked && attestationData.revocable ? "hover:bg-white hover:text-black border bg-black border-black":"bg-gray-600" } mt-3`}
            >
              {attestationData.revoked? "already revoked":attestationData.revocable?"revoke":"nonRevocable"}
            </button>
            <Notification
              isLoading={isLoading}
              isSuccess={isSuccess}
              isError={isError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttestationProfile;
