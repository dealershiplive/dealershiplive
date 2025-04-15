import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Remove the experimental section with appDir
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
