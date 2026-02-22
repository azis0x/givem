import { data } from "react-router";
import { createUser, findUserByEmail, findUserById } from "./users.server";
import {
  createUserSession,
  destroyUserSession,
  getUserId,
} from "./session.server";
import { verifyPassword } from "./utils.server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!name || !email || !password) {
    return data({ error: "All fields are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return data({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (password.length < 8) {
    return data(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const userId = await createUser({ name, email, password });
  if (!userId) {
    return data({ error: "That email is already taken." }, { status: 409 });
  }

  return createUserSession(request, userId, "/home");
}

export async function login(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return data({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  // constant-time-ish: always hash even on miss
  const valid = user ? await verifyPassword(password, user.password) : false;

  if (!user || !valid) {
    return data({ error: "Invalid email or password." }, { status: 401 });
  }

  return createUserSession(request, user.id, "/home");
}

export async function logout(request: Request) {
  return destroyUserSession(request);
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;
  return findUserById(userId);
}
