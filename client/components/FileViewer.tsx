import React, { useEffect, useState } from "react";
import { JsonViewer } from "@textea/json-viewer";

interface FileViewerProps {
  fileBlob: Blob | null;
  fileUri: string | null;
  fileType: string | null;
}

const FileViewer: React.FC<FileViewerProps> = ({
  fileBlob,
  fileUri,
  fileType,
}) => {
  const [jsonContent, setJsonContent] = useState<any>(null);

  useEffect(() => {
    const fetchJsonContent = async () => {
      try {
        if ((fileBlob || fileUri) && fileType === "JSON") {
          const response = await fetch(
            fileUri || (fileBlob ? URL.createObjectURL(fileBlob) : "")
          );
          const data = await response.json();
          setJsonContent(data);
        }
      } catch (error) {
        console.error("Error fetching JSON content:", error);
      }
    };

    fetchJsonContent();
  }, [fileBlob, fileType]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg my-auto mb-6 transition duration-300 transform hover:scale-105">
      {(fileBlob || fileUri) && fileType ? (
        <>
          {fileType === "JSON" && jsonContent && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">JSON Viewer</h2>
              <JsonViewer value={jsonContent} />
            </div>
          )}
          {/* {fileType === "CSV" && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">CSV Viewer</h2>
              <CsvViewer
                csv={fileBlob || ""}
                delimiter={","}
                // @ts-ignore
                onError={() => console.error("Error loading CSV")}
              />
            </div>
          )} */}
          {fileType === "Image" && (
            <img
              src={fileUri || (fileBlob ? URL.createObjectURL(fileBlob) : "")}
              alt="File"
              className="mb-4 rounded-lg"
            />
          )}
          {fileType === "Video" && (
            <div className="flex flex-col items-center h-full mb-4">
              <video className="h-full w-full rounded-lg" controls>
                <source
                  src={
                    fileUri || (fileBlob ? URL.createObjectURL(fileBlob) : "")
                  }
                />
              </video>
            </div>
          )}
          {fileType === "PDF" && (
            <div className="mb-4">
              <h2 className="text-xl mb-2">PDF Viewer</h2>
              <embed
                src={fileUri || (fileBlob ? URL.createObjectURL(fileBlob) : "")}
                type="application/pdf"
                className="w-full h-96"
              />
            </div>
          )}
          {fileType &&
            fileType !== "Image" &&
            fileType !== "Video" &&
            fileType !== "PDF" && (
              <div className="mb-4">
                <h2 className="text-xl mb-2">File</h2>
                <a
                  href={
                    fileUri || (fileBlob ? URL.createObjectURL(fileBlob) : "")
                  }
                  download={`file.${fileBlob?.type.split("/")[1]}`}
                  className="text-blue-600 hover:underline"
                >
                  Download {fileType} File
                </a>
              </div>
            )}
        </>
      ) : (
        <p>Loading file...</p>
      )}
    </div>
  );
};

export default FileViewer;
