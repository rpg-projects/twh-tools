/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh7-rt.googleusercontent.com"], // adiciona o domínio
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
