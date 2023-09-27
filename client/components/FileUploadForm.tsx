import React, { useState } from "react";
import { Progress } from "@material-tailwind/react";

import { useAccount } from "wagmi";
import {
  uploadFileEncrypted,
  applyAccessConditions,
  uploadFile,
  uploadFolder,
  jsonCIDsUpload,
} from "@/lib/lighthouse";

interface FileUploadFormProps {
  isSubscription: boolean;
  resolver?: string;
  chainID: number;
  schemaUID: string;
  type: string;
  handleInputChange: (
    newValue: any,
    attrName: string,
    attrType: string
  ) => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({
  isSubscription,
  resolver,
  chainID,
  schemaUID,
  type,
  handleInputChange,
}) => {
  const { address } = useAccount();

  const [onProgress, setOnProgress] = useState(-1);

  const acceptedFileTypes = {
    image: "image/jpeg, image/png, image/gif",
    video: "video/mp4, video/webm, video/ogg",
    pdf: "application/pdf",
    csv: "text/csv",
    json: "application/json",
  };

  const getAcceptedFileTypes = (fileType: string) =>
    // @ts-ignore
    acceptedFileTypes[fileType] || "";

  const handleSimpleFileUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);
    // Upload file and get encrypted CID
    const CID = await uploadFile(file, key, setOnProgress);
    setOnProgress(100);
    handleInputChange(CID.Hash, type, "string");
  };

  const handleFolderUpload = async (files: any, type: any) => {
    let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);

    let CIDs = await uploadFolder(files, type, key, setOnProgress);
    setOnProgress(100);

    handleInputChange(CIDs, type, "string[]");
  };

  const handleEncryptedFolderUpload = async (files: any) => {
    let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);
    let token = localStorage.getItem(`lighthouse-jwt-${address}`);
    let fileArray = [];
    for (const file of files) {
      const CID = await uploadFileEncrypted(
        [file],
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
        token,
        resolver
      );
      fileArray.push(res.data.cid);
    }

    let ret = await jsonCIDsUpload(key, files[0].type, fileArray);
    setOnProgress(100);

    handleInputChange(ret, type, "string[]");
  };

  const handleEncryptedFileUpload = async (file: any) => {
    let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);
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
      token,
      resolver
    );
    setOnProgress(100);
    handleInputChange(res.data.cid, type, "string");
  };

  const renderFileUploadUI = () => {
    switch (type) {
      case "jsonCID":
      case "imageCID":
      case "videoCID":
        return (
          <div className="flex flex-col border border-black rounded-md p-2">
            <label htmlFor={`${type.slice(0, -3)} Upload`} className="mb-1">
              {`${type.slice(0, -3)} Upload`}
            </label>

            <input
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              type="file"
              accept={getAcceptedFileTypes(type.slice(0, -3))}
              onChange={(e) => {
                if (e.target.files) {
                  if (isSubscription) {
                    handleEncryptedFileUpload(e.target.files);
                  } else {
                    handleSimpleFileUpload(e.target.files);
                  }
                }
              }}
            />

            {onProgress > 0 && (
              <div className="items-center text-center p-2 ">
                <Progress
                  className="text-white bg-black rounded-lg p-2  "
                  value={onProgress}
                  label="Completed"
                />
              </div>
            )}
          </div>
        );
      case "jsonCIDs":
      case "imageCIDs":
      case "videoCIDs":
        return (
          <div className="flex flex-col border border-black rounded-md p-2">
            <label htmlFor={`${type.slice(0, -4)} upload`} className="mb-1">
              {`${type.slice(0, -4)}s Upload`}
            </label>
            <input
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              type="file"
              multiple
              accept={getAcceptedFileTypes(type.slice(0, -4))}
              onChange={(e) => {
                if (e.target.files) {
                  if (isSubscription) {
                    handleEncryptedFolderUpload(e.target.files);
                  } else {
                    handleFolderUpload(e.target.files, type);
                  }
                }
              }}
            />
            {onProgress > 0 && (
              <div className="items-center text-center">
                <Progress
                  className="text-white bg-black rounded-lg"
                  value={onProgress}
                  label="Completed"
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto p-4 border rounded-lg bg-white shadow-lg flex flex-col">
      {renderFileUploadUI()}
    </div>
  );
};

export default FileUploadForm;
