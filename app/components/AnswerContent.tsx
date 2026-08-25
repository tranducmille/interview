"use client";

import CodeBlock from "./CodeBlock";
import { Fragment } from "react";

function renderInlineContent(text: string) {
  return text.split(/(`.+?`|\*\*.+?\*\*)/g).map((content, index) => {
    if (content.startsWith("`") && content.endsWith("`")) {
      return (
        <code key={index} className="inline-code">
          {content.slice(1, -1)}
        </code>
      );
    }

    if (content.startsWith("**") && content.endsWith("**")) {
      return <strong key={index}>{content.slice(2, -2)}</strong>;
    }

    return content;
  });
}

export default function AnswerContent({ answer = "" }: { answer?: string }) {
  const parts = answer.split(/(```[a-z]*\n[\s\S]*?\n```)/g);

  return (
    <div className="answer-copy">
      {parts.map((part, index) => {
        const codeMatch = part.match(/```([a-z]*)\n([\s\S]*?)\n```/);

        if (codeMatch) {
          return (
            <CodeBlock
              key={index}
              code={codeMatch[2]}
              language={codeMatch[1] || "javascript"}
            />
          );
        }

        const lines = part.split(/\r?\n/);

        return (
          <div key={index} className="answer-paragraph">
            {lines.map((line, lineIndex) => {
              const headingMatch = line.match(/^(---#|###|##|#)\s*(.*)$/);
              const content = headingMatch ? headingMatch[2] : line;
              const lineContent = renderInlineContent(content);

              if (headingMatch?.[1] === "###") {
                return (
                  <Fragment key={lineIndex}>
                    <h3 className="answer-subheading">{lineContent}</h3>
                    {lineIndex < lines.length - 1}
                  </Fragment>
                );
              }

              if (
                headingMatch?.[1] === "#" ||
                headingMatch?.[1] === "##" ||
                headingMatch?.[1] === "---#"
              ) {
                return (
                  <Fragment key={lineIndex}>
                    <h2 className="answer-subheading">{lineContent}</h2>
                    {lineIndex < lines.length - 1}
                  </Fragment>
                );
              }

              return (
                <Fragment key={lineIndex}>
                  {lineContent}
                  {lineIndex < lines.length - 1}
                </Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
