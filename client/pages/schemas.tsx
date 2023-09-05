import React, { useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import RegisterSchemaModal from "@/components/RegisterSchemaModal"; // Import the modal component
import Link from "next/link"; // Import Link from Next.js
import DecodedSchema from "@/components/DecodedSchema";
import EthereumAddress from "@/components/EthereumAddress";

const Schemas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Dummy data for the table (replace with actual data)
  const tableData = [
    {
      id: 1,
      uid: "0x461e04108d4569e0cd6ae3ddd34fac162d1e659c688af682bcd65489d7975d74",
      schema: {
        fields: [
          { type: "uint256", name: "id" },
          { type: "string", name: "name" },
          { type: "address", name: "wallet" },
          { type: "bytes32", name: "hash" },
          { type: "bool", name: "isActive" },
        ],
      },
      resolverAddress: "0x9a2d1097D97AB918149E5268640F423fa309A2f1",
      attestations: 3,
    },
    {
      id: 2,
      uid: "0x461e04108d4569e0cd6ae3ddd34fac162d1e659c688af682bcd65489d7975d74",
      schema: {
        fields: [
          { type: "uint256", name: "id" },
          { type: "string", name: "name" },
          { type: "address", name: "wallet" },
          { type: "bytes32", name: "hash" },
          { type: "bool", name: "isActive" },
        ],
      },
      resolverAddress: "0x9a2d1097D97AB918149E5268640F423fa309A2f1",
      attestations: 5,
    },
    // Add more data as needed
  ];

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100 rounded-full`}>
      <Navbar />
      <div className={`flex-grow mx-8 ${isModalOpen ? "filter blur-md" : ""}`}>
        <div className="px-4 py-4 bg-white rounded-t-xl">
          <div className="flex flex-col items-center">
            <Typography variant="h4" color="black">
              Schemas
            </Typography>
            <Typography color="black">
              Showing the most recent schemas.
            </Typography>
          </div>
        </div>
        <div className="rounded-b-xl bg-white">
          <div className="px-4 py-4 flex flex-col items-center gap-5">
            <div className="flex  items-center">
              <Typography color="black">Total Schemas:{"  "}</Typography>
              <Typography className="ml-2" variant="h6" color="black">
                169
              </Typography>
            </div>
            <div className="flex items-center">
              <Typography color="black">Unique Creators: {"  "}</Typography>
              <Typography className="ml-2" variant="h6" color="black">
                5016
              </Typography>
            </div>
            <Button
              type="button"
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black self-center"
              onClick={openModal}
            >
              Create Schema
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div
            className="rounded-lg overflow-hidden"
            style={{ background: "rgba(0, 0, 0, 0.05)" }}
          >
            <table className="w-full table-fixed border-collapse border border-gray-200">
              <thead className="bg-black ">
                <tr>
                  <th className="w-1/24 py-2 text-white"> # </th>
                  <th className="w-3/12 py-2 text-white"> UID </th>
                  <th className="w-4/12 py-2 text-white"> Schema </th>
                  <th className="w-3/12 py-2 text-white"> Resolver Address </th>
                  <th className="w-5/24 py-2 text-white">Attestations</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } text-center`}
                  >
                    <td className="py-2">
                      <p className="px-1 py-2">{row.id}</p>
                    </td>
                    <td className="py-2">
                      <Link href={`/schema`} passHref>
                        <div className="flex items-center justify-center">
                          <EthereumAddress address={row.uid}></EthereumAddress>

                        </div>
                      </Link>
                    </td>
                    <td className="py-2">
                      <DecodedSchema schema={row.schema.fields}/>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center justify-center">
                        <EthereumAddress address={row.resolverAddress}></EthereumAddress>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center justify-center">
                        <p className="px-2 py-2">{row.attestations}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
      <RegisterSchemaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={createSchema}
      />
    </div>
  );
};

export default Schemas;
