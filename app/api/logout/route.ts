import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  // Clear cookie client-side; backend will also clear on its /auth/logout endpoint
  const res = NextResponse.redirect(new URL("/login", _req.url));
  res.cookies.set("access_token", "", { maxAge: 0, path: "/" });
  return res;
}


