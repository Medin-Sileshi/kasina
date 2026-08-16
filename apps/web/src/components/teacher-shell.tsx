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
    <div className="flex min-h-dvh bg-[#F4F6F5]">
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col bg-primary-900 text-white md:flex">
        <div className="px-5 pb-4 pt-6">
          <Link href="/teacher" className="block">
            <span className="text-xl font-bold tracking-tight">Kasina</span>
            <span
              lang="am"
              className="font-ethiopic ml-1.5 text-base font-semibold text-white/70"
            >
              (ካሲና)
            </span>
          </Link>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
            Teacher
          </p>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-4 pt-2">
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
          <div className="border-t border-white/10 p-3">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700 md:hidden">
              Kasina Teacher
            </p>
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

        <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden">
          {mobileNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold ${
                pathname === item.href ||
                (item.href !== "/teacher" && pathname.startsWith(item.href))
                  ? "bg-primary-800 text-white"
                  : "bg-primary-50 text-primary-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="ml-auto whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold text-gray-500"
            >
              Sign out
            </button>
          ) : null}
        </nav>

        <div className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
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
        <div className="flex min-h-dvh items-center justify-center bg-[#F4F6F5] text-gray-500">
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
