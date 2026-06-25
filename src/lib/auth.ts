import { NextRequest, NextResponse } from "next/server";

/* ══════════════════════════════════════════════════════════════════════════
   Auth Helper — Simplified for frontend-only auth
   
   احراز هویت در فرانت‌اند انجام میشه (admin / Imaz@2026)
   این فایل فقط برای سازگاری API‌هایی هست که requireAdmin استفاده می‌کنن
   ══════════════════════════════════════════════════════════════════════════ */

const ADMIN_TOKEN = "imaz-admin-local";

/* ── Simple admin verification — always allows (frontend handles auth) ── */
export function verifyAdminRequest(_request: NextRequest): string | null {
  // Frontend-only auth: always return admin user
  return ADMIN_TOKEN;
}

/* ── Require admin auth — always passes (frontend handles auth) ── */
export function requireAdmin(
  _request: NextRequest
): { userId: string } | { error: NextResponse } {
  return { userId: ADMIN_TOKEN };
}

/* ── Compatibility stubs ── */
export async function createAdminSession(userId: string): Promise<string> {
  return userId;
}

export function setAdminCookie(_response: NextResponse, _token: string) {
  // No-op: frontend handles auth via localStorage
}

export function clearAdminCookie(_response: NextResponse) {
  // No-op
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return password === hashedPassword;
}

export function hashPassword(password: string): string {
  return password;
}

export async function ensureDefaultAdmin() {
  // No-op: frontend-only auth, no DB user needed
}
