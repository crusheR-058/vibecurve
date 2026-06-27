import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Google sign-in (identity-backed pseudonymity — playbook Tier-1). A verified
 * human on the backend; to other users you are still only an emoji.
 *
 * The Google provider is added ONLY when its credentials are present, so the
 * app builds and runs untouched until GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 * are configured. `NEXT_PUBLIC_AUTH_ENABLED` gates the client-side UI.
 */
export const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const authOptions: NextAuthOptions = {
  providers: googleConfigured
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    // keep users inside our own calm UI rather than the default NextAuth page
    signIn: "/app",
  },
};
