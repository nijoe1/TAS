import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading/Loading";
import Link from "next/link"; // Import Link from Next.js
import SchemaProfile from "@/components/SchemaProfile";
import { useRouter } from "next/router";
import { getSchemaAttestations, getSchema } from "@/lib/tableland";

const schema = () => {
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

  const router = useRouter();
  const schemaUID = router?.query?.schemaUID;

  function decodeSchema(rawSchema: string) {
    if (typeof rawSchema !== "string") {
      // Handle the case where rawSchema is not a string (e.g., it's undefined or null)
      return [];
    }

    // Continue with your existing code to split and decode the schema
    const fieldStrings = rawSchema.split(",").map((field) => field.trim());
    const decodedSchema = [];
    fieldStrings.forEach((fieldString) => {
      const [type, name] = fieldString.split(" ");
      decodedSchema.push({ type, name });
    });
    console.log(decodedSchema);

    return decodedSchema;
  }

  useEffect(() => {
    async function fetch() {
      if (schemaUID) {
        const attestationTableInfo = [];
        let attestations = await getSchemaAttestations(schemaUID);
        let schema = await getSchema(schemaUID);
        schema = schema[0];
        let schemaInfo = schemaData;
        attestations.forEach((inputObject, index) => {
          // Create a tableData entry
          const entry = {
            uid: inputObject.uid,
            fromAddress: inputObject.attester,
            toAddress: inputObject.recipient,

            age: "3mins ago",
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
        setTaken(!taken);

        setTableData(attestationTableInfo);
        setSchemaData(schemaInfo);
        console.log(schemaData);
      }
    }
    if (!taken && schemaUID) {
      fetch();
    }
  }, [schemaUID]);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <SchemaProfile schemaData={schemaData}></SchemaProfile>
          <div className={`flex-grow mx-8`}>
            <div className="rounded-b-xl bg-white mt-4">
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: "rgba(0, 0, 0, 0)" }}
              >
                <table className="w-full table-fixed border-collapse border border-gray-200">
                  <thead className="bg-black">
                    <tr>
                      <th className="w-2/12 py-2 text-white">UID</th>
                      <th className="w-3/12 py-2 text-white">From Address</th>
                      <th className="w-3/12 py-2 text-white">To Address</th>
                      <th className="w-4/12 py-2 text-white">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.uid} className="bg-white text-center">
                        <td className="py-2">
                          <Link href={`/attestation?uid=${row.uid}`} passHref>
                            <p className="rounded-full px-4 py-2 cursor-pointer hover:bg-gradient-to-r from-black to-blue-gray-10000 hover:text-white">
                              {row.uid}
                            </p>
                          </Link>
                        </td>
                        <td className="py-2">{row.fromAddress}</td>
                        <td className="py-2">{row.toAddress}</td>
                        <td className="py-2">{row.age}</td>
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

export default schema;
