// design-sync shim for `next-auth/react` — previews have no auth backend.
// useSession returns an unauthenticated session (no throw), sign in/out are
// no-ops, SessionProvider is a passthrough. Matches the app's default state
// (AUTH disabled), so AuthButton/Login render their signed-out branch.
import * as React from "react";

export function useSession() {
  return { data: null, status: "unauthenticated" as const, update: async () => null };
}

export async function signIn() {
  return undefined;
}

export async function signOut() {
  return undefined;
}

export function SessionProvider({ children }: { children?: React.ReactNode }) {
  return children as React.ReactElement;
}

export function getSession() {
  return Promise.resolve(null);
}
