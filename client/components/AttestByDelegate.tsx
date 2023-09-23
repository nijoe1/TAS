import React, { useState, useEffect } from "react";
import {
  useChainId,
  useAccount,
  useSignTypedData,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { recoverTypedDataAddress, hexToSignature } from "viem";
// @ts-ignore
import { Orbis } from "@orbisclub/orbis-sdk";
import { CONTRACTS } from "@/constants/contracts/index";
import {
  primaryType,
  AttestTypes,
  getAttestDelegateTypedData,
} from "@/lib/offchain";
import crypto from "crypto";
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

const AttestByDelegate = ({
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

  const { config, error: errr } = usePrepareContractWrite({
    // @ts-ignore
    address: CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    abi: CONTRACTS.TAS[chainID].abi,
    functionName: "attestByDelegation",
    args: [
      [
        schema,
        [recipient, 0, revocable, refUID, AttestationData, Base64Data, 0],
        [decodedSig.v, decodedSig.r, decodedSig.s],
        address,
        0,
      ],
    ],
    value: BigInt(0),
  });
  const {
    write,
    data: txdata,
    isError: isErrorr,
    isLoading: isLoadingg,
    isSuccess: isSuccesss,
  } = useContractWrite(config);

  const {
    data: res,
    isError: err,
    isLoading: wait,
    isSuccess: succ,
  } = useWaitForTransaction({
    confirmations: 2,

    hash: txdata?.hash,
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
    if (!done) {
      let tdata: AttestDelegateTypedData = getAttestDelegateTypedData(
        schema,
        recipient,
        revocable,
        refUID,
        AttestationData,
        chainID,
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
    }
    if (decodedSig.v !== BigInt(0)) {
      setTimeout(() => {
        // Code to execute after a 500ms delay
      }, 500);
    }
  }, [
    data,
    schema,
    recipient,
    revocable,
    refUID,
    AttestationData,
    chainID,
    TAS,
    decodedSig,
    success,
    error,
  ]);

  const handleSignAndCreate = async () => {
    // await recover();
    if (decodedSig.v !== BigInt(0)) {
      // @ts-ignore
      write();
    }
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
          } else {
            handleSignAndCreate();
            setDoneAttest(!doneAttest);
          }
        }}
      >
        {!signature ? "sign" : "attest"}
      </button>
      {(success || error) && (
        <Notification
          isLoading={false}
          isSuccess={false}
          isError={false}
          wait={false}
          success={success}
          error={error}
          offchain={true}
        />
      )}
    </div>
  );
};

export default AttestByDelegate;
