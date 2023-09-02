import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/router";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/utils/config";
const origin =
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : SITE_URL;
const Navbar = () => {
  const router = useRouter();

  const handleLinkClick = (href: any) => {
    router.push(href);
  };

  return (
    <nav className="w-full border-b border-gray-800 bg-zinc-800/30 backdrop-blur-2xl bg-gradient-to-b from-zinc-200 dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:dark:bg-zinc-800/30 mt-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center py-6 px-12 xl:px-0">
          <div className="lg:flex-initial">
            <button onClick={() => handleLinkClick("/")}>
              <Image
                className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                src="/boilr3.svg"
                alt="BOILR3 Logo"
                width={125}
                height={37}
                priority
              />
            </button>
          </div>
          <div className="lg:flex lg:items-center space-x-4">
            <button
              onClick={() => handleLinkClick("/")}
              className="text-black font-bold hover:text-gray-700 hover:bg-white hover:rounded-md py-2 px-6 transition-colors"
            >
              Attestations
            </button>
            <button
              onClick={() => handleLinkClick("/")}
              className="text-black font-bold hover:text-gray-700 hover:bg-white hover:rounded-md py-2 px-6 transition-colors"
            >
              Create Schema
            </button>
            <button
              onClick={() => handleLinkClick("/")}
              className="text-black font-bold hover:text-gray-700 hover:bg-white hover:rounded-md py-2 px-6 transition-colors"
            >
              Exclusive Content
            </button>
          </div>
          <div className="bottom-0 left-0 lg:flex lg:items-end lg:justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black static h-auto w-auto lg:bg-none my-6 lg:my-0">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
