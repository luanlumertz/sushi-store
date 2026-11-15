import "server-only";

import { cookies } from "next/headers";
import { getDemoSessionByToken } from "@/services/demo-session";

const DEMO_SESSION_COOKIE_NAME = "sushi-store-demo-session";

export async function getCurrentDemoSession() {
    const cookieStore = await cookies();

    const cookie = cookieStore.get(DEMO_SESSION_COOKIE_NAME);

    if (!cookie) {
        return null;
    }

    return getDemoSessionByToken(cookie.value);
}

export async function setDemoSessionCookie(token: string, expiresAt: Date) {
    const cookieStore = await cookies();

    cookieStore.set(DEMO_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
}
