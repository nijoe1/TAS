import type { AppProps } from "next/app";
import Web3Provider from "@/providers/Web3";
import { SEO } from "@/components/layout";

import "@/styles/globals.css";
/** Import Orbis SDK */
// @ts-ignore
import {Orbis} from "@orbisclub/orbis-sdk";

const  orbis = new Orbis();
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <SEO />
      <Component {...pageProps} />
    </Web3Provider>
  );
}
