import { NextRequest, NextResponse } from "next/server";

const upstream = process.env.LEGACY_GIFTS_API || "https://lista-presentes-novo-lar.suportepradoferragen.chatgpt.site/api/gifts";

async function proxy(method: "GET" | "POST", request?: NextRequest) {
  try {
    const init: RequestInit = {
      method,
      cache: "no-store",
      headers: { "content-type": "application/json" },
    };
    if (method === "POST" && request) init.body = await request.text();

    const response = await fetch(upstream, init);
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível acessar a lista de presentes agora." },
      { status: 502 },
    );
  }
}

export async function GET() {
  return proxy("GET");
}

export async function POST(request: NextRequest) {
  return proxy("POST", request);
}
