import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "estatics-nasia.dtibcn.cat" },
      { hostname: "dlalba0s5uicj.cloudfront.net" },
      { hostname: "images.unsplash.com" },
      { hostname: "www.meam.es" },
    ],
  },
};

export default nextConfig;
