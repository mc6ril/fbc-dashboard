import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/dashboard/stats",
        destination: "/dashboard/analyses",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
