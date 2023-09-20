import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading/Loading";
import SchemaProfile from "@/components/SchemaProfile";
import { useRouter } from "next/router";
import { useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import SubscriptionItem from "@/components/SubscriptionItem";
import { useAccount } from "wagmi";
import { getSchemaData, SchemaInfo } from "@/lib/tas";
import AttestationsTable from "@/components/AttestationsTable";
import { getIsEncrypted } from "@/lib/tableland";

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
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false)
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

        setIsEncrypted(await getIsEncrypted(chainID, schemaUID) as boolean)
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
              isEncrypted={schemaData?.resolverContract ==
                // @ts-ignore
                CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase()
                  ? true
                  : isEncrypted}
            ></SchemaProfile>

            {tableData.length > 0 &&
            // @ts-ignore
            CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase() !==
              schemaData?.resolverContract ? (
              <AttestationsTable attestationsTableData={tableData} notSchemaUID={true}/>
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
