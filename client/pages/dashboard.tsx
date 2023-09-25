import {
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
} from "@material-tailwind/react";
import { ProfileCard } from "@/components/UserProfile";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading/Loading";
import {
  getAllUserAttestations,
  getAllUserRecievedAttestations,
  getUserCreatedSchemas,
  getUserDataInformation,
  getUserSchemaSubscriptions,
} from "@/lib/tas";
import { useChainId, useAccount } from "wagmi";
import { useRouter } from "next/router";
import AttestationsTable from "@/components/AttestationsTable";
import SchemasTable from "@/components/SchemasTable";
import UserDataTable from "@/components/UserDataTable";

export function DashboardPage({}) {
  const [isDataFetched, setIsDataFetched] = useState(false);
  const chainID = useChainId();
  const router = useRouter();
  const { address } = useAccount();
  const [taken, setTaken] = useState(false);
  const [attestationsTableData, setAttestationsTableData] = useState([]);
  const [subscriptionTableData, setSubscriptionTableData] = useState([]);
  const [attestationsRecievedTableData, setAttestationsRecievedTableData] =
    useState([]);
  const [schemasTableData, setSchemasTableData] = useState([]);
  const [dataInfo, setDataInfo] = useState<any>();
  const [selection, setSelection] = useState("created");
  const [isUser, setIsUser] = useState(false);
  const [userr, setUserr] = useState(false);

  const [tabsValue, setTabsValue] = useState("");
  const handleDataFetch = (isuser: boolean) => {
    setIsDataFetched(true);
    setIsUser(isuser);
  };
  const [data, setData] = useState([
    { label: "Attestations", value: "attestations" },
    { label: "User Schemas", value: "user-schemas" },
    { label: "Subscribed Schemas", value: "subscribed-schemas" },
  ]);

  useEffect(() => {
    async function fetch(user: `0x${string}`) {
      let userr = user as string;
      let allAttestations = await getAllUserAttestations(
        chainID,
        userr.toLowerCase() as `0x${string}`
      );
      let allRecievedAttestations = await getAllUserRecievedAttestations(
        chainID,
        userr.toLowerCase() as `0x${string}`
      );
      let createdSchemas = await getUserCreatedSchemas(chainID, user);

      let subscriptionData = await getUserSchemaSubscriptions(chainID, user);

      let userDataInfo = await getUserDataInformation(user);
      let temp: {
        publicKey: string;
        fileName: string;
        mimeType: string;
        txHash: string;
        status: string;
        createdAt: number;
        fileSizeInBytes: string;
        cid: string;
        id: string;
        lastUpdate: number;
        encryption: boolean;
      }[] = [];
      if (userDataInfo.uploads != temp && isUser) {
        setData([
          { label: "Attestations", value: "attestations" },
          { label: "User Schemas", value: "user-schemas" },
          { label: "Subscribed Schemas", value: "subscribed-schemas" },
          { label: "Lighthouse data usage", value: "user-data" },
        ]);
      }

      setDataInfo(userDataInfo);

      setTaken(!taken);
      // @ts-ignore
      setAttestationsTableData(allAttestations);
      // @ts-ignore
      setAttestationsRecievedTableData(allRecievedAttestations);
      // @ts-ignore
      setSchemasTableData(createdSchemas);
      // @ts-ignore
      setSubscriptionTableData(subscriptionData);
    }

    let user = router.query.address;
    if (isUser) {
      user = address?.toLowerCase();
    }

    if (!taken && chainID && user) {
      // @ts-ignore
      setUserr(user)
      fetch(user as `0x${string}`);
    }
  }, [isUser]);

  return (
    <div>
      <div className="flex flex-col min-h-screen bg-blue-gray-100">
        <Navbar />
        <div className="flex flex-col items-center flex-1 mt-10">
          <ProfileCard onDataFetch={handleDataFetch} />
          {isDataFetched && taken ? (
            <Tabs value="attestations" className="mx-auto mt-10">
              <TabsHeader
                className="bg-transparent"
                indicatorProps={{
                  className: "bg-gray-900/10 shadow-none !text-gray-900",
                }}
              >
                {data.map(({ label, value }) => (
                  <Tab
                    key={value}
                    value={value}
                    onChange={() => setTabsValue(value)}
                  >
                    {label}
                  </Tab>
                ))}
              </TabsHeader>
              <TabsBody>
                <TabPanel value="attestations">
                  {/* Content for Attestations Tab */}
                  <div className="flex flex-wrap items-center">
                    <h2 className="text-lg font-semibold mb-2">
                      {"Attestations : "}
                    </h2>
                    <select
                      value={selection}
                      onChange={(e) => {
                        const newValue =
                          e.target.value === "created" ? "created" : "recieved";
                        setSelection(newValue);
                      }}
                      className="ml-3 mb-2"
                      style={{
                        padding: "10px",
                        border: "2px solid #000",
                        borderRadius: "8px",
                        fontSize: "16px",
                        width: "150px",
                        maxWidth: "100%",
                        backgroundColor: "#fff",
                        color: "#000",
                        cursor: "pointer",
                      }}
                    >
                      <option value="created">created</option>
                      <option value="recieved">recieved</option>
                    </select>
                  </div>
                  <AttestationsTable
                    attestationsTableData={
                      selection == "created"
                        ? attestationsTableData
                        : attestationsRecievedTableData
                    }
                  />
                  <div
                    style={{ height: "500px", backgroundColor: "transparent" }}
                  ></div>
                </TabPanel>
                <TabPanel value="user-schemas">
                  {/* Content for Created Schemas Tab */}
                  <h2 className="text-lg font-semibold mb-2">
                    Created Schemas Content
                  </h2>
                  <SchemasTable
                    schemaTableData={schemasTableData}
                    chainID={chainID}
                    showRevenue={true}
                    showRole={true}
                  />
                  <div
                    style={{ height: "500px", backgroundColor: "transparent" }}
                  ></div>
                </TabPanel>
                <TabPanel value="subscribed-schemas">
                  {/* Content for Created Schemas Tab */}
                  <h2 className="text-lg font-semibold mb-2">
                    subscribed Schemas Content
                  </h2>
                  {/* Add your content here */}
                  <SchemasTable
                    schemaTableData={subscriptionTableData}
                    subscription={true}
                    chainID={chainID}
                  />
                  <div
                    style={{ height: "700px", backgroundColor: "transparent" }}
                  ></div>
                </TabPanel>

                {dataInfo.uploads.length != 0 && isUser && (
                  <TabPanel value="user-data">
                    {/* Content for Created Schemas Tab */}
                    <div className="flex flex-col items-center">
                      {/* Add your content here */}
                      <UserDataTable
                        userDataTableData={dataInfo.uploads}
                        balance={dataInfo.balance}
                      />
                    </div>
                    {!isUser && (
                      <div
                        style={{
                          height: "500px",
                          backgroundColor: "transparent",
                        }}
                      ></div>
                    )}
                  </TabPanel>
                )}
              </TabsBody>
            </Tabs>
          ) : userr? (
            <Loading />
          ):(<div className="text-lg font-semibold bg-white text-black rounded-md p-3">Connect your wallet</div>)}
        </div>
      </div>

      <Footer />
    </div>
  );
}
export default DashboardPage;
