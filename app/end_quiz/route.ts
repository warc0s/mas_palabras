import { NextResponse } from "next/server";

import { buildFlashUrl } from "@/lib/flash";
import { endActiveQuiz } from "@/lib/quiz";

export async function GET(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site" || fetchSite === "same-site") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const message = (await endActiveQuiz()) ?? "There was no active quiz session.";
  return NextResponse.redirect(new URL(buildFlashUrl("/quiz", "info", message), request.url));
}
