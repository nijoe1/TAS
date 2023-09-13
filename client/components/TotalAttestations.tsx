import React, { useEffect, useState } from "react";
import { getTotalAttestations } from "@/lib/tableland";

interface TotalAttestationsProps {
  schemaUID: any;
  chainID: number;
}

const TotalAttestations: React.FC<TotalAttestationsProps> = ({
  schemaUID,
  chainID,
}) => {
  const [totalAttestations, setTotalAttestations] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      let total = await getTotalAttestations(chainID, schemaUID);
      // @ts-ignore
      setTotalAttestations(total);
    };
    if (totalAttestations === null) {
      fetch();
    }
  },[totalAttestations]);

  return (
    <div>
      {totalAttestations !== null ? (
        <p>{totalAttestations}</p>
      ) : (
        <p>...</p>
      )}
    </div>
  );
};

export default TotalAttestations;
