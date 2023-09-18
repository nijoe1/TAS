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
  getUserSchemasRevenue,
  getUserSchemaSubscriptions,
} from "@/lib/tas";
import { useChainId, useAccount } from "wagmi";
import { useRouter } from "next/router";
import AttestationsTable from "@/components/AttestationsTable";
import SchemasTable from "@/components/SchemasTable";

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
  const [revenueData, setRevenueData] = useState([]);
  const [schemasTableData, setSchemasTableData] = useState([]);
  const [selection, setSelection] = useState("created");

  const handleDataFetch = () => {
    setIsDataFetched(true);
  };
  // Sample data for the Tabs
  const data = [
    { label: "Attestations", value: "attestations" },
    { label: "Total Revenue", value: "total-revenue" },
    { label: "Created Schemas", value: "created-schemas" },
    { label: "Subscribed Schemas", value: "subscribed-schemas" },
  ];

  useEffect(() => {
    async function fetch(user: `0x${string}`) {
      let allAttestations = await getAllUserAttestations(chainID, user);
      let allRecievedAttestations = await getAllUserRecievedAttestations(
        chainID,
        user
      );
      let createdSchemas = await getUserCreatedSchemas(chainID, user);

      let revenue = await getUserSchemasRevenue(chainID, user);

      let subscriptionData = await getUserSchemaSubscriptions(chainID, user);

      setTaken(!taken);
      // @ts-ignore
      setAttestationsTableData(allAttestations);
      // @ts-ignore
      setAttestationsRecievedTableData(allRecievedAttestations);
      // @ts-ignore
      setSchemasTableData(createdSchemas);
      // @ts-ignore
      setRevenueData(revenue);
      // @ts-ignore
      setSubscriptionTableData(subscriptionData);
    }
    let user = router.query.address;
    if (!user) {
      user = address;
    }

    if (!taken && chainID && user) {
      fetch(user as `0x${string}`);
    }
  }, [chainID, selection]);

  return (
    <div
      className={`flex flex-col min-h-screen bg-blue-gray-100 w-full rounded-lg`}
    >
      <Navbar />

      <div className="flex flex-col items-center mt-10">
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
                <Tab key={value} value={value}>
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
              </TabPanel>
              <TabPanel value="total-revenue">
                {/* Content for Total Revenue Tab */}
                <h2 className="text-lg font-semibold mb-2">
                  Total Revenue Content
                </h2>
                {/* Add your content here */}
                <SchemasTable
                  schemaTableData={revenueData}
                  showRevenue={true}
                  chainID={chainID}
                />
              </TabPanel>
              <TabPanel value="created-schemas">
                {/* Content for Created Schemas Tab */}
                <h2 className="text-lg font-semibold mb-2">
                  Created Schemas Content
                </h2>
                <SchemasTable
                  schemaTableData={schemasTableData}
                  chainID={chainID}
                />
                {/* Add your content here */}
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
              </TabPanel>
            </TabsBody>
          </Tabs>
        ) : (
          <Loading />
        )}
      </div>
      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
export default DashboardPage;
