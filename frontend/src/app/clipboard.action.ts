"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

async function getClientIpHeaders() {
  const reqHeaders = await headers();

  const clientIp =
    reqHeaders.get("x-vercel-forwarded-for") ||
    reqHeaders.get("cf-connecting-ip") ||
    (reqHeaders.get("x-forwarded-for") || "").split(",")[0] ||
    reqHeaders.get("true-client-ip") ||
    reqHeaders.get("x-real-ip") ||
    "";

  return {
    // Send ip via a custom header so Vercel's outgoing NAT proxy doesn't strip it
    "x-clep-client-ip": clientIp.trim(),
  };
}

export interface CheckCodeResult {
  available: boolean;
  suggestions: string[];
}

export interface ClipboardData {
  code: string;
  content: string;
  created_at: string;
  expires_at: string;
  isOwner?: boolean;
}

export async function checkCodeAvailability(
  code: string,
): Promise<CheckCodeResult> {
  const cleanCode = code.trim().toLowerCase();
  if (!cleanCode) return { available: false, suggestions: [] };

  try {
    const ipHeaders = await getClientIpHeaders();
    const res = await fetch(
      `${API_BASE}/check?code=${encodeURIComponent(cleanCode)}`,
      { cache: "no-store", headers: { ...ipHeaders } },
    );
    if (!res.ok) return { available: false, suggestions: [] };
    const data = await res.json();
    return { available: data.available, suggestions: data.suggestions || [] };
  } catch {
    return { available: false, suggestions: [] };
  }
}

export async function createClipboardAction(code = "") {
  const cleanCode = code.trim().toLowerCase();

  try {
    const ipHeaders = await getClientIpHeaders();
    const res = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ipHeaders },
      body: JSON.stringify({ code: cleanCode }),
      cache: "no-store",
    });

    if (res.status === 409) {
      const collisionData = await res.json();
      return {
        success: false,
        collision: true,
        suggestions: collisionData.suggestions || [],
      };
    }

    if (!res.ok) return { success: false, error: "Failed to create room." };

    const data = await res.json();

    if (data.owner_token) {
      const cookieStore = await cookies();
      cookieStore.set(`owner_${data.code}`, data.owner_token, {
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    redirect(`/${data.code}`);
  } catch (err) {
    if ((err as Error).message === "NEXT_REDIRECT") throw err;
    return { success: false, error: "Server error." };
  }
}

export async function updateClipboardAction(code: string, content: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(`owner_${code}`)?.value;

    if (!token) {
      return { success: false, error: "Unauthorized. You are not the owner." };
    }

    const ipHeaders = await getClientIpHeaders();
    const res = await fetch(`${API_BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ipHeaders },
      body: JSON.stringify({ code, content, owner_token: token }),
      cache: "no-store",
    });

    if (!res.ok) return { success: false };
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getClipboardAction(
  code: string,
): Promise<ClipboardData | null> {
  const cleanCode = code.trim().toLowerCase();

  try {
    const ipHeaders = await getClientIpHeaders();
    const res = await fetch(`${API_BASE}/clipboard/${cleanCode}`, {
      cache: "no-store",
      headers: { ...ipHeaders },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const cookieStore = await cookies();
    const isOwner = !!cookieStore.get(`owner_${cleanCode}`)?.value;

    return { ...data, isOwner };
  } catch {
    return null;
  }
}

export async function joinClipboardAction(formData: FormData) {
  const code = formData.get("code") as string;
  if (!code) return;
  redirect(`/${code.trim().toLowerCase()}`);
}

export async function getRandomCodeAction(): Promise<string> {
  try {
    const ipHeaders = await getClientIpHeaders();
    const res = await fetch(`${API_BASE}/random`, {
      cache: "no-store",
      headers: { ...ipHeaders },
    });
    if (!res.ok) throw new Error("Failed to fetch random code");
    const data = await res.json();
    return data.code;
  } catch {
    return Math.random().toString(36).substring(2, 6);
  }
}
