"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Bell,
  LogOut,
  AlertTriangle,
  UserRound,
  Grid3X3,
  LineChart,
} from "lucide-react";
import { BrandAtmosphere } from "@/components/brand-chrome";

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (path: string, search: string) => boolean;
};

const nav: Array<{ group: string; items: NavItem[] }> = [
  {
    group: "Overview",
    items: [
      {
        id: "dashboard",
        href: "/teacher",
        label: "Dashboard",
        icon: LayoutDashboard,
        match: (p) => p === "/teacher",
      },
      {
        id: "classes",
        href: "/teacher/classes",
        label: "My Classes",
        icon: Users,
        match: (p) =>
          p === "/teacher/classes" ||
          (p.startsWith("/teacher/classes/") && !p.includes("/assign")),
      },
    ],
  },
  {
    group: "Students",
    items: [
      {
        id: "all-students",
        href: "/teacher/students",
        label: "All Students",
        icon: UserRound,
        match: (p) => p === "/teacher/students",
      },
      {
        id: "at-risk",
        href: "/teacher/students/at-risk",
        label: "At-Risk Students",
        icon: AlertTriangle,
        match: (p) => p === "/teacher/students/at-risk",
      },
    ],
  },
  {
    group: "Content",
    items: [
      {
        id: "assign",
        href: "/teacher/assign",
        label: "Assign Work",
        icon: ClipboardList,
        match: (p) =>
          p === "/teacher/assign" ||
          p.includes("/assign") ||
          p.startsWith("/teacher/assignments"),
      },
      {
        id: "sets",
        href: "/teacher/practice-sets",
        label: "Practice Sets",
        icon: BookOpen,
        match: (p) => p === "/teacher/practice-sets",
      },
    ],
  },
  {
    group: "Analytics",
    items: [
      {
        id: "heatmap",
        href: "/teacher/analytics/heatmap",
        label: "Topic Heatmap",
        icon: Grid3X3,
        match: (p) => p === "/teacher/analytics/heatmap",
      },
      {
        id: "predictions",
        href: "/teacher/analytics/predictions",
        label: "Exam Predictions",
        icon: LineChart,
        match: (p) => p === "/teacher/analytics/predictions",
      },
    ],
  },
];

const mobileNav = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/classes", label: "Classes" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/assign", label: "Assign" },
];

function TeacherShellNav({
  children,
  title,
  userName,
  onSignOut,
}: {
  children: React.ReactNode;
  title?: string;
  userName?: string;
  onSignOut?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const activeId =
    nav
      .flatMap((s) => s.items)
      .find((item) => item.match(pathname, search))?.id ?? "dashboard";

  return (
    <div className="flex min-h-dvh bg-primary-800 md:bg-gray-50">
      <aside className="relative sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col overflow-hidden bg-primary-800 text-white md:flex">
        <BrandAtmosphere />
        <div className="relative z-10 px-5 pb-4 pt-6">
          <Link href="/teacher" className="block">
            <span className="text-xl font-bold tracking-tight">Kasina</span>
            <span
              lang="am"
              className="font-ethiopic ml-1.5 text-base font-semibold text-white/70"
            >
              (ካሲና)
            </span>
          </Link>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-500/90">
            Teacher
          </p>
        </div>

        <nav className="relative z-10 flex-1 space-y-7 overflow-y-auto px-3 pb-4 pt-2">
          {nav.map((section) => (
            <div key={section.group}>
              <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                {section.group}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === activeId;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13.5px] transition ${
                          active
                            ? "bg-white/12 font-semibold text-white"
                            : "font-medium text-white/60 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {active ? (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-500" />
                        ) : null}
                        <Icon
                          className={`h-[17px] w-[17px] shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {onSignOut ? (
          <div className="relative z-10 border-t border-white/10 p-3">
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13.5px] font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : null}
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col md:bg-transparent">
        {/* Mobile: green brand strip matching landing */}
        <div className="relative overflow-hidden bg-primary-800 text-white md:hidden">
          <BrandAtmosphere />
          <div className="relative z-10 flex h-14 items-center justify-between px-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-500/90">
                Kasina · Teacher
              </p>
              {title ? (
                <h1 className="truncate text-base font-bold tracking-tight">
                  {title}
                </h1>
              ) : null}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold ring-2 ring-white/10">
              {(userName ?? "T").charAt(0).toUpperCase()}
            </div>
          </div>
          <nav className="relative z-10 flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2">
            {mobileNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold ${
                  pathname === item.href ||
                  (item.href !== "/teacher" && pathname.startsWith(item.href))
                    ? "bg-white/15 text-white"
                    : "text-white/65"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {onSignOut ? (
              <button
                type="button"
                onClick={onSignOut}
                className="ml-auto whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold text-white/55"
              >
                Sign out
              </button>
            ) : null}
          </nav>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:pl-0">
          <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 backdrop-blur-md md:flex sm:px-8">
            <div className="min-w-0">
              {title ? (
                <h1 className="truncate text-lg font-bold tracking-tight text-gray-950 sm:text-[1.35rem]">
                  {title}
                </h1>
              ) : null}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-800 text-sm font-semibold text-white ring-2 ring-white">
                {(userName ?? "T").charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="landing-sheet-in mx-auto min-h-full max-w-6xl rounded-t-[1.75rem] bg-gray-50 px-4 py-6 shadow-[0_-12px_40px_rgba(0,44,27,0.2)] sm:px-8 sm:py-8 md:rounded-none md:bg-transparent md:px-8 md:py-8 md:shadow-none">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200 md:hidden" />
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeacherShell({
  children,
  title,
  userName,
  onSignOut,
}: {
  children: React.ReactNode;
  title?: string;
  userName?: string;
  onSignOut?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-primary-800 text-white/70">
          Loading…
        </div>
      }
    >
      <TeacherShellNav title={title} userName={userName} onSignOut={onSignOut}>
        {children}
      </TeacherShellNav>
    </Suspense>
  );
}
