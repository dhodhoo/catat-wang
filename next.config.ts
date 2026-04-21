import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/pdfkit/js/data/**/*",
      "node_modules/pdfkit/js/data/**/*"
    ]
  }
};

export default nextConfig;
