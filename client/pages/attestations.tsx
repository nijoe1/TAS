import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import RegisterSchemaModal from "@/components/RegisterSchemaModal"; // Import the modal component
import Link from "next/link"; // Import Link from Next.js
import EthereumAddress from "@/components/EthereumAddress";
import { getAttestations } from "@/lib/tableland";
import Loading from "@/components/Loading/Loading";
import TimeCreated from "@/components/TimeCreated";
import { useChainId } from "wagmi";

const Attestations = () => {
  const chainID = useChainId();

  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    async function fetch() {
      const attestationTableInfo = [];
      let attestations = await getAttestations(chainID);

      attestations.forEach((inputObject, index) => {
        // Create a tableData entry
        const entry = {
          uid: inputObject.uid,
          schemaUid: inputObject.schemaUID,
          fromAddress: inputObject.attester,
          toAddress: inputObject.recipient,

          age: inputObject.creationTimestamp,
          // Add other properties as needed from the inputObject
        };

        // Push the entry to the tableData array
        attestationTableInfo.push(entry);
      });

      setTaken(!taken);

      setTableData(attestationTableInfo);
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
              <Typography className="ml-2" variant="h9" color="black">
                169
              </Typography>
              <Typography color="black">Unique Attestors: {"  "}</Typography>
              <Typography className="ml-2" variant="h9" color="black">
                5016
              </Typography>
              <Typography color="black">
                Offchain Attestations: {"  "}
              </Typography>
              <Typography className="ml-2 " variant="h9" color="black">
                16981
              </Typography>
            </div>

            <div className="mt-10 mx-[10%]">
              <div className="overflow-x-auto rounded-lg">
                <table className="w-screen-md table-fixed border-b border-gray">
                  <thead className="bg-black">
                    <tr>
                      <th className="w-3/12 py-2 text-white border-r border-gray">
                        UID
                      </th>
                      <th className="w-3/12 py-2 text-white border-r border-gray">
                        SchemaUID
                      </th>
                      <th className="w-2/12 py-2 text-white border-r border-gray">
                        From Address
                      </th>
                      <th className="w-2/12 py-2 text-white border-r border-gray">
                        To Address
                      </th>
                      <th className="w-2/12 py-2 text-white">createdAt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        } text-center`}
                      >
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress
                              link={`/attestation?uid=${row.uid}`}
                              address={row.uid}
                            />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress
                              link={`/schema?schemaUID=${row.schemaUid}`}
                              address={row.schemaUid}
                            />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress address={row.fromAddress} />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress address={row.toAddress} />
                          </div>
                        </td>
                        <td className="py-2 border-b border-gray">
                          <div className="flex items-center justify-center">
                            <p className="px-2 py-2">
                              {<TimeCreated createdAt={row.age} />}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
