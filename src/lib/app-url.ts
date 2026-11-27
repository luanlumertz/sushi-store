import "server-only";

export function getAppUrl(requestHost?: string): string {
    const isPreview = process.env.VERCEL_ENV === "preview";
    const previewHosts = [process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL]
        .map((host) => host?.trim().toLowerCase())
        .filter((host): host is string => Boolean(host));
    const incomingHost = requestHost?.trim().toLowerCase();

    if (isPreview && incomingHost && !previewHosts.includes(incomingHost)) {
        throw new Error("O domínio da requisição não pertence a este Preview.");
    }

    const previewHost = isPreview ? incomingHost || previewHosts[0] : undefined;

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
