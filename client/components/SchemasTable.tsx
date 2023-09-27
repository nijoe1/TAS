import React, { useEffect, useState } from "react";
import EthereumAddress from "./EthereumAddress"; // Make sure to import EthereumAddress and TimeCreated components
import TimeCreated from "./TimeCreated";
import { PiChatDotsFill } from "react-icons/pi";
import ChatModal from "./ChatModal";
import { VscFeedback } from "react-icons/vsc";
import DecodedSchema from "./DecodedSchema";
import { getSchemaType } from "@/lib/contractReads";
import CategoriesContainer from "./CategoriesContainer";
import { TbListDetails } from "react-icons/tb";
import { getSchemaAttesters } from "@/lib/tas";
interface Schema {
  name: string;
  description: string;
  categories: string[];
  creator: string;
}
interface SchemasTableProps {
  schemaTableData: {
    id: any; // Incrementing ID
    uid: any;
    schema: { fields: any };
    resolverAddress: any;
    attestations: any;
    creationTimestamp: any;
    schemaType: any;
    revenue?: any;
    subscriptionEnds?: any;
    role?: any;
    schemaDetails?: Schema;
  }[];
  showRevenue?: boolean;
  subscription?: boolean;
  showRole?: boolean;
  chainID?: number;
}

const SchemasTable: React.FC<SchemasTableProps> = ({
  schemaTableData,
  showRevenue,
  subscription,
  showRole,
  chainID,
}) => {
  const [context, setContext] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const openFeedbackModal = () => {
    setModalIsOpen(true);
  };

  const closeFeedbackModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  const getCellStyle = (schemaType: string) => {
    let backgroundColorClass;
    let textColorClass;

    switch (schemaType) {
      case "STANDARD":
        backgroundColorClass = "bg-green-100 rounded-lg text-center"; // Green background for "classic"
        textColorClass = "text-black"; // White text for "classic"
        break;
      case "SUBSCRIPTION":
        backgroundColorClass = "bg-blue-200 rounded-lg"; // Blue background for "subscription"
        textColorClass = "text-black"; // White text for "subscription"
        break;
      case "ACCESS-CONTROL":
        backgroundColorClass = "bg-orange-300 rounded-lg"; // Orange background for "access-control"
        textColorClass = "text-black"; // White text for "access-control"
        break;
      default:
        backgroundColorClass = "bg-gray-200 rounded-lg"; // Default gray background
        textColorClass = "text-black"; // Default black text color
        break;
    }

    return `${backgroundColorClass} ${textColorClass}`;
  };

  const rowsPerPage = 10;

  const totalRows = schemaTableData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const paginatedData = schemaTableData.slice(startIdx, endIdx);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <div>
      {totalRows > 0 ? (
        <div className="overflow-x-auto sm:overflow-x-auto overflow-x-scroll rounded-lg mt-2">
          <table className="mix-w-full border border-gray-300 sm:overflow-x-auto">
            <thead className="bg-black">
              <tr>
                <th className=" py-2 text-white border-r border-gray">#</th>
                <th className="py-2 text-white border-r border-gray">
                  SchemaUID
                </th>
                {!subscription ? (
                  <>
                    <th className="py-2 text-white border-r border-gray">
                      Schema
                    </th>
                    <th className=" py-2 text-white border-r border-gray">
                      Schema Details
                    </th>
                    <th className=" py-2 text-white border-r border-gray">
                      Resolver Address
                    </th>

                    {!showRole ? (
                      <th className="px-4 py-2 text-white border-r border-gray mx-4">
                        Attestations
                      </th>
                    ) : (
                      <th className="px-4 py-2 text-white border-r border-gray mx-4">
                        Role
                      </th>
                    )}
                    <th className=" py-2 text-white border-r border-gray">
                      Age
                    </th>
                    {showRevenue && (
                      <th className="py-2 text-white border-r border-gray mx-4">
                        Taken Revenue
                      </th>
                    )}
                    <th className="px-3 py-2 text-white mx-4">
                      <VscFeedback />
                    </th>
                  </>
                ) : (
                  <th className="py-2 text-white mx-4">Subscription Expires</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
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
                  {!subscription ? (
                    <>
                      <td className="flex flex-col  py-2 border-r border-gray border-b border-gray">
                        <div className="flex flex-col  ">
                          <DecodedSchema schema={row.schema.fields} />
                        </div>
                      </td>
                      <td
                        className={`py-2 px-1 border-r border-gray border-b border-gray ${getCellStyle(
                          getSchemaType(row.resolverAddress, chainID as number)
                        )}`}
                      >
                        <div className="flex flex-col  items-center justify-center ">
                          <p>
                            {getSchemaType(
                              row.resolverAddress,
                              chainID as number
                            )}
                          </p>
                          <SchemaDetailsModal
                            schema={row.schemaDetails}
                            type={getSchemaType(
                              row.resolverAddress,
                              chainID as number
                            )}
                            schemaUID={row.uid as unknown as string}
                            chainID={chainID}
                          ></SchemaDetailsModal>
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

                      {!showRole ? (
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            {/* @ts-ignore */}
                            <p>{row.attestations}</p>
                          </div>
                        </td>
                      ) : (
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            {/* @ts-ignore */}
                            <p>{row.role}</p>
                          </div>
                        </td>
                      )}
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
                      {showRevenue && (
                        <td className="py-2 border-r border-gray border-b border-gray">
                          <div className="flex items-center justify-center">
                            {row.revenue ? (
                              <p className="px-2 py-2">{`${
                                row.revenue / 10 ** 18
                              } ether`}</p>
                            ) : (
                              <p className="px-2 py-2">{`NaN`}</p>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-2 border-b border-gray">
                        <div className="flex items-center justify-center cursor-pointer z-50">
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
                    </>
                  ) : (
                    <td className="py-2 border-r border-gray border-b border-gray">
                      <div className="flex items-center justify-center">
                        {showRevenue ? (
                          <p className="px-2 py-2">{`${row.revenue} ether`}</p>
                        ) : (
                          <p className="px-2 py-2">
                            {
                              <TimeCreated
                                // @ts-ignore
                                createdAt={row.subscriptionEnds}
                              />
                            }
                          </p>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-center mt-4">
            {/* @ts-ignore */}
            {[...Array(totalPages).keys()].map((page) => (
              <span
                key={page}
                onClick={() => handlePageChange(page + 1)}
                className={`cursor-pointer rounded-lg px-3 py-2 mx-1 ${
                  currentPage === page + 1 ? "bg-gray-300" : "bg-white"
                }`}
              >
                {page + 1}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div>No Data</div>
      )}
    </div>
  );
};

export default SchemasTable;

function splitTextIntoChunks(text: any, chunkSize: any) {
  if (text) {
    const regex = new RegExp(`.{1,${chunkSize}}`, "g");
    return text.match(regex) || [];
  }
  return [];
}

interface SchemaDetailsModalProps {
  schema?: Schema;
  schemaUID?: string;
  type?: string;
  chainID?: number;
}
const SchemaDetailsModal: React.FC<SchemaDetailsModalProps> = ({
  schema,
  schemaUID,
  type,
  chainID,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [attesters, setAttesters] = useState<string[]>([]);
  const [revokers, setRevokers] = useState<string[]>([]);
  const [creators, setCreators] = useState<string[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getSchemaAttesters(
          chainID as number,
          schemaUID as `0x${string}`,
          type as string
        );

        if (type === "ACCESS_CONTROL") {
          setAttesters((await res.attesters) || []);
          setRevokers((await res.revokers) || []);
        } else if (type === "SUBSCRIPTION") {
          setCreators(res || []);
        }
      } catch (error) {
        console.error(
          "Error fetching attesters, revokers, or creators:",
          error
        );
      }
    }
    fetch();
  }, []);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const modalStyle: React.CSSProperties = {
    display: isOpen ? "flex" : "none",
    position: "fixed",
    zIndex: 999,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    overflow: "auto",
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "center",
    alignItems: "center",
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: "#fefefe",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    maxWidth: "400px",
  };

  return (
    <div>
      <TbListDetails onClick={toggleModal} style={{ cursor: "pointer" }} />
      <div
        id="myModal"
        style={modalStyle}
        className="flex flex-col items-center"
      >
        <div style={contentStyle} className="flex flex-col items-center">
          <strong>Name</strong>
          <p className="border border-black px-2 py-1 rounded-md">
            {schema?.name}
          </p>
          <strong>Description</strong>
          <div className="border border-black px-2 py-1 rounded-md">
            {splitTextIntoChunks(schema?.description, 35).map(
              (chunk: any, index: any) => (
                <React.Fragment key={index}>
                  {chunk}
                  <br />
                </React.Fragment>
              )
            )}
          </div>
          <div>
            <CategoriesContainer strings={schema?.categories || []} />
          </div>
          <strong>Creator</strong>
          <div className="border border-black px-2 py-1 rounded-md">
            <EthereumAddress
              link={`/dashboard?address=${schema?.creator}`}
              address={schema?.creator || ""}
            />
          </div>
          {type === "ACCESS_CONTROL" && (
            <div className="border border-black p-2 rounded-md">
              <div>
                <p>Attesters:</p>
                {attesters.map((attester, index) => (
                  <EthereumAddress
                    key={index}
                    // @ts-ignore
                    address={attester.address}
                    // @ts-ignore
                    link={`/dashboard?address=${attester.address}`}
                  />
                ))}
              </div>
              <div>
                <p>Revokers:</p>
                {revokers.map((revoker, index) => (
                  <EthereumAddress
                    key={index}
                    // @ts-ignore
                    address={revoker.address}
                    // @ts-ignore
                    link={`/dashboard?address=${revoker.address}`}
                  />
                ))}
              </div>
            </div>
          )}
          {type === "SUBSCRIPTION" && (
            <div>
              <p>Content Creators:</p>
              {creators.map((creator, index) => (
                <EthereumAddress
                  key={index}
                  address={creator}
                  link={`/dashboard?address=${creator}`}
                />
              ))}
            </div>
          )}
          <div className="flex flex-col items-center">
            <button
              className="bg-black flex flex-col rounded-md items-center text-white px-3 mt-3"
              onClick={toggleModal}
            >
              close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
