/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  experimental: { optimizeCss: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pokeapi.co",
      },
    ],
  },
};

module.exports = nextConfig;
