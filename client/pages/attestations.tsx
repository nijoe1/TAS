import React, { useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import RegisterSchemaModal from "@/components/RegisterSchemaModal"; // Import the modal component
import Link from "next/link"; // Import Link from Next.js
import EthereumAddress from "@/components/EthereumAddress";

const Attestations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Define a function to handle creating a schema
  const createAttestation = (attestationData) => {
    // Handle schema creation logic here
    console.log("attestationData :", attestationData);
  };

  // Dummy data for the table (replace with actual data)
  const tableData = [
    {
      uid: "0x461e04108d4569e0cd6ae3ddd34fac162d1e659c688af682bcd65489d7975d74",
      schemaUid: "0x1234567890abcdef",
      fromAddress: "0xAddress1",
      toAddress: "0xAddress2",
      age: "2023-09-05", // Replace with an actual date
    },
    {
      uid: "0x461e04108d4569e0cd6ae3ddd34fac162d1e659c688af682bcd65489d7975d74",
      schemaUid: "0x1234567890abcdef",
      fromAddress: "0xAddress3",
      toAddress: "0xAddress4",
      age: "2023-09-04", // Replace with an actual date
    },
    // Add more data as needed
  ];

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      <div className={`flex-grow mx-8 ${isModalOpen ? "filter blur-md" : ""}`}>
        <div className="px-4 py-4 bg-white rounded-t-xl">
          <div className="flex flex-col items-center">
            <Typography variant="h4" color="black">
              Attestations
            </Typography>
            <Typography color="black">
              Showing the most recent attestations.
            </Typography>
          </div>
        </div>
        <div className="rounded-b-xl bg-white">
          <div className="px-4 py-4 flex flex-col items-center gap-5">
            <div className="flex  items-center">
              <Typography color="black">Total Attestations:{"  "}</Typography>
              <Typography className="ml-2" variant="h6" color="black">
                169
              </Typography>
            </div>
            <div className="flex items-center">
              <Typography color="black">Unique Attestors: {"  "}</Typography>
              <Typography className="ml-2" variant="h6" color="black">
                5016
              </Typography>
            </div>
            <div className="flex  items-center">
              <Typography color="black">
                Offchain Attestations: {"  "}
              </Typography>
              <Typography className="ml-2 " variant="h6" color="black">
                16981
              </Typography>
            </div>
            <Button
              type="button"
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black self-center"
              onClick={openModal}
            >
              Create Attestation
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
                  <th className="w-3/12 py-2 text-white">UID</th>
                  <th className="w-3/12 py-2 text-white">SchemaUID</th>
                  <th className="w-2/12 py-2 text-white">From Address</th>
                  <th className="w-2/12 py-2 text-white">To Address</th>
                  <th className="w-2/12 py-2 text-white">Age (DateCreated)</th>
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
                      <Link href={`/attestation`} passHref>
                        <div className="flex items-center justify-center">
                          <EthereumAddress address={row.uid}/>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2">
                      <Link href={`#`} passHref>
                        <div className="flex items-center justify-center">
                          <EthereumAddress address={row.schemaUid}/>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center justify-center">
                        <EthereumAddress address={row.fromAddress}/>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center justify-center">
                        <EthereumAddress address={row.toAddress}/>
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
      </div>
      <Footer />
      <RegisterSchemaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={createAttestation} // Replace with the actual function to create attestations
      />
    </div>
  );
};

export default Attestations;
