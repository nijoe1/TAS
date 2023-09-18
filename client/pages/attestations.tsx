import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import EthereumAddress from "@/components/EthereumAddress";
import Loading from "@/components/Loading/Loading";
import TimeCreated from "@/components/TimeCreated";
import { useChainId } from "wagmi";
import { RiLinkUnlinkM } from "react-icons/ri";
import { getAllAttestations } from "@/lib/tas";
import AttestationsTable from "@/components/AttestationsTable";

const Attestations = () => {
  const chainID = useChainId();

  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    async function fetch() {
      let allAttestations = await getAllAttestations(chainID);
      setTaken(!taken);
      // @ts-ignore
      setTableData(allAttestations);
    }
    if (!taken && chainID) {
      fetch();
    }
  }, [chainID]);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <div className="flex flex-col items-center">
            <div className="px-4 py-4 mx-auto bg-white rounded-xl flex flex-col items-center">
              <Typography variant="h4" color="black">
                Attestations
              </Typography>
              <Typography color="black">
                Showing the most recent attestations.
              </Typography>
              <Typography color="black">Total Attestations:{"  "}</Typography>
              <Typography className="ml-2" variant="h6" color="black">
                169
              </Typography>
              <Typography color="black">Unique Attestors: {"  "}</Typography>
              <Typography className="ml-2" variant="h6" color="black">
                5016
              </Typography>
              <Typography color="black">
                Offchain Attestations: {"  "}
              </Typography>
              <Typography className="ml-2 " variant="h6" color="black">
                16981
              </Typography>
            </div>
            <AttestationsTable attestationsTableData={tableData}/>
            
          </div>
        </>
      ) : (
        <Loading />
      )}
      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
};

export default Attestations;
