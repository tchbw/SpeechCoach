import "katex/dist/katex.min.css";

import type { FC } from "react";
import { memo } from "react";
import type { Components, Options } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { CodeBlock } from "./codeblock";

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

const preprocessLaTeX = (content: string) => {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  );
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
};

const preprocessMedia = (content: string) => {
  // Remove `sandbox:` from the beginning of the URL
  // to fix OpenAI's models issue appending `sandbox:` to the relative URL
  return content.replace(/(sandbox|attachment|snt):/g, ``);
};

const preprocessContent = (content: string) => {
  return preprocessMedia(preprocessLaTeX(content));
};

export default function Markdown({
  content,
  components,
}: {
  content: string;
  components?: Partial<Components>;
}) {
  const processedContent = preprocessContent(content);

  return (
    <MemoizedReactMarkdown
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 custom-markdown break-words"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        pre({ children, className, ...props }) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        code({ className, children, ...props }) {
          if (Array.isArray(children) && children.length) {
            if (children[0] == `▍`) {
              return (
                <span className="mt-1 animate-pulse cursor-default">▍</span>
              );
            }

            children[0] = (children[0] as string).replace(`\`▍\``, `▍`);
          }

          const match = /language-(\w+)/.exec(className || ``);

          // Deprecated https://github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-extra-props-passed-to-certain-components
          // if (inline) {
          //   return (
          //     <code className={className} {...props}>
          //       {children}
          //     </code>
          //   );
          // }

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ``}
              value={String(children).replace(/\n$/, ``)}
              {...props}
            />
          );
        },
        ...components,
      }}
    >
      {processedContent}
    </MemoizedReactMarkdown>
  );
}
