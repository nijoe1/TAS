import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import StepperForm from "@/components/StepperForm";
import { useConnect } from "wagmi";

const navLinks = [
  { text: "Attestations", href: "/attestations" },
  { text: "Schemas", href: "/schemas" },
  { text: "Dashboard", href: "/dashboard" },
];

const CustomNavbar = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [currentAddress, setCurrentAddress] = useState(address);

  const chainID = useChainId();
  const [currentChainID, setCurrentChainID] = useState(chainID);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [changeChain, setChangeChain] = useState(true);

  const [divCount, setDivCount] = useState(3); // Number of black divs to render

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;

      if (windowWidth >= 1350) {
        setDivCount(4); // Display 2 divs
      } else if (windowWidth >= 1180 && windowWidth <= 1349) {
        setDivCount(3); // Display 1 div
      } else if (windowWidth >= 800 && windowWidth <= 749) {
        setDivCount(2); // Display 1 div
      } else {
        setDivCount(1); // Display 1 div
      }
    };

    // Initial check
    handleResize();

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  let blackDivs;
  if (divCount === 4) {
    blackDivs = (
      <>
        {!address ? (
          <></>
        ) : (
          <>
            <div className="w-7/40 ml-8" style={{ height: "50%" }}>
              <div className="w-20 h-2 bg-black mx-auto rounded-full"></div>
            </div>

            <div className="w-4/40 ml-8" style={{ height: "50%" }}>
              <div className="w-20 h-2 bg-black  mx-auto rounded-full"></div>
            </div>

            <div className="w-5/40 ml-8" style={{ height: "50%" }}>
              <div className="w-19 h-2 bg-black mx-auto rounded-full"></div>
            </div>
            <div className="w-7/40 ml-8" style={{ height: "50%" }}>
              <div className="w-15 h-2 bg-black mx-auto rounded-full"></div>
            </div>
            <div className="w-1/40 ml-8" style={{ height: "50%" }}>
              <div className="w-9 h-2 bg-black mx-auto rounded-full"></div>
            </div>
          </>
        )}
      </>
    );
  } else if (divCount === 3) {
    blackDivs = (
      <div>
        <div className="w-full ml-8 flex flex-wrap items-center">
          <div className="w-1/3" style={{ height: "33.33%" }}>
            <div className="w-20 h-2 bg-black  mx-auto rounded-full"></div>
          </div>

          <div className="w-1/3" style={{ height: "33.33%" }}>
            <div className="w-20 h-2 bg-black  mx-auto rounded-full"></div>
          </div>
        </div>

        <div className="w-1/3 ml-8" style={{ height: "33.33%" }}>
          <div className="w-20 h-2 bg-black mx-auto rounded-full"></div>
        </div>
      </div>
    );
  } else if (divCount === 2) {
    blackDivs = (
      <div>
        <div className="w-full flex flex-col items-center">
          <div className="w-1/3" style={{ height: "33.33%" }}>
            <div className="w-20 h-2 bg-black  mx-auto rounded-full"></div>
          </div>

          <div className="w-1/3" style={{ height: "33.33%" }}>
            <div className="w-20 h-2 bg-black  mx-auto rounded-full"></div>
          </div>
          <div className="w-1/3" style={{ height: "33.33%" }}>
            <div className="w-20 h-2 bg-black mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    );
  } else if (divCount === 1) {
    // No black divs
    blackDivs = null;
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLinkClick = (href: any) => {
    router.push(href);
  };
  const connect = useConnect({
    onSuccess(data) {
      console.log("Connect", data);
    },
  });

  useEffect(() => {
    if (!address) {
      connect;
    }
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
        window.location.href = "/";
      }
      setChangeChain(true);
    };
    check();
  }, [address, chainID]);

  return (
    <div className="">
      <div
        className={`bg-black py-2 border w-full  flex ${
          divCount == 1 ? "flex-col gap-2 w-full " : ""
        } items-center  mb-3`}
      >
        <div className="w-4/40 flex rounded-xl ml-4 z-50">
          <Image
            src="/logo.png"
            alt="TAS Logo"
            onClick={() => handleLinkClick("/")}
            width={125}
            height={37}
            className="rounded-lg cursor-pointer"
          />
        </div>
        {blackDivs}

        <div className="w-13/40 flex flex-wrap rounded-xl mx-auto gap-4">
          {/* Navigation Links */}
          {navLinks.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button
                onClick={() => handleLinkClick(item.href)}
                size="lg"
                color="white"
                className="hover:bg-gray-200 text-lg p-1 hover:text-black hover:rounded-md w-full mx-1"
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </div>
        <div className="w-7/40 flex rounded-xl mr-4">
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
