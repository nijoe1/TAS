import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Link from "next/link"; // Import Link from Next.js
import SchemaProfile from "@/components/SchemaProfile";
import DynamicForm from "@/components/DynamicForm";

const schema = () => {
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
  // Mock data for the schema profile (replace with actual data)
  const schemaData = {
    schemaUID:
      "0x461e04108d4569e0cd6ae3ddd34fac162d1e659c688af682bcd65489d7975d74",
    name: "Name",
    description: "Description",
    created: "17 hours ago",
    creator: "0xCf7ecA52dE76E72e562ADddb513CeF4c609f1fd2",
    resolverContract: "0x0000000000000000000000000000000000000000",
    revocable: true,
    attestationCount: {
      onchain: 1,
      offchain: 0,
    },
    decodedSchema: [
      { type: "bytes32", name: "bookId" },
      { type: "bool", name: "isRead" },
      { type: "uint8", name: "score" },
      { type: "uint8", name: "score" },

      { type: "uint8", name: "score" },
      { type: "uint8", name: "score" },
    ],
    rawSchema: "bytes32 bookId,bool isRead,uint8 score, uint8 ",
  };

  // Mock data for the table of attestations (replace with actual data)
  const tableData = [
    {
      uid: "Attestation1",
      fromAddress: "Address1",
      toAddress: "Address2",
      age: "2 days ago",
    },
    {
      uid: "Attestation2",
      fromAddress: "Address3",
      toAddress: "Address4",
      age: "5 days ago",
    },
    // Add more data as needed
  ];

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      <div className={`flex-grow mx-8 ${isModalOpen ? "filter blur-md" : ""}`}>
        <Button
          type="button"
          className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black self-center"
          onClick={openModal}
        >
          Create Schema
        </Button>
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
                        <Link href={`/attestation/${row.uid}`} passHref>
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
      </div>

      <Footer />
      <DynamicForm
        schema="uint256 id, string name, address wallet, bytes32 hash, bool isActive, string[] tsifsa"
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={createSchema}
      />
    </div>
  );
};

export default schema;
