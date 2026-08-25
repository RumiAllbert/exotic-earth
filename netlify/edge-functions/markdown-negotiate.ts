import { negotiate, setVaryAccept } from "../../src/lib/negotiate.ts";

export const config = {
  path: "/*",
};

type EdgeContext = {
  next: () => Promise<Response>;
};

export default async (request: Request, context: EdgeContext) => {
  const url = new URL(request.url);
  const result = negotiate(url.pathname, request.headers.get("accept"));

  if (result.kind === "skip") return;

  if (result.kind === "not_acceptable") {
    return new Response(result.body, { status: 406, headers: result.headers });
  }

  if (result.kind === "markdown") {
    return new Response(result.body, {
      status: result.status,
      headers: result.headers,
    });
  }

  const origin = await context.next();
  const headers = new Headers(origin.headers);
  setVaryAccept(headers);
  return new Response(origin.body, { status: origin.status, headers });
};
