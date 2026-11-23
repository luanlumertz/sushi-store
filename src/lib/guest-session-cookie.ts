import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";
import { createDemoGuestSession, getDemoGuestSessionByToken } from "@/services/guest-session";

function getGuestSessionCookieName(contextId: string): string {
    const id = z.uuid().parse(contextId);

    return `sushi-store-guest-session-${id}`;
}

export async function getCurrentDemoGuestSession(expectedContextId: string) {
    const cookieName = getGuestSessionCookieName(expectedContextId);
    const cookieStore = await cookies();

    const cookie = cookieStore.get(cookieName);

    if (!cookie) {
        return null;
    }

    return getDemoGuestSessionByToken(expectedContextId, cookie.value);
}

export async function setGuestSessionCookie(contextId: string, token: string, expiresAt: Date) {
    const cookieName = getGuestSessionCookieName(contextId);
    const cookieStore = await cookies();

    cookieStore.set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
}

export async function clearGuestSessionCookie(contextId: string) {
    const cookieName = getGuestSessionCookieName(contextId);
    const cookieStore = await cookies();

    cookieStore.delete({
        name: cookieName,
        path: "/",
    });
}

export async function getOrCreateDemoGuestSession(expectedContextId: string) {
    const currentSession = await getCurrentDemoGuestSession(expectedContextId);

    if (currentSession) {
        return currentSession;
    }

    const createdSession = await createDemoGuestSession(expectedContextId);

    await setGuestSessionCookie(
        createdSession.contextId,
        createdSession.token,
        createdSession.expiresAt,
    );

    return {
        id: createdSession.id,
        contextId: createdSession.contextId,
        expiresAt: createdSession.expiresAt,
    };
}
