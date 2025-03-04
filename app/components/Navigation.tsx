"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navigation({ categories = [] }: any) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 category-nav w-full transition-all duration-200 bg-gray-50 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/categories" className="text-xl font-bold text-gray-800">
            Interview Q&A Tool
          </Link>
        </div>

        <div className="overflow-x-auto whitespace-nowrap py-2">
          <div className="flex space-x-4">
            <Link
              href="/categories"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/categories"
                  ? "bg-primary-100 text-primary-800"
                  : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              All Categories
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === `/categories/${category.id}`
                    ? "bg-primary-100 text-primary-800"
                    : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {session && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="hidden text-sm font-medium text-gray-700 md:inline">
                {session.user?.name}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm font-medium text-gray-700 hover:text-primary-600 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}