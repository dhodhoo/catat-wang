import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  outputFileTracingIncludes: {
    "/*": ["./node_modules/pdfkit/js/data/**/*"]
  }
};

export default nextConfig;
