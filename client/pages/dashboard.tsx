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
import { useState } from "react";
import Loading from "@/components/Loading/Loading";

export function DashboardPage({}) {
  const [isDataFetched, setIsDataFetched] = useState(false);

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

  return (
    <div
      className={`flex flex-col min-h-screen bg-blue-gray-100 w-full rounded-lg`}
    >
      <Navbar />

      <div className="flex flex-col items-center mt-10">
        <ProfileCard onDataFetch={handleDataFetch} />
        {isDataFetched ? (
          <Tabs value="attestations" className="max-w-[40rem] mt-10">
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
                <h2 className="text-lg font-semibold mb-2">
                  Attestations Content
                </h2>
                {/* Add your content here */}
              </TabPanel>
              <TabPanel value="total-revenue">
                {/* Content for Total Revenue Tab */}
                <h2 className="text-lg font-semibold mb-2">
                  Total Revenue Content
                </h2>
                {/* Add your content here */}
              </TabPanel>
              <TabPanel value="created-schemas">
                {/* Content for Created Schemas Tab */}
                <h2 className="text-lg font-semibold mb-2">
                  Created Schemas Content
                </h2>
                {/* Add your content here */}
              </TabPanel>
              <TabPanel value="subscribed-schemas">
                {/* Content for Created Schemas Tab */}
                <h2 className="text-lg font-semibold mb-2">
                subscribed Schemas Content
                </h2>
                {/* Add your content here */}
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
