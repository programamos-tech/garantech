import { globalSearch } from "@/lib/actions/search";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({
      warranties: [],
      claims: [],
      customers: [],
      products: [],
    });
  }

  const results = await globalSearch(q);
  return NextResponse.json(results);
}
