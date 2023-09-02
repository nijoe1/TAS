import React from "react";
import { Typography } from "@material-tailwind/react";
import AttributeFormComponent from "@/components/AttributeFormComponent"; // Import the form component
import DynamicForm from "@/components/DynamicForm"; // Import the form component

import { Navbar } from "@/components/layout"; // Import your Navbar and Footer components
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

const CreateSchema = () => {
  const containerStyle = {
    maxWidth: "800px", // Customize the maximum width as needed
    margin: "0 auto", // Center the container horizontally
    padding: "16px", // Add padding as needed
  };
  return (
    <div
      className={`flex flex-col min-h-screen ${inter.className} bg-blue-gray-100`}
    >
      <Navbar /> {/* Include your Navbar component */}
      <div style={containerStyle}>
        <Typography variant="h5" align="center" gutterBottom>
          Create Schema
        </Typography>
        <AttributeFormComponent /> {/* Include your form component */}
        <DynamicForm
          schema={[
            { name: "id", type: "uint256" },
            { name: "name", type: "string" },
            { name: "counter", type: "uint8" },
          ]}
        />
      </div>
      <div className="flex-grow"></div>
      <Footer /> {/* Include your Footer component */}
    </div>
  );
};

export default CreateSchema;
