"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, User, Wifi, WifiOff } from "lucide-react";
import { BrandAtmosphere } from "@/components/brand-chrome";
import { KasinaLogo } from "@/components/kasina-logo";
import { getLastSyncedAt } from "@/lib/offline-session/sync";

const links = [
  { href: "/student", label: "Home", exact: true },
  { href: "/subjects/mathematics", label: "Subjects" },
  { href: "/student/melak", label: "Melak" },
  { href: "/cbt", label: "CBT" },
  { href: "/read/mathematics", label: "Textbook" },
  { href: "/progress", label: "Progress" },
];

function linkActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href.startsWith("/read")) return pathname.startsWith("/read");
  if (href === "/student/melak") return pathname.startsWith("/student/melak");
  if (href === "/cbt") return pathname.startsWith("/cbt");
  if (href.startsWith("/subjects")) {
    return pathname.startsWith("/subjects") || pathname.startsWith("/quiz");
  }
  return pathname === href || pathname.startsWith(href);
}

function formatSynced(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SyncIndicator() {
  const [online, setOnline] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    void getLastSyncedAt()
      .then((v) => setLastSynced(v))
      .catch(() => setLastSynced(null));

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const syncedLabel = formatSynced(lastSynced);

  return (
    <span
      className="hidden items-center gap-1.5 text-[11px] font-medium text-white/65 sm:inline-flex"
      title={syncedLabel ? `Last synced ${syncedLabel}` : "Not synced yet"}
    >
      {online ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      {online ? "Online" : "Offline"}
      {syncedLabel ? (
        <span className="text-white/40">· {syncedLabel}</span>
      ) : null}
    </span>
  );
}

export function StudentNav({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <header className="relative z-40 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <KasinaLogo size="sm" tone="dark" href="/student" />

        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          {links.map((link) => {
            const active = linkActive(pathname, link.href, link.exact);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative text-sm font-medium transition ${
                  active ? "text-white" : "text-white/65 hover:text-white"
                }`}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-[18px] left-0 right-0 h-[2.5px] rounded-full bg-accent-500" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <SyncIndicator />
          <span className="hidden text-xs font-medium text-white/65 lg:inline">
            EN <span className="text-white/30">|</span> አማ
          </span>
          <button
            type="button"
            disabled
            title="Notifications coming soon"
            className="cursor-not-allowed rounded-full p-2 text-white/40"
            aria-label="Notifications (coming soon)"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold ring-2 ring-white/10"
            title={userName}
          >
            {userName ? (
              userName.charAt(0).toUpperCase()
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 md:hidden">
        {links.map((link) => {
          const active = linkActive(pathname, link.href, link.exact);
          return (
            <Link
              key={`m-${link.label}`}
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
  );
}

export function StudentShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-primary-800">
      <BrandAtmosphere />
      <StudentNav userName={userName} />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-0 sm:px-4">
        <div className="landing-sheet-in flex flex-1 flex-col rounded-t-[2rem] bg-gray-50 px-4 pb-10 pt-7 shadow-[0_-16px_48px_rgba(0,44,27,0.35)] sm:rounded-t-[2.25rem] sm:px-6 sm:pb-12 sm:pt-9">
          <div className="mx-auto mb-6 h-1.5 w-12 shrink-0 rounded-full bg-gray-200 sm:mb-8" />
          {children}
        </div>
      </div>
    </div>
  );
}
