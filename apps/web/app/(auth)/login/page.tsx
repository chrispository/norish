import { redirect } from "next/navigation";

import { AUTO_LOGIN_FAILED_PARAM, AUTO_LOGIN_PATH } from "@norish/auth/auto-login";
import { getAvailableProviders } from "@norish/auth/providers";
import { SERVER_CONFIG } from "@norish/config/env-config-server";
import { isRegistrationEnabled } from "@norish/shared-server/config/server-config-loader";
import { APP_ROOT } from "@norish/shared/lib/base-path";

import { LoginClient } from "./components/login-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [providers, registrationEnabled] = await Promise.all([
    getAvailableProviders(),
    isRegistrationEnabled(),
  ]);

  const params = await searchParams;
  const { callbackUrl, logout } = params;
  const justLoggedOut = logout === "true";
  // A repeated parameter arrives as a list; only a single one is a destination.
  const destination = typeof callbackUrl === "string" ? callbackUrl : APP_ROOT;

  // With AUTO_LOGIN_EMAIL set there is no form to fill in. Logging out still
  // lands on the form, so another account stays reachable.
  if (
    SERVER_CONFIG.AUTO_LOGIN_EMAIL &&
    !justLoggedOut &&
    params[AUTO_LOGIN_FAILED_PARAM] !== "true"
  ) {
    redirect(`/api/auth${AUTO_LOGIN_PATH}?${new URLSearchParams({ callbackURL: destination })}`);
  }

  // Only auto-redirect for single OAuth provider
  const oauthProviders = providers.filter((p) => p.type === "oauth");
  const hasCredential = providers.some((p) => p.type === "credential");
  const shouldAutoRedirect = oauthProviders.length === 1 && !hasCredential && !justLoggedOut;

  return (
    <LoginClient
      autoRedirect={shouldAutoRedirect}
      callbackUrl={destination}
      providers={providers}
      registrationEnabled={registrationEnabled}
    />
  );
}
