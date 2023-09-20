import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import CreateSchemaModal from "@/components/CreateSchemaModal"; // Import the modal component
import { getSchemas } from "@/lib/tas";
import Loading from "@/components/Loading/Loading";
import { useChainId } from "wagmi";
import SchemasTable from "@/components/SchemasTable";

const Schemas = () => {
  const chainID = useChainId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0)

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Define a function to handle creating a schema
  const createSchema = (schemaData: any) => {
    // Handle schema creation logic here
    console.log("Schema Data:", schemaData);
  };

  useEffect(() => {
    async function fetch() {
      let tableData = await getSchemas(chainID);
      setTaken(!taken);
      // @ts-ignore
      setTableData(tableData.tableData);
      setTotal(tableData.number)
    }
    if (!taken && chainID) {
      fetch();
    }
  }, [chainID]);

  return (
    <div className={`flex flex-col min-h-screen w-full rounded-lg`}>
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
                    {total}
                  </Typography>
                  <Button
                    type="button"
                    className="bg-black text-white rounded-full hover:bg-white hover:text-black border border-black mt-2"
                    onClick={openModal}
                  >
                    Create Schema
                  </Button>
                </div>
              </div>
            </div>
            <SchemasTable schemaTableData={tableData} chainID={chainID} />
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
