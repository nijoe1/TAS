import React, { useEffect, useState } from "react";
import {
  getDealStatusByCID,
  getIpfsCID,
  getIpfsGatewayUri,
} from "@/lib/lighthouse";
import {
  JsonViewerComponent,
  PdfViewer,
  VideoViewer,
  ImageViewer,
} from "@/components/FileViewers";
import Carousel from "react-elastic-carousel";

interface FileViewerProps {
  filesBlobs: Blob[] | null;
  fileUri: string | null;
  fileType: string | null;
  CIDs?: string[];
  encrypted?: boolean;
}

const FileViewer: React.FC<FileViewerProps> = ({
  filesBlobs,
  fileUri,
  fileType,
  CIDs,
  encrypted,
}) => {
  const [jsonContent, setJsonContent] = useState<any[]>([]);
  const [deals, setDeals] = useState<string[][]>([[]]);
  const [files, setFiles] = useState<string[]>([]);

  const fetchDeals = async (fileUris: string[]) => {
    const dealList: string[][] = [];
    for (const uri of fileUris) {
      const dealsList =
        (await getDealStatusByCID(getIpfsCID(uri)))?.dealInfos?.dealID || [];
      dealList.push(dealsList);
    }
    setDeals(dealList);
  };

  useEffect(() => {
    const getFilesContent = async () => {
      try {
        if ((filesBlobs || fileUri) && fileType === "JSON") {
          const response = await fetch(
            fileUri || (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
          );
          const data = await response.json();
          setJsonContent([data]);
          await fetchDeals([fileUri || ""]);
        }

        if (filesBlobs && (filesBlobs || fileUri) && fileType === "JSON[]") {
          const jsons = await Promise.all(
            filesBlobs.map(async (blob) => {
              const response = await fetch(
                fileUri || (filesBlobs ? URL.createObjectURL(blob) : "")
              );
              const data = await response.json();
              return data;
            })
          );
          setJsonContent(jsons);
          await fetchDeals(CIDs || []);
        }

        if (fileUri && (filesBlobs || fileUri) && fileType === "JSON[]") {
          const response = await fetch(fileUri || "");
          const data = await response.json();
          console.log(data);
          const jsons = await Promise.all(
            data.CIDs.map(async (CID: any) => {
              const uri = getIpfsGatewayUri(CID);
              const response = await fetch(uri);
              const data = await response.json();
              return data;
            })
          );
          setJsonContent(jsons);
          await fetchDeals(data.CIDs);
        }
      } catch (error) {
        console.error("Error fetching JSON content:", error);
      }

      try {
        if (fileUri && (fileType === "Image[]" || fileType === "Video[]")) {
          const response = await fetch(fileUri || "");
          const data = await response.json();
          console.log(data);
          const filesCIDs = data.CIDs.map((CID: any) => getIpfsGatewayUri(CID));
          setFiles(filesCIDs);
          fetchDeals(filesCIDs);
        } else if (CIDs && CIDs.length > 0) {
          fetchDeals(CIDs);
        } else if (!["JSON", "JSON[]"].includes(fileType || "")) {
          fetchDeals([fileUri || ""]);
        }
      } catch (error) {
        console.error("Error fetching JSON content:", error);
      }
    };

    getFilesContent();
  }, [filesBlobs, fileType]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg my-auto mb-6 transition duration-300 transform hover:scale-105">
      {filesBlobs || fileUri ? (
        <div>
          {fileType === "JSON" && jsonContent && (
            <JsonViewerComponent
              jsonContent={jsonContent[0]}
              deals={deals[0]}
            />
          )}
          {fileType === "JSON[]" && jsonContent && (
            // @ts-ignore
            <Carousel className="rounded-xl">
              {jsonContent.map((file, index) => (
                <JsonViewerComponent
                  key={index}
                  jsonContent={file}
                  deals={deals[index]}
                />
              ))}
            </Carousel>
          )}

          {fileType === "Image" && (
            <ImageViewer
              fileSrc={
                fileUri ||
                (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
              }
              deals={deals[0]}
            />
          )}

          {fileType === "Image[]" && files.length > 1 && !CIDs ? (
            // @ts-ignore
            <Carousel className="rounded-xl">
              {files.map((file, index) => (
                <ImageViewer
                  key={index}
                  fileSrc={file || ""}
                  deals={deals[index] || []}
                />
              ))}
            </Carousel>
          ) : (
            fileType === "Image[]" && (
              // @ts-ignore
              <Carousel className="rounded-xl">
                {filesBlobs &&
                  filesBlobs.map((file, index) => (
                    <ImageViewer
                      key={index}
                      fileSrc={filesBlobs ? URL.createObjectURL(file) : ""}
                      deals={deals[index] || []}
                    />
                  ))}
              </Carousel>
            )
          )}

          {fileType === "Video[]" && files.length > 0 ? (
            // @ts-ignore
            <Carousel className="rounded-xl">
              {files.map((file, index) => (
                <VideoViewer
                  key={index}
                  fileSrc={file || ""}
                  deals={deals[index] || []}
                />
              ))}
            </Carousel>
          ) : (
            fileType === "Video[]" && (
              // @ts-ignore
              <Carousel className="rounded-xl">
                {filesBlobs &&
                  filesBlobs.map((file, index) => (
                    <VideoViewer
                      key={index}
                      fileSrc={filesBlobs ? URL.createObjectURL(file) : ""}
                      deals={deals[index] || []}
                    />
                  ))}
              </Carousel>
            )
          )}

          {fileType === "Video" && !encrypted ? (
            <VideoViewer
              fileSrc={
                fileUri ||
                (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
              }
              deals={deals[0]}
            />
          ) : (
            fileType === "Video" && (
              <VideoViewer
                fileSrc={filesBlobs ? URL.createObjectURL(filesBlobs[0]) : ""}
                deals={deals[0]}
              />
            )
          )}

          {fileType === "PDF" && (
            <PdfViewer
              fileSrc={
                fileUri ||
                (filesBlobs ? URL.createObjectURL(filesBlobs[0]) : "")
              }
              deals={deals[0]}
            />
          )}
        </div>
      ) : (
        <p>Loading file...</p>
      )}
    </div>
  );
};

export default FileViewer;
