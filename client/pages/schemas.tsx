import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import CreateSchemaModal from "@/components/CreateSchemaModal"; // Import the modal component
import Link from "next/link"; // Import Link from Next.js
import DecodedSchema from "@/components/DecodedSchema";
import EthereumAddress from "@/components/EthereumAddress";
import { getAllSchemas } from "@/lib/tableland";
import Loading from "@/components/Loading/Loading";
import { useChainId } from "wagmi";

const Schemas = () => {
  const chainID = useChainId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Define a function to handle creating a schema
  const createSchema = (schemaData) => {
    // Handle schema creation logic here
    console.log("Schema Data:", schemaData);
  };

  function parseInputString(inputString) {
    const fields = inputString.split(",").map((field) => {
      const [type, name] = field.trim().split(" ");
      return { type, name };
    });

    return { fields };
  }

  useEffect(() => {
    async function fetch() {
      const tableData = [];
      let schemas = await getAllSchemas(chainID);
      console.log(schemas);
      schemas.forEach((inputObject, index) => {
        const schemaString = inputObject.schema;
        const schema = parseInputString(schemaString);

        // Create a tableData entry
        const entry = {
          id: index + 1, // Incrementing ID
          uid: inputObject.schemaUID,
          schema,
          resolverAddress: inputObject.resolver,
          attestations: 1,
          // Add other properties as needed from the inputObject
        };

        // Push the entry to the tableData array
        tableData.push(entry);
      });
      setTaken(!taken);
      setTableData(tableData);
    }
    if (!taken && chainID) {
      fetch();
    }
  }, [chainID]);

  return (
    <div
      className={`flex flex-col min-h-screen bg-blue-gray-100 w-full rounded-lg`}
    >
      <Navbar />
      {taken ? (
        <>
          <div className="flex flex-col items-center">
            <div className={` mx-auto ${isModalOpen ? "filter blur-md" : ""}`}>
              <div className="px-4 py-4 bg-white rounded-xl">
                <div className="flex flex-col items-center">
                  <Typography variant="h4" color="black">
                    Schemas
                  </Typography>
                  <Typography color="black">
                    Showing the most recent schemas.
                  </Typography>
                  <Typography color="black">Total Schemas:{"  "}</Typography>
                  <Typography className="ml-2" variant="h6" color="black">
                    169
                  </Typography>
                  <Typography color="black">Unique Creators: {"  "}</Typography>
                  <Typography className="ml-2" variant="h6" color="black">
                    5016
                  </Typography>
                  <Button
                    type="button"
                    className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black self-center mt-2"
                    onClick={openModal}
                  >
                    Create Schema
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-10 ">
              <div className="overflow-x-auto rounded-lg">
                <table className="w-screen-md table-fixed border-b border-gray">
                  <thead className="bg-black">
                    <tr>
                      <th className="w-1/12 py-2 text-white border-r border-gray">
                        #
                      </th>
                      <th className="w-3/12 py-2 text-white border-r border-gray">
                        SchemaUID
                      </th>
                      <th className="w-5/12 py-2 text-white border-r border-gray">
                        Schema
                      </th>
                      <th className="w-2/12 py-2 text-white border-r border-gray">
                        Resolver Address
                      </th>
                      <th className="w-1/12 py-2 text-white">Attestations</th>
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
                            <p className="px-1 py-2">{row.id}</p>
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress
                              address={row.uid}
                              link={`/schema?schemaUID=${row.uid}`}
                            ></EthereumAddress>
                          </div>
                        </td>
                        <td className="flex flex-col py-2 border-r border-gray border-b border-gray">
                          <div className="flex flex-col  ">
                            <DecodedSchema schema={row.schema.fields} />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress
                              address={row.resolverAddress}
                            ></EthereumAddress>
                          </div>
                        </td>
                        <td className="py-2 border-b border-gray">
                          <div className="flex items-center justify-center">
                            <p className="px-2 py-2">{1}</p>
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
      <CreateSchemaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={createSchema}
      />
    </div>
  );
};

export default Schemas;
