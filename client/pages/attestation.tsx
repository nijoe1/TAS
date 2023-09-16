import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading/Loading";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import Link from "next/link"; // Import Link from Next.js
import AttestationProfile from "@/components/AttestationProfile";
import { useRouter } from "next/router";
import { getAttestation } from "@/lib/tableland";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useChainId } from "wagmi";
import { getOffChainAttestation } from "@/lib/offchain";

const Attestation = () => {
  const chainID = useChainId();

  const [taken, setTaken] = useState(false);
  const [attestationData, setAttestationData] = useState();
  const router = useRouter();
  const uid = router?.query?.uid;
  const type = router?.query?.type;

  function transformDecodedData(inputObject: any) {
    // @ts-ignore
    const transformedArray = [];

    inputObject.forEach((item: any) => {
      const transformedItem = {
        type: item.type,
        name: item.name,
        value: item.value.value,
      };

      transformedArray.push(transformedItem);
    });
    // @ts-ignore
    return transformedArray;
  }

  useEffect(() => {
    async function fetch() {
      let attestation;
      if (type === "ONCHAIN") {
        attestation = await getAttestation(chainID, uid);
        attestation = attestation[0];
      } else {
        attestation = await getOffChainAttestation(chainID, uid as string);
        console.log(attestation)
      }

      const encoder = new SchemaEncoder(attestation.schema);
      const data = transformDecodedData(encoder.decodeData(attestation.data));
      setTaken(!taken);
      setAttestationData({
        // @ts-ignore
        attestationUID: uid,
        created: attestation.creationTimestamp,
        expiration: attestation.expirationTime === "0" ? "Never" : "Somewhere",
        revoked:
          attestation.revoker === "0x0000000000000000000000000000000000000000"
            ? false
            : true,
        revocable: attestation.revocable == "false" ? false : true,
        resolver: attestation.resolver,

        schemaUID: attestation.schemaUID,
        from: attestation.attester,
        to: attestation.recipient,
        decodedData: data,
        referencedAttestation: "No reference",
        referencingAttestation: 0,
      });
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
