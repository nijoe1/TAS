import React, { useState } from "react";
import EthereumAddress from "./EthereumAddress"; // Make sure to import EthereumAddress and TimeCreated components
import TimeCreated from "./TimeCreated";
import { RiLinkUnlinkM } from "react-icons/ri"; // Import the RiLinkUnlinkM icon

interface AttestationsTableProps {
  attestationsTableData: {
    uid: string;
    refUID: string;
    schemaUid: string;
    fromAddress: string;
    toAddress: string;
    type: string;
    age: string;
  }[];
  notSchemaUID?: boolean;
}

const AttestationsTable: React.FC<AttestationsTableProps> = ({
  attestationsTableData,
  notSchemaUID,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const totalRows = attestationsTableData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const paginatedData = attestationsTableData.slice(startIdx, endIdx);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <div>
      {totalRows > 0 ? (
        <div className="overflow-x-auto rounded-lg mt-10">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-black">
              <tr>
                <th className="py-2 text-white border-r border-gray">
                  attestationUID
                </th>
                <th className="py-2 text-white border-r border-gray">refUID</th>
                {!notSchemaUID && (
                  <th className="py-2 text-white border-r border-gray">
                    schemaUID
                  </th>
                )}
                <th className="py-2 text-white border-r border-gray">
                  Attester
                </th>
                <th className="py-2 text-white border-r border-gray">
                  Recipient
                </th>
                <th className="py-2 text-white border-r border-gray">Type</th>
                <th className="py-2 text-white">Age</th>
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
                      <EthereumAddress
                        link={`/attestation?uid=${row.uid}&type=${row.type}`}
                        address={row.uid}
                      />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    {row.refUID == "0x0000000000000000000000000000000000000000000000000000000000000000" ? (
                      <div className="flex items-center justify-center">
                        <EthereumAddress address={row.refUID} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <EthereumAddress address={row.refUID} link={`/attestation?uid=${row.refUID}`} />
                      </div>
                    )}
                  </td>
                  {!notSchemaUID && (
                    <td className="py-2 border-r border-gray border-b border-gray">
                      <div className="flex items-center justify-center">
                        <EthereumAddress
                          link={`/schema?schemaUID=${row.schemaUid}`}
                          address={row.schemaUid}
                        />
                      </div>
                    </td>
                  )}
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <EthereumAddress
                        address={row.fromAddress}
                        link={`/dashboard?address=${row.fromAddress}`}
                      />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      {row.toAddress !=
                      "0x0000000000000000000000000000000000000000" ? (
                        <EthereumAddress
                          address={row.toAddress}
                          link={`/dashboard?address=${row.toAddress}`}
                        />
                      ) : (
                        <EthereumAddress address={row.toAddress} />
                      )}
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex flex-wrap items-center justify-center">
                      <RiLinkUnlinkM className="ml-2" />
                      <p className="px-2 py-2">{row.type}</p>
                    </div>
                  </td>
                  <td className="py-2 border-b border-gray">
                    <div className="flex items-center justify-center">
                      <p className="px-2 py-2">
                        <TimeCreated createdAt={row.age} />
                      </p>
                    </div>
                  </td>
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

export default AttestationsTable;
