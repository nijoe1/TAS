import React, { useState } from "react";
import EthereumAddress from "./EthereumAddress"; // Make sure to import EthereumAddress and TimeCreated components
import TimeCreated from "./TimeCreated";
import { PiChatDotsFill } from "react-icons/pi";
import ChatModal from "./ChatModal";
import { VscFeedback } from "react-icons/vsc";
import DecodedSchema from "./DecodedSchema";
import { getSchemaType } from "@/lib/contractReads";

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
    role?:any
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
      case "CLASIC":
        backgroundColorClass = "bg-green-200 rounded-lg"; // Green background for "classic"
        textColorClass = "text-black"; // White text for "classic"
        break;
      case "SUBSCRIPTION":
        backgroundColorClass = "bg-blue-200 rounded-lg"; // Blue background for "subscription"
        textColorClass = "text-black"; // White text for "subscription"
        break;
      case "ACCESS-CONTROL":
        backgroundColorClass = "bg-orange-200 rounded-lg"; // Orange background for "access-control"
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
        <div className="overflow-x-auto rounded-lg mt-2">
          <table className="min-w-full border border-gray-300">
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
                      Resolver Address
                    </th>
                    <th className=" py-2 text-white border-r border-gray">
                      Schema Type
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
                  <th className="py-2 text-white mx-4">
                    Remaining Subscription
                  </th>
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
                      <td className="flex flex-col py-2 border-r border-gray border-b border-gray">
                        <div className="flex flex-col  ">
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
                      <td
                        className={`py-2 px-3 border-r border-gray border-b border-gray ${getCellStyle(
                          getSchemaType(row.resolverAddress, chainID as number)
                        )}`}
                      >
                        <div className="flex items-center justify-center">
                          <p>
                            {getSchemaType(
                              row.resolverAddress,
                              chainID as number
                            )}
                          </p>
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
                              <p className="px-2 py-2">{`${row.revenue} ether`}</p>
                            ) : (
                              <p className="px-2 py-2">{`0 ether`}</p>
                            )}
                          </div>
                        </td>
                      )}
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
