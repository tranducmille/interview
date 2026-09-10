"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import QuestionAccordion from "../../components/QuestionAccordion";
import QuestionForm from "../../components/QuestionForm";
import AnswerContent from "../../components/AnswerContent";
import toast from "react-hot-toast";
import { FiCheck, FiCheckCircle, FiChevronLeft, FiChevronRight, FiLogOut, FiMaximize2, FiMinimize2, FiMinus, FiPlus, FiX } from "react-icons/fi";

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
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [answerWindowState, setAnswerWindowState] = useState<"default" | "maximized" | "minimized">("default");
  const [completedQuestionIds, setCompletedQuestionIds] = useState<string[]>([]);
  const progressSaveQueue = useRef(Promise.resolve());

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetchCategory();
    }
  }, [status, params.id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const [res, progressRes] = await Promise.all([
        fetch(`/api/categories/${params.id}`),
        fetch(`/api/categories/${params.id}/progress`),
      ]);
      
      if (res.ok) {
        const data = await res.json();
        const progress = progressRes.ok ? await progressRes.json() : null;
        setCategory(data);
        setCompletedQuestionIds(progress?.completedQuestionIds || []);
        const savedQuestionId = progress?.currentQuestionId;
        const hasSavedQuestion = savedQuestionId && data.questions.some((question: any) => question.id === savedQuestionId);
        const hasCurrentQuestion = selectedQuestionId && data.questions.some((question: any) => question.id === selectedQuestionId);
        const nextQuestionId = hasSavedQuestion
          ? savedQuestionId
          : hasCurrentQuestion
            ? selectedQuestionId
            : data.questions[0]?.id || null;

        setSelectedQuestionId(nextQuestionId);

        const selectedIndex = data.questions.findIndex((question: any) => question.id === nextQuestionId);
        const questionPage = selectedIndex >= 0 ? Math.floor(selectedIndex / rowsPerPage) + 1 : 1;
        const latestPage = Math.max(1, Math.ceil(data.questions.length / rowsPerPage));
        setCurrentPage(Math.min(questionPage, latestPage));
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

  const toggleQuestionCompletion = (questionId: string) => {
    setCompletedQuestionIds((currentIds) => {
      const nextIds = currentIds.includes(questionId)
        ? currentIds.filter((id) => id !== questionId)
        : [...currentIds, questionId];

      saveProgress(nextIds, selectedQuestionId);
      return nextIds;
    });
  };

  const setAllQuestionsCompleted = (completed: boolean) => {
    const nextIds = completed ? questions.map((question: any) => question.id) : [];
    setCompletedQuestionIds(nextIds);
    saveProgress(nextIds, selectedQuestionId);
  };

  const selectQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    saveProgress(completedQuestionIds, questionId);
  };

  const saveProgress = (completedQuestionIds: string[], currentQuestionId: string | null) => {
    progressSaveQueue.current = progressSaveQueue.current
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch(`/api/categories/${params.id}/progress`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedQuestionIds, currentQuestionId }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(`${response.status}: ${error.message || "Unable to save question progress"}`);
        }
      })
      .catch((error) => {
        console.error("Error saving question progress:", error);
        toast.error(error instanceof Error ? error.message : "Unable to save question progress");
      });
  };

  const completedCount = questions.filter((question: any) => completedQuestionIds.includes(question.id)).length;
  const progressPercent = questions.length ? Math.round((completedCount / questions.length) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-800">
            {category?.name || "Category"}
          </h1>

          <div className="flex items-center gap-3">
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
                <div className="progress-summary" aria-label={`${completedCount} of ${questions.length} questions completed`}>
                  <span>{completedCount}/{questions.length} completed</span>
                  <span className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${progressPercent}% complete`}>
                    <span className="progress-value" style={{ width: `${progressPercent}%` }} />
                    <span className="progress-label">{progressPercent}%</span>
                  </span>
                  <div className="progress-actions">
                    <button type="button" onClick={() => setAllQuestionsCompleted(true)}>
                      Mark all
                    </button>
                    <button type="button" onClick={() => setAllQuestionsCompleted(false)}>
                      Unmark all
                    </button>
                  </div>
                </div>
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
                isCompleted={completedQuestionIds.includes(question.id)}
                onSelect={selectQuestion}
                onToggleComplete={toggleQuestionCompletion}
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
                <label htmlFor="rows-per-page-bottom">Rows</label>
                <select
                  id="rows-per-page-bottom"
                  value={rowsPerPage}
                  onChange={(event) => handleRowsPerPageChange(event.target.value)}
                  className="rows-select"
                >
                  <option value="10">10</option>
                  <option value="15">15</option>
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

          <section
            className={`answer-panel ${answerWindowState === "maximized" ? "is-maximized" : ""} ${answerWindowState === "minimized" ? "is-minimized" : ""}`}
            aria-live="polite"
          >
            {selectedQuestion ? (
              <>
                <div className="answer-heading">
                  <div>
                    <p className="panel-eyebrow">Selected answer</p>
                    <h2>{selectedQuestion.title}</h2>
                  </div>
                  <div className="answer-panel-actions">
                    <button
                      type="button"
                      className={`completion-control ${completedQuestionIds.includes(selectedQuestion.id) ? "completed" : ""}`}
                      onClick={() => toggleQuestionCompletion(selectedQuestion.id)}
                      aria-pressed={completedQuestionIds.includes(selectedQuestion.id)}
                    >
                      {completedQuestionIds.includes(selectedQuestion.id) ? <FiCheckCircle /> : <FiCheck />}
                      <span>{completedQuestionIds.includes(selectedQuestion.id) ? "Completed" : "Mark complete"}</span>
                    </button>
                    <div className="answer-window-actions">
                      <button
                        type="button"
                        className="window-control"
                        onClick={() =>
                          setAnswerWindowState((current) =>
                            current === "maximized" ? "default" : "maximized"
                          )
                        }
                        aria-label={
                          answerWindowState === "maximized"
                            ? "Restore answer panel"
                            : "Maximize answer panel"
                        }
                      >
                        {answerWindowState === "maximized" ? <FiMinimize2 /> : <FiMaximize2 />}
                      </button>
                      <button
                        type="button"
                        className="window-control"
                        onClick={() =>
                          setAnswerWindowState((current) =>
                            current === "minimized" ? "default" : "minimized"
                          )
                        }
                        aria-label={
                          answerWindowState === "minimized"
                            ? "Restore answer panel"
                            : "Minimize answer panel"
                        }
                      >
                        <FiMinus />
                      </button>
                    </div>
                  </div>
                </div>
                {answerWindowState !== "minimized" && (
                  <AnswerContent answer={selectedQuestion.answer} />
                )}
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