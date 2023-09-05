import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Link from "next/link"; // Import Link from Next.js
import SchemaProfile from "@/components/SchemaProfile";
import AttestationProfile from "@/components/AttestationProfile";

const attestation = () => {
  // Use React Router or a similar library to get the schema UID from the URL

  // Mock data for the schema profile (replace with actual data)
  const attestationData = {
    attestationUID:
      "0x3cd3a8cf2ac6e6b6e53d825c50a39412bce0a5334448474f3a0cfb4fc83401b6",
    created: "09/05/2023",
    expiration: "Never",
    revoked: false,
    revocable: true,
    schemaUID:
      "0x461e04108d4569e0cd6ae3ddd34fac162d1e659c688af682bcd65489d7975d74",
    from: {
      name: "matallo.eth",
      address: "0xCf7ecA52dE76E72e562ADddb513CeF4c609f1fd2",
    },
    to: "No recipient",
    decodedData: [
      {
        type: "bytes32",
        name: "Book Id",
        value:
          "0x4a839d2ab2d72022389992bf4a0413446fd4ddca5be71c4c2c08d1546e5ff14a",
      },      {
        type: "bytes32",
        name: "Book Id",
        value:
          "0x4a839d2ab2d72022389992bf4a0413446fd4ddca5be71c4c2c08d1546e5ff14a",
      },      {
        type: "bytes32",
        name: "Book Id",
        value:
          "0x4a839d2ab2d72022389992bf4a0413446fd4ddca5be71c4c2c08d1546e5ff14a",
      },
      { type: "bool", name: "Is Read", value: "True" },
      { type: "uint8", name: "Score", value: "5" },
    ],
    referencedAttestation: "No reference",
    referencingAttestations: 0,
  };

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      <div className="mx-auto">
        <AttestationProfile attestationData={attestationData} />
      </div>

      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
};

export default attestation;
