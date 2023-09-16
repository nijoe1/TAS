import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import ChatModal from "@/components/ChatModal";
import { decrypt } from "@/lib/lighthouse";
import { PiChatDotsFill } from "react-icons/pi";
import TimeCreated from "./TimeCreated";
import FileViewer from "./FileViewer";
import { GrUserWorker } from "react-icons/gr";
import router from "next/router";
type SubscriptionItemProps = {
  itemData: {
    data: string;
    address: `0x${string}`;
    context: string;
    from: `0x${string}`;
    age: number;
    type: string;
  };
};

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ itemData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileBlob, setFileBlob] = useState(null);
  const [fileType, setFileType] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openFeedbackModal = () => {
    setModalIsOpen(true);
  };

  const closeFeedbackModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  async function parseBlobToJson(blob: any) {
    try {
      const response = await fetch(URL.createObjectURL(blob));
      const jsonData = await response.json();
      return jsonData;
    } catch (error: any) {
      throw new Error("Error parsing Blob as JSON: " + error.message);
    }
  }

  const allowedFileTypes = {
    "image/jpeg": "Image",
    "image/png": "Image",
    "image/gif": "Image",
    "video/mp4": "Video",
    "video/webm": "Video",
    "video/ogg": "Video",
    "application/pdf": "PDF",
    "text/csv": "CSV",
  };

  const getFileTypeFromAccept = (acceptValue: string): string | undefined => {
    const acceptValues = acceptValue.split(",").map((val) => val.trim());

    for (const [key, value] of Object.entries(allowedFileTypes)) {
      if (acceptValues.includes(key)) {
        return value;
      }
    }

    return undefined;
  };

  function transformDecodedData(inputObject: any) {
    // @ts-ignore
    const transformedArray = [];

    inputObject.forEach((item: any) => {
      const transformedItem = {
        type: item.type,
        name: item.name,
        value: item.value.value,
      };

      transformedArray.push(transformedItem);
    });
    // @ts-ignore
    return transformedArray;
  }

  useEffect(() => {
    const fetch = async () => {
      const encoder = new SchemaEncoder("string jsonCID");
      const ipfsCID = transformDecodedData(encoder.decodeData(itemData.data))[0]
        .value;
      const jwt = localStorage.getItem(`lighthouse-jwt-${itemData.address}`);
      const blob = await decrypt(ipfsCID, itemData.address, jwt);
      const json = await parseBlobToJson(blob);
      setName(json.name);
      setDescription(json.description);

      const fileblob = await decrypt(json.file.CID, itemData.address, jwt);
      // Set the Blob and file type
      setFileBlob(fileblob);
      // @ts-ignore
      setFileType(getFileTypeFromAccept(json.file.type));
    };

    fetch();
  }, []);

  function getFileExtension(mimeType: any) {
    const parts = mimeType.split("/");
    if (parts.length === 2) {
      return parts[1];
    }
    return "";
  }

  return (
    <Card className="mt-6 w-96">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {name}
        </Typography>
        <Typography>{description}</Typography>
        <div className="mt-4">
          {fileBlob && fileType ? (
            <FileViewer
              fileBlob={fileBlob}
              fileType={fileType}
              fileUri={null}
            />
          ) : (
            <p>Loading file...</p>
          )}
        </div>
      </CardBody>
      <div className="flex-grow"></div>
      <CardFooter className="pt-0">
        <div className="flex flex-wrap itens-center justify-between mt-4">
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Creator:</Typography>
            <div className="flex flex-wrap items-center">
              <GrUserWorker
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard?address=${itemData.from}`)
                }
                title={`Go to ${itemData.from}'s dashboard`}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Age:</Typography>
            <TimeCreated createdAt={itemData.age} />
          </div>
        </div>

        <div className="flex  itens-center justify-between mt-4 mx-auto">
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Type:</Typography>
            <Typography>{itemData.type}</Typography>
          </div>
          <div className="flex flex-wrap items-center">
            <Typography variant="small">Comments:</Typography>
            <PiChatDotsFill
              className="bolder"
              onClick={() => {
                openFeedbackModal();
              }}
            />{" "}
          </div>
          <ChatModal
            context={itemData.context}
            isOpen={modalIsOpen}
            closeModal={closeFeedbackModal}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionItem;
