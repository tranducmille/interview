"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit, FiTrash2 } from "react-icons/fi";
import CodeBlock from "./CodeBlock";

export default function QuestionAccordion({
  question,
  onEdit,
  onDelete,
  isAdmin = false,
  index,
}: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded((prev) => !prev); // Use functional update for state
  };

  // Function to render the answer with code highlighting
  const renderAnswer = (answer: any) => {
    // Split by code blocks
    const parts = answer.split(/(```[a-z]*\n[\s\S]*?\n```)/g);
    
    return parts.map((part: any, index: any) => {
      // Check if this part is a code block
      const codeMatch = part.match(/```([a-z]*)\n([\s\S]*?)\n```/);
      
      if (codeMatch) {
        const language = codeMatch[1] || "javascript";
        const code = codeMatch[2];
        return <CodeBlock key={index} code={code} language={language} />;
      }
      
      // Regular text - we'll parse it for inline code
      return (
        <div key={index} className="mb-2 whitespace-pre-wrap  text-xs">
          {part.split(/(`.+?`)/g).map((text: any, i: any) => {
            if (text.startsWith("`") && text.endsWith("`")) {
              // Inline code
              return (
                <code
                  key={i}
                  className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-pink-600"
                >
                  {text.slice(1, -1)}
                </code>
              );
            }
            return text;
          })}
        </div>
      );
    });
  };

  return (
    <div>
      <div className={`accordion transition-all duration-300 ${isExpanded ? 'bg-white' : 'bg-gray-50'}`}>
        <div
          onClick={toggleAccordion}
          className="flex cursor-pointer items-center justify-between p-1 transition-colors duration-200 hover:bg-gray-100 border-b border-gray-300"
        >
          <h3 className="text-sm font-medium text-gray-900 flex-1">
            {index + 1}. {question.title}
          </h3>
          {isAdmin && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.scrollTo(0, 0); // Scroll to top
                  onEdit(question);
                }}
                className="text-gray-600 hover:bg-gray-200 rounded-md p-1"
                aria-label="Edit question"
              >
                <FiEdit />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question.id);
                }}
                className="text-gray-600 hover:bg-red-200 rounded-md p-1"
                aria-label="Delete question"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
          <span className="text-gray-600 ml-2">
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </div>
        {isExpanded && (
          <div className="accordion-content px-3 pt-2">
            <div className="prose max-w-none text-gray-800 text-xs">
              {renderAnswer(question.answer)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}