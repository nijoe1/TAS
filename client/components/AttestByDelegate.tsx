import React, { useState, useEffect } from "react";
import {
  useChainId,
  useAccount,
  useSignTypedData,
  useContractRead,
} from "wagmi";
import { hexToSignature } from "viem";
// @ts-ignore
import { Orbis } from "@orbisclub/orbis-sdk";
import { CONTRACTS } from "@/constants/contracts/index";
import {
  primaryType,
  AttestTypes,
  getAttestDelegateTypedData,
} from "@/lib/offchain";
import Notification from "./Notification";
interface Signature {
  v: BigInt;
  r: `0x${string}`;
  s: `0x${string}`;
}

interface AttestDelegateTypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  message: {
    schema: `0x${string}`;
    recipient: `0x${string}`;
    expirationTime: number; // Change to number
    revocable: boolean;
    refUID: `0x${string}`;
    data: `0x${string}`;
    value: string; // ETH amount as a string
    nonce: string; // The nonce value
    deadline: string; // The deadline value
  };
  primaryType: string;
  types: any; // Replace with the actual types
}

interface SignProps {
  version: string;
  schema: `0x${string}`;
  recipient: `0x${string}`;
  expirationTime: number;
  revocable: boolean;
  refUID: `0x${string}`;
  AttestationData: `0x${string}`;
  Base64Data: string;
}

const orbis = new Orbis();

const AttestByDelegateRequest = ({
  schema,
  recipient,
  revocable,
  refUID,
  AttestationData,
  Base64Data,
}: SignProps) => {
  const chainID = useChainId();
  const { address } = useAccount();
  const [signature, setSignature] = useState<`0x${string}`>();
  const [done, setDone] = useState(false);
  const [doneAttest, setDoneAttest] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [decodedSig, setDecodedSig] = useState<Signature>({
    v: BigInt(0),
    r: "0x",
    s: "0x",
  });

  const [typedData, setTypedData] = useState<AttestDelegateTypedData | null>(
    null
  );


  const { data: userNonce } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "getNonce",
    args: [address],
    // watch: true,
  });

  // @ts-ignore
  const { data: currentTimestamp } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "getTime",
  });

  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;

  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      // @ts-ignore
      domain: typedData?.domain,
      // @ts-ignore
      message: typedData?.message,
      // @ts-ignore
      primaryType: primaryType,
      // @ts-ignore
      types: AttestTypes,
    });

  useEffect(() => {
    const createPost = async (v: BigInt, r: string, s: string) => {
      let content = createDelegatedRequestPostContent(
        v,
        r,
        s,
        userNonce as unknown as number
      );
      const post = {
        title: `Delegated Attestation Request for schemaUID: ${schema}`,
        body: `Off chain delegated request for TAS protocol`,
        data: content,
        mentions: [],
        tags: [
          {
            slug: `DelegatedAttestationRequest/${schema}`,
            title: address,
          },
          {
            slug: `DelegatedAttestationRequest/${address}/${userNonce}`,
            title: address,
          },
          {
            slug: `delegator/${address?.toLowerCase()}/${TAS}`,
            title: "attester",
          },
          {
            slug: `DelegateRecipient/${address?.toLowerCase()}/${TAS}`,
            title: "recipient",
          },
        ],
        context: `DelegatedAttestationRequest/${schema}`,
        // Other properties based on your requirements
      };
      await orbis.isConnected();
      const res = await orbis.createPost(post);
      console.log(res);
      if (res.status == 200) {
        setSuccess(true);
      } else {
        setError(true);
      }
    };
    if (!done && userNonce) {
      let tdata: AttestDelegateTypedData = getAttestDelegateTypedData(
        schema,
        recipient,
        revocable,
        refUID,
        AttestationData,
        chainID,
        userNonce,
        TAS
      );
      setTypedData(tdata);
      setDone(!done);
    }
    if (data && !doneAttest) {
      setSignature(data);
      const res = hexToSignature(data as `0x${string}`);
      console.log(res, data);
      setDecodedSig({ v: res.v, r: res.r, s: res.s });
      createPost(res.v, res.r, res.s);
      setDoneAttest(!doneAttest);
      setDecodedSig({
        v: BigInt(0),
        r: "0x",
        s: "0x",
      });
      setSuccess(!success);
    }
  }, [data, decodedSig, success, error, userNonce]);

  const createDelegatedRequestPostContent = (
    v: BigInt,
    r: string,
    s: string,
    nonce: number
  ) => {
    const postContent = {
      schemaUID: schema,
      AttestationRequestData: {
        recipient: recipient,
        expirationTime: 0,
        revocable: revocable,
        refUID: refUID,
        AttestationData: AttestationData,
        Base64Data: Base64Data,
        value: 0,
      },
      signature: {
        v: v,
        r: r as `0x${string}`,
        s: s as `0x${string}`,
      },
      attester: address,
      deadline: 0,
      createdAt: currentTimestamp,
      nonce: nonce,
    };

    return postContent;
  };

  return (
    <div>
      <button
        disabled={success}
        className={`bg-black text-white rounded-md px-6 py-2 ${
          !success && "hover:bg-white hover:text-black"
        } border border-black`}
        onClick={async (e) => {
          e.preventDefault(); // Prevent default behavior
          if (!signature) {
            signTypedData();
          }
        }}
      >
        CreateDelegationRequest
      </button>
      {(success || error) && (
        <Notification
          isLoading={false}
          isSuccess={false}
          isError={undefined}
          wait={false}
          success={success?"Your delegation request submitted with success":undefined}
          error={error}
          offchain={true}
        />
      )}
    </div>
  );
};

export default AttestByDelegateRequest;
