import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // The portraits route lists public/characters at runtime; make sure the files
  // ship inside the serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/characters": ["./public/characters/**"],
  },
};

export default nextConfig;
