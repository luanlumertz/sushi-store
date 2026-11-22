export function GeoapifyAttribution() {
    return (
        <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
                href="https://www.geoapify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
            >
                Geoapify
            </a>
            {" · © "}
            <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
            >
                OpenStreetMap contributors
            </a>
        </p>
    );
}
