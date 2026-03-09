import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-d20b5044-3d5c-49ff-8ae4-ac7df359ae8f.space.z.ai",
  ],
};

export default nextConfig;
