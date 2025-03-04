"use client";

import { SessionProvider } from "next-auth/react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/categories");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          FAQ Management System
        </h1>
        <div className="mb-4 text-center text-gray-600">
          <p>Sign in to manage your FAQ categories and questions</p>
        </div>
        <button
          onClick={() => signIn("google", { callbackUrl: "/categories" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FcGoogle className="h-5 w-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}