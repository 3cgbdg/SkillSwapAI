import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("proxy", () => {
  it("allows public portfolio pages without a session", () => {
    const response = proxy(request("/portfolio/matches"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects anonymous visitors from protected pages", () => {
    const response = proxy(request("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login"
    );
  });

  it("redirects signed-in visitors away from auth pages", () => {
    const response = proxy(request("/auth/login", "access_token=session"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    );
  });
});
