import React from "react";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/utils/config";
import { DefaultSeo } from "next-seo";

const SEO = () => {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : SITE_URL;

  return (
    <DefaultSeo
      title={SITE_NAME}
      defaultTitle={SITE_NAME}
      description={SITE_DESCRIPTION}
      defaultOpenGraphImageWidth={1200}
      defaultOpenGraphImageHeight={630}
      openGraph={{
        type: "website",
        siteName: SITE_NAME,
        url: origin,
        images: [
          {
            url: `${origin}/logo.png`,
            alt: `${SITE_NAME} Open Graph Image`,
          },
        ],
      }}
    />
  );
};

export default SEO;
