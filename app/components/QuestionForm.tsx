"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function QuestionForm({
  categoryId,
  onSuccess,
  initialData = null,
  onCancel,
}: any) {
  const [formData, setFormData] = useState({
    title: "",
    answer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        answer: initialData.answer || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = initialData
        ? `/api/questions/${initialData.id}`
        : "/api/questions";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categoryId,
        }),
      });

      if (response.ok) {
        toast.success(
          initialData ? "Question updated!" : "Question created!"
        );
        setFormData({ title: "", answer: "" });
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
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
          Question Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="p-1 form-input border border-gray-300 rounded w-full text-sm focus:border-gray-300 hover:border-gray-300"
          placeholder="Enter question title"
        />
      </div>

      <div>
        <label htmlFor="answer" className="mb-2 block text-sm font-medium text-gray-700">
          Answer
        </label>
        <div className="mb-1 text-xs text-gray-500">
          <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
            ```javascript<br />
            const example = "This will be highlighted";<br />
            ```
          </pre>
          Use single backticks for inline code: `variable`
        </div>
        <textarea
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          required
          rows={8}
          className="p-1 form-input border border-gray-300 rounded font-mono text-xs w-full hover:border-gray-300 focus:border-gray-300"
          placeholder="Enter the answer with formatting"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary btn-small"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-small"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}