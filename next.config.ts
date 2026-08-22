import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow real phone testing on local network (open http://192.168.31.195:3000 on your phone)
  allowedDevOrigins: ['192.168.31.195'],
};

export default nextConfig;

