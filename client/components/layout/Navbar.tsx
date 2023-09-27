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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Initial call to set isMobile based on window width
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleLinkClick = (href: string) => {
    router.push(href);
  };
  return (
    <div className={` ${isMobile && " flex flex-col justify-between items-center"}`}>
      <div
        className={`flex ${
          isMobile ? "flex-col gap-2 items-center mx-50" : "flex-row"
        } items-center bg-black py-2 border-b mb-3 mx-1px mt-1px`}
      >
        <div
          className={`flex ${
            !isMobile ? "" : "flex-col"
          } items-center justify-between w-full lg:w-auto`}
        >
          <img
            src="/logo2.jpeg"
            alt="TAS Logo"
            onClick={() => handleLinkClick("/")}
            width={100}
            height={50}
            className="rounded-lg cursor-pointer ml-4"
          />
        </div>
        <div
          className={`flex items-center ${
            !isMobile ? "flex-grow justify-center" : "flex-col "
          }`}
        >
          <div
            className={`flex ${
              !isMobile
                ? "flex-wrap gap-4 ml-14 max-w-screen-xl"
                : "flex-col gap-1 mx-auto items-center ml-3 max-w-screen-xl"
            }`}
          >
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
          {!isMobile && (
            <div className="flex flex-wrap bg-white rounded-md h-8 mt-2 ml-4 lg:mt-0">
              <input
                type="text"
                placeholder="  Search by UID"
                className="rounded-lg bg-white w-32 md:w-48 lg:w-56 mr-2 "
              />
              <TbWorldSearch className="cursor-pointer mt-2 mr-2" />
            </div>
          )}
          {!isMobile && (
            <div className="flex flex-wrap items-center justify-between w-auto  gap-4 ml-4 text-white rounded-md">
              <TfiTwitterAlt />
              <BsGithub />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end lg:w-auto">
          <div className={`${isMobile ? "mx-1" : "mr-4"}`}>
            <ConnectButton
              chainStatus="icon"
              accountStatus="address"
              showBalance={false}
            />
            {isMobile && (
              <div className="flex flex-wrap bg-white rounded-md h-8 mt-2 mx-2 lg:mt-0">
                <input
                  type="text"
                  placeholder="  Search by UID"
                  className="rounded-lg bg-white w-32 md:w-48 lg:w-56 mr-2 "
                />
                <TbWorldSearch className="cursor-pointer mt-2 mr-2" />
              </div>
            )}
          </div>
        </div>
        <StepperForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentAddress={address as `0x${string}`}
          address={address as `0x${string}`}
        />
      </div>
    </div>
  );
};

export default CustomNavbar;
