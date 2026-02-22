// app/server/session.server.ts
import { createCookieSessionStorage, redirect } from "react-router";

const ONE_WEEK = 60 * 60 * 24 * 7;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET env var is required");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__givem_sid",
    secrets: [process.env.SESSION_SECRET],
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_WEEK,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("cookie"));
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  return typeof userId === "string" ? userId : null;
}

export async function requireUserId(
  request: Request,
  redirectTo = "/login",
): Promise<string> {
  const userId = await getUserId(request);
  if (!userId) throw redirect(redirectTo);
  return userId;
}

export async function createUserSession(
  request: Request,
  userId: string,
  redirectTo: string,
) {
  const session = await getUserSession(request);
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function destroyUserSession(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
