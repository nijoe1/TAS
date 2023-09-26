import React, { useEffect, useState } from "react";
import { PiListDuotone } from "react-icons/pi";
import { SiZeromq } from "react-icons/si";
import EthereumAddress from "@/components/EthereumAddress";
import DecodedData from "@/components/DecodedData";
import TimeCreated from "./TimeCreated";
import Field from "@/components/Field";
import { Card, Typography } from "@material-tailwind/react";
import AccessBox from "./AccessBox";
import {
  useContractWrite,
  usePrepareContractWrite,
  useChainId,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { getSchemaType } from "@/lib/contractReads";

import { CONTRACTS } from "@/constants/contracts";
import Notification from "./Notification";
type AttestationProfileProps = {
  attestationData: {
    attestationUID: string;
    refUID: string;
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
      blobs?: Blob[];
      json?: any;
      CIDs?: string[];
    }>;
    data: string;
    referencedInAttestations: Array<{
      uid: string;
      type: string;
    }>;
    referencingAttestations: number;
  };
  type: string;
  isEncrypted?: boolean;
  viewAccess?: boolean;
};

const AttestationProfile: React.FC<AttestationProfileProps> = ({
  attestationData,
  type,
  isEncrypted,
  viewAccess,
}) => {
  const [accessInfo, setAccessInfo] = useState({
    attestAccess: false,
    revokeAccess: false,
    viewAccess: false,
  });

  const [taken, setTaken] = useState(false);
  // Define a function to update the accessInfo state
  const handleAccessInfoChange = (newAccessInfo: any) => {
    setAccessInfo(newAccessInfo);
  };
  const chainID = useChainId();

  const { address } = useAccount();

  const { config, error } = usePrepareContractWrite({
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
    <Card
      color="white"
      shadow={true}
      className="mb-4 p-4 border  border border-black rounded-xl"
    >
      <div className={`flex flex-col mx-auto text-black`}>
        <div className="bg-white rounded-xl p-4 flex flex-col mx-auto">
          <div className="items-center flex flex-col text-center border border-black rounded-lg mx-auto">
            <Typography variant="h4">attestationUID</Typography>
            <EthereumAddress address={attestationData.attestationUID} />
          </div>
          <div className="border border-black rounded-lg text-white text-center rounded-lg bg-black mt-2 flex flex-col items-center mx-auto p-1">
            <Typography className=" bold text-white rounded-lg ">{`${type}`}</Typography>
          </div>
          <div className="flex justify-between gap-2">
            {/* Header */}
            <div className="mb-2 mt-2 w-5/8 p-2 border border-black rounded-lg ">
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
                label="refUID"
                value={
                  <EthereumAddress
                    address={attestationData.refUID}
                    link={`/attestation?uid=${attestationData.refUID}`}
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
              <Field
                label="Type"
                value={
                  <p className="flex  font-extrabold text-black px-2 py-1 rounded-full text-xxs whitespace-nowrap ">
                    {`${getSchemaType(attestationData.resolver, chainID)} (${
                      isEncrypted ? "Encrypted" : "Unencrypted"
                    })`}
                  </p>
                }
              />
            </div>
            <div className="w-3/8 mb-4 mt-3 gap-1  border border-black rounded-xl p-1">
              <Field
                label="created"
                value={<TimeCreated createdAt={attestationData.created} />}
              />
              {attestationData.expiration == "Never" ? (
                <Field
                  label="expiration"
                  value={
                    // @ts-ignore
                    <p className="flex  font-extrabold text-black px-2 py-1 rounded-full text-xxs whitespace-nowrap ">
                      {attestationData.expiration}
                    </p>
                  }
                />
              ) : (
                <Field
                  label="expiration"
                  value={
                    <TimeCreated
                      subscription={true}
                      createdAt={attestationData.expiration}
                    />
                  }
                />
              )}
              <Field
                label="revoked"
                value={
                  <p className="flex  font-extrabold text-black px-2 py-1 rounded-full text-xxs whitespace-nowrap ">
                    {`${attestationData.revoked ? "Yes" : "No"}`}
                  </p>
                }
              />
              <Field
                label="revocable"
                value={
                  <p className="flex  font-extrabold text-black px-2 py-1 rounded-full text-xxs whitespace-nowrap ">
                    {`${attestationData.revocable ? "Yes" : "No"}`}
                  </p>
                }
              />
            </div>
          </div>

          {/* Left Box */}
          <div className="items-center rounded-lg border border-black mx-auto text-center flex flex-col mb-2">
            <Field
              notshow={true}
              label="Referenced in Attestations"
              value={
                <Modal data={attestationData.referencedInAttestations}></Modal>
              }
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
            accessInfo.viewAccess || viewAccess ? (
              <div className="flex flex-col mx-auto text-center items-center p-2 border border-black rounded-xl mt-2">
                <p className="text-xl font-semibold mb-1">Decoded Data</p>
                <DecodedData
                  decodedData={attestationData.decodedData}
                  isEncrypted={isEncrypted}
                />
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
                    ? "hover:bg-white hover:text-black border border-black bg-black border border-black-black"
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
                isError={undefined}
                wait={wait}
                error={err}
                success={succ}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AttestationProfile;

interface AttestationData {
  uid: string;
  type: string;
}

interface ModalProps {
  data: AttestationData[];
}

const Modal: React.FC<ModalProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {!isModalOpen && data.length > 0 ? (
        <PiListDuotone
          className="cursor-pointer ml-1"
          onClick={handleOpenModal}
        ></PiListDuotone>
      ) : (
        data.length == 0 && <SiZeromq className=" ml-1"></SiZeromq>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div>
              {data.map(({ uid, type }) => (
                <div key={uid}>
                  <EthereumAddress
                    address={uid}
                    link={`/attestation?uid=${uid}&type=${type}`}
                  />
                </div>
              ))}
            </div>
            <span className="close cursor-pointer" onClick={handleCloseModal}>
              &times;
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
