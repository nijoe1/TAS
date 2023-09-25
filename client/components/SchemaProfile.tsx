import React, { useEffect, useState } from "react";
import EthereumAddress from "@/components/EthereumAddress"; // Assuming your EthereumAddress component is in a separate file
import Field from "./Field";
import DecodedSchema from "./DecodedSchema";
import ChatModal from "./ChatModal";
import DynamicForm from "./DynamicForm";
import TimeCreated from "./TimeCreated"; // Replace with the actual path
import AccessBox from "./AccessBox";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import SubscriptionForm from "./SubscriptionForm";
import { CONTRACTS } from "@/constants/contracts";
import { getSchemaType } from "@/lib/contractReads";

type SchemaDataProps = {
  schemaData: {
    schemaUID: string;
    name: string;
    description: string;
    categories: string[];
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
  onAccessInfoChange: (accessData: {
    attestAccess: boolean; // Replace with your actual data
    revokeAccess: boolean; // Replace with your actual data
    viewAccess: boolean;
  }) => void;
  toggleShowAttestations: () => void;
  chainID: number;
  isEncrypted: boolean;
};

const SchemaProfile: React.FC<SchemaDataProps> = ({
  schemaData,
  onAccessInfoChange,
  chainID,
  isEncrypted,
  toggleShowAttestations,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isAttestModalOpen, setIsAttestModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [showAttestations, setShowAttestations] = useState(true)

  const openModal = () => {
    setModalIsOpen(true);
  };
  const openSubscribeModal = () => {
    setIsSubscribeModalOpen(true);
  };

  const closeSubscribeModal = () => {
    setIsSubscribeModalOpen(false);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openAttestModal = () => {
    setIsAttestModalOpen(true);
  };

  const closeAttestModal = () => {
    setIsAttestModalOpen(false);
  };
  function subscribe(): void {}

  function splitTextIntoChunks(text: any, chunkSize: any) {
    if (text) {
      const regex = new RegExp(`.{1,${chunkSize}}`, "g");
      return text.match(regex) || [];
    }
    return [];
  }

  const [accessInfo, setAccessInfo] = useState({
    attestAccess: false,
    revokeAccess: false,
    viewAccess: false,
  });

  // Define a function to update the accessInfo state
  const handleAccessInfoChange = (newAccessInfo: any) => {
    setAccessInfo(newAccessInfo);
    onAccessInfoChange(newAccessInfo);
  };

  return (
    <Card
      color="white"
      shadow={true}
      className="mb-4 p-4 border border-black rounded-xl"
    >
      <div className={`flex flex-col mx-auto `}>
        <div className="bg-white rounded-xl p-4 ">
          <Card className="flex flex-col border rounded-lg items-center">
            <CardBody>
              <div className="border rounded-lg flex flex-col items-center text-center mx-auto p-2">
                <Typography variant="h5" color="black">
                  {"SchemaUID"}
                </Typography>
                <EthereumAddress address={schemaData.schemaUID} />
              </div>
              <Typography
                variant="h5"
                color="black"
                className="mb-2 mt-2 text-center"
              >
                {`${schemaData.name}`}
              </Typography>
              <div className="text-center">
                {splitTextIntoChunks(schemaData.description, 50).map(
                  (chunk: any, index: any) => (
                    <React.Fragment key={index}>
                      {chunk}
                      <br />
                    </React.Fragment>
                  )
                )}
              </div>

              {schemaData.categories && (
                <BorderedBox strings={schemaData.categories}></BorderedBox>
              )}
            </CardBody>
          </Card>

          <div className="flex min-w-full justify-between mt-2 ">
            {/* Left Box */}
            <div className="border rounded-xl p-2  overflow-x-auto">
              <Field
                label="Created"
                value={<TimeCreated createdAt={schemaData.created} />}
              />
              <Field
                label="Creator"
                value={
                  <EthereumAddress
                    address={schemaData.creator}
                    link={`/dashboard?address=${schemaData.creator}`}
                  />
                }
              />
              <Field
                label="Resolver"
                value={
                  <EthereumAddress address={schemaData.resolverContract} />
                }
              />

              <Field
                label="Type"
                value={
                  <p className="flex  font-extrabold text-black px-2 py-1 rounded-full text-xxs whitespace-nowrap ">
                    {`${getSchemaType(schemaData.resolverContract, chainID)} (${
                      isEncrypted ? "Encrypted" : "Unencrypted"
                    })`}
                  </p>
                }
              />
            </div>

            {/* Right Box */}
            <div className="text-center flex-flex-col items-center border rounded-xl p-4  ">
              <p className="font-extrabold text-center text-black px-2 py-1 rounded-full text-md whitespace-nowrap ">
                Schema
              </p>
              <DecodedSchema schema={schemaData.decodedSchema} />
            </div>
          </div>
          <div className="w-full mb-2  mt-2 items-center">
            <AccessBox
              uid={schemaData.schemaUID}
              isSchema={true}
              isRevocable={schemaData.revocable}
              onAccessInfoChange={handleAccessInfoChange}
              resolverContract={schemaData.resolverContract}
            />
          </div>
          <div className="flex flex-col gap-2 justify-right">
            <ChatModal
              context={schemaData.schemaUID}
              isOpen={modalIsOpen}
              closeModal={closeModal}
            />
            {accessInfo.attestAccess && (
              <button
                type="button"
                className="bg-black text-white hover:bg-white hover:text-black border border-black py-2 px-4 rounded mx-auto"
                onClick={openAttestModal}
              >
                Attest with Schema
              </button>
            )}
            {accessInfo.attestAccess && (
              <button
                type="button"
                className="bg-black text-white hover:bg-white hover:text-black border border-black py-2 px-4 rounded mx-auto"
                onClick={()=> {toggleShowAttestations();setShowAttestations(!showAttestations) }}
              >
                {showAttestations? "showDelegatedRequests":"showAttestations"}
              </button>
            )}
            {(accessInfo.attestAccess || accessInfo.viewAccess) && (
              <button
                className="bg-black text-white hover:bg-white hover:text-black border border-black py-2 px-4 rounded mx-auto"
                onClick={openModal}
              >
                feedbackChat
              </button>
            )}
            {/* @ts-ignore */}
            {!accessInfo.viewAccess &&
              !accessInfo.attestAccess &&
              schemaData.resolverContract.toLowerCase() ==
                // @ts-ignore
                CONTRACTS.SubscriptionResolver[
                  chainID
                ].contract.toLowerCase() && (
                <button
                  className="bg-black text-white hover:bg-white hover:text-black border border-black py-2 px-4 rounded mx-auto"
                  onClick={openSubscribeModal}
                >
                  Subscribe
                </button>
              )}
            {isAttestModalOpen && (
              <DynamicForm
                schema={schemaData.rawSchema}
                schemaUID={schemaData.schemaUID}
                isSubscription={isEncrypted}
                resolver={schemaData.resolverContract}
                isOpen={isAttestModalOpen}
                onClose={closeAttestModal}
                revocable={schemaData.revocable}
              />
            )}
            {isSubscribeModalOpen && (
              <SubscriptionForm
                schemaUID={schemaData.schemaUID}
                isOpen={isSubscribeModalOpen}
                onClose={closeSubscribeModal}
                onCreate={subscribe}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
export default SchemaProfile;

interface BorderedBoxProps {
  strings: string[];
}

const BorderedBox: React.FC<BorderedBoxProps> = ({ strings }) => {
  return (
    <div>
      {strings.length > 0 && (
        <div className="flex flex-col item-center text-center ">
          <Typography variant="h5" color="black" className=" mt-2 text-center">
            Categories
          </Typography>
          <div className="border p-4 rounded-md   flex flex-wrap gap-2 mx-auto">
            {strings.map((str, index) => (
              <div key={index} className="flex flex-col mx-auto">
                <span
                  className="bg-black rounded-md text-center text-white font-bold p-1"
                  style={{ flex: "1 0 30%", minWidth: "100px" }}
                >
                  {str}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
