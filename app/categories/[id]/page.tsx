"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import QuestionAccordion from "../../components/QuestionAccordion";
import QuestionForm from "../../components/QuestionForm";
import toast from "react-hot-toast";
import { FiPlus, FiX } from "react-icons/fi";

export default function CategoryDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetchCategory();
    }
  }, [status, params.id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/categories/${params.id}`);
      
      if (res.ok) {
        const data = await res.json();
        setCategory(data);
      } else if (res.status === 404) {
        toast.error("Category not found");
        router.push("/categories");
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Error loading category");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionEdit = (question: any) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleQuestionDelete = async (questionId: any) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Question deleted successfully");
        fetchCategory();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to delete question");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingQuestion(null);
    fetchCategory();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            {category?.name || "Category"}
          </h1>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setShowForm(!showForm);
            }}
            className="btn btn-primary btn-small flex items-center gap-1"
          >
            {showForm ? (
              <>
                <FiX /> Cancel
              </>
            ) : (
              <>
                <FiPlus /> Add Question
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="mb-6">
            <QuestionForm
              categoryId={params.id}
              initialData={editingQuestion}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingQuestion(null);
              }}
            />
          </div>
        )}

        <div className="space-y-4">
          {category?.questions?.length > 0 ? (
            category.questions.map((question, index) => (
              <QuestionAccordion
                key={question.id}
                question={question}
                onEdit={handleQuestionEdit}
                onDelete={handleQuestionDelete}
                isAdmin={true}
                index={index} // Pass the index h
              />
            ))
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="text-gray-500">
                No questions found in this category. Create your first question!
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}