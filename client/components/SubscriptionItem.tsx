import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

import { signMessage } from "@wagmi/core";
import lighthouse from "@lighthouse-web3/sdk";
import {
  uploadFile,
  decrypt,
  uploadFileEncrypted,
  applyAccessConditions,
  generateLighthouseJWT,
} from "@/lib/lighthouse";
type SubscriptionItemProps = {
  itemData: {
    data: string;
    address: string;
  };
};

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ itemData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileBlob, setFileBlob] = useState(null);
  const [fileType, setFileType] = useState("");

  async function parseBlobToJson(blob: any) {
    try {
      const response = await fetch(URL.createObjectURL(blob));
      const jsonData = await response.json();
      return jsonData;
    } catch (error: any) {
      throw new Error("Error parsing Blob as JSON: " + error.message);
    }
  }

  function transformDecodedData(inputObject: any) {
    // @ts-ignore
    const transformedArray = [];

    inputObject.forEach((item:any) => {
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
      console.log(ipfsCID);
      const blob = await decrypt(ipfsCID, itemData.address, jwt);
      const json = await parseBlobToJson(blob);
      setName(json.name);
      setDescription(json.description);

      const fileblob = await decrypt(json.file.CID, itemData.address, jwt);
      // Set the Blob and file type
      setFileBlob(fileblob);
      setFileType(json.file.type);
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
      </CardBody>
      <CardFooter className="pt-0">
        {fileBlob && fileType ? (
          // Check if the file type is an image or video
          fileType.startsWith("image") ? (
            // Render as an image
            <img src={URL.createObjectURL(fileBlob)} alt="File" />
          ) : fileType.startsWith("video") ? (
            <div>
              <video controls width="400" height="300">
                <source src={URL.createObjectURL(fileBlob)} type={fileType} />
                Your browser does not support the video tag.
              </video>
              <a
                href={URL.createObjectURL(fileBlob)}
                download={`${name}.${getFileExtension(fileType)}`}
              >
                Download File
              </a>
            </div>
          ) : (
            // Render as a link or provide appropriate handling for other file types
            <a
              href={URL.createObjectURL(fileBlob)}
              download={`${name}.${getFileExtension(fileType)}`}
            >
              Download File
            </a>
          )
        ) : (
          // Render loading message or handle other cases
          <p>Loading file...</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionItem;
