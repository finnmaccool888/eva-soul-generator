import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookies = req.cookies.getAll();
  const authCookie = req.cookies.get("twitter_auth");
  
  return NextResponse.json({
    allCookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    authCookie: authCookie ? {
      exists: true,
      name: authCookie.name,
      valueLength: authCookie.value.length,
      parsed: (() => {
        try {
          return JSON.parse(authCookie.value);
        } catch {
          return "Failed to parse";
        }
      })()
    } : { exists: false },
    headers: Object.fromEntries(req.headers.entries()),
  });
} 