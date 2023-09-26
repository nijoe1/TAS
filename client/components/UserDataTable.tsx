import React, { useEffect, useState } from "react";
import EthereumAddress from "./EthereumAddress"; // Make sure to import EthereumAddress and TimeCreated components
import TimeCreated from "./TimeCreated";
import { RiLinkUnlinkM } from "react-icons/ri"; // Import the RiLinkUnlinkM icon
import { bytesToMB, getFileTypeFromAccept } from "@/lib/utils";
import Pagination from "./Pagination";
import FileViewer from "./FileViewer";
import { ImEye, ImEyeBlocked } from "react-icons/im";
import { FaDownload } from "react-icons/fa";
import { decrypt } from "@/lib/lighthouse";
import { useAccount } from "wagmi";

type fileObject = {
  publicKey: string;
  fileName: string;
  mimeType: string;
  txHash: string;
  status: string;
  createdAt: number;
  fileSizeInBytes: string;
  cid: string;
  id: string;
  lastUpdate: number;
  encryption: boolean;
};
interface UserDataTableProps {
  userDataTableData: fileObject[];
  balance: {
    dataLimit: number;
    dataUsed: number;
  };
}

const UserDataTable: React.FC<UserDataTableProps> = ({
  userDataTableData,
  balance,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const totalRows = userDataTableData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const paginatedData = userDataTableData.slice(startIdx, endIdx);

  const [fileViewerProps, setFileViewerProps] =
    useState<FileViewerProps | null>(null);

  const poweredByStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginTop: "20px", // Adjust spacing from the active deals
  };

  const logoStyle: React.CSSProperties = {
    height: "20px", // Set the height of the logo to make it smaller
    marginLeft: "10px", // Adjust spacing between the logo and text
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleBuyStorage = () => {
    window.location.href = "https://files.lighthouse.storage/";
  };
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFileViewerProps = () => {
    return fileViewerProps as FileViewerProps;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.textContent = "Download File";

    document.body.appendChild(a);

    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const HandleDownloadFile = async (
    encrypted: boolean,
    cid: string,
    mimeType: string,
    fileName: string
  ) => {
    const type = getFileTypeFromAccept(mimeType);
    const CIDs = [cid];
    let fileUri = undefined;
    const blobs = [];

    if (encrypted) {
      const token = localStorage.getItem(`lighthouse-jwt-${address}`);
      const blob = await decrypt(cid, address, token);
      blobs.push(blob);
    } else {
      fileUri = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    }

    if (fileUri) {
      // Handle unencrypted file
      const response = await fetch(fileUri);
      const blob = await response.blob();
      downloadBlob(blob, fileName);
    } else if (blobs.length > 0) {
      // Handle encrypted file
      // Assuming you have the decrypted blobs, handle them as needed
      // For demonstration, let's download the first decrypted blob
      downloadBlob(blobs[0], fileName);
    }
  };

  const handleOpenModal = async (
    encrypted: boolean,
    cid: string,
    mimeType: string
  ) => {
    let type = getFileTypeFromAccept(mimeType, 1) as string;
    let CIDs = [cid] as string[];
    let fileUri = undefined;
    let blobs = [] as any[];

    if (encrypted) {
      let token = localStorage.getItem(`lighthouse-jwt-${address}`);
      let blob = await decrypt(cid, address, token);
      blobs.push(blob);
    } else {
      fileUri = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    }

    // Create the fileViewerProps object based on your requirements
    const fileViewerProps = {
      filesBlobs: blobs,
      fileUri,
      fileType: type,
      CIDs,
      encrypted,
    };

    // Set the fileViewerProps state
    // @ts-ignore
    setFileViewerProps(fileViewerProps);
    openModal();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className=" text-center">
      <div className="flex flex-col  items-center mx-auto mt-10">
        <div className="border p-4 rounded-md shadow-lg bg-gray-100 text-black font-bold flex flex-col">
          <p className="font-bold mb-2 ">Storage Balance</p>
          <p>
            {`${bytesToMB(balance.dataUsed)}/${bytesToMB(balance.dataLimit)}`}
          </p>
          <button
            onClick={handleBuyStorage}
            className="bg-black  text-white font-bold py-1 px-2 rounded-md mt-5"
          >
            Buy More Storage
          </button>
          <div style={poweredByStyle}>
            <span>Powered by Lighthouse</span>
            <img
              className="rounded-md"
              src="https://gateway.lighthouse.storage/ipfs/QmRNCAfjKXtTjqnEBPTzRbohLhFQtwsYTf6mfhYmksX5ft"
              alt="Powered by Lighthouse"
              style={logoStyle}
            />
          </div>
        </div>
      </div>
      {totalRows > 0 ? (
        <div className="overflow-x-auto sm:overflow-x-auto overflow-x-scroll rounded-lg mt-2">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-black">
              <tr>
                <th className="py-2 text-white border-r border-gray">
                  fileName
                </th>
                <th className="py-2 text-white border-r border-gray">
                  mimeType
                </th>
                <th className="py-2 text-white border-r border-gray">cid</th>
                <th className="py-2 text-white border-r border-gray">
                  fileSize
                </th>
                <th className="py-2 text-white border-r border-gray">
                  encrypted
                </th>
                <th className="py-2 text-white border-r border-gray">
                  createdAt
                </th>
                <th className="py-2 text-white">View / Download</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } text-center`}
                >
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <EthereumAddress copy={true} address={row.fileName} />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <EthereumAddress copy={true} address={row.mimeType} />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <EthereumAddress
                        link={`https://gateway.lighthouse.storage/ipfs/${row.cid}`}
                        address={row.cid}
                      />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <EthereumAddress
                        copy={true}
                        address={bytesToMB(row.fileSizeInBytes)}
                      />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex flex-wrap items-center justify-center">
                      <RiLinkUnlinkM className="ml-2" />
                      <p className="px-2 py-2">
                        {row.encryption ? "Encrypted" : "Unencrypted"}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <p className="px-2 py-2">
                        <TimeCreated
                          realTime={true}
                          createdAt={row.createdAt}
                        />
                      </p>
                    </div>
                  </td>
                  <td className="py-2 border-b border-gray">
                    <div className="flex flex-wrap gap-6 items-center justify-center">
                      {Math.round(
                        (parseInt(row.fileSizeInBytes) / (1024 * 1024)) * 100
                      ) /
                        100 <=
                      2 ? (
                        <ImEye
                          title="view file"
                          className="cursor-pointer"
                          onClick={async () =>
                            await handleOpenModal(
                              row.encryption,
                              row.cid,
                              row.mimeType
                            )
                          }
                        />
                      ) : (
                        <div>
                          <ImEyeBlocked title="file too big download" />
                        </div>
                      )}
                      <FaDownload
                        className="cursor-pointer"
                        onClick={async () =>
                          await HandleDownloadFile(
                            row.encryption,
                            row.cid,
                            row.mimeType,
                            row.fileName
                          )
                        }
                      />
                      <Modal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        fetchFileViewerProps={fetchFileViewerProps}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        </div>
      ) : (
        <div>No Data</div>
      )}
    </div>
  );
};

export default UserDataTable;

interface FileViewerProps {
  filesBlobs: Blob[] | null;
  fileUri: string | null;
  fileType: string | null;
  CIDs?: string[];
  encrypted?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchFileViewerProps: () => FileViewerProps;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  fetchFileViewerProps,
}) => {
  const [fileViewerProps, setFileViewerProps] =
    useState<FileViewerProps | null>(null);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const props = fetchFileViewerProps();
        // @ts-ignore
        setFileViewerProps(props);
      } catch (error) {
        console.error("Error fetching fileViewerProps:", error);
      }
    };

    if (isOpen) {
      fetchProps();
    }
  }, [isOpen, fetchFileViewerProps]);

  if (!isOpen || !fileViewerProps) return null;

  const modalStyle: React.CSSProperties = {
    display: isOpen ? "block" : "none",
    position: "fixed",
    zIndex: 9000, // Set a high z-index
    left: 0,
    top: "20px",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0)", // Semi-transparent background
  };

  const modalContentStyle: React.CSSProperties = {
    top: "20px",
    backgroundColor: "#fff",
    margin: "15% auto", // Adjusted margin for centering
    // padding: "25px",
    // border: "1px solid #ccc",
    // borderRadius: "10px", // Added border radius for a more modern look
    width: "60%", // Adjust the width as needed
    maxWidth: "500px", // Limit the maximum width
    // position: "fixed", // Make it relative for button positioning
  };

  const buttonStyle: React.CSSProperties = {
    // position: "absolute",
    bottom: "0px", // Adjusted button position
    right: "20px", // Adjusted button position
    padding: "10px 20px",
    borderRadius: "10px",
    backgroundColor: "black",
    color: "white",
    fontWeight: "bold",
  };

  return (
    <div className="modal flex flex-col my-auto" style={modalStyle}>
      <div className="modal-content  rounded-md " style={modalContentStyle}>
        <FileViewer {...fileViewerProps} />
        <button onClick={onClose} style={buttonStyle}>
          Close
        </button>
      </div>
    </div>
  );
};
