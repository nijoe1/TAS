import React, { useEffect, useState } from "react";
import { JsonViewer } from "@textea/json-viewer";
import {
  getDealStatusByCID,
  getIpfsCID,
  getIpfsGatewayUri,
} from "@/lib/lighthouse";
import ActiveDealsComponent from "./DealsDetails";
import Carousel from "react-elastic-carousel";
interface FileViewerProps {
  filesBlobs: Blob[] | null;
  fileUri: string | null;
  fileType: string | null;
  CIDs?: string[];
  encrypted?:boolean
}

const FileViewer: React.FC<FileViewerProps> = ({
  filesBlobs,
  fileUri,
  fileType,
  CIDs,
  encrypted
}) => {
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [deals, setDeals] = useState([[]]);
  const [files, setFiles] = useState<any[]>([]);

  const fetchDeals = async (fileUris: any) => {
    let dealList = [];
    for (fileUri of fileUris) {
      let dealsList = (await getDealStatusByCID(getIpfsCID(fileUri)))?.dealInfos
        ?.dealID;
      if (dealsList) {
        dealList.push(dealsList);
      } else {
        dealList.push([]);
      }
    }
    setDeals(dealList);
  };

  useEffect(() => {
    const fetchJsonContent = async () => {
      console.log(fileType);
      try {
        if ((filesBlobs || fileUri) && fileType === "JSON") {
          const response = await fetch(fileUri ? fileUri : "");
          const data = await response.json();
          setJsonContent(data);
          await fetchDeals([fileUri]);
        }
      } catch (error) {
        console.error("Error fetching JSON content:", error);
      }
      try {
        if (
          fileUri &&
          (fileType === "Image[]" ||
            fileType === "Video[]" ||
            fileType === "Json[]")
        ) {
          const response = await fetch(fileUri ? fileUri : "");
          if (response) {
          }
          const data = await response.json();
          console.log(data);
          let filesCIDs = [];
          for (const CID of data.CIDs) {
            filesCIDs.push(getIpfsGatewayUri(CID));
          }
          setFiles(filesCIDs);
          fetchDeals(filesCIDs);
        } else if (CIDs && CIDs.length > 0 ) {
          fetchDeals(CIDs);
        } else {
          fetchDeals([fileUri]);
        }
      } catch (error) {
        console.error("Error fetching JSON content:", error);
      }
    };

    fetchJsonContent();
  }, [filesBlobs, fileType]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg my-auto mb-6 transition duration-300 transform hover:scale-105">
      {(filesBlobs || fileUri) && fileType ? (
        <div>
          {fileType === "JSON" && jsonContent && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">JSON Viewer</h2>
              <JsonViewer value={jsonContent} />
            </div>
          )}
          {fileType === "Image" && (
            <div className="flex flex-col items-center mx-auto">
              <img
                src={
                  fileUri ||
                  (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
                }
                alt="File"
                className="mb-4 rounded-lg"
              />
              <ActiveDealsComponent
                activeDeals={deals[0]}
              ></ActiveDealsComponent>
            </div>
          )}
          {fileType === "Image[]" && files.length > 1 && !CIDs ? (
            // @ts-ignore
            <Carousel className="rounded-xl">
              {files.map((file, index) => (
                <div key={index} className="flex flex-col items-center mx-auto">
                  <img
                    src={file || ""}
                    alt="File"
                    className="mb-4 rounded-lg"
                  />
                  <ActiveDealsComponent
                    activeDeals={deals[index] || []} // Pass appropriate active deals for this file
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            fileType === "Image[]" && (
              // @ts-ignore
              <Carousel className="rounded-xl">
                {filesBlobs &&
                  filesBlobs.map((file, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center mx-auto"
                    >
                      <img
                        src={filesBlobs ? URL.createObjectURL(file) : ""}
                        alt="File"
                        className="mb-4 rounded-lg"
                      />
                      <ActiveDealsComponent
                        activeDeals={deals[index] || []} // Pass appropriate active deals for this file
                      />
                    </div>
                  ))}
              </Carousel>
            )
          )}

          {fileType === "Video[]" && files.length > 0 ? (
            // @ts-ignore
            <Carousel className="rounded-xl">
              {files.map((file, index) => (
                <div key={index} className="flex flex-col items-center mx-auto">
                  <video className="h-full w-full rounded-lg" controls>
                    <source src={file || ""} />
                  </video>
                  <ActiveDealsComponent
                    activeDeals={deals[index] || []} // Pass appropriate active deals for this file
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            fileType === "Video[]" && (
              // @ts-ignore
              <Carousel className="rounded-xl">
                {filesBlobs &&
                  filesBlobs.map((file, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center mx-auto"
                    >
                      <video className="h-full w-full rounded-lg" controls>
                        <source
                          src={filesBlobs ? URL.createObjectURL(file) : ""}
                        />
                      </video>
                      <ActiveDealsComponent
                        activeDeals={deals[index] || []} // Pass appropriate active deals for this file
                      />
                    </div>
                  ))}
              </Carousel>
            )
          )}

          {fileType === "Video" && !encrypted ? (
            <div className="flex flex-col items-center h-full mb-4">
              <video className="h-full w-full rounded-lg" controls>
                <source
                  src={
                    fileUri ||
                    (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
                  }
                />
              </video>
              <ActiveDealsComponent
                activeDeals={deals[0]}
              ></ActiveDealsComponent>
            </div>
          ) : fileType === "Video" &&(
            <div className="flex flex-col items-center h-full mb-4">
              <video className="h-full w-full rounded-lg" controls>
                <source
                  src={
                    (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
                  }
                />
              </video>
              <ActiveDealsComponent
                activeDeals={deals[0]}
              ></ActiveDealsComponent>
            </div>
          )}
          {fileType === "PDF" && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">PDF Viewer</h2>
              <embed
                src={
                  fileUri ||
                  (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
                }
                type="application/pdf"
                className="w-full h-96"
              />
              <ActiveDealsComponent
                activeDeals={deals[0]}
              ></ActiveDealsComponent>
            </div>
          )}
        </div>
      ) : (
        <p>Loading file...</p>
      )}
    </div>
  );
};

export default FileViewer;
