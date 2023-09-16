import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading/Loading";
import SchemaProfile from "@/components/SchemaProfile";
import { useRouter } from "next/router";
import { getSchemaAttestations, getSchema } from "@/lib/tableland";
import TimeCreated from "@/components/TimeCreated"; // Replace with the actual path
import EthereumAddress from "@/components/EthereumAddress";
import { useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import SubscriptionItem from "@/components/SubscriptionItem";
import { useAccount } from "wagmi";
import {
  getOffChainAttestationsForSchema,
  transformAndSortArrays,
} from "@/lib/offchain";
import { RiLinkUnlinkM } from "react-icons/ri";

const Schema = () => {
  const useChainID = useChainId();
  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [schemaData, setSchemaData] = useState({
    schemaUID: "",
    name: "",
    description: "",
    created: "17 hours ago",
    creator: "",
    resolverContract: "",
    revocable: true,
    attestationCount: {
      onchain: 1,
      offchain: 0,
    },
    decodedSchema: [],
    rawSchema: "",
  });
  const [subscriptionResolver, setSubscriptionResolver] = useState();
  const { address } = useAccount();

  const router = useRouter();
  const schemaUID = router?.query?.schemaUID;

  function decodeSchema(rawSchema: string) {
    if (typeof rawSchema !== "string") {
      // Handle the case where rawSchema is not a string (e.g., it's undefined or null)
      return [];
    }

    // Continue with your existing code to split and decode the schema
    const fieldStrings = rawSchema.split(",").map((field) => field.trim());
    // @ts-ignore
    const decodedSchema = [];
    fieldStrings.forEach((fieldString) => {
      const [type, name] = fieldString.split(" ");
      decodedSchema.push({ type, name });
    });
    // @ts-ignore
    console.log(decodedSchema);
    // @ts-ignore
    return decodedSchema;
  }
  const [accessInfo, setAccessInfo] = useState({
    attestAccess: false,
    revokeAccess: false,
    viewAccess: false,
  });

  // Define a function to update the accessInfo state
  const handleAccessInfoChange = (newAccessInfo: any) => {
    setAccessInfo(newAccessInfo);
    console.log(newAccessInfo);
  };

  useEffect(() => {
    async function fetch() {
      if (schemaUID) {
        let offChain = await getOffChainAttestationsForSchema(
          useChainID,
          schemaUID as string
        );

        const formattedEntries = [];

        for (const inputObject of offChain) {
          const body = JSON.parse(inputObject.content.body);

          // Extracting relevant information
          const toAddress = body.sig.message.recipient || null;
          const fromAddress = body.signer;
          const age = body.sig.message.time;
          const uid =
            inputObject.content.tags.find((tag: any) => tag.slug === "uid")
              ?.title || null;

          const entry = {
            uid: uid,
            fromAddress: fromAddress,
            toAddress: toAddress,
            age: age,
            data: body.sig.message.data.toLowerCase(),
            type: "OFFCHAIN",
          };
          formattedEntries.push(entry);
        }
        // @ts-ignore
        const attestationTableInfo: any[] | ((prevState: never[]) => never[]) =
          [];
        let attestations = await getSchemaAttestations(useChainID, schemaUID);
        let schema = await getSchema(useChainID, schemaUID);
        schema = schema[0];
        let schemaInfo = schemaData;
        attestations.forEach((inputObject: any, index: any) => {
          // Create a tableData entry
          const entry = {
            uid: inputObject.uid,
            fromAddress: inputObject.attester,
            toAddress: inputObject.recipient,
            age: inputObject.creationTimestamp,
            data: inputObject.data,
            type: "ONCHAIN",
            // Add other properties as needed from the inputObject
          };

          // Push the entry to the tableData array
          attestationTableInfo.push(entry);
        });

        schemaInfo.creator = schema.creator;
        // @ts-ignore
        schemaInfo.decodedSchema = decodeSchema(schema.schema);
        // @ts-ignore

        schemaInfo.schemaUID = schemaUID;
        schemaInfo.name = schema.name;
        schemaInfo.description = schema.description;
        schemaInfo.resolverContract = schema.resolver;
        schemaInfo.rawSchema = schema.schema;
        schemaInfo.revocable = schema.revocable === "true" ? true : false;
        schemaInfo.created = schema.creationTimestamp;
        setTaken(!taken);
        setSubscriptionResolver(
          // @ts-ignore
          CONTRACTS.SubscriptionResolver[useChainID].contract.toLowerCase()
        );
        let tableDt:
          | ((prevState: never[]) => never[])
          | {
              uid: any;
              fromAddress: any;
              toAddress: any;
              age: any;
              data: any;
              type: string;
            }[]
          | {
              uid: any;
              schemaUid: any; // Add other properties as needed from the inputObject
              // Add other properties as needed from the inputObject
              fromAddress: any;
              toAddress: any; // Push the entry to the tableData array
              // Push the entry to the tableData array
              age: any;
              type: any;
            }[] = [];
        if (formattedEntries.length == 0 && attestationTableInfo.length == 0) {
        } else if (attestationTableInfo.length == 0) {
          tableDt = formattedEntries;
        } else if (formattedEntries.length == 0) {
          tableDt = attestationTableInfo;
        } else {
          tableDt = transformAndSortArrays(
            formattedEntries,
            attestationTableInfo
          );
        }
        console.log(tableDt);

        // @ts-ignore
        setTableData(tableDt);
        setSchemaData(schemaInfo);
      }
    }
    if (!taken && schemaUID && useChainID) {
      fetch();
    }
  }, [schemaUID, useChainID, address]);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <div className="flex flex-col items-center">
            <SchemaProfile
              schemaData={schemaData}
              onAccessInfoChange={handleAccessInfoChange}
              chainID={useChainID}
            ></SchemaProfile>

            {tableData.length > 0 &&
            // @ts-ignore
            CONTRACTS.SubscriptionResolver[
              useChainID
            ].contract.toLowerCase() !== schemaData.resolverContract ? (
              <div className="mt-10 mx-[10%]">
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-screen-md table-fixed border-b border-gray">
                    <thead className="bg-black">
                      <tr>
                        <th className=" py-2 text-white border-r border-gray">
                          attestationUID
                        </th>
                        <th className=" py-2 text-white border-r border-gray">
                          From Address
                        </th>
                        <th className=" py-2 text-white border-r border-gray">
                          To Address
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
                            <div className="flex flex-wrap items-center justify-center">
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
            ) : accessInfo.viewAccess || accessInfo.attestAccess ? (
              <div className="grid grid-cols-3 gap-2 mx-auto">
                {" "}
                {/* Adjust the grid layout */}
                {tableData.map((item, index) => (
                  <SubscriptionItem
                    key={index}
                    itemData={{
                      // @ts-ignore
                      address: address,
                      // @ts-ignore
                      data: item.data,
                      // @ts-ignore
                      context: item.uid,
                      // @ts-ignore
                      from: item.fromAddress,
                      // @ts-ignore
                      age: item.age,
                      // @ts-ignore
                      type: item.type
                    }}
                  />
                ))}
              </div>
            ) : (
              <div>No access</div>
            )}
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

export default Schema;
