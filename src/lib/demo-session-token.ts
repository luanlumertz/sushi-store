import "server-only";

import { createHash, randomBytes } from "node:crypto";

export function generateDemoToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashDemoToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
