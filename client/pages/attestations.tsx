import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import RegisterSchemaModal from "@/components/RegisterSchemaModal"; // Import the modal component
import Link from "next/link"; // Import Link from Next.js
import EthereumAddress from "@/components/EthereumAddress";
import { getAttestations } from "@/lib/tableland";
import Loading from "@/components/Loading/Loading";

const Attestations = () => {
  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    async function fetch() {
      const attestationTableInfo = [];
      let attestations = await getAttestations();

      attestations.forEach((inputObject, index) => {
        // Create a tableData entry
        const entry = {
          uid: inputObject.uid,
          schemaUid: inputObject.schemaUID,
          fromAddress: inputObject.attester,
          toAddress: inputObject.recipient,

          age: "3mins ago",
          // Add other properties as needed from the inputObject
        };

        // Push the entry to the tableData array
        attestationTableInfo.push(entry);
      });

      setTaken(!taken);

      setTableData(attestationTableInfo);
    }
    if (!taken) {
      fetch();
    }
  }, []);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <div className="px-4 py-4 mx-8 bg-white rounded-t-xl">
            <div className="flex flex-col items-center">
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
            </div>
            <div className="flex  flex-col items-center">
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
          </div>
          <div className="mt-4 mx-8">
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: "rgba(0, 0, 0, 0.05)" }}
            >
              <table className="w-full table-fixed border-collapse border border-gray-200">
                <thead className="bg-black ">
                  <tr>
                    <th className="w-3/12 py-2 text-white">UID</th>
                    <th className="w-3/12 py-2 text-white">SchemaUID</th>
                    <th className="w-2/12 py-2 text-white">From Address</th>
                    <th className="w-2/12 py-2 text-white">To Address</th>
                    <th className="w-2/12 py-2 text-white">
                      Age (DateCreated)
                    </th>
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
                      <td className="py-2">
                        <Link href={`/attestation?uid=${row.uid}`} passHref>
                          <div className="flex items-center justify-center">
                            <EthereumAddress address={row.uid} />
                          </div>
                        </Link>
                      </td>
                      <td className="py-2">
                        <Link href={`#`} passHref>
                          <div className="flex items-center justify-center">
                            <EthereumAddress address={row.schemaUid} />
                          </div>
                        </Link>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-center">
                          <EthereumAddress address={row.fromAddress} />
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-center">
                          <EthereumAddress address={row.toAddress} />
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-center">
                          <p className="px-2 py-2">{row.age}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
