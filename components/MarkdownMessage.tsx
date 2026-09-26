"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const inline = !className;

            if (inline) {
              return (
                <code
                  className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4">
                <code className={className}>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}