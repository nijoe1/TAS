import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading/Loading";
import Link from "next/link"; // Import Link from Next.js
import SchemaProfile from "@/components/SchemaProfile";
import { useRouter } from "next/router";
import { getSchemaAttestations, getSchema } from "@/lib/tableland";
import TimeCreated from "@/components/TimeCreated"; // Replace with the actual path
import EthereumAddress from "@/components/EthereumAddress";
import { useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import SubscriptionItem from "@/components/SubscriptionItem";
import { useAccount } from "wagmi";

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
        // @ts-ignore
        const attestationTableInfo = [];
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
        // @ts-ignore
        setTableData(attestationTableInfo);
        setSchemaData(schemaInfo);
        console.log(schemaData);
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
            CONTRACTS.SubscriptionResolver[useChainID].contract.toLowerCase() !==
              schemaData.resolverContract ? (
              <div className="mt-10 mx-[25%]">
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-screen-md table-fixed border-b border-gray">
                    <thead className="bg-black">
                      <tr>
                        <th className="w-4/12 py-2 text-white border-r border-gray">
                          attestationUID
                        </th>
                        <th className="w-3/12 py-2 text-white border-r border-gray">
                          From Address
                        </th>
                        <th className="w-3/12 py-2 text-white border-r border-gray">
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
                                // @ts-ignore
                                link={`/attestation?uid=${row.uid}`}
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
            ) : accessInfo.viewAccess || accessInfo.attestAccess ? (
              <div className="grid grid-cols-3 gap-2 mx-auto">
                {" "}
                {/* Adjust the grid layout */}
                {tableData.map((item, index) => (
                  <SubscriptionItem
                    key={index}
                    // @ts-ignore
                    itemData={{ address: address, data: item.data }}
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
