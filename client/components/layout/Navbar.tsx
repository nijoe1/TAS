import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import StepperForm from "@/components/StepperForm";

const navLinks = [
  { text: "Attestations", href: "/attestations" },
  { text: "Schemas", href: "/schemas" },
  { text: "Exclusive Content", href: "/" },
  { text: "Docs", href: "/" },
];

const CustomNavbar = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [currentAddress, setCurrentAddress] = useState(address);

  const chainID = useChainId();
  const [currentChainID, setCurrentChainID] = useState(chainID);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [changeChain, setChangeChain] = useState(true);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLinkClick = (href: any) => {
    router.push(href);
  };

  useEffect(() => {
    const check = async () => {
      console.log(chainID);
      if (currentAddress != address && address) {
        localStorage.removeItem("ceramic-session");
        openModal();
        setCurrentAddress(address);
        setChangeChain(false);
      }
      if (
        currentChainID != chainID &&
        chainID &&
        currentChainID &&
        changeChain
      ) {
        setCurrentChainID(chainID);
        window.location.reload();
      }
      setChangeChain(true);
    };
    check();
  }, [address, chainID]);

  return (
    <div>
      <div className="bg-black  py-2 border flex items-center mb-3">
        <div className="w-1/40 flex rounded-xl ml-4">
          <Image
            src="/logo.png"
            alt="BOILR3 Logo"
            width={125}
            height={37}
            className="rounded-lg "
          />
        </div>
        <div className="w-8/10 flex flex-wrap rounded-xl mx-auto gap-2">
          {/* Navigation Links */}
          {navLinks.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button
                onClick={() => handleLinkClick(item.href)}
                size="md"
                className="hover:bg-gray-200 hover:text-black hover:rounded-md w-full mx-1"
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </div>
        <div className="w-7/40 flex rounded-xl mr-4 ">
          <ConnectButton />
        </div>
      </div>
      <StepperForm
        isOpen={isModalOpen}
        onClose={closeModal}
        currentAddress={currentAddress as `0x${string}`}
        address={address as `0x${string}`}
      />
    </div>
  );
};

export default CustomNavbar;
