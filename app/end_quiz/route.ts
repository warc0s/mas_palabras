import { NextResponse } from "next/server";

import { buildFlashUrl } from "@/lib/flash";
import { endActiveQuiz } from "@/lib/quiz";

export async function GET(request: Request) {
  const message = (await endActiveQuiz()) ?? "No había sesión de quiz activa.";
  return NextResponse.redirect(new URL(buildFlashUrl("/quiz", "info", message), request.url));
}
