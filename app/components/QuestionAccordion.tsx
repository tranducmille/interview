"use client";

import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function QuestionAccordion({
  question,
  onEdit,
  onDelete,
  isAdmin = false,
  index,
  isActive = false,
  onSelect,
}: any) {
  return (
    <div className={`question-list-item ${isActive ? "active" : ""}`}>
      <button type="button" onClick={() => onSelect(question.id)} className="question-select">
        <span className="question-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="question-title">{question.title}</span>
      </button>
      {isAdmin && (
        <div className="question-actions">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              onEdit(question);
            }}
            className="question-action"
            aria-label="Edit question"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="question-action delete"
            aria-label="Delete question"
          >
            <FiTrash2 />
          </button>
        </div>
      )}
    </div>
  );
}