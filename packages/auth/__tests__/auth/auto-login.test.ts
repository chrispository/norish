// @vitest-environment node
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { describe, expect, it, vi } from "vitest";

import { autoLogin, safeCallback } from "@norish/auth/auto-login";

vi.mock("@norish/shared-server/logger", () => ({
  authLogger: { warn: vi.fn() },
}));

const ORIGIN = "http://localhost:3000";
const EMAIL = "cook@example.com";

async function createAuth(email: string | undefined) {
  const auth = betterAuth({
    baseURL: ORIGIN,
    secret: "test-secret-that-is-long-enough-for-better-auth",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    rateLimit: { enabled: false },
    plugins: [autoLogin(email)],
  });

  const ctx = await auth.$context;

  await ctx.internalAdapter.createUser({ email: EMAIL, name: "Cook", emailVerified: true });

  return auth;
}

function get(auth: Awaited<ReturnType<typeof createAuth>>, query: string) {
  return auth.handler(new Request(`${ORIGIN}/api/auth/auto-login${query}`));
}

describe("autoLogin", () => {
  it("signs the configured user in and returns to the callback", async () => {
    const auth = await createAuth(EMAIL);
    const response = await get(auth, "?callbackURL=%2Frecipes");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/recipes");
    expect(response.headers.get("set-cookie")).toContain("better-auth.session_token=");
  });

  it("sends the reader to the login form when the email names nobody", async () => {
    const auth = await createAuth("nobody@example.com");
    const response = await get(auth, "?callbackURL=%2F");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/login?autoLoginFailed=true");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("does not exist when no email is configured", async () => {
    const auth = await createAuth(undefined);
    const response = await get(auth, "");

    expect(response.status).toBe(404);
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example"])(
    "never redirects off-site, even for callback %s",
    async (callback) => {
      const auth = await createAuth(EMAIL);
      const response = await get(auth, `?callbackURL=${encodeURIComponent(callback)}`);

      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe("/");
    }
  );
});

describe("safeCallback", () => {
  it("keeps a same-site path with its query", () => {
    expect(safeCallback("/norish/recipes?tag=Thai")).toBe("/norish/recipes?tag=Thai");
  });

  it("falls back to the app root for a missing value", () => {
    expect(safeCallback(null)).toBe("/");
  });
});
