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

function parseTableRow(line: string) {
  if (!line.includes("|")) {
    return null;
  }

  const cells = line.trim().replace(/^\||\|$/g, "").split("|");
  return cells.map((cell) => cell.trim());
}

function isTableSeparator(cells: string[]) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
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
        const tableStarts = new Map<number, { end: number; headers: string[]; rows: string[][] }>();
        const tableLines = new Set<number>();

        for (let lineIndex = 0; lineIndex < lines.length - 1; lineIndex += 1) {
          const headers = parseTableRow(lines[lineIndex]);
          const separator = parseTableRow(lines[lineIndex + 1]);

          if (!headers || !separator || !isTableSeparator(separator)) {
            continue;
          }

          const rows: string[][] = [];
          let end = lineIndex + 2;

          while (end < lines.length) {
            const row = parseTableRow(lines[end]);
            if (!row) {
              break;
            }

            rows.push(row);
            end += 1;
          }

          tableStarts.set(lineIndex, { end, headers, rows });
          for (let tableLine = lineIndex; tableLine < end; tableLine += 1) {
            tableLines.add(tableLine);
          }

          lineIndex = end - 1;
        }

        return (
          <div key={index} className="answer-paragraph">
            {lines.map((line, lineIndex) => {
              const table = tableStarts.get(lineIndex);
              if (table) {
                return (
                  <div key={lineIndex} className="answer-table-wrap">
                    <table className="answer-table">
                      <thead>
                        <tr>
                          {table.headers.map((header, cellIndex) => (
                            <th key={cellIndex}>{renderInlineContent(header)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {table.headers.map((_, cellIndex) => (
                              <td key={cellIndex}>
                                {renderInlineContent(row[cellIndex] || "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (tableLines.has(lineIndex)) {
                return null;
              }

              const questionMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
              const headingMatch = line.match(/^(---#|###|##|#)\s*(.*)$/);
              const quoteMatch = line.match(/^[<>]\s?(.*)$/);
              const content = questionMatch
                ? questionMatch[1]
                : headingMatch
                  ? headingMatch[2]
                  : quoteMatch
                    ? quoteMatch[1]
                    : line;
              const lineContent = renderInlineContent(content);

              if (questionMatch) {
                return (
                  <h2 key={lineIndex} className="answer-subheading answer-question">
                    {lineContent}
                  </h2>
                );
              }

              if (quoteMatch) {
                if (!quoteMatch[1].trim()) {
                  return null;
                }

                return (
                  <blockquote key={lineIndex} className="answer-quote">
                    {lineContent}
                  </blockquote>
                );
              }

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
                <span key={lineIndex} className="answer-line">
                  {lineContent}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
