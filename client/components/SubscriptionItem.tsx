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

  const signEncryption = async () => {
    let key = localStorage.getItem(`lighthouse-jwt-${itemData.address}`);
    if (key) {
      return key;
    } else {
      try {
        const response = await lighthouse.getAuthMessage(itemData.address);

        if (response && response.data && response.data.message) {
          return await generateLighthouseJWT(
            itemData.address,
            await signMessage({
              message: response.data.message,
            })
          );
        } else {
          console.error("Error: Unable to retrieve authentication message.");
          // Handle the error or return a default value as needed.
          return null;
        }
      } catch (error) {
        console.error("Error while getting authentication message:", error);
        // Handle the error or return a default value as needed.
        return null;
      }
    }
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

  function transformDecodedData(inputObject) {
    const transformedArray = [];

    inputObject.forEach((item) => {
      const transformedItem = {
        type: item.type,
        name: item.name,
        value: item.value.value,
      };

      transformedArray.push(transformedItem);
    });

    return transformedArray;
  }

  useEffect(() => {
    const fetch = async () => {
      const encoder = new SchemaEncoder("string jsonCID");
      const ipfsCID = transformDecodedData(encoder.decodeData(itemData.data))[0]
        .value;
      const blob = await decrypt(
        ipfsCID,
        itemData.address,
        await signEncryption()
      );
      const json = await parseBlobToJson(blob);
      setName(json.name);
      setDescription(json.description);

      const fileblob = await decrypt(
        json.file.CID,
        itemData.address,
        await signEncryption()
      );
      // Set the Blob and file type
      setFileBlob(fileblob);
      setFileType(json.file.type);
    };

    fetch();
  }, []);

  function getFileExtension(mimeType) {
    const parts = mimeType.split('/');
    if (parts.length === 2) {
      return parts[1];
    }
    return '';
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
              <a href={URL.createObjectURL(fileBlob)} download={`${name}.${getFileExtension(fileType)}`}>
                Download File
              </a>
            </div>
          ) : (
            // Render as a link or provide appropriate handling for other file types
            <a href={URL.createObjectURL(fileBlob)} download={`${name}.${getFileExtension(fileType)}`}>
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
