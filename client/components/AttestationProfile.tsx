import React from "react";
import EthereumAddress from "@/components/EthereumAddress";
import DecodedData from "@/components/DecodedData";
import TimeCreated from "./TimeCreated";
import Field from "@/components/Field";

type AttestationProfileProps = {
  attestationData: {
    attestationUID: string;
    created: string;
    expiration: string;
    revoked: boolean;
    revocable: boolean;
    resolver: string;
    schemaUID: string;
    from: string;
    to: string;
    decodedData: Array<{ type: string; name: string; value: string }>;
    referencedAttestation: string;
    referencingAttestations: number;
  };
};

const AttestationProfile: React.FC<AttestationProfileProps> = ({
  attestationData,
}) => {
  return (
    <div className={`flex-grow mx-auto`}>
      <Field label={"Attestation Details"} value="" />
      <div className="bg-white rounded-xl p-4">
        <div className="flex justify-between">
          {/* Header */}
          <div className="mb-4 mt-3 w-3/4 flex-col flex">
            <Field
              label="ATTESTATIONUID"
              value={
                <EthereumAddress address={attestationData.attestationUID} />
              }
            />
            <Field
              label="SCHEMAUID"
              value={<EthereumAddress address={attestationData.schemaUID} />}
            />
            <Field
              label="FROM"
              value={<EthereumAddress address={attestationData.from} />}
            />
            <Field
              label="TO"
              value={<EthereumAddress address={attestationData.to} />}
            />
          </div>
          <div className="w-1/4  border rounded-xl p-4">
            <Field label="CREATED" value={<TimeCreated createdAt={attestationData.created}/>} />
            <Field label="EXPIRATION" value={attestationData.expiration} />
            <Field
              label="REVOKED"
              value={attestationData.revoked ? "Yes" : "No"}
            />
            <Field
              label="REVOCABLE"
              value={attestationData.revocable ? "Yes" : "No"}
            />
            <Field
              label="Resolver"
              value={<EthereumAddress address={attestationData.resolver} />}
            />
          </div>
        </div>

        <div className="flex justify-between">
          {/* Left Box */}
          <div className="w-3/4 flex flex-col">
            <Field
              label="Referencing Attestations"
              value={attestationData.referencingAttestations.toString()}
            />
            <Field
              label="Referenced Attestation"
              value={attestationData.referencedAttestation}
            />
          </div>

          {/* Right Box */}
          <div className="w-1/4  text-center border rounded-xl p-4">
            <Field
              label="AttestAccess"
              value={"YES"}
            />
            <Field
              label="RevokeAccess"
              value={"YES"}
            />
                        <Field
              label="ViewAccess"
              value={"YES"}
            />
          </div>
        </div>
        <div className="w-full  border rounded-xl p-4">
          <div className="text-xl font-semibold">Decoded Data</div>
          <DecodedData decodedData={attestationData.decodedData} />
        </div>
      </div>
    </div>
  );
};

export default AttestationProfile;
