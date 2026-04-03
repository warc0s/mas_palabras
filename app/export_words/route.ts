import { NextResponse } from "next/server";

import { exportWords } from "@/lib/words";

export async function GET() {
  const payload = await exportWords();
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="palabras.json"',
    },
  });
}
