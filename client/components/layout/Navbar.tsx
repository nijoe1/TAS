import React, { useState, useEffect } from "react";
import { Navbar, Button } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Orbis } from "@orbisclub/orbis-sdk";

const orbis = new Orbis();

async function isConnected() {
  const connected = await orbis.isConnected();

  if (connected.status == 200) {
    localStorage.setItem("userdid", connected.did);
  } else {
    await connect();
  }
}

async function connect() {
  const res = await orbis.connect_v2({ chain: "ethereum", lit: false });

  /** Check if the connection is successful or not */
  if (res.status == 200) {
    localStorage.setItem("userdid", res.did);
  } else {
    console.log("Error connecting to Ceramic: ", res);
    alert("Error connecting to Ceramic.");
  }
}

const navLinks = [
  { text: "Attestations", href: "/" },
  { text: "Create Schema", href: "/CreateSchema" },
  { text: "Exclusive Content", href: "/" },
  { text: "Docs", href: "/" },
];

const CustomNavbar = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [currentAddress, setCurrentAddress] = useState(address);

  const handleLinkClick = (href) => {
    router.push(href);
  };

  useEffect(() => {
    const check = async () => {
      if (currentAddress != address && address) {
        localStorage.removeItem("ceramic-session");
        await isConnected();
      }
    };
    check();
  }, [address]);

  return (
    <Navbar color="transparent">
      <div className="bg-gradient-to-r from-black to-blue-gray-900 rounded-lg py-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between">
            {/* Logo */}
            <div className="text-white cursor-pointer ml-3 rounded-full">
              <Image
                className="text-white cursor-pointer ml-3 rounded-lg"
                src="/logo.png"
                alt="BOILR3 Logo"
                width={125}
                height={37}
                priority
              />
            </div>

            {/* Navigation Links */}
            <div className="space-x-4">
              {navLinks.map((item, index) => (
                <Link key={index} href={item.href}>
                  <Button
                    color="black"
                    onClick={() => handleLinkClick(item.href)}
                    className="rounded-full hover:bg-white hover:text-black mx-2"
                  >
                    {item.text}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Connect Button */}
            <div className="mx-3">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default CustomNavbar;
