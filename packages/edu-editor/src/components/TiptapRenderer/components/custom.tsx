import { lazy, Suspense } from "react";
import { Components } from "rehype-react";
import HeadingWithAnchor from "./HeadingWithAnchor";
import CopyButton from "./CopyButton";
import type { ReactElement } from "react";

// Lazy load the syntax highlighter
const SyntaxHighlighter = lazy(() => import("./SyntaxHighlighter"));

export const components: Partial<Components> = {
  h2: (props) => <HeadingWithAnchor level={2} {...props} />,
  h3: (props) => <HeadingWithAnchor level={3} {...props} />,
  h4: (props) => <HeadingWithAnchor level={4} {...props} />,
  img: ({ src, alt, width, ...props }: any) => (
      <img
          src={src}
          alt={alt || ""}
          width={props["data-width"]}
          height={props["data-height"]}
          className="mx-auto rounded-lg"
          loading="lazy" // Add lazy loading
      />
  ),
  iframe: ({ ...props }) => (
      <div>
        <iframe
            {...props}
            allowFullScreen={true}
            className="w-full h-full aspect-video mx-auto rounded-lg"
        />
      </div>
  ),
  pre: ({ children, ...props }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
      const code = (children as ReactElement).props.children;
    return (
        <div className="relative group not-prose rounded-lg overflow-hidden border border-[#d1d9e0] dark:border-[#3d444d]">
          <CopyButton code={String(code)} />
          <pre {...(props as any)}>{children}</pre>
        </div>
    );
  },
  code: ({ children, ...props }) => {
    const match = /language-(\w+)/.exec(props.className || "");
    const code = String(children).replace(/\n$/, "");
    return match ? (
        <Suspense fallback={<code {...props}>{children}</code>}>
          <SyntaxHighlighter language={match[1]} content={code} />
        </Suspense>
    ) : (
        <code {...props}>{children}</code>
    );
  },
  table: (props: any) => (
      <table className="not-prose w-full table-auto border-collapse mx-auto text-sm" {...props} />
  ),
  tr: (props: any) => (
      <tr
          className="border-b last:border-b-0 border-b-[#d1d9e0] dark:border-b-[#3d444d]"
          {...props}
      />
  ),
  td: (props: any) => <td className="px-2.5 py-3.5" {...props} />,
  th: (props: any) => <td className="px-2.5 py-3.5 font-bold" {...props} />,
};