import { JsonViewer } from "@textea/json-viewer";
import ActiveDealsComponent from "./DealsDetails";

interface ViewerProps {
  fileSrc: string;
  deals: string[];
}

export const ImageViewer: React.FC<{ fileSrc: string; deals: string[] }> = ({
  fileSrc,
  deals,
}) => {
  const viewerStyles: React.CSSProperties = {
    height: "300px", // Set a fixed height for the viewer
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div className="flex flex-col items-center mx-auto">
      <div style={viewerStyles}>
        <img
          src={fileSrc}
          alt="File"
          className="rounded-lg"
          style={{ width: "auto", height: "100%" }}
        />
      </div>
      <ActiveDealsComponent activeDeals={deals} />
    </div>
  );
};

export const VideoViewer: React.FC<ViewerProps> = ({ fileSrc, deals }) => {
  const viewerStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <div className="flex flex-col items-center mx-auto">
      <video className="h-full w-full rounded-lg" controls style={viewerStyles}>
        <source src={fileSrc} />
      </video>

      <ActiveDealsComponent activeDeals={deals} />
    </div>
  );
};

export const PdfViewer: React.FC<ViewerProps> = ({ fileSrc, deals }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2">PDF Viewer</h2>
      <embed src={fileSrc} type="application/pdf" className="w-full h-96" />
      <ActiveDealsComponent activeDeals={deals} />
    </div>
  );
};

export const JsonViewerComponent: React.FC<{
  jsonContent: any;
  deals: string[];
}> = ({ jsonContent, deals }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2">JSON Viewer</h2>
      <JsonViewer value={jsonContent} />
      <div className="flex flex-col items-center mx-auto">
        <ActiveDealsComponent activeDeals={deals} />
      </div>
    </div>
  );
};
