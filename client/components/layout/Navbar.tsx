import React from "react";
import { Navbar, Button } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { text: "Attestations", href: "/" },
  { text: "Create Schema", href: "/" },
  { text: "Exclusive Content", href: "/" },
  { text: "Docs", href: "/" },
];

const CustomNavbar = () => {
  const router = useRouter();

  const handleLinkClick = (href) => {
    router.push(href);
  };

  return (
    <Navbar color="transparent">
      <div className="bg-gradient-to-r from-black to-blue-gray-900 rounded-lg py-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between">
            {/* Logo */}
            <div className="text-white cursor-pointer ml-3">
              <Image
                src="/boilr3.svg"
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