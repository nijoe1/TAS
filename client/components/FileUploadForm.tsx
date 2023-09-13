import React, { useState } from "react";
import { Progress } from "@material-tailwind/react";

import { useAccount } from "wagmi";
import {
  uploadFileEncrypted,
  applyAccessConditions,
  uploadFile,
} from "@/lib/lighthouse";

interface FileUploadFormProps {
  isSubscription: boolean;
  chainID: number;
  schemaUID: string;
  type: string;
  handleInputChange: (
    newValue: string,
    attrName: string,
    attrType: string
  ) => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({
  isSubscription,
  chainID,
  schemaUID,
  type,
  handleInputChange,
}) => {
  const { address } = useAccount();

  const [formDataJson, setFormDataJson] = useState({
    name: "",
    description: "",
    fileType: "image",
  });
  const [onProgress, setOnProgress] = useState(-1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormDataJson({
      ...formDataJson,
      [name]: value,
    });
  };

  function getAcceptedFileTypes(fileType: any) {
    const allowedFileTypes = {
      image: "image/jpeg, image/png, image/gif",
      video: "video/mp4, video/webm, video/ogg",
      pdf: "application/pdf",
      csv: "text/csv",
    };
    // @ts-ignore
    return allowedFileTypes[fileType] || "";
  }

  const handleFileUpload = async (file: any) => {
    if (isSubscription) {
      if (type == "jsonCID") {
        await handleEncryptedJsonUpload(file);
      } else {
        await handleEncryptedFileUpload(file);
      }
    } else {
      if (type == "jsonCID") {
        await handleJsonUpload(file);
      } else {
        await handleSimpleFileUpload(file);
      }
    }
  };

  const handleSimpleFileUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    // Upload file and get encrypted CID
    const CID = await uploadFile(file, key, setOnProgress);
    setOnProgress(100);
    handleInputChange(CID.Hash, type, "string");
  };

  const handleJsonUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    // Upload file and get encrypted CID
    const CID = await uploadFile(file, key, setOnProgress);

    // Create JSON object
    const json = {
      name: formDataJson.name,
      description: formDataJson.description,
      file: {
        name: CID.Name,
        type: file[0].type,
        CID: CID.Hash,
      },
    };

    const jsonBlob = new Blob([JSON.stringify(json)], {
      type: "application/json",
    });

    // Create a File object from the Blob
    const jsonFile = new File([jsonBlob], `${formDataJson.name}.json`, {
      type: "application/json",
    });
    // Upload JSON
    let data = await uploadFile([jsonFile], key, setOnProgress);
    setOnProgress(100);
    // Update state
    // setFileURL(await decrypt(encryptedCID, address, signedEncryption));
    handleInputChange(data.Hash, type, "string");
  };

  const handleEncryptedFileUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    let token = localStorage.getItem(`lighthouse-jwt-${address}`);
    // Upload file and get encrypted CID
    const CID = await uploadFileEncrypted(
      file,
      key,
      address,
      token,
      setOnProgress
    );

    let res = await applyAccessConditions(
      CID[0].Hash,
      chainID,
      schemaUID,
      address,
      token
    );
    setOnProgress(100);
    handleInputChange(res.data.cid, type, "string");
  };

  const handleEncryptedJsonUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    let token = localStorage.getItem(`lighthouse-jwt-${address}`);
    // Upload file and get encrypted CID
    const CID = await uploadFileEncrypted(
      file,
      key,
      address,
      token,
      setOnProgress
    );

    let res = await applyAccessConditions(
      CID[0].Hash,
      chainID,
      schemaUID,
      address,
      token
    );
    console.log("Access Controll Applied REsponse:  ", res);

    // Create JSON object
    const json = {
      name: formDataJson.name,
      description: formDataJson.description,
      file: {
        name: CID[0].Name,
        type: file[0].type,
        CID: res.data.cid,
      },
    };

    const jsonBlob = new Blob([JSON.stringify(json)], {
      type: "application/json",
    });

    // Create a File object from the Blob
    const jsonFile = new File([jsonBlob], `${formDataJson.name}.json`, {
      type: "application/json",
    });
    // Upload JSON
    let jsonCID = await uploadFileEncrypted(
      [jsonFile],
      key,
      address,
      token,
      setOnProgress
    );
    console.log(jsonCID[0].Hash);

    res = await applyAccessConditions(
      jsonCID[0].Hash,
      chainID,
      schemaUID,
      address,
      token
    );
    setOnProgress(100);
    handleInputChange(res.data.cid, type, "string");
  };

  return (
    <div className=" mx-auto p-4 border rounded-lg bg-white shadow-lg flex flex-col">
      {type == "jsonCID" ? (
        <div className="flex flex-col">
          <label htmlFor={"jsonFile"} className="mb-1">
            {"jsonFile"}
          </label>
          <label className="flex flex-col text-center">
            Name
            <input
              className="ml-2 border rounded-full"
              type="text"
              name="name"
              value={formDataJson.name}
              onChange={handleChange}
            />
          </label>
          <br />
          <label className="flex flex-col text-center">
            Description:
            <input
              className="ml-2 border rounded-full"
              type="text"
              name="description"
              value={formDataJson.description}
              onChange={handleChange}
            />
          </label>
          <br />
          <label className="flex flex-col text-center mx-auto">
            File Type:
            <select
              className="ml-2  rounded-lg text-center"
              name="fileType"
              value={formDataJson.fileType}
              onChange={handleChange}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </label>
          <br />
          {onProgress < 0 ? (
            <input
              className="rounded-lg"
              type="file"
              accept={getAcceptedFileTypes(formDataJson.fileType)}
              onChange={async (e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files);
                }
              }}
            />
          ) : (
            <div className="items-center text-center">
              <Progress
                className="text-white bg-black rounded-lg"
                value={onProgress}
                label="Completed"
              />
            </div>
          )}
        </div>
      ) : type == "imageCID" ? (
        <div className="flex flex-col">
          <label htmlFor={"image upload"} className="mb-1">
            {"image upload"}
          </label>
          {onProgress < 0 ? (
            <input
              className="rounded-lg"
              type="file"
              accept={getAcceptedFileTypes("image")}
              onChange={async (e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files);
                }
              }}
            />
          ) : (
            <div className="items-center text-center">
              <Progress
                className="text-white bg-black rounded-lg"
                value={onProgress}
                label="Completed"
              />
            </div>
          )}
        </div>
      ) : (
        type == "videoCID" && (
          <div className="flex flex-col">
          <label htmlFor={"video upload"} className="mb-1">
            {"video upload"}
          </label>
            {onProgress < 0 ? (
              <input
                className="rounded-lg"
                type="file"
                accept={getAcceptedFileTypes("video")}
                onChange={async (e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files);
                  }
                }}
              />
            ) : (
              <div className="items-center text-center">
                <Progress
                  className="text-white bg-black rounded-lg"
                  value={onProgress}
                  label="Completed"
                />
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default FileUploadForm;
