"use client";

import CodeBlock from "./CodeBlock";

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

        return (
          <p key={index} className="answer-paragraph">
            {part.split(/(`.+?`)/g).map((text, textIndex) => {
              if (text.startsWith("`") && text.endsWith("`")) {
                return (
                  <code key={textIndex} className="inline-code">
                    {text.slice(1, -1)}
                  </code>
                );
              }

              return text;
            })}
          </p>
        );
      })}
    </div>
  );
}
