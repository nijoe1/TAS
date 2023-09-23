import React, { useState } from "react";
import { HiExternalLink } from "react-icons/hi";

const activeDealsContainerStyle: React.CSSProperties = {
  backgroundColor: "black",
  color: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "auto",
  boxSizing: "border-box",
};

const activeDealsHeadingStyle: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "1.2em",
  marginBottom: "10px",
};

const selectDealStyle: React.CSSProperties = {
  backgroundColor: "white",
  color: "black",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "5px",
  width: "100%",
  boxSizing: "border-box",
};

const dealLinkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "underline",
  marginLeft: "10px", // Added margin between DealID and icon
};

const poweredByStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginTop: "20px", // Adjust spacing from the active deals
};

const logoStyle: React.CSSProperties = {
  height: "15px", // Set the height of the logo to make it smaller
  marginLeft: "10px", // Adjust spacing between the logo and text
};

const ActiveDealsComponent = ({ activeDeals }: { activeDeals: string[] }) => {
  const [selectedDeal, setSelectedDeal] = useState<string>("");

  const handleDealChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeal(event.target.value);
  };

  return (
    <div className="mt-5 mb-1" style={activeDealsContainerStyle}>
      <h3 style={activeDealsHeadingStyle}>Active Deals</h3>
      {selectedDeal !== "" && (
        <div className="flex flex-col items-center">
          <p className="flex flex-wrap">
            DealID {selectedDeal}
            <a
              href={`https://calibration.filfox.info/en/deal/${selectedDeal}`}
              style={dealLinkStyle}
            >
              <HiExternalLink className="cursor-pointer" />
            </a>
          </p>
        </div>
      )}
      {activeDeals && activeDeals.length > 0 ? (
        <div>
          <select
            value={selectedDeal}
            onChange={handleDealChange}
            style={selectDealStyle}
          >
            <option value="">Select a deal</option>
            {activeDeals.map((deal, index) => (
              <option key={index} value={deal}>
                DealID {deal}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="mt-3">Replication in progress.</p>
      )}
      {/* Powered by section */}
      <div style={poweredByStyle}>
        <span>Powered by Lighthouse</span>
        <img
          src="https://gateway.lighthouse.storage/ipfs/QmRNCAfjKXtTjqnEBPTzRbohLhFQtwsYTf6mfhYmksX5ft"
          alt="Powered by Lighthouse"
          style={logoStyle}
        />
      </div>
    </div>
  );
};

export default ActiveDealsComponent;