import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthed = !!req.auth;
  const isSignIn = req.nextUrl.pathname === "/signin";
  const isApi = req.nextUrl.pathname.startsWith("/api/auth");

  if (!isAuthed && !isSignIn && !isApi) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  if (isAuthed && isSignIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icon).*)"],
};
