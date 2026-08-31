"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiBookOpen, FiChevronDown, FiFolder, FiGrid, FiChevronUp } from "react-icons/fi";
import { useState } from "react";

export default function Navigation({ categories = [] }: any) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-brand">
        <Link href="/categories" className="brand-mark" aria-label="Interview Q&A home">
          <FiBookOpen />
        </Link>
        <div className="brand-copy">
          <p className="brand-name">Interview</p>
          <p className="brand-caption">Knowledge library</p>
        </div>
      </div>

      <div className="nav-section">
        <Link
          href="/categories"
          className={`nav-pill ${pathname === "/categories" ? "active" : ""}`}
        >
          <FiGrid />
          <span>Overview</span>
        </Link>

        <div className="library-menu">
          <button
            type="button"
            className="nav-library-toggle"
            onClick={() => setIsLibraryExpanded((expanded) => !expanded)}
            aria-expanded={isLibraryExpanded}
            aria-label={`${isLibraryExpanded ? "Collapse" : "Expand"} categories`}
          >
            <FiFolder />
            <span>My Categories</span>
            {isLibraryExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {isLibraryExpanded && (
            <div className="library-panel">
              {categories.length > 0 ? (
                categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className={`library-item ${pathname === `/categories/${category.id}` ? "active" : ""}`}
                  >
                    <span className="category-dot" />
                    <span>{category.name}</span>
                  </Link>
                ))
              ) : (
                <div className="library-empty">No categories yet</div>
              )}
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}