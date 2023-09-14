import React, { useEffect, useState } from "react";
import EthereumAddress from "@/components/EthereumAddress"; // Assuming your EthereumAddress component is in a separate file
import Field from "./Field";
import DecodedSchema from "./DecodedSchema";
import ChatModal from "./ChatModal";
import DynamicForm from "./DynamicForm";
import TimeCreated from "./TimeCreated"; // Replace with the actual path
import AccessBox from "./AccessBox";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { subscribe } from "diagnostics_channel";
import SubscriptionForm from "./SubscriptionForm";
import { CONTRACTS } from "@/constants/contracts";


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
  onAccessInfoChange: (accessData: {
    attestAccess: boolean; // Replace with your actual data
    revokeAccess: boolean; // Replace with your actual data
    viewAccess: boolean;
  }) => void;
  chainID:number;
};

const SchemaProfile: React.FC<SchemaDataProps> = ({ schemaData ,onAccessInfoChange,chainID}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [subscribeModalIsOpen, setSubscribeModalIsOpen] = useState(false);
  const [isAttestModalOpen, setIsAttestModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

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

  const formattedDescription = formatDescription(schemaData.description);

  function splitTextIntoChunks(text:any, chunkSize:any) {
    const regex = new RegExp(`.{1,${chunkSize}}`, "g");
    return text.match(regex) || [];
  }

  const [accessInfo, setAccessInfo] = useState({
    attestAccess: false,
    revokeAccess: false,
    viewAccess: false,
  });

  // Define a function to update the accessInfo state
  const handleAccessInfoChange = (newAccessInfo:any) => {
    setAccessInfo(newAccessInfo);
    onAccessInfoChange(newAccessInfo);
  };

  return (
    <div className={`flex-grow mx-auto `}>
      <div className="bg-white rounded-xl p-4 ">
        <Typography variant="h6" color="blue-gray">
          {"Schema Details"}
        </Typography>
        <Card className="mt-6 flex flex-col border rounded-lg items-center">
          <CardBody>
            <div className="border rounded-lg items-center text-center mx-auto">
              <Typography variant="h5" color="blue-gray">
                {"SchemaUID"}
              </Typography>
              <EthereumAddress address={schemaData.schemaUID} />
            </div>
            <Typography
              variant="h5"
              color="blue-gray"
              className="mb-2 text-center"
            >
              {`${schemaData.name}`}
            </Typography>
            <div className="text-center">
              {splitTextIntoChunks(schemaData.description, 50).map(
                (chunk:any, index:any) => (
                  <React.Fragment key={index}>
                    {chunk}
                    <br />
                  </React.Fragment>
                )
              )}
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-between  ">
          {/* Left Box */}
          <div className="w-3/4  border rounded-xl p-4 mx-auto overflow-x-auto">
            <Field
              label="Created"
              value={<TimeCreated createdAt={schemaData.created} />}
            />
            <Field
              label="Creator"
              value={<EthereumAddress address={schemaData.creator} />}
            />
            <Field
              label="Resolver"
              value={<EthereumAddress address={schemaData.resolverContract} />}
            />
          </div>

          {/* Right Box */}
          <div className="w-1/4  text-center border rounded-xl p-4 mx-auto ">
            <Field
              label="Schema"
              value={<DecodedSchema schema={schemaData.decodedSchema} />}
            />
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
        <div className="flex flex-col justify-right">
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
          {accessInfo.attestAccess ||
            (accessInfo.viewAccess && (
              <button
                className="bg-black text-white hover:bg-white hover:text-black border border-black py-2 px-4 rounded mx-auto"
                onClick={openModal}
              >
                feedbackChat
              </button>
            ))}
          {!accessInfo.attestAccess && !accessInfo.viewAccess && (
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
              // @ts-ignore
              isSubscription={schemaData.resolverContract==CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase()?true:false}
              isOpen={isAttestModalOpen}
              onClose={closeAttestModal}
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
  );
};
export default SchemaProfile;

function formatDescription(description: string) {
  const maxLength = 32; // Maximum characters per line
  const words = description.split(" "); // Split the text into words

  let currentLine = "";
  let formattedDescription = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (currentLine.length + word.length <= maxLength) {
      // Add the word to the current line if it doesn't exceed the maximum length
      if (currentLine !== "") {
        currentLine += " "; // Add a space if it's not the first word on the line
      }
      currentLine += word;
    } else {
      // If adding the word would exceed the maximum length, start a new paragraph
      formattedDescription.push(currentLine);
      currentLine = word; // Start a new paragraph with the current word
    }
  }

  // Add the last paragraph
  formattedDescription.push(currentLine);

  return formattedDescription;
}
