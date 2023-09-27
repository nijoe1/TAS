import React, { useState } from "react";
import EthereumAddress from "./EthereumAddress";
import { GrView } from "react-icons/gr";
import FileViewer from "./FileViewer";
import { getIpfsGatewayUri } from "@/lib/lighthouse";

type DecodedDataProps = {
  decodedData: any;
  isEncrypted?: boolean;
  hasAccess?: boolean;
};

const DecodedData: React.FC<DecodedDataProps> = ({
  decodedData,
  isEncrypted,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const checkName = (name: string) => {
    if (name.endsWith("CID") || name.endsWith("CIDs")) {
      return true;
    }
    return false;
  };

  const getFileType = (name: string) => {
    if (name.endsWith("CIDs")) {
      const fileType = name.split("CID")[0];
      if (fileType === "image") return "Image[]";
      if (fileType === "video") return "Video[]";
      if (fileType === "pdf") return "PDF[]";
      if (fileType === "json") return "JSON[]";
      if (fileType === "csv") return "CSV[]";

      return "";
    } else {
      const fileType = name.split("CID")[0];
      if (fileType === "image") return "Image";
      if (fileType === "video") return "Video";
      if (fileType === "pdf") return "PDF";
      if (fileType === "json") return "JSON";
      if (fileType === "csv") return "CSV";

      return "";
    }
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
    <div className="flex flex-wrap gap-2">
      {decodedData &&
        decodedData.map((item: any, index: any) => (
          <div
            className="bg-black flex flex-col items-center gap-1 text-center font-bold text-white mx-auto rounded-lg px-2 py-1 text-xs m-1"
            key={index}
          >
            <span className="font-bold border rounded-lg   p-1">
              {item.type.toUpperCase()}
            </span>
            <span className="font-bold border rounded-lg  p-1">
              {item.name}
            </span>
            {!checkName(item.name) ? (
              <EthereumAddress
                className="border-white text-center items-center bg-white p-1"
                address={item.value}
                stringLength={7}
              />
            ) : (
              <div
                className="text-white flex flex-col items-center cursor-pointer"
                onClick={() => openModal(item.value)} // Pass item.value instead of item.name
              >
                <GrView
                  className="text-white bg-white rounded-md p-1 "
                  color="green"
                  size={20}
                />
              </div>
            )}
            {modalOpen &&
              selectedFileName &&
              selectedFileName === item.value && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
                  <div className="relative max-w-2xl w-full mx-auto p-6">
                    <div className="flex justify-end">
                      <button
                        onClick={closeModal}
                        className="text-white text-lg cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <div className="mt-4">
                      {item.value && isEncrypted ? (
                        <FileViewer
                          filesBlobs={item.blobs}
                          CIDs={item.CIDs}
                          fileType={getFileType(item.name)} // Use item.name to determine the file type
                          encrypted={isEncrypted}
                          fileUri={null}
                        />
                      ) : getFileType(item.type) == "JSON" ? (
                        <FileViewer
                          filesBlobs={item.blobs}
                          fileType={"JSON"}
                          fileUri={null}
                          encrypted={isEncrypted}
                          CIDs={item.CIDs}
                        />
                      ) : getFileType(item.type) == "JSON[]" ? (
                        <FileViewer
                          filesBlobs={item.blobs}
                          fileType={"JSON[]"}
                          fileUri={null}
                          encrypted={isEncrypted}
                          CIDs={item.CIDs}
                        />
                      ) : (
                        <FileViewer
                          filesBlobs={item.blobs}
                          fileType={getFileType(item.name)} // Use item.name to determine the file type
                          encrypted={isEncrypted}
                          fileUri={getIpfsGatewayUri(
                            item.name.endsWith("CIDs")
                              ? item.value[0]
                              : item.value
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        ))}
      {decodedData?.length == 0 && (
        <div>
          <p>Error in attested data</p>
        </div>
      )}
    </div>
  );
};

export default DecodedData;
