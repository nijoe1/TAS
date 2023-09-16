import React, { useState } from "react";
import EthereumAddress from "./EthereumAddress";
import { GrView } from "react-icons/gr";
import FileViewer from "./FileViewer";
import { getIpfsGatewayUri } from "@/lib/lighthouse";

type DecodedDataProps = {
  decodedData: any;
};

const DecodedData: React.FC<DecodedDataProps> = ({ decodedData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const checkName = (name: string) => {
    if (name.endsWith("CID")) {
      return true;
    }
    return false;
  };

  const getFileType = (name: string) => {
    const fileType = name.split("CID")[0];
    if (fileType === "image") return "Image";
    if (fileType === "video") return "Video";
    if (fileType === "pdf") return "PDF";
    if (fileType === "json") return "JSON";
    if (fileType === "csv") return "CSV";
    return "";
  };

  const openModal = (name: string) => {
    setSelectedFileName(name);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedFileName(null);
    setModalOpen(false);
  };

  return (
    <div className="flex flex-wrap">
      {decodedData.map((item: any, index: any) => (
        <div
          className="bg-black flex flex-col font-bold text-white mx-auto rounded-lg px-2 py-1 text-xs m-1"
          key={index}
        >
          <span className="font-bold border rounded-lg mt-1 mb-1">
            {item.type.toUpperCase()}
          </span>
          <span className="font-bold border rounded-lg mb-1">{item.name}</span>
          {!checkName(item.name) ? (
            <EthereumAddress
              className="border-white text-center items-center bg-white"
              address={item.value}
            />
          ) : (
            <div
              className="text-white flex flex-col items-center cursor-pointer"
              onClick={() => openModal(item.value)} // Pass item.value instead of item.name
            >
              <GrView className="text-white bg-white rounded-sm" color="green" size={20} />
            </div>
          )}
          {modalOpen && selectedFileName && selectedFileName === item.value && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
              <div className="relative max-w-2xl w-full mx-auto p-6">
                <div className="flex justify-end">
                  <button onClick={closeModal} className="text-white text-lg cursor-pointer">
                    Close
                  </button>
                </div>
                <div className="mt-4">
                  {item.value && (
                    <FileViewer
                      fileBlob={null}
                      fileUri={getIpfsGatewayUri(item.value)}
                      fileType={getFileType(item.name)} // Use item.name to determine the file type
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DecodedData;