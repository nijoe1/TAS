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
  { text: "Attestations", href: "/attestations" },
  { text: "Schemas", href: "/schemas" },
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
    </div>
  );
};

export default CustomNavbar;
