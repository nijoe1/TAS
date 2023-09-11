import React, { useEffect, useState } from "react";
import EthereumAddress from "@/components/EthereumAddress"; // Assuming your EthereumAddress component is in a separate file
import Field from "./Field";
import DecodedSchema from "./DecodedSchema";
import ChatModal from "./ChatModal";
import DynamicForm from "./DynamicForm";
import TimeCreated from "./TimeCreated"; // Replace with the actual path

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
};

const SchemaProfile: React.FC<SchemaDataProps> = ({ schemaData }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const [isAttestModalOpen, setIsAttestModalOpen] = useState(false);

  const openAttestModal = () => {
    setIsAttestModalOpen(true);
  };

  const closeAttestModal = () => {
    setIsAttestModalOpen(false);
  };
  function createAttestation(schemaData: any): void {}
  const formattedDescription = formatDescription(schemaData.description);

  return (
    <div className={`flex-grow mx-auto `}>
      <Field label={"Schema Details"} value="" />
      <div className="bg-white rounded-xl p-4 ">
        <div className="flex justify-between ">
          {/* Header */}
          <div className=" w-2/4  border rounded-xl mx-auto overflow-x-auto  ">
            <Field
              label="SchemaUID"
              value={<EthereumAddress address={schemaData.schemaUID} />}
            />
            <Field label="Name" value={schemaData.name} />
          </div>
          <div className="w-2/4  text-center border rounded-xl p-4 mx-auto">
            <Field label="Description" value={""} />
            {formattedDescription.map((paragraph, index) => (
              <div
                className="text-center mx-auto"
                style={{
                  maxWidth: "100%",
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                }}
                key={index}
              >
                {paragraph}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between  ">
          {/* Left Box */}
          <div className="w-2/4  border rounded-xl p-4 mx-auto overflow-x-auto">
            <Field
              label="Created"
              value={<TimeCreated createdAt={schemaData.created} />}
            />
            <Field
              label="Creator"
              value={<EthereumAddress address={schemaData.creator} />}
              isAddress={true}
            />
            <Field
              label="Resolver"
              value={<EthereumAddress address={schemaData.resolverContract} />}
              isAddress={true}
            />
          </div>

          {/* Right Box */}
          <div className="w-2/4  text-center border rounded-xl p-4 mx-auto ">
            <Field label="AttestAccess" value={"YES"} />
            <Field label="RevokeAccess" value={"YES"} />
            <Field label="ViewAccess" value={"YES"} />
          </div>
        </div>
        <div className="w-full  border rounded-xl p-4 mx-auto my-auto">
          <Field
            label="Decoded Schema"
            value={<DecodedSchema schema={schemaData.decodedSchema} />}
          />
        </div>
        <div className="flex flex-col justify-right">
          <ChatModal
            context={schemaData.schemaUID}
            isOpen={modalIsOpen}
            closeModal={closeModal}
          />
          <button
            type="button"
            className="bg-black text-white hover:bg-white hover:text-black border border-black py-2 px-4 rounded mx-auto"
            onClick={openAttestModal}
          >
            Attest with Schema
          </button>
          <button
            className="bg-black text-white hover:bg-white hover:text-black border border-black py-2 px-4 rounded mx-auto"
            onClick={openModal}
          >
            feedbackChat
          </button>
          {isAttestModalOpen && (
            <DynamicForm
              schema={schemaData.rawSchema}
              schemaUID={schemaData.schemaUID}
              isOpen={isAttestModalOpen}
              onClose={closeAttestModal}
              onCreate={createAttestation}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default SchemaProfile;

function formatDescription(description) {
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
