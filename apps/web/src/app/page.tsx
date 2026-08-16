"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { BrandAtmosphere, BrandWordmark } from "@/components/brand-chrome";

export default function HomePage() {
  return (
    <main className="bg-primary-800 text-white">
      {/* First viewport — brand composition */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <BrandAtmosphere />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-20 text-center sm:px-8 sm:pb-20 sm:pt-24">
          <div className="landing-fade-up">
            <BrandWordmark size="lg" />
          </div>

          <h1 className="landing-fade-up landing-delay-1 mt-10 max-w-xl text-[1.65rem] font-bold leading-tight tracking-tight text-white sm:mt-12 sm:text-[2.15rem]">
            Practice that helps Ethiopian Grade 12 students pass.
          </h1>

          <p className="landing-fade-up landing-delay-2 mt-4 max-w-md text-[15px] leading-relaxed text-white/70 sm:text-base">
            Teachers assign work. Students practice by topic. Progress stays in
            the classroom loop.
          </p>

          <div className="landing-fade-up landing-delay-3 mt-10 flex w-full max-w-sm flex-col gap-3 sm:mt-12">
            <Link
              href="/join"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[17px] font-semibold text-primary-800 transition hover:bg-white/95"
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/student/login"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/35 bg-transparent px-5 text-[17px] font-semibold text-white transition hover:bg-white/10"
            >
              Student sign in
            </Link>
          </div>

          <p className="landing-fade-up landing-delay-3 mt-8 text-[13px] text-white/55">
            Teachers:{" "}
            <Link
              href="/teacher/login"
              className="font-semibold text-white/85 underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
            <span className="mx-2 text-white/30">·</span>
            <Link
              href="/teacher/signup"
              className="font-semibold text-white/85 underline-offset-2 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>

        <div
          aria-hidden
          className="relative z-10 mx-auto mb-5 h-1 w-10 rounded-full bg-white/25 sm:mb-7"
        />
      </section>

      {/* Students */}
      <section className="relative border-t border-white/10 bg-primary-900/40 px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-lg text-center">
          <BookOpen
            className="mx-auto h-7 w-7 text-accent-500"
            strokeWidth={1.75}
            aria-hidden
          />
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
            For students
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65">
            Join with your teacher’s invite code, practice Mathematics topics,
            and see where you need to focus before exams.
          </p>
          <Link
            href="/join"
            className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent-500 transition hover:text-accent-600"
          >
            Join a class
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Teachers */}
      <section className="relative border-t border-white/10 px-6 py-16 sm:px-8 sm:py-20">
        <BrandAtmosphere className="opacity-60" />
        <div className="relative z-10 mx-auto max-w-lg text-center">
          <Users
            className="mx-auto h-7 w-7 text-accent-500"
            strokeWidth={1.75}
            aria-hidden
          />
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
            For teachers
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65">
            Create a class, assign practice sets, and see who’s struggling —
            without leaving the classroom workflow.
          </p>
          <Link
            href="/teacher/signup"
            className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent-500 transition hover:text-accent-600"
          >
            Create teacher account
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center sm:px-8">
        <p className="text-sm font-semibold tracking-tight text-white/90">
          Kasina{" "}
          <span lang="am" className="font-ethiopic font-semibold text-white/70">
            (ካሲና)
          </span>
        </p>
        <p className="mt-2 text-xs text-white/40">
          Classroom learning for Ethiopian secondary schools
        </p>
      </footer>
    </main>
  );
}
