import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading/Loading";
import SchemaProfile from "@/components/SchemaProfile";
import { useRouter } from "next/router";
import { useChainId } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { useAccount } from "wagmi";
import { getSchemaData, SchemaInfo } from "@/lib/tas";
import AttestationsTable from "@/components/AttestationsTable";
import { getIsEncrypted } from "@/lib/tableland";
import { Card } from "@material-tailwind/react";

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
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
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
        let resp = (await getIsEncrypted(chainID, schemaUID)) as boolean;
        resp =
          schemaData?.resolverContract ==
          // @ts-ignore
          CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase()
            ? true
            : resp;
        console.log(resp, "  : in shema");

        setIsEncrypted(resp);
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
                isEncrypted={
                  schemaData?.resolverContract ==
                  // @ts-ignore
                  CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase()
                    ? true
                    : isEncrypted
                }
              ></SchemaProfile>

            {(tableData.length > 0 &&
              // @ts-ignore
              accessInfo.viewAccess) ||
            accessInfo.attestAccess ? (
              <AttestationsTable
                attestationsTableData={tableData}
                notSchemaUID={true}
              />
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
