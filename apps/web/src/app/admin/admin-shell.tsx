"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandAtmosphere } from "@/components/brand-chrome";
import { KasinaLogo } from "@/components/kasina-logo";
import { ContentSkeleton } from "@/components/ui";
import { isUnauthorized, useMe, useSignOut } from "@/lib/session";

const DEFAULT_BASE = "/medin";

function navLinks(basePath: string) {
  return [
    { href: basePath, label: "Overview", exact: true },
    { href: `${basePath}/signups`, label: "Signups" },
    { href: `${basePath}/otp`, label: "OTP queue" },
    { href: `${basePath}/audit`, label: "Audit" },
  ];
}

export function AdminShell({
  children,
  basePath = DEFAULT_BASE,
  loginHref = `${DEFAULT_BASE}/login`,
}: {
  children: React.ReactNode;
  basePath?: string;
  loginHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const meQuery = useMe();
  const signOut = useSignOut();
  const me = meQuery.data;
  const unauthorized = isUnauthorized(meQuery.error);
  const links = navLinks(basePath);

  useEffect(() => {
    if (unauthorized) {
      router.replace(loginHref);
      return;
    }
    if (me && me.user.role !== "admin") {
      router.replace(me.user.role === "teacher" ? "/teacher" : "/student");
    }
  }, [unauthorized, me, router, loginHref]);

  if (unauthorized) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center text-gray-500">
        Redirecting to sign in…
      </main>
    );
  }

  if (meQuery.isPending && !me) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <ContentSkeleton rows={4} />
      </main>
    );
  }

  if (me && me.user.role !== "admin") {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center text-gray-500">
        Redirecting…
      </main>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-primary-800">
      <BrandAtmosphere />
      <header className="relative z-40 text-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <KasinaLogo size="sm" tone="dark" href={basePath} />
          <nav className="hidden flex-1 items-center gap-5 md:flex">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium ${
                    active ? "text-white" : "text-white/65 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">
              {me?.user.name}
            </span>
            <button
              type="button"
              onClick={() => void signOut().then(() => router.replace(loginHref))}
              className="text-white/60 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 md:hidden">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={`m-${link.href}`}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                  active ? "bg-white/15 text-white" : "text-white/65"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-0 sm:px-4">
        <div className="flex flex-1 flex-col rounded-t-[2rem] bg-gray-50 px-4 pb-10 pt-7 shadow-[0_-16px_48px_rgba(0,44,27,0.35)] sm:rounded-t-[2.25rem] sm:px-6 sm:pb-12 sm:pt-9">
          {children}
        </div>
      </div>
    </div>
  );
}
