import React, { useEffect, useState } from "react";
import EthereumAddress from "./EthereumAddress"; // Make sure to import EthereumAddress and TimeCreated components
import TimeCreated from "./TimeCreated";
import Pagination from "./Pagination";
import {
  useChainId,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { getEncryptedFilesBlobs } from "@/lib/tas";
import DecodedData from "./DecodedData";
// @ts-ignore
import { Orbis } from "@orbisclub/orbis-sdk";
import Notification from "@/components/Notification";
import { CONTRACTS } from "@/constants/contracts/index";
type delegationObject = {
  schemaUID: string;
  AttestationRequestData: {
    recipient: string;
    expirationTime: number;
    revocable: boolean;
    refUID: string;
    transformedData: any;
    attestationData: string;
    Base64Data: string;
    value: number;
  };
  signature: {
    v: number;
    r: string;
    s: string;
  };
  attester: string;
  deadline: number;
  nonce: number;
  createdAt: number;
};
interface SchemaDelegationsTableProps {
  schemaDelegationsTableData: delegationObject[];
  encrypted: boolean;
}
const orbis = new Orbis();

const SchemaDelegationsTable: React.FC<SchemaDelegationsTableProps> = ({
  schemaDelegationsTableData,
  encrypted,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fetched, setFetched] = useState(false);
  const rowsPerPage = 10;
  const { address } = useAccount();
  const totalRows = schemaDelegationsTableData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const chainID = useChainId();
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedData = schemaDelegationsTableData.slice(startIdx, endIdx);
  const [selecterRow, setSelectedRow] = useState(paginatedData[0]);

  const {
    write,
    data: txdata,
    isError: isErrorr,
    isLoading: isLoadingg,
    isSuccess: isSuccesss,
    error,
  } = useContractWrite({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "attestByDelegation",
  });

  const {
    data: res,
    isError: err,
    isLoading: wait,
    isSuccess: succ,
  } = useWaitForTransaction({
    confirmations: 2,

    hash: txdata?.hash,
  });

  useEffect(() => {
    const createPost = async () => {
      const post = {
        title: `Delegated Attestation for schemaUID: ${selecterRow.schemaUID}`,
        body: `AttestationRequestDelegated/${selecterRow.attester}/${selecterRow.nonce}`,
        mentions: [],
        tags: [
          {
            slug: `DelegatedBy/${address}`,
            title: address,
          },
          {
            slug: `DelegatedAttestation/${selecterRow.attester}`,
            title: address,
          },
        ],
        context: `AttestationRequestDelegated/${selecterRow.attester}/${selecterRow.nonce}`,
        // Other properties based on your requirements
      };
      await orbis.isConnected();
      const res = await orbis.createPost(post);
      if (res.status != 200) {
        alert("true");
      }
    };
    const jwt = localStorage.getItem(`lighthouse-jwt-${address}`);

    const fetch = async () => {
      for (const request of schemaDelegationsTableData) {
        let decodedData = await getEncryptedFilesBlobs(
          request.AttestationRequestData.transformedData,
          address as `0x${string}`,
          jwt as string
        );
        request.AttestationRequestData.transformedData = decodedData;
      }
      setFetched(!fetched);
    };
    if (!fetched) {
      if (encrypted) {
        fetch();
      } else {
        setFetched(!fetched);
      }
    }
    if (isSuccesss) {
      createPost();
    }
  }, [fetched, isSuccesss]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className=" text-center">
      {totalRows > 0 && fetched ? (
        <div className="overflow-x-auto sm:overflow-x-auto overflow-x-scroll rounded-lg mt-2">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-black">
              <tr>
                <th className="py-2 text-white border-r border-gray">
                  attester
                </th>
                <th className="py-2 text-white border-r border-gray">
                  recipient
                </th>
                <th className="py-2 text-white border-r border-gray">refUID</th>
                <th className="py-2 text-white border-r border-gray">
                  attestationData
                </th>
                <th className="py-2 text-white border-r border-gray">Age</th>
                <th className="py-2 text-white">attestByDelegate</th>
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
                        address={row.attester}
                        link={`/dashboard?address=${row.attester}`}
                      />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      {row.AttestationRequestData.recipient !==
                      "0x0000000000000000000000000000000000000000" ? (
                        <EthereumAddress
                          link={`/dashboard?address=${row.AttestationRequestData.recipient}`}
                          address={row.AttestationRequestData.recipient}
                        />
                      ) : (
                        <EthereumAddress
                          address={row.AttestationRequestData.recipient}
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <EthereumAddress
                        address={row.AttestationRequestData.refUID}
                      />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <DecodedData
                        decodedData={row.AttestationRequestData.transformedData}
                        isEncrypted={encrypted}
                      />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center">
                      <TimeCreated createdAt={row.createdAt} />
                    </div>
                  </td>
                  <td className="py-2 border-r border-gray border-b border-gray">
                    <div className="flex items-center justify-center p-2">
                      <button
                        className="bg-black text-white p-1 rounded-md"
                        // disabled={!write}
                        onClick={async () => {
                          //@ts-ignore
                          setSelectedRow(row);
                          write({
                            args: [
                              [
                                row.schemaUID,
                                [
                                  row.AttestationRequestData.recipient,
                                  row.AttestationRequestData.expirationTime,
                                  row.AttestationRequestData.revocable,
                                  row.AttestationRequestData.refUID,
                                  row.AttestationRequestData.attestationData,
                                  row.AttestationRequestData.Base64Data,
                                  row.AttestationRequestData.value,
                                ],
                                [
                                  BigInt(row.signature.v),
                                  row.signature.r,
                                  row.signature.s,
                                ],
                                row.attester,
                                row.deadline,
                              ],
                            ],
                            value: BigInt("0"),
                          });
                        }}
                      >
                        AttestByDelegate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
          <Notification
            isLoading={isLoadingg}
            isSuccess={isSuccesss}
            isError={error ? "Delegated Request Nonce Expired" : undefined}
            wait={wait}
            error={err}
            success={succ ? "Attestation sponsored with success" : undefined}
          />
        </div>
      ) : totalRows == 0 ? (
        <div>No Data</div>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
};

export default SchemaDelegationsTable;
