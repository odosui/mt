import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import CrossLink from "./preview/CrossLink";
import Mermaid from "./preview/Mermaid";
import HashTagPlugin from "./utils/rehype/tag_plugin";

const components = {
  code: renderCode,
  a: renderLink,
  span: renderSpan,
};

const Preview: React.FC<{ markdown: string }> = ({ markdown }) => {
  return (
    <div className="note-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[HashTagPlugin]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

function renderSpan({ node }: any) {
  if (node.hashtag) {
    return <span className="tag">{node.hashtag}</span>;
  } else {
    return <span>{node.children}</span>;
  }
}

function renderCode(aprops: any) {
  const { inline, className, children, ...props } = aprops;
  const match = /language-(\w+)/.exec(className || "");

  if (inline) {
    return (
      <code className="inline" {...props}>
        {children}
      </code>
    );
  }

  const content = String(children).replace(/\n$/, "");
  const lang = match ? match[1] : "none";

  if (content.trim() && lang === "mermaid") {
    // const res = tryParsingMermaid(content)

    // if (res === true) {
    return <Mermaid code={content} />;
    // } else {
    //   return <div className="code-error">Mermaid parse error: ${res}</div>
    // }
  }

  return (
    <div className="code-block">
      <SyntaxHighlighter style={theme as any} language={lang} {...props}>
        {content}
      </SyntaxHighlighter>
    </div>
  );
}

function renderLink(props: any) {
  const {
    children,
    node: { properties },
  } = props;
  if (!properties) {
    return null;
  }

  const href = properties["href"];
  if (!href) {
    return null;
  }

  const str = href.toString();
  const match = str.match(/^\d+$/);
  if (match) {
    const noteId = str;
    return <CrossLink noteId={noteId}>{children}</CrossLink>;
  } else {
    return (
      <a href={str} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }
}

export default Preview;
