"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FiBookOpen, FiChevronDown, FiChevronUp, FiGrid, FiLogOut } from "react-icons/fi";

export default function Navigation({ categories = [] }: any) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`app-topbar ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="sidebar-brand">
        <Link href="/categories" className="brand-mark" aria-label="Interview Q&A home">
          <FiBookOpen />
        </Link>
        <div>
          <p className="brand-name">Interview</p>
          <p className="brand-caption">Interview library</p>
        </div>
      </div>

      <div className="sidebar-content">
        <p className="sidebar-label">Workspace</p>
        <Link
          href="/categories"
          className={`sidebar-link ${pathname === "/categories" ? "active" : ""}`}
        >
          <FiGrid />
          <span>All categories</span>
        </Link>

        <div className="category-panel-heading">
          <p className="sidebar-label category-label">Your library</p>
          <button
            type="button"
            className="category-toggle"
            onClick={() => setIsLibraryExpanded((expanded) => !expanded)}
            aria-expanded={isLibraryExpanded}
            aria-label={`${isLibraryExpanded ? "Collapse" : "Expand"} categories`}
          >
            {isLibraryExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
        {isLibraryExpanded && (
          <div className="category-links">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className={`sidebar-link ${pathname === `/categories/${category.id}` ? "active" : ""}`}
              >
                <span className="category-dot" />
                <span className="truncate">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {session && (
        <div className="sidebar-account">
          <div className="account-info">
            {session.user?.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="account-avatar" />
            ) : (
              <span className="account-avatar account-initial">{session.user?.name?.charAt(0) || "U"}</span>
            )}
            <span className="account-name">{session.user?.name || "Account"}</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="sign-out" aria-label="Sign out">
            <FiLogOut />
          </button>
        </div>
      )}
    </nav>
  );
}