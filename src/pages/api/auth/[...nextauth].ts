import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { env } from "../../../lib/env";

declare module "next-auth" {
  interface Session {
    isOwner: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isOwner?: boolean;
  }
}

// Owner-only access by email allowlist
function isOwner(email?: string | null) {
  if (!email) return false;
  if (!env.OWNER_EMAIL) return false;
  return email.toLowerCase() === env.OWNER_EMAIL.toLowerCase();
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID ?? "",
      clientSecret: env.GITHUB_SECRET ?? "",
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      return isOwner(user.email);
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      token.isOwner = isOwner((token.email as string | undefined) ?? null);
      return token;
    },
    async session({ session, token }) {
      session.isOwner = Boolean(token.isOwner);
      return session;
    },
  },
  pages: {
    signIn: "/private-admin/signin",
  },
};

export default NextAuth(authOptions);
