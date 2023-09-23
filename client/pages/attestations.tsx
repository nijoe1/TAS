import React, { useEffect, useState } from "react";
import { Typography, Button, Card } from "@material-tailwind/react";
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
  const [totalOffChain, setTotalOffChain] = useState<number>(0);
  const [totalOnChain, setTotalOnChain] = useState<number>(0);

  useEffect(() => {
    async function fetch() {
      let allAttestations = await getAllAttestations(chainID);
      setTaken(!taken);
      // @ts-ignore
      setTableData(allAttestations.tableDt);
      setTotalOffChain(allAttestations.offChain);
      setTotalOnChain(allAttestations.onchain);
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
            <Card
              color="white"
              shadow={false}
              className="mb-4 p-4 border border-black rounded-xl"
            >
              <div className="px-4 py-4 mx-auto bg-white rounded-xl flex flex-col items-center">
                <Typography variant="h4" color="black">
                  Attestations
                </Typography>
                <Typography color="black">
                  Showing the most recent attestations.
                </Typography>
                <div className="border rounded-lg flex flex-col items-center mx-2 mt-3 mb-3">
                  <div className="flex flex-wrap mx-2 items-center text-center">
                    <Typography color="black">
                      Total Attestations:{"  "}
                    </Typography>
                    <Typography className="ml-2" variant="h6" color="black">
                      {totalOffChain + totalOnChain}
                    </Typography>
                  </div>
                  <div className="flex flex-wrap mx-2 ">
                    <Typography color="black">
                      OnChain Attestations: {"  "}
                    </Typography>
                    <Typography className="ml-2" variant="h6" color="black">
                      {totalOnChain}
                    </Typography>
                  </div>
                  <div className="flex flex-wrap mx-2 items-center text-center">
                    <Typography color="black">
                      Offchain Attestations: {"  "}
                    </Typography>
                    <Typography className="ml-2 " variant="h6" color="black">
                      {totalOffChain}
                    </Typography>
                  </div>
                </div>
              </div>
            </Card>
            <AttestationsTable attestationsTableData={tableData} />
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
