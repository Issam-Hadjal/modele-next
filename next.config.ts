import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AGENTS.md says how to work here: next dev must not write its own block into it.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
