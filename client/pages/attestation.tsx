import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading/Loading";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import AttestationProfile from "@/components/AttestationProfile";
import { useRouter } from "next/router";
import { useChainId } from "wagmi";
import { getAttestationData } from "@/lib/tas"

const Attestation = () => {
  const chainID = useChainId();
  const [taken, setTaken] = useState(false);
  const [attestationData, setAttestationData] = useState();
  const router = useRouter();
  const uid = router?.query?.uid;
  const type = router?.query?.type;

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
      // @ts-ignore
      let AttestationData = await getAttestationData(type, chainID, uid);
      setTaken(!taken);
      // @ts-ignore
      setAttestationData(AttestationData);
    }
    if (!taken && uid && chainID) {
      fetch();
    }
  }, [uid, , type, chainID]);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <div className="flex flex-col items-center">
            <div className="mx-auto">
              {/*  @ts-ignore */}
              <AttestationProfile attestationData={attestationData} type={type} />
            </div>
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

export default Attestation;
