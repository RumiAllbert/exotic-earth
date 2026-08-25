import { preferredType, setVaryAccept, VARY_ACCEPT } from "./accept.ts";
import {
  isNegotiablePath,
  markdownForPath,
  markdownResponseHeaders,
  notAcceptableBody,
  NOT_FOUND_MARKDOWN,
} from "./site-content.ts";

export type Negotiation =
  | { kind: "skip" }
  | { kind: "html" }
  | {
      kind: "markdown";
      status: number;
      body: string;
      headers: Record<string, string>;
    }
  | { kind: "not_acceptable"; body: string; headers: Record<string, string> };

export function negotiate(
  pathname: string,
  acceptHeader: string | null,
): Negotiation {
  if (!isNegotiablePath(pathname)) return { kind: "skip" };

  const chosen = preferredType(acceptHeader);
  if (chosen === null) {
    return {
      kind: "not_acceptable",
      body: notAcceptableBody(acceptHeader),
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Vary: VARY_ACCEPT,
        "Cache-Control": "no-store",
      },
    };
  }

  if (chosen === "text/markdown") {
    const markdown = markdownForPath(pathname);
    if (markdown) {
      return {
        kind: "markdown",
        status: 200,
        body: markdown,
        headers: markdownResponseHeaders(),
      };
    }
    return {
      kind: "markdown",
      status: 404,
      body: NOT_FOUND_MARKDOWN,
      headers: {
        ...markdownResponseHeaders(),
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    };
  }

  return { kind: "html" };
}

export { setVaryAccept };
