"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { FiEdit, FiLogOut, FiTrash2 } from "react-icons/fi";
import CategoryForm from "./CategoryForm";
import toast from "react-hot-toast";

const categoryThemes = [
  { background: "#fef3c7", border: "#f5d98a", text: "#5c4413" },
  { background: "#e0f2fe", border: "#a8d8f6", text: "#1d4f6d" },
  { background: "#dcfce7", border: "#9ed7a6", text: "#1d4d35" },
  { background: "#fce7f3", border: "#f1afd5", text: "#61284f" },
  { background: "#ede9fe", border: "#c4b5fd", text: "#3d2c6a" },
  { background: "#e0f7f4", border: "#9adfd4", text: "#114b48" },
];

const getCategoryTheme = (category: any, index: number) => {
  const seed = category?.id ? Number(String(category.id).split("").reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0)) : index;
  const theme = categoryThemes[seed % categoryThemes.length];

  return {
    background: theme.background,
    border: theme.border,
    text: theme.text,
  };
};

export default function CategoryList({ initialCategories = [] } : any) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] =  useState<any>([]);
  const [showForm, setShowForm] = useState(false);

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error refreshing categories:", error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm("Are you sure you want to delete this category? This will also delete all questions within this category.")) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Category deleted successfully");
        setCategories(categories.filter((cat: any) => cat.id !== id));
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#dfe9e6] bg-[rgba(255,255,255,0.75)] px-4 py-3 shadow-sm backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-[#182524]">Categories</h1>

        <div className="flex items-center gap-3">
         
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowForm(!showForm);
            }}
            className="btn btn-small py-1.5 px-3 btn-primary "
          >
            {showForm ? "Cancel" : "Add Category"}
          </button>

         {session && (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-small flex items-center gap-2 border border-[#cfe2dd] bg-[#887a3d] text-[#ffffff] hover:border-[#b7d7d0] hover:bg-[#ebf7f4]"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            )}
        </div>
      </div>

      {showForm && (
        <CategoryForm
          initialData={editingCategory}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length > 0 ? (
          categories.map((category: any, index: number) => {
            const theme = getCategoryTheme(category, index);

            return (
              <div
                key={category.id}
                className="flex flex-col justify-between rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${theme.background} 0%, rgba(255,255,255,0.9) 100%)`,
                  borderColor: theme.border,
                }}
              >
                <div>
                  <h2 className="mb-2 text-xl font-semibold" style={{ color: theme.text }}>
                    {category.name}
                  </h2>
                  <p className="text-sm" style={{ color: `${theme.text}cc` }}>
                    {category._count?.questions || 0} questions
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={`/categories/${category.id}`}
                    className="font-semibold transition-opacity hover:opacity-80"
                    style={{ color: theme.text }}
                  >
                    View Questions
                  </Link>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="rounded p-1 transition-colors" style={{ color: theme.text, backgroundColor: "rgba(255,255,255,0.3)" }}
                      aria-label="Edit category"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="rounded p-1 transition-colors" style={{ color: theme.text, backgroundColor: "rgba(255,255,255,0.3)" }}
                      aria-label="Delete category"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full rounded-lg border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-500">No categories found. Create your first category!</p>
          </div>
        )}
      </div>
    </div>
  );
}