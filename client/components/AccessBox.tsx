import React, { useState, useEffect } from "react";
import { ImEyeBlocked, ImEye, ImUnlocked, ImLock } from "react-icons/im";
import { useChainId, useAccount, useContractRead } from "wagmi";
import { CONTRACTS } from "@/constants/contracts/index";
import { getAttestAccess, getAttestRevokeAccess } from "@/lib/tableland";
import { Router } from "next/router";

type AccessBoxProps = {
  uid: string;
  isSchema: boolean;
  isRevocable: boolean;
  onAccessInfoChange: (accessData: {
    attestAccess: boolean; // Replace with your actual data
    revokeAccess: boolean; // Replace with your actual data
    viewAccess: boolean;
  }) => void;
  resolverContract: string; // Replace 'any' with the actual type of your event data
};

const AccessBox: React.FC<AccessBoxProps> = ({
  uid,
  isSchema,
  isRevocable,
  onAccessInfoChange,
  resolverContract,
}) => {
  const [attestAccess, setAttestAccess] = useState(false);
  const [revokeAccess, setRevokeAccess] = useState(false);
  const [viewAccess, setViewAccess] = useState(false);
  const { address } = useAccount();
  const chainid = useChainId();
  const [fetched, setFetched] = useState(false);

  const { data: hasViewAccess } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.SubscriptionResolver[chainid].contract,
    // @ts-ignore
    abi: CONTRACTS.SubscriptionResolver[chainid].abi,
    functionName: "hasAccess",
    args: [address, uid],
  });

  const { data: hasViewAccess2 } = useContractRead({
    // @ts-ignore
    address: CONTRACTS.ACResolver[chainid].contract,
    // @ts-ignore
    abi: CONTRACTS.ACResolver[chainid].abi,
    functionName: "hasAccess",
    args: [address, uid],
  });

  // Simulated API call to fetch access information
  useEffect(() => {
    const fetch = async () => {
      let accessData = {
        attestAccess: true, // Replace with your actual data
        revokeAccess: false, // Replace with your actual data
        viewAccess: true, // Replace with your actual data
      };
      if (
        resolverContract ==
        // @ts-ignore
        CONTRACTS.SubscriptionResolver[chainid].contract.toLowerCase()
      ) {
        accessData.revokeAccess = false;
        accessData.attestAccess = (await getAttestAccess(
          chainid,
          uid,
          address
        )) as boolean
        accessData.viewAccess = hasViewAccess || accessData.attestAccess?true:false
      } else if (
        resolverContract ==
        // @ts-ignore
        CONTRACTS.ACResolver[chainid].contract.toLowerCase()
      ) {
        let res = await getAttestRevokeAccess(chainid, address, uid);
        console.log(res);
        accessData.revokeAccess = res ? res.revokeAccess && isRevocable : false;
        accessData.attestAccess = res ? res.attestAccess : false;
        accessData.viewAccess = hasViewAccess2 ? true : false;
      } else {
        let res = await getAttestRevokeAccess(chainid, address, uid);
        console.log(res);
        accessData.revokeAccess = isRevocable;
        accessData.attestAccess = true;
        accessData.viewAccess = true;
      }
      onAccessInfoChange(accessData);

      // Update state with fetched data
      setAttestAccess(accessData.attestAccess);
      setRevokeAccess(accessData.revokeAccess);
      setViewAccess(accessData.viewAccess);
      setFetched(!fetched);
    };
    if (chainid && !fetched) {
      fetch();
    }
  }, [chainid, address, Router]);

  return (
    <div className="border rounded-lg mx-auto p-4 flex flex-wrap text-black items-center space-x-4">
      <div className=" mx-auto flex flex-wrap items-center space-x-4">
        {isSchema && (
          <div className="flex items-center">
            <span className="mr-2">Attest Access:</span>
            {attestAccess ? (
              <ImUnlocked className="p-1" size={20} />
            ) : (
              <ImLock className="p-1" size={20} />
            )}
          </div>
        )}

        <div className="flex items-center">
          <span className="mr-2">Revoke Access:</span>
          {revokeAccess ? (
            <ImUnlocked className="p-1" size={20} />
          ) : (
            <ImLock className="p-1" size={20} />
          )}
        </div>

        <div className="flex items-center">
          <span className="mr-2">View Access:</span>
          {viewAccess ? (
            <ImEye className="p-1" size={20} />
          ) : (
            <ImEyeBlocked className="p-1" size={20} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessBox;
