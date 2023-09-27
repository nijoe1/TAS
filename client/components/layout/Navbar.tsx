import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import StepperForm from "@/components/StepperForm";
import { useConnect } from "wagmi";
import { BsGithub } from "react-icons/bs";
import { TfiTwitterAlt } from "react-icons/tfi";
import { TbWorldSearch } from "react-icons/tb";

const navLinks = [
  { text: "Attestations", href: "/attestations" },
  { text: "Schemas", href: "/schemas" },
  { text: "Dashboard", href: "/dashboard" },
];

const CustomNavbar = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleLinkClick = (href: string) => {
    router.push(href);
  };
  return (
    <div className="flex justify-between items-center bg-black py-2 border-b mb-3">
      <div className="flex items-center">
        <img
          src="/logo2.jpeg"
          alt="TAS Logo"
          onClick={() => handleLinkClick("/")}
          width={100}
          height={50}
          className="rounded-lg cursor-pointer ml-4"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-4 mr">
          {/* Navigation Links */}
          {navLinks.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button
                onClick={() => handleLinkClick(item.href)}
                size="lg"
                color="white"
                className="hover:bg-gray-200 text-lg p-1 hover:text-black hover:rounded-md mx-1"
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search"
          className="p-2 rounded-lg bg-white w-42"
        />
        <TbWorldSearch className="text-white mx-2 cursor-pointer" />
        <ConnectButton />
      </div>
      <StepperForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentAddress={address as `0x${string}`}
        address={address as `0x${string}`}
      />
    </div>
    // <BsGithub className="text-white mx-2" />
    //
  );
};

export default CustomNavbar;
