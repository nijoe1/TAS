import {
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
  Typography,
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
import Notification from "@/components/Notification";

export function DashboardPage({}) {
  const [isDataFetched, setIsDataFetched] = useState(false);
  const chainID = useChainId();
  const router = useRouter();
  const { address } = useAccount();
  const [taken, setTaken] = useState(false);
  const [attestationsTableData, setAttestationsTableData] = useState([]);
  const [subscriptionTableData, setSubscriptionTableData] = useState([]);
  const [subscriptions, setSubscriptions] = useState(false);
  const [attestationsRecievedTableData, setAttestationsRecievedTableData] =
    useState([]);
  const [schemasTableData, setSchemasTableData] = useState([]);
  const [dataInfo, setDataInfo] = useState<any>();
  const [selection, setSelection] = useState("created");
  const [isUser, setIsUser] = useState(false);
  const [userr, setUserr] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [success, setSuccess] = useState(false);
  const [noUser, setNoUser] = useState(false);
  const [tabsValue, setTabsValue] = useState("");
  const handleDataFetch = (isuser: boolean, connected: boolean) => {
    setIsDataFetched(true);
    setIsUser(isuser);
    setIsConnected(connected);
  };
  const handleUpdate = (success: boolean) => {
    setSuccess(success);
  };
  const [data, setData] = useState([
    { label: "Attestations", value: "attestations" },
    { label: "User Schemas", value: "user-schemas" },
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
      let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);

      let userDataInfo = await getUserDataInformation(user, key as string);
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
          { label: "Uploaded data", value: "user-data" },
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
      setUserr(user);
      fetch(user as `0x${string}`);
    }
    if (!user && chainID) {
      setNoUser(!noUser);
    }
  }, [isUser, selection]);
  useEffect(() => {}, [success]);
  return (
    <div>
      <div className="flex flex-col min-h-screen bg-blue-gray-100">
        <Navbar />
        <div className="flex flex-col items-center flex-1 mt-10">
          <ProfileCard onDataFetch={handleDataFetch} onUpdate={handleUpdate} />
          <Notification
            isLoading={false}
            isSuccess={false}
            isError={undefined}
            wait={false}
            error={false}
            success={
              success ? "Profile details updated successfully" : undefined
            }
          />
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
                    style={{ height: "2000px", backgroundColor: "transparent" }}
                  ></div>
                </TabPanel>
                <TabPanel value="user-schemas">
                  <div className="flex  justify-center items-center gap-2 mt-2 p-3">
                    <input
                      type="checkbox"
                      checked={subscriptions}
                      onChange={() => setSubscriptions(!subscriptions)}
                      className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer "
                    />
                    <Typography
                      className="cursor-pointer focus:ring-blue-500 focus:ring-2"
                      color="black"
                      onClick={() => setSubscriptions(!subscriptions)}
                    >
                      view subscriptions
                    </Typography>
                  </div>
                  {!subscriptions ? (
                    <SchemasTable
                      schemaTableData={schemasTableData}
                      chainID={chainID}
                      showRevenue={true}
                      showRole={true}
                    />
                  ) : (
                    <SchemasTable
                      schemaTableData={subscriptionTableData}
                      subscription={true}
                      chainID={chainID}
                    />
                  )}
                  <div
                    style={{ height: "2000px", backgroundColor: "transparent" }}
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
                    <div
                      style={{
                        height: "1000px",
                        backgroundColor: "transparent",
                      }}
                    ></div>
                  </TabPanel>
                )}
              </TabsBody>
            </Tabs>
          ) : isConnected ? (
            <Loading />
          ) : (
            <div className="text-center">
              <p>Connect Your Wallet</p>
              <p>to view dashboard</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
export default DashboardPage;
