import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import CreateSchemaModal from "@/components/CreateSchemaModal"; // Import the modal component
import DecodedSchema from "@/components/DecodedSchema";
import EthereumAddress from "@/components/EthereumAddress";
import ChatModal from "@/components/ChatModal";

import { getSchemas } from "@/lib/tas";
import Loading from "@/components/Loading/Loading";
import { useChainId } from "wagmi";
import { VscFeedback } from "react-icons/vsc";
import { PiChatDotsFill } from "react-icons/pi";
import TimeCreated from "@/components/TimeCreated";

const Schemas = () => {
  const chainID = useChainId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [context, setContext] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openFeedbackModal = () => {
    setModalIsOpen(true);
  };

  const closeFeedbackModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

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
      setTableData(tableData);
    }
    if (!taken && chainID) {
      fetch();
    }
  }, [chainID]);

  return (
    <div
      className={`flex flex-col min-h-screen w-full rounded-lg`}
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
                    className="bg-black text-white rounded-full hover:bg-white hover:text-black border border-black mt-2"
                    onClick={openModal}
                  >
                    Create Schema
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-10 w-[90%] items-center flex flex-col">
              <div className="overflow-x-auto rounded-lg">
                <table className="w-screen-md table-fixed border-b border-gray">
                  <thead className="bg-black">
                    <tr>
                      <th className=" py-2 text-white border-r border-gray">
                        #
                      </th>
                      <th className="py-2 text-white border-r border-gray">
                        SchemaUID
                      </th>
                      <th className="py-2 text-white border-r border-gray">
                        Schema
                      </th>
                      <th className=" py-2 text-white border-r border-gray">
                        Resolver Address
                      </th>
                      <th className="px-4 py-2 text-white border-r border-gray mx-4">
                        Attestations
                      </th>
                      <th className=" py-2 text-white border-r border-gray">
                        Age
                      </th>
                      <th className="px-3 py-2 text-white mx-4">
                        <VscFeedback />
                      </th>
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
                            {/* @ts-ignore */}
                            <p className="px-1 py-2">{row.id}</p>
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress
                              // @ts-ignore
                              address={row.uid}
                              // @ts-ignore
                              link={`/schema?schemaUID=${row.uid}`}
                            ></EthereumAddress>
                          </div>
                        </td>
                        <td className="flex flex-col py-2 border-r border-gray border-b border-gray">
                          <div className="flex flex-col  ">
                            {/* @ts-ignore */}
                            <DecodedSchema schema={row.schema.fields} />
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <EthereumAddress
                              // @ts-ignore
                              address={row.resolverAddress}
                            ></EthereumAddress>
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            {/* @ts-ignore */}
                            <p>{row.attestations}</p>
                          </div>
                        </td>
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            <p className="px-2 py-2">
                              {
                                <TimeCreated
                                  // @ts-ignore
                                  createdAt={row.creationTimestamp}
                                />
                              }
                            </p>
                          </div>
                        </td>
                        <td className="py-2 border-b border-gray">
                          <div className="flex items-center justify-center cursor-pointer">
                            <PiChatDotsFill
                              className="bolder"
                              onClick={() => {
                                // @ts-ignore
                                setContext(row.uid);
                                openFeedbackModal();
                              }}
                            />
                            <ChatModal
                              // @ts-ignore
                              context={context}
                              isOpen={modalIsOpen}
                              closeModal={closeFeedbackModal}
                            />
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
