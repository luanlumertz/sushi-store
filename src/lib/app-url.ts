import "server-only";

export function getAppUrl(): string {
    const previewHost =
        process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_BRANCH_URL?.trim() : undefined;

    const configuredUrl = previewHost ? `https://${previewHost}` : process.env.APP_URL?.trim();

    if (!configuredUrl) {
        throw new Error("APP_URL não configurada.");
    }

    const url = new URL(configuredUrl);

    if (
        (url.protocol !== "http:" && url.protocol !== "https:") ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
    ) {
        throw new Error("APP_URL deve conter apenas o domínio e a porta, quando necessária.");
    }

    return url.origin;
}
