import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships WASM + data files; keep it out of the server bundle so Node resolves it at runtime.
  serverExternalPackages: ["@electric-sql/pglite"],
  // schema.sql is read with fs at boot; make sure it ships with the server output.
  outputFileTracingIncludes: { "/**": ["./src/lib/db/schema.sql"] },
};

export default nextConfig;
