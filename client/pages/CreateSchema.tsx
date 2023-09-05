import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";
import RegisterSchema from "@/components/RegisterSchema"; // Import the form component
import DynamicForm from "@/components/DynamicForm"; // Import the form component
import axios from "axios";

import { Navbar } from "@/components/layout"; // Import your Navbar and Footer components
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import { Orbis } from "@orbisclub/orbis-sdk";
import {
  uploadFile,
  decrypt,
  uploadFileEncrypted,
  applyAccessConditions,
} from "@/lib/index";
import { useAccount } from "wagmi";
import { signMessage } from "@wagmi/core";
import lighthouse from "@lighthouse-web3/sdk";

const orbis = new Orbis();

const inter = Inter({ subsets: ["latin"] });

const CreateSchema = () => {
  const [fileURL, setFileURL] = useState(undefined);
  const [cid, setCID] = useState("");
  const containerStyle = {
    maxWidth: "800px", // Customize the maximum width as needed
    margin: "0 auto", // Center the container horizontally
    padding: "16px", // Add padding as needed
  };

  const { address } = useAccount();

  const sign = async () => {
    const verificationMessage = (
      await axios.get(
        `https://api.lighthouse.storage/api/auth/get_message?publicKey=${address}`
      )
    ).data;
    console.log(verificationMessage);
    const signed = await signMessage({
      message: verificationMessage,
    });
    return signed;
  };

  const signEncryption = async () => {
    const messageRequested = (await lighthouse.getAuthMessage(address)).data
      .message;
    return await signMessage({
      message: messageRequested,
    });
  };
  return (
    <div
      className={`flex flex-col min-h-screen ${inter.className} bg-blue-gray-100`}
    >
      <Navbar /> {/* Include your Navbar component */}
      <div style={containerStyle}>
        <Typography variant="h5" align="center" gutterBottom>
          Create Schema
        </Typography>
        <RegisterSchema /> {/* Include your form component */}
        <DynamicForm schema="uint256 id, string name, address wallet, bytes32 hash, bool isActive, string[] tsifsa" />
      </div>
      <div className="App">
        <input
          onChange={async (e) =>
            uploadFile(e.target.files, address, await sign())
          }
          type="file"
        />
      </div>
      <div className="App">
        {/* @ts-ignore */}
        <input
          onChange={async (e) =>
            setCID(
              uploadFileEncrypted(
                e.target.files,
                address,
                await signEncryption(),
                await sign()
              )
            )
          }
          type="file"
        />
      </div>
      <div className="App">
        {/* @ts-ignore */}
        <button
          onClick={async () =>
            setFileURL(await decrypt(cid, address, await signEncryption()))
          }
        >
          decrypt
        </button>
        {fileURL ? (
              <video className="h-500 w-500 rounded-lg" controls>
              <source src={`${fileURL}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
        ) : null}
      </div>
      <div className="App">
        <button
          onClick={async () => {
            applyAccessConditions(address, await signEncryption());
          }}
        >
          Apply Access Conditions
        </button>
      </div>
      <div className="flex-grow"></div>
      <Footer /> {/* Include your Footer component */}
    </div>
  );
};

export default CreateSchema;
