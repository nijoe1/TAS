import React, { useState, useEffect } from "react";
import {
  useChainId,
  useAccount,
  useSignTypedData,
  useContractRead,
} from "wagmi";
import { recoverTypedDataAddress, hexToSignature } from "viem";
// @ts-ignore
import { Orbis } from "@orbisclub/orbis-sdk";
import { CONTRACTS } from "@/constants/contracts/index";
import { getTypedData, primaryType, types, getPostData } from "@/lib/offchain";
import crypto from "crypto";
interface Signature {
  v: BigInt;
  r: `0x${string}`;
  s: `0x${string}`;
}

interface TypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  message: {
    version: number;
    schema: `0x${string}`;
    recipient: `0x${string}`;
    time: number;
    expirationTime: number; // Change to number
    revocable: boolean;
    refUID: `0x${string}`;
    data: `0x${string}`;
  };
  primaryType: string;
  types: any; // Replace with the actual types
}

interface SignProps {
  version: string;
  schema: `0x${string}`;
  recipient: `0x${string}`;
  time: number;
  expirationTime: number;
  revocable: boolean;
  refUID: `0x${string}`;
  AttestationData: `0x${string}`;
}

const orbis = new Orbis();

const AttestOffChain = ({
  schema,
  recipient,
  time,
  revocable,
  refUID,
  AttestationData,
}: SignProps) => {
  const chainID = useChainId();
  const { address } = useAccount();
  const [signature, setSignature] = useState<`0x${string}`>();
  const [done, setDone] = useState(false);
  const [decodedSig, setDecodedSig] = useState<Signature>({
    v: BigInt(0),
    r: "0x",
    s: "0x",
  });

  const [typedData, setTypedData] = useState<TypedData | null>(null);
  // @ts-ignore
  const { data: currentTimestamp } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "getTime",
  });

  function randomUint32() {
    const uuid = crypto.randomBytes(16).toString("hex");

    const M = parseInt(uuid[14], 16);
    const N = parseInt(uuid[19], 16);
    const uint32Value = (M << 4) | N;
    return uint32Value;
  }

  const { data: uid } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "_getUID",
    args: [
      [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        schema,
        currentTimestamp,
        0,
        0,
        refUID,
        recipient,
        address,
        revocable,
        AttestationData,
      ],
      randomUint32(),
    ],
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
      types: types,
    });

  const createPostContent = () => {
    const postContent = getPostData(
      schema,
      recipient,
      revocable,
      refUID,
      AttestationData,
      decodedSig.v,
      decodedSig.r,
      decodedSig.s,
      // @ts-ignore
      uid,
      TAS,
      chainID,
      currentTimestamp?.toString() || "",
      address
    );

    return postContent;
  };

  useEffect(() => {
    if (!done) {
      let tdata: TypedData = getTypedData(
        schema,
        recipient,
        revocable,
        refUID,
        AttestationData,
        Number(currentTimestamp ? currentTimestamp : time),
        chainID,
        TAS
      );
      setTypedData(tdata);
      setDone(!done);
    }
    if (data) {
      setSignature(data);
      const res = hexToSignature(data as `0x${string}`);
      console.log("Hex to Signature Result:", res);
      setDecodedSig({ v: res.v, r: res.r, s: res.s });
    }
    if (decodedSig.v !== BigInt(0)) {
      setTimeout(() => {
        // Code to execute after a 500ms delay
        console.log("Half a second has passed.");
      }, 500);
    }
  }, [
    data,
    schema,
    recipient,
    revocable,
    refUID,
    AttestationData,
    time,
    currentTimestamp,
    chainID,
    TAS,
    decodedSig,
  ]);

  const recover = async () => {
    const res = hexToSignature(signature as `0x${string}`);
    console.log("Hex to Signature Result:", res);
    setDecodedSig({ v: res.v, r: res.r, s: res.s });
  };

  const createPost = async () => {
    let content = createPostContent();
    const post = {
      body: JSON.stringify(content),
      mentions: [],
      tags: [
        {
          slug: "attester",
          title: address,
        },
        {
          slug: "schemaUID",
          title: schema,
        },
        {
          slug: "refUID",
          title: refUID,
        },
        {
          slug: "time",
          title: currentTimestamp?.toString(),
        },
        {
          slug: "uid",
          title: uid?.toString(),
        },
      ],
      context: `off-chain-attestation-${TAS}`,
      // Other properties based on your requirements
    };
    await orbis.isConnected();
    const res = await orbis.createPost(post);
    console.log(res);
    if (res.status == 200) {
      alert("done");
    } else {
      alert("error");
    }
  };

  const handleSignAndCreate = async () => {
    // await recover();
    if (decodedSig.v !== BigInt(0)) {
      await createPost();
    }
  };

  return (
    <div>
      <button
        className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
        onClick={async (e) => {
          e.preventDefault(); // Prevent default behavior
          if (!signature) {
            signTypedData();
          } else {
            handleSignAndCreate();
          }
        }}
      >
        {!signature ? "sign" : "attest"}
      </button>
    </div>
  );
};

export default AttestOffChain;
