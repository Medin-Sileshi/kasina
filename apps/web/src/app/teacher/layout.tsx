import type { Metadata } from "next";
import type { ReactNode } from "react";
import TeacherGroupLayout from "@/components/teacher-group-layout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <TeacherGroupLayout>{children}</TeacherGroupLayout>;
}
