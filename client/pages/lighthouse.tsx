import React, { useState } from "react";
import {
  uploadFile,
  decrypt,
  uploadFileEncrypted,
  applyAccessConditions,
} from "@/lib/lighthouse";
import { useAccount } from "wagmi";
import { signMessage } from "@wagmi/core";
import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";

function Lighthouse() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fileType: "image",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  function getAcceptedFileTypes(fileType) {
    const allowedFileTypes = {
      image: "image/jpeg, image/png, image/gif",
      video: "video/mp4, video/webm, video/ogg",
      pdf: "application/pdf",
      csv: "text/csv",
    };

    return allowedFileTypes[fileType] || "";
  }

  const handleFileUpload = async (file) => {
    let key = localStorage.getItem("API_KEY");
    if (!key) {
      const signed = await sign();
      const API_KEY = await lighthouse.getApiKey(address, signed);
      localStorage.setItem("API_KEY", API_KEY.data.apiKey);
      key = API_KEY.data.apiKey;
    }

    // Upload file and get encrypted CID
    const CID = await uploadFile(file, key);

    // Create JSON object
    const json = {
      name: formData.name,
      description: formData.description,
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
    const jsonFile = new File([jsonBlob], `${formData.name}.json`, {
      type: "application/json",
    });
    // Upload JSON
    let jsonCID = await uploadFile([jsonFile], key);
    console.log(jsonCID.Hash);
    // Update state
    // setFileURL(await decrypt(encryptedCID, address, signedEncryption));
  };

  const sign = async () => {
    const verificationMessage = (
      await axios.get(
        `https://api.lighthouse.storage/api/auth/get_message?publicKey=${address}`
      )
    ).data;
    const signed = await signMessage({
      message: verificationMessage,
    });
    return signed;
  };

  const signEncryption = async () => {
    try {
      const response = await lighthouse.getAuthMessage(address);

      if (response && response.data && response.data.message) {
        return await signMessage({
          message: response.data.message,
        });
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
  };

  return (

      <div className=" mx-auto p-4 border rounded-lg bg-white shadow-lg flex flex-col">
        <form className=" mx-auto p-4 border rounded-lg bg-white shadow-lg flex flex-col">
          <label className="flex flex-col text-center">
            Name
            <input
              className="ml-2 border rounded-full"
              type="text"
              name="name"
              value={formData.name}
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
              value={formData.description}
              onChange={handleChange}
            />
          </label>
          <br />
          <label className="flex flex-col text-center mx-auto">
            File Type:
            <select
              className="ml-2  rounded-lg text-center"
              name="fileType"
              value={formData.fileType}
              onChange={handleChange}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </label>
          <br />
          <input
            className="rounded-lg"
            type="file"
            accept={getAcceptedFileTypes(formData.fileType)}
            onChange={async (e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
              }
            }}
          />
        </form>
      </div>
  );
}

export default Lighthouse;
