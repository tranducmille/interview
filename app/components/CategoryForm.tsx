"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function CategoryForm({
  onSuccess,
  initialData = null,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = initialData
        ? `/api/categories/${initialData.id}`
        : "/api/categories";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        toast.success(
          initialData ? "Category updated!" : "Category created!"
        );
        setName("");
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-md">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
          Category Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-1 form-input border border-gray-300 rounded w-full text-sm focus:border-gray-300 hover:border-gray-300"
          placeholder="Enter category name"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-small"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-small"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}