import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading/Loading";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import AttestationProfile from "@/components/AttestationProfile";
import { Router, useRouter } from "next/router";
import { useChainId, useAccount, useContractRead } from "wagmi";
import { getAttestationData } from "@/lib/tas";
import {
  getAttestAccess,
  getAttestRevokeAccess,
  getIsEncrypted,
} from "@/lib/tableland";
import { getEncryptedFilesBlobs } from "@/lib/tas";
import { CONTRACTS } from "@/constants/contracts";

const Attestation = () => {
  const { address } = useAccount();
  const chainID = useChainId();
  const [taken, setTaken] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [attestationData, setAttestationData] = useState();
  const router = useRouter();
  const uid = router?.query?.uid;
  const type = router?.query?.type;
  const [viewAccess, setViewAccess] = useState(false);

  const { data: hasViewAccess } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.SubscriptionResolver[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.SubscriptionResolver[chainID].abi,
    functionName: "hasAccess",
    args: [address, uid],
  });

  const { data: hasViewAccess2 } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.ACResolver[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.ACResolver[chainID].abi,
    functionName: "hasAccess",
    args: [address, uid],
  });
  useEffect(() => {
    async function fetch() {


      // @ts-ignore
      let AttestationData = await getAttestationData(type, chainID, uid);
      let encrypted = (await getIsEncrypted(
        chainID,
        AttestationData.schemaUID
      )) as boolean;

      let accessData = {
        attestAccess: true, // Replace with your actual data
        revokeAccess: false, // Replace with your actual data
        viewAccess: true, // Replace with your actual data
      };
      if (
        AttestationData.resolver ==
        // @ts-ignore
        CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase()
      ) {
        accessData.revokeAccess = false;
        accessData.attestAccess = (await getAttestAccess(
          chainID,
          uid,
          address
        )) as boolean;
        accessData.viewAccess =
          hasViewAccess || accessData.attestAccess ? true : false;
      } else if (
        AttestationData.resolver ==
        // @ts-ignore
        CONTRACTS.ACResolver[chainID].contract.toLowerCase()
      ) {
        accessData.viewAccess = encrypted ? hasViewAccess2 as unknown as boolean : true;
      } else {
        accessData.viewAccess = true;
      }
      setViewAccess(accessData.viewAccess);

      if (
        (encrypted ||
          // @ts-ignore
          CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase() ==
            AttestationData.resolver) &&
        viewAccess
      ) {
        AttestationData.decodedData = await getEncryptedFilesBlobs(
          AttestationData.decodedData,
          address as `0x${string}`
        );
        setIsEncrypted(true);
      } else {
        setIsEncrypted(false);
      }
      // @ts-ignore
      setAttestationData(AttestationData);
      setTaken(!taken);
    }
    if (!taken && uid && chainID) {
      fetch();
    }
  }, [uid, , type, chainID, Router, address]);

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      {taken ? (
        <>
          <div className="flex flex-col items-center">
            <div className="mx-auto">
              <AttestationProfile
                // @ts-ignore
                attestationData={attestationData}
                // @ts-ignore
                type={type}
                isEncrypted={isEncrypted}
                viewAccess={viewAccess}
              />
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
