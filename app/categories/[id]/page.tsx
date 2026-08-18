"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import QuestionAccordion from "../../components/QuestionAccordion";
import QuestionForm from "../../components/QuestionForm";
import AnswerContent from "../../components/AnswerContent";
import toast from "react-hot-toast";
import { FiChevronLeft, FiChevronRight, FiPlus, FiX } from "react-icons/fi";

export default function CategoryDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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
        setCurrentPage(1);
        setSelectedQuestionId((currentId) => currentId && data.questions.some((question: any) => question.id === currentId)
          ? currentId
          : data.questions[0]?.id || null);
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

  const selectedQuestion = category?.questions?.find(
    (question: any) => question.id === selectedQuestionId
  );
  const questions = category?.questions || [];
  const totalPages = Math.max(1, Math.ceil(questions.length / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const visibleQuestions = questions.slice(pageStart, pageStart + rowsPerPage);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

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

        <div className="question-workspace">
          <section className="question-list-panel" aria-label="Questions">
             {questions.length > 0 && (
            <div className="panel-heading">
              <div>
                <p className="panel-eyebrow">Study queue ({questions.length})</p>
                <h2>Questions</h2>
              </div>
              <div className="pagination-controls">
                <label htmlFor="rows-per-page">Rows</label>
                <select
                  id="rows-per-page"
                  value={rowsPerPage}
                  onChange={(event) => handleRowsPerPageChange(event.target.value)}
                  className="rows-select"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                </button>
                <span className="page-number">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
          {questions.length > 0 ? (
            visibleQuestions.map((question: any, index: number) => (
              <QuestionAccordion
                key={question.id}
                question={question}
                onEdit={handleQuestionEdit}
                onDelete={handleQuestionDelete}
                isAdmin={true}
                index={pageStart + index}
                isActive={question.id === selectedQuestionId}
                onSelect={setSelectedQuestionId}
              />
            ))
          ) : (
            <div className="empty-questions">
              <p className="text-gray-500">
                No questions found in this category. Create your first question!
              </p>
            </div>
          )}
          {questions.length > 0 && (
            <div className="question-pagination">
              <span className="pagination-summary">
                Showing {pageStart + 1}-{Math.min(pageStart + rowsPerPage, questions.length)} of {questions.length}
              </span>
              <div className="pagination-controls">
                <label htmlFor="rows-per-page">Rows</label>
                <select
                  id="rows-per-page"
                  value={rowsPerPage}
                  onChange={(event) => handleRowsPerPageChange(event.target.value)}
                  className="rows-select"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                </button>
                <span className="page-number">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
          </section>

          <section className="answer-panel" aria-live="polite">
            {selectedQuestion ? (
              <>
                <div className="answer-heading">
                  <div>
                    <p className="panel-eyebrow">Selected answer</p>
                    <h2>{selectedQuestion.title}</h2>
                  </div>
                  <span className="answer-index">
                    {String(category.questions.indexOf(selectedQuestion) + 1).padStart(2, "0")}
                  </span>
                </div>
                <AnswerContent answer={selectedQuestion.answer} />
              </>
            ) : (
              <div className="answer-empty">
                <p>Select a question to view its answer.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}