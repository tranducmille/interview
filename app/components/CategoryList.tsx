"use client";

import { useState } from "react";
import Link from "next/link";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import CategoryForm from "./CategoryForm";
import toast from "react-hot-toast";

export default function CategoryList({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState(null);
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
        setCategories(categories.filter((cat) => cat.id !== id));
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(!showForm);
          }}
          className="btn btn-small"
        >
          {showForm ? "Cancel" : "Add Category"}
        </button>
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
          categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <h2 className="mb-2 text-xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {category._count?.questions || 0} questions
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link
                  href={`/categories/${category.id}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Questions
                </Link>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-primary-500"
                    aria-label="Edit category"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                    aria-label="Delete category"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-lg border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-500">No categories found. Create your first category!</p>
          </div>
        )}
      </div>
    </div>
  );
}