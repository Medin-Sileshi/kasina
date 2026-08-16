import Link from "next/link";
import { WelcomeChrome } from "@/components/auth-chrome";
import { PrimaryButton } from "@/components/ui";

export default function HomePage() {
  return (
    <WelcomeChrome tagline="Learn. Practice. Pass.">
      <div className="text-center">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-950 sm:text-[2rem]">
          Welcome to Kasina
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-gray-500">
          Prepare for your national examination.
        </p>
      </div>

      <div className="mt-9 space-y-5">
        <Link href="/join" className="block">
          <PrimaryButton type="button" className="h-14 rounded-2xl text-[17px]">
            Get Started
          </PrimaryButton>
        </Link>
        <p className="text-center text-[15px] text-gray-600">
          Already have an account?{" "}
          <Link
            href="/student/login"
            className="font-semibold text-gray-950 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-10 border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
        Teachers:{" "}
        <Link
          href="/teacher/login"
          className="font-medium text-primary-700 hover:underline"
        >
          Teacher login
        </Link>
        <span className="mx-1.5 text-gray-300">·</span>
        <Link
          href="/teacher/signup"
          className="font-medium text-primary-700 hover:underline"
        >
          Create account
        </Link>
      </div>
    </WelcomeChrome>
  );
}
