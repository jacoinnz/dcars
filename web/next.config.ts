import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vercel sets `outputFileTracingRoot` to the monorepo root when the repo includes `web/`.
 * Next.js requires `turbopack.root` and `outputFileTracingRoot` to be identical — set both here.
 * Standalone deploys (only app files at project root) keep root = config dir.
 */
function tracingAndTurbopackRoot(): string {
  if (path.basename(configDir) === "web") {
    return path.resolve(configDir, "..");
  }
  return configDir;
}

const root = tracingAndTurbopackRoot();

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  turbopack: {
    root,
  },
};

export default nextConfig;
