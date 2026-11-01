import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";

import { authLogger } from "@norish/shared-server/logger";
import { addBasePath, APP_ROOT } from "@norish/shared/lib/base-path";

export const AUTO_LOGIN_PATH = "/auto-login";

/** The login page's flag for "auto-login was tried and failed", so it shows the form instead of looping. */
export const AUTO_LOGIN_FAILED_PARAM = "autoLoginFailed";

/**
 * The caller-supplied destination, kept to a path on this site. Anything else
 * (another origin, or a protocol-relative "//host") falls back to the app root,
 * so the endpoint cannot be used as an open redirect.
 */
export function safeCallback(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return APP_ROOT;
  }

  return value;
}

function callbackFrom(request: Request | undefined): string {
  return safeCallback(request ? new URL(request.url).searchParams.get("callbackURL") : null);
}

/**
 * Sign the configured user in without a form, for an instance nobody else can
 * reach (a homelab with no ingress). It mints an ordinary session, so every
 * check downstream — tRPC, websockets, media routes, households — runs exactly
 * as it does for a password sign-in. Without an email configured the endpoint
 * does not exist as far as callers can tell.
 */
export function autoLogin(email: string | undefined) {
  return {
    id: "norish-auto-login",
    endpoints: {
      autoLogin: createAuthEndpoint(AUTO_LOGIN_PATH, { method: "GET" }, async (ctx) => {
        if (!email) {
          throw new APIError("NOT_FOUND");
        }

        const found = await ctx.context.internalAdapter.findUserByEmail(email);

        if (!found) {
          authLogger.warn("AUTO_LOGIN_EMAIL names no existing user; showing the login form");

          throw ctx.redirect(addBasePath(`/login?${AUTO_LOGIN_FAILED_PARAM}=true`));
        }

        const session = await ctx.context.internalAdapter.createSession(found.user.id);

        await setSessionCookie(ctx, { session, user: found.user });

        throw ctx.redirect(callbackFrom(ctx.request));
      }),
    },
  } satisfies BetterAuthPlugin;
}
