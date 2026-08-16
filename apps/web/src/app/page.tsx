"use client";

import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import {
  BottomSheet,
  BrandAtmosphere,
  BrandWordmark,
} from "@/components/brand-chrome";

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-primary-800">
      <BrandAtmosphere />

      <section className="relative flex min-h-[48dvh] flex-1 flex-col items-center justify-center px-6 pb-10 pt-20 text-center sm:min-h-[52dvh] sm:pb-12 sm:pt-24">
        <div className="landing-fade-up">
          <BrandWordmark size="lg" />
        </div>
      </section>

      <BottomSheet>
        <div className="text-center">
          <h1 className="text-[1.65rem] font-bold tracking-tight text-gray-950 sm:text-[1.85rem]">
            Start practicing
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-gray-500">
            Join your class with an invite code, or sign in to continue.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link href="/join" className="block">
            <PrimaryButton type="button" className="h-14 rounded-2xl text-[17px]">
              Get Started
            </PrimaryButton>
          </Link>
          <Link href="/student/login" className="block">
            <SecondaryButton
              type="button"
              className="h-14 rounded-2xl text-[17px]"
            >
              Sign in
            </SecondaryButton>
          </Link>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em]">
            Teachers
          </p>
          <p className="mt-2 text-[13px] text-gray-500">
            <Link
              href="/teacher/login"
              className="font-semibold text-primary-700 hover:underline"
            >
              Teacher login
            </Link>
            <span className="mx-2 text-gray-300">·</span>
            <Link
              href="/teacher/signup"
              className="font-semibold text-primary-700 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </BottomSheet>
    </main>
  );
}
