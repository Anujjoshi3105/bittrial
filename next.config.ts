import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sabmmpbbnjnqauqkqaaq.supabase.co",
        pathname: "/storage/**",
        port: "",
      },
    ],
  },
};

export default nextConfig;
