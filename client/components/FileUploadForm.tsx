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
        if (formDataJson.fileType.endsWith("s")) {
          await handleEncryptedJsonUpload(file, true);
        } else {
          await handleEncryptedJsonUpload(file, false);
        }
      } else if (formDataJson.fileType.endsWith("s")) {
        await handleEncryptedFolderUpload(file);
      } else {
        await handleEncryptedFileUpload(file);
      }
    } else {
      if (type == "jsonCID") {
        if (formDataJson.fileType.endsWith("s")) {
          await handleJsonUpload(file, true);
        } else {
          await handleJsonUpload(file, false);
        }
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

  const handleJsonUpload = async (files: any, multiple: boolean) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    if (multiple) {
      let fileArray = [];
      for (const file of files) {
        const CID = await uploadFile(file, key, setOnProgress);
        fileArray.push({
          name: CID.Name,
          type: file[0].type,
          CID: CID.Hash,
        });
      }
      const json = {
        name: formDataJson.name,
        description: formDataJson.description,
        files: fileArray,
      };

      const jsonBlob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const jsonFile = new File([jsonBlob], `${formDataJson.name}.json`, {
        type: "application/json",
      });
      let data = await uploadFile([jsonFile], key, setOnProgress);
      setOnProgress(100);
      handleInputChange(data.Hash, type, "string");
    } else {
      const CID = await uploadFile(files, key, setOnProgress);
      const json = {
        name: formDataJson.name,
        description: formDataJson.description,
        files: [
          {
            name: CID.Name,
            type: files[0].type,
            CID: CID.Hash,
          },
        ],
      };

      const jsonBlob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const jsonFile = new File([jsonBlob], `${formDataJson.name}.json`, {
        type: "application/json",
      });
      let data = await uploadFile([jsonFile], key, setOnProgress);
      setOnProgress(100);
      handleInputChange(data.Hash, type, "string");
    }
  };

  const handleFolderUpload = async (files: any, type: any) => {
    console.log(files);
    let key = localStorage.getItem(`API_KEY_${address}`);

    let CIDs = await uploadFolder(files, type, key, setOnProgress);
    setOnProgress(100);

    handleInputChange(CIDs, type, "string[]");
  };

  const handleEncryptedFolderUpload = async (files: any) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
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
    console.log(fileArray);

    let ret = await jsonCIDsUpload(key, files[0].type, fileArray);
    console.log(ret);
    setOnProgress(100);

    handleInputChange(ret, type, "string[]");
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
      token,
      resolver
    );
    setOnProgress(100);
    handleInputChange(res.data.cid, type, "string");
  };

  const handleEncryptedJsonUpload = async (files: any, multiple: boolean) => {
    let key = localStorage.getItem(`API_KEY_${address}`);
    let token = localStorage.getItem(`lighthouse-jwt-${address}`);
    if (multiple) {
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
        console.log("Access Controll Applied REsponse:  ", res);
        fileArray.push({
          name: CID[0].Name,
          type: files[0].type,
          CID: res.data.cid,
        });
      }
      // Create JSON object
      const json = {
        name: formDataJson.name,
        description: formDataJson.description,
        files: fileArray,
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

      let res = await applyAccessConditions(
        jsonCID[0].Hash,
        chainID,
        schemaUID,
        address,
        token,
        resolver
      );
      setOnProgress(100);
      handleInputChange(res.data.cid, type, "string");
    } else {
      const CID = await uploadFileEncrypted(
        files,
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
      console.log("Access Controll Applied REsponse:  ", res);

      // Create JSON object
      const json = {
        name: formDataJson.name,
        description: formDataJson.description,
        files: [
          {
            name: CID[0].Name,
            type: files[0].type,
            CID: res.data.cid,
          },
        ],
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
        token,
        resolver
      );
      setOnProgress(100);
      handleInputChange(res.data.cid, type, "string");
    }
  };

  const renderFileUploadUI = () => {
    // render the appropriate file upload UI based on the type
    switch (type) {
      case "jsonCID":
        return (
          <div className="flex flex-col">
            <label htmlFor={"jsonFile"} className="mb-1">
              json upload
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
                className="ml-2  mx-auto rounded-lg text-center"
                name="fileType"
                value={formDataJson.fileType}
                onChange={handleChange}
              >
                <option value="image">Image</option>
                <option value="images">Images</option>
                <option value="video">Video</option>
                <option value="videos">Videos</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </label>
            <br />
            {onProgress < 0 ? (
              <div>
                {formDataJson.fileType == "images" ||
                formDataJson.fileType == "videos" ? (
                  <input
                    className="rounded-lg"
                    type="file"
                    multiple
                    accept={getAcceptedFileTypes(formDataJson.fileType)}
                    onChange={async (e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                  />
                ) : (
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
                )}
              </div>
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
        );
      case "imageCID":
        return (
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
        );
      case "videoCID":
        return (
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
        );
      case "imageCIDs":
        return (
          <div className="flex flex-col">
            <label htmlFor={"image upload"} className="mb-1">
              {"images upload"}
            </label>
            {onProgress < 0 ? (
              <input
                className="rounded-lg"
                type="file"
                multiple
                accept={getAcceptedFileTypes("image")}
                onChange={async (e) => {
                  if (e.target.files) {
                    if (isSubscription) {
                      await handleEncryptedFolderUpload(e.target.files);
                    } else {
                      await handleFolderUpload(e.target.files, type);
                    }
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
        );
      case "videoCIDs":
        return (
          <div className="flex flex-col">
            <label htmlFor={"video upload"} className="mb-1">
              {"videos upload"}
            </label>
            {onProgress < 0 ? (
              <input
                className="rounded-lg"
                type="file"
                multiple
                accept={getAcceptedFileTypes("video")}
                onChange={async (e) => {
                  if (e.target.files) {
                    if (isSubscription) {
                      await handleEncryptedFolderUpload(e.target.files);
                    } else {
                      await handleFolderUpload(e.target.files, type);
                    }
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
