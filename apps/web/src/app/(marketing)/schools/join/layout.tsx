import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School join request",
  description:
    "Request for your Ethiopian secondary school to join the Kasina pilot.",
};

export default function SchoolJoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
