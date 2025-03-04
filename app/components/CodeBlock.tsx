"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ code, language }: any) {
  // Default to javascript if language is not specified
  const lang = language || "javascript";
  
  return (
    <div className="code-block my-4 rounded-lg">
      <SyntaxHighlighter 
        language={lang} 
        style={atomDark}
        customStyle={{
          borderRadius: "0.5rem",
          fontSize: "0.9rem",
          margin: 0
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}