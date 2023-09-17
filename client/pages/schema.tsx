import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading/Loading";
import SchemaProfile from "@/components/SchemaProfile";
import { useRouter } from "next/router";
import TimeCreated from "@/components/TimeCreated"; // Replace with the actual path
import EthereumAddress from "@/components/EthereumAddress";
import { useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import SubscriptionItem from "@/components/SubscriptionItem";
import { useAccount } from "wagmi";
import { getSchemaData, SchemaInfo } from "@/lib/tas";
import { RiLinkUnlinkM } from "react-icons/ri";

interface SchemaData {
  schemaUID: string;
  name: string;
  description: string;
  created: string;
  creator: string;
  resolverContract: string;
  revocable: boolean;
  attestationCount: {
    onchain: number;
    offchain: number;
  };
  decodedSchema: Array<{ type: string; name: string }>; // Adjust the type based on the actual schema structure
  rawSchema: string;
}
const Schema = () => {
  const chainID = useChainId();
  const [taken, setTaken] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [schemaData, setSchemaData] = useState<SchemaData>();
  const [subscriptionResolver, setSubscriptionResolver] = useState();
  const { address } = useAccount();

  const router = useRouter();
  const schemaUID = router?.query?.schemaUID;

  const [accessInfo, setAccessInfo] = useState({
    attestAccess: false,
    revokeAccess: false,
    viewAccess: false,
  });

  // Define a function to update the accessInfo state
  const handleAccessInfoChange = (newAccessInfo: any) => {
    setAccessInfo(newAccessInfo);
    console.log(newAccessInfo);
  };

  useEffect(() => {
    async function fetch() {
      if (schemaUID) {
        let res = await getSchemaData(chainID, schemaUID as `0x${string}`);
        // @ts-ignore
        setTableData(res.tableDt);
        setSchemaData(res.schemaInfo ? res.schemaInfo : SchemaInfo);
        setTaken(!taken);
        setSubscriptionResolver(
          // @ts-ignore
          CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase()
        );
      }
    }
    if (!taken && schemaUID && chainID) {
      fetch();
    }
  }, [schemaUID, chainID, address]);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <div className="flex flex-col items-center">
            <SchemaProfile
              schemaData={schemaData ? schemaData : SchemaInfo}
              onAccessInfoChange={handleAccessInfoChange}
              chainID={chainID}
            ></SchemaProfile>

            {tableData.length > 0 &&
            // @ts-ignore
            CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase() !==
              schemaData?.resolverContract ? (
              <div className="mt-10 mx-[10%]">
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-screen-md table-fixed border-b border-gray">
                    <thead className="bg-black">
                      <tr>
                        <th className=" py-2 text-white border-r border-gray">
                          attestationUID
                        </th>
                        <th className=" py-2 text-white border-r border-gray">
                          From Address
                        </th>
                        <th className=" py-2 text-white border-r border-gray">
                          To Address
                        </th>
                        <th className=" py-2 text-white border-r border-gray">
                          Type
                        </th>
                        <th className=" py-2 text-white">Age</th>
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
                              <EthereumAddress
                                // @ts-ignore
                                link={`/attestation?uid=${row.uid}&type=${row.type}`}
                                // @ts-ignore
                                address={row.uid}
                              />
                            </div>
                          </td>
                          <td className="py-2 border-r border-gray border-b border-gray">
                            <div className="flex items-center justify-center">
                              {/* @ts-ignore */}
                              <EthereumAddress address={row.fromAddress} />
                            </div>
                          </td>
                          <td className="py-2 border-r border-gray border-b border-gray">
                            <div className="flex items-center justify-center">
                              {/* @ts-ignore */}
                              <EthereumAddress address={row.toAddress} />
                            </div>
                          </td>
                          <td className="py-2 border-r border-gray border-b border-gray">
                            <div className="flex flex-wrap items-center justify-center">
                              <RiLinkUnlinkM className="ml-2" />
                              {/* @ts-ignore */}
                              <p className="px-2 py-2">{row.type}</p>
                            </div>
                          </td>
                          <td className="py-2 border-b border-gray">
                            <div className="flex flex-wrap items-center justify-center">
                              <p className="px-2 py-2">
                                {/* @ts-ignore */}
                                {<TimeCreated createdAt={row.age} />}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : accessInfo.viewAccess || accessInfo.attestAccess ? (
              <div className="grid grid-cols-3 gap-2 mx-auto">
                {" "}
                {/* Adjust the grid layout */}
                {tableData.map((item, index) => (
                  <SubscriptionItem
                    key={index}
                    itemData={{
                      // @ts-ignore
                      address: address,
                      // @ts-ignore
                      data: item.data,
                      // @ts-ignore
                      context: item.uid,
                      // @ts-ignore
                      from: item.fromAddress,
                      // @ts-ignore
                      age: item.age,
                      // @ts-ignore
                      type: item.type,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div>No access</div>
            )}
          </div>
        </>
      ) : (
        <Loading />
      )}
      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
};

export default Schema;
