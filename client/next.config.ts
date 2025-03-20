import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // will remove this 2 later during official deployment
  eslint: {
    ignoreDuringBuilds: true, // skip eslint checks during builds
  },
  typescript: {
    ignoreBuildErrors: true, // skip TypeScript type checking during builds
  },

};

export default nextConfig;
