import type { NextConfig } from "next";

/**
 * Optional same-origin API proxy for production cookie issues.
 * Set API_PROXY_TARGET=https://api.kasina.et and leave NEXT_PUBLIC_API_URL
 * empty (or same as NEXT_PUBLIC_APP_URL) so the browser only talks to kasina.et.
 */
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: "/me",
        destination: `${apiProxyTarget}/me`,
      },
      {
        source: "/health",
        destination: `${apiProxyTarget}/health`,
      },
      {
        source: "/classes/:path*",
        destination: `${apiProxyTarget}/classes/:path*`,
      },
      {
        source: "/assignments/:path*",
        destination: `${apiProxyTarget}/assignments/:path*`,
      },
      {
        source: "/sessions/:path*",
        destination: `${apiProxyTarget}/sessions/:path*`,
      },
      {
        source: "/progress/:path*",
        destination: `${apiProxyTarget}/progress/:path*`,
      },
      {
        source: "/progress",
        destination: `${apiProxyTarget}/progress`,
      },
      {
        source: "/subjects/:path*",
        destination: `${apiProxyTarget}/subjects/:path*`,
      },
      {
        source: "/questions",
        destination: `${apiProxyTarget}/questions`,
      },
      {
        source: "/textbooks/:path*",
        destination: `${apiProxyTarget}/textbooks/:path*`,
      },
      {
        source: "/melak/chat",
        destination: `${apiProxyTarget}/melak/chat`,
      },
      {
        source: "/melak/history",
        destination: `${apiProxyTarget}/melak/history`,
      },
      {
        source: "/melak/context/:path*",
        destination: `${apiProxyTarget}/melak/context/:path*`,
      },
      {
        source: "/teacher/signup",
        destination: `${apiProxyTarget}/teacher/signup`,
      },
    ];
  },
};

export default nextConfig;
