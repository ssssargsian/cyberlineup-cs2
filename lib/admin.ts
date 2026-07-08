import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const COOKIE_NAME = "cs2-lineups-admin";

function getCookieValue() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return null;
  }

  return Buffer.from(`${password}:authorized`).toString("base64");
}

export function isAdminAuthenticated() {
  const expected = getCookieValue();

  if (!expected) {
    return false;
  }

  return cookies().get(COOKIE_NAME)?.value === expected;
}

export function requireAdmin() {
  if (!isAdminAuthenticated()) {
    redirect("/admin");
  }
}

export function setAdminSession() {
  const value = getCookieValue();

  if (!value) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME);
}

export function isAdminCookieValid() {
  const expected = getCookieValue();

  if (!expected) {
    return false;
  }

  return cookies().get(COOKIE_NAME)?.value === expected;
}

export function ensureAdminApiAccess() {
  if (!isAdminCookieValid()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
