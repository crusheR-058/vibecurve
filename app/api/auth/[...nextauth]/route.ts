import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// NextAuth (v4) App Router handler — serves /api/auth/* (signin, callback,
// session, csrf, providers). Google's redirect URI is:
//   {origin}/api/auth/callback/google
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
