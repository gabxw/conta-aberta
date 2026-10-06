import { NextRequest, NextResponse } from "next/server";
const allowed = new Set([
  "dashboard",
  "account",
  "comparison",
  "usage",
  "timeline",
  "services",
  "recommendations",
  "actions",
  "events",
  "admin/overview",
  "health",
  "assistant",
]);
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  if (!allowed.has(endpoint))
    return NextResponse.json(
      { title: "Rota não encontrada." },
      { status: 404 },
    );
  const base = (
    process.env.API_BASE_URL || "http://localhost:5080/api/v1"
  ).replace(/\/$/, "");
  try {
    const upstream = await fetch(
      `${base}/${endpoint}${request.nextUrl.search}`,
      {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
        },
        body: request.method === "POST" ? await request.text() : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(endpoint === "assistant" ? 90000 : 15000),
      },
    );
    return new NextResponse(
      upstream.status === 204 ? null : await upstream.text(),
      {
        status: upstream.status,
        headers: {
          "Content-Type":
            upstream.headers.get("content-type") || "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        title: "Conexão indisponível",
        detail:
          "Seus dados estão temporariamente indisponíveis. Tente novamente em instantes.",
      },
      { status: 503 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
