import Image from "next/image";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer"; // Import the Footer component

import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/utils/config";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useAccount } from "wagmi";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { address } = useAccount();
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : SITE_URL;

  const links = [
    {
      title: "Tableland",
      description:
        "Seamlessly integrate your decentralized application with Next.js, a popular React-based framework.",
      href: "https://nextjs.org",
    },
    {
      title: "Filecoin",
      description: "A powerful and easy-to-use wallet Ethereum-based dApps.",
      href: "https://www.rainbowkit.com",
    },
    {
      title: "Lighthouse",
      description:
        "wagmi is a collection of React Hooks containing everything you need to start working with Ethereum.",
      href: "https://testnet.hypercerts.org/app/gallery-all",
    },
    {
      title: "Lilypad",
      description:
        "Start by exploring some pre-built examples to inspire your creativity!",
      href: `https://co2.storage/assets/bafyreifyxfrvpf4xek2afrp46snz6oho4ydc3m7ykviagrmtla52r3knli`,
    },
  ];
  return (
    <div className={`flex flex-col min-h-screen ${inter.className}`}>
      <Navbar />
      <section className="dark:bg-gray-800 dark:text-gray-100">
        <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-3xl">
          <h1 className="text-4xl font-bold leadi sm:text-5xl">
            Tableland
            <span className="dark:text-violet-400"> Attestation </span>
            Service
          </h1>
          <p className="px-8 mt-8 mb-12 text-lg">
            EAS build using tableland as a better and more decentralized and gas efficient solution. Bridging attestation service on the filecoin network
          </p>
          <div className="flex flex-wrap justify-center">
            <button className="px-8 py-3 m-2 text-lg font-semibold rounded dark:bg-violet-400 dark:text-gray-900">
              Get started
            </button>
            <button className="px-8 py-3 m-2 text-lg border rounded dark:text-gray-50 dark:border-gray-700">
              Source Code
            </button>
          </div>
        </div>
      </section>
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
        {/* Add ClaimTokensComponent if needed */}
      </main>
      {/* <ClaimTokensComponent></ClaimTokensComponent> */}
      <div className="flex-grow"></div> {/* Empty block to push the footer */}
      <Footer /> {/* Add the Footer component here */}
    </div>
  );
}
