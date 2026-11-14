"use server";

import { getCurrentDemoSession, setDemoSessionCookie } from "@/lib/demo-session-cookie";
import { createDemoSession } from "@/services/demo-session";
import { redirect } from "next/navigation";

const DEMO_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

export async function startDemoSession(): Promise<void> {
    const currentDemoSession = await getCurrentDemoSession();

    if (!currentDemoSession) {
        const expiresAt = new Date(Date.now() + DEMO_SESSION_DURATION_MS);

        const createdDemoSession = await createDemoSession(expiresAt);

        await setDemoSessionCookie(createdDemoSession.token, createdDemoSession.expiresAt);
    }

    redirect("/demo");
}
