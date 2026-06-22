import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "::1"],
  async headers() {
    return [
      {
        // Apply baseline browser protections to every app and API response.
        headers: securityHeaders,
        source: "/:path*",
      },
    ];
  },
  experimental: {
    authInterrupts: true,
  },
  images: {
    qualities: [70, 75, 78, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ehzveltsktfusrhtgzqt.supabase.co",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default withNextIntl(nextConfig);
