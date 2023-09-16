import Image from "next/image";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer"; // Import the Footer component

import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/utils/config";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Animation from "@/components/HeroAnimation/Animation";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  const { address } = useAccount();

  const handleLinkClick = (href: any) => {
    router.push(href);
  };

  const links = [
    {
      title: "Tableland",
      description:
        "Tableland is an open source, permissionless cloud database built on SQLite. Read and write tamperproof data from apps, data pipelines, or EVM smart contracts.",
      href: "https://tableland.xyz/",
    },
    {
      title: "Filecoin",
      description:
        "Filecoin is making the web more secure and efficient with a decentralized data storage marketplace, protocol, and cryptocurrency.",
      href: "https://filecoin.io/",
    },
    {
      title: "Lighthouse",
      description:
        "Store Files Permanently. Perpetual storage powered by decentralized web. Easily store and secure your data.",
      href: "https://www.lighthouse.storage/",
    },
    {
      title: "Lilypad",
      description:
        "Lilypad is building the infrastructure for internet-scale trustless distributed compute networks for #web3 underpinned by the Bacalhau Project.",
      href: `https://docs.lilypadnetwork.org/`,
    },
  ];
  const style = {
    height: 300,
  };
  return (
    <div
      className={`flex flex-col min-h-screen ${inter.className} bg-blue-gray-100`}
    >
      <Navbar />
      <div className="flex flex-row items-center">
        <Animation></Animation>
        <section className="flex-grow dark:bg-gray-800 dark:text-gray-100">
          <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl text-black dark:text-white">
              Welcome to Tableland Attestation Service
            </h1>
            <p className="px-8 mt-6 mb-12 text-lg text-gray-600 dark:text-gray-300">
              TAS, integrated with EAS protocol, elevates Tableland, presenting
              an interoperable and indexable decentralized solution. It enables
              decentralized identity, subscription-based content, expert-revoked
              research results, and more—all accessible and queryable using SQL
              queries. Unlock trust and on-chain potential with
              attestations—simple yet potent building blocks.
            </p>
            <div className="flex flex-wrap justify-center">
              <button
                onClick={() => handleLinkClick("/schemas")}
                className="px-8 py-3 m-2 text-lg font-semibold rounded-full bg-black text-white hover:bg-white hover:text-black transition duration-300"
              >
                Get Started
              </button>
              <button
                onClick={() => handleLinkClick("https://github.com/nijoe1/tas")}
                className="px-8 py-3 m-2 text-lg border rounded-full dark:border-white dark:hover:border-black dark:hover:bg-white dark:text-black hover:bg-black hover:text-white transition duration-300"
              >
                Source Code
              </button>
            </div>
          </div>
        </section>
        <Animation></Animation>
      </div>
      <main className="flex flex-col items-center justify-between p-24">
        <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left mt-24 lg:mt-0">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              rel="noopener noreferrer"
            >
              <h2 className={`mb-3 text-2xl font-semibold`}>
                {link.title}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
              <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
}
