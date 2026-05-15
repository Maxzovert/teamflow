import type { NextAuthConfig } from "next-auth";

const publicRoutes = ["/login", "/register"];
const authRoutes = ["/login", "/register"];

export const authConfig = {
  // Do not set `secret` here — it gets inlined at build time as undefined on Edge.
  // Auth.js reads AUTH_SECRET from the environment at runtime automatically.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isPublicRoute = publicRoutes.includes(pathname);
      const isAuthRoute = authRoutes.includes(pathname);

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (!isLoggedIn && !isPublicRoute && pathname !== "/") {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (!isLoggedIn && pathname === "/") {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isLoggedIn && pathname === "/") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.designation = user.designation;
        if (user.image) token.picture = user.image;
        if (user.name) token.name = user.name;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name as string;
        if (session.image !== undefined) token.picture = session.image as string;
        if (session.designation !== undefined) {
          token.designation = session.designation as string;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as import("@/types").UserRole;
        session.user.designation = token.designation as string | undefined;
        if (token.picture) session.user.image = token.picture as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
