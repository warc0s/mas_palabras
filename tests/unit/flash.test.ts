import { describe, expect, it } from "vitest";

import { buildFlashUrl, getFlash } from "@/lib/flash";

describe("flash helpers", () => {
  it("inyecta status y message en la url", () => {
    expect(buildFlashUrl("/quiz", "info", "Quiz iniciado")).toBe(
      "/quiz?status=info&message=Quiz+iniciado",
    );
  });

  it("lee mensajes de flash desde search params", () => {
    expect(
      getFlash({
        status: "success",
        message: "Guardado",
      }),
    ).toEqual({
      type: "success",
      message: "Guardado",
    });
  });
});
