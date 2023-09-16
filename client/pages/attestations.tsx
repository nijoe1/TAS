import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import {
  getOffChainAttestations,
  transformAndSortArrays,
} from "@/lib/offchain";
import EthereumAddress from "@/components/EthereumAddress";
import { getAttestations } from "@/lib/tableland";
import Loading from "@/components/Loading/Loading";
import TimeCreated from "@/components/TimeCreated";
import { useChainId } from "wagmi";
import { RiLinkUnlinkM } from "react-icons/ri";

const Attestations = () => {
  const chainID = useChainId();

  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    async function fetch() {
      let attestations = await getAttestations(chainID);
      let offChain = await getOffChainAttestations(chainID);
      const formattedEntries = [];

      for (const inputObject of offChain) {
        const body = JSON.parse(inputObject.content.body);

        // Extracting relevant information
        const schemaUid = body.sig.message.schema || null;
        const toAddress = body.sig.message.recipient || null;
        const fromAddress = body.signer;
        const age = body.sig.message.time;
        const uid =
          inputObject.content.tags.find((tag: any) => tag.slug === "uid")
            ?.title || null;

        const entry = {
          uid: uid,
          schemaUid: schemaUid,
          fromAddress: fromAddress,
          toAddress: toAddress,
          age: age,
          type: "OFFCHAIN",
          // Add other properties as needed from the inputObject
        };
        formattedEntries.push(entry);
      }
      // @ts-ignore
      const attestationTableInfo: any[] = [];
      attestations.forEach((inputObject: any, index: any) => {
        // Create a tableData entry
        const entry = {
          uid: inputObject.uid,
          schemaUid: inputObject.schemaUID,
          fromAddress: inputObject.attester,
          toAddress: inputObject.recipient,
          age: inputObject.creationTimestamp,
          type: "ONCHAIN",
          // Add other properties as needed from the inputObject
        };

        // Push the entry to the tableData array
        attestationTableInfo.push(entry);
      });

      let tableDt = transformAndSortArrays(
        formattedEntries,
        attestationTableInfo
      );

      setTaken(!taken);
      // @ts-ignore
      setTableData(tableDt);
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

            <div className="mt-10 ">
              <div className="overflow-x-auto rounded-lg">
                <table className="w-screen-md table-fixed border-b border-gray">
                  <thead className="bg-black">
                    <tr>
                      <th className=" py-2 text-white border-r border-gray">
                        attestationUID
                      </th>
                      <th className=" py-2 text-white border-r border-gray">
                        schemaUID
                      </th>
                      <th className=" py-2 text-white border-r border-gray">
                        from Address
                      </th>
                      <th className="py-2 text-white border-r border-gray">
                        to Address
                      </th>
                      <th className=" py-2 text-white border-r border-gray">
                        Type
                      </th>
                      <th className=" py-2 text-white">Age</th>
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
                              // @ts-ignore
                              link={`/attestation?uid=${row.uid}&type=${row.type}`}
                              // @ts-ignore
                              address={row.uid}
                            />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress
                              // @ts-ignore
                              link={`/schema?schemaUID=${row.schemaUid}`}
                              // @ts-ignore
                              address={row.schemaUid}
                            />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            {/* @ts-ignore */}
                            <EthereumAddress address={row.fromAddress} />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            {/* @ts-ignore */}
                            <EthereumAddress address={row.toAddress} />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex flex-wrap items-center justify-center">
                            <RiLinkUnlinkM className="ml-2" />
                            {/* @ts-ignore */}
                            <p className="px-2 py-2">{row.type}</p>
                          </div>
                        </td>
                        <td className="py-2 border-b border-gray">
                          <div className="flex items-center justify-center">
                            <p className="px-2 py-2">
                              {/* @ts-ignore */}
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
