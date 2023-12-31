import React, { useEffect, useState } from "react";
import { Typography, Card } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading/Loading";
import { useChainId } from "wagmi";
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
                <div className="border border-black rounded-lg flex flex-col items-center mx-2 mt-3 mb-3 gap-2">
                  <div className="flex flex-wrap mx-2 mt-2 items-center text-center border border-black rounded-md p-1">
                    <Typography color="black">
                      Total Attestations:{"  "}
                    </Typography>
                    <Typography className="ml-2 " variant="h6" color="black">
                      {totalOffChain + totalOnChain}
                    </Typography>
                  </div>
                  <div className="flex flex-wrap mx-2  border border-black rounded-md p-1">
                    <Typography color="black">ONCHAIN: {"  "}</Typography>
                    <Typography className="ml-2" variant="h6" color="black">
                      {totalOnChain}
                    </Typography>
                  </div>
                  <div className="flex flex-wrap mx-2 mb-2 items-center border border-black rounded-md p-1 text-center">
                    <Typography color="black">OFFCHAIN: {"  "}</Typography>
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
