import React, { useState } from "react";
// @ts-ignore
import { Orbis } from "@orbisclub/orbis-sdk";
import { signMessage } from "@wagmi/core";
import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";
import { generateLighthouseJWT } from "@/lib/lighthouse";
const orbis = new Orbis();

async function isConnected() {
  const connected = await orbis.isConnected();

  if (connected.status == 200) {
    localStorage.setItem("userdid", connected.did);
  } else {
    await connect();
  }
}

async function connect() {
  const res = await orbis.connect_v2({ chain: "ethereum", lit: false });

  /** Check if the connection is successful or not */
  if (res.status == 200) {
    localStorage.setItem("userdid", res.did);
  } else {
    console.log("Error connecting to Ceramic: ", res);
    alert("Error connecting to Ceramic.");
  }
}
const StepperForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  address: string;
}> = ({ isOpen, onClose, currentAddress, address }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [ceramicClicked, setCeramicClicked] = useState(false);
  const [apiClicked, setApiClicked] = useState(false);
  const [tokenClicked, setTokenClicked] = useState(false);

  const generateLighthouseApiKey = async (address: any) => {
    let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);
    if (!key) {
      const verificationMessage = (
        await axios.get(
          `https://api.lighthouse.storage/api/auth/get_message?publicKey=${address}`
        )
      ).data;
      const signed = await signMessage({
        message: verificationMessage,
      });
      const API_KEY = await lighthouse.getApiKey(address, signed);
      if (API_KEY.data.apiKey) {
        localStorage.setItem(`API_KEY_${address?.toLowerCase()}`, API_KEY.data.apiKey);
        nextStep();
      } else {
        setApiClicked(!apiClicked);
      }
    } else {
      nextStep();
    }
  };
  const generateLighthouseJWToken = async (address: string) => {
    let key = localStorage.getItem(`lighthouse-jwt-${address}`);
    if (!key) {
      const response = await lighthouse.getAuthMessage(address);

      if (response && response.data && response.data.message) {
        let res = await generateLighthouseJWT(
          address,
          await signMessage({
            message: response.data.message,
          })
        );
        if (res) {
          localStorage.setItem(`lighthouse-jwt-${address}`, res);
          nextStep();
        } else {
          setTokenClicked(!tokenClicked);
        }
      }
    }
  };


  const steps = [
    {
      title: "Connect to Ceramic",
      description: "To get access to gasless interactions.",
      buttonText: "Connect to Ceramic",
    },
    {
      title: "Connect to Lighthouse",
      description: "To upload files on IPFS and Filecoin.",
      buttonText: "Connect to Lighthouse",
    },
    {
      title: "Create Lighthouse Token",
      description: "To encrypt your files with ease.",
      buttonText: "Create Lighthouse JWT",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const closeModal = () => {
    setCurrentStep(1);
    window.location.reload();
    onClose();
  };

  return (
    <div
      className={`${
        isOpen
          ? "fixed inset-0 flex flex-col items-center text-center mx-auto justify-center z-50"
          : "hidden"
      }`}
    >
      <div className="fixed inset-0 bg-gray-700 opacity-70"></div>
      <div className=" bg-white p-8 rounded flex flex-col items-center text-center mx-auto shadow-lg relative z-10">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-semibold mb-4">{`Step ${
            currentStep + 1
          }: ${steps[currentStep].title}`}</h3>
          <p className="mb-6">{steps[currentStep].description}</p>
          {currentStep === 0 && (
            <button
              disabled={ceramicClicked}
              onClick={async () => {
                setCeramicClicked(!ceramicClicked);
                await isConnected();
                // Get all keys from localStorage
                const keys = Object.keys(localStorage);

                // Iterate through keys and remove those containing "API_KEY" or "lighthouse-jwt"
                keys.forEach((key) => {
                  if (
                    key.includes("API_KEY") ||
                    key.includes("lighthouse-jwt")
                  ) {
                    localStorage.removeItem(key);
                  }
                });
                nextStep();
              }}
              className="bg-black text-white py-2 px-4 rounded-lg mt-4"
            >
              {steps[currentStep].buttonText}
            </button>
          )}
          {currentStep === 1 && (
            <button
              disabled={apiClicked}
              onClick={async () => {
                setApiClicked(!apiClicked);
                await generateLighthouseApiKey(address);
              }}
              className="bg-black text-white py-2 px-4 rounded-lg mt-4"
            >
              {steps[currentStep].buttonText}
            </button>
          )}
          {currentStep === 2 && (
            <button
              disabled={tokenClicked}
              onClick={async () => {
                setTokenClicked(!tokenClicked);
                await generateLighthouseJWToken(address);
                closeModal();
              }}
              className="bg-black text-white py-2 px-4 rounded-lg mt-4"
            >
              {steps[currentStep].buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepperForm;
