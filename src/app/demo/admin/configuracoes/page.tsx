import { StoreSettingsForm } from "@/components/demo/admin/store-settings-form";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { getDemoStoreSettings } from "@/services/store-settings";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getCurrentDemoSession();

    if (!session) {
        redirect("/");
    }

    const settings = await getDemoStoreSettings();

    return (
        <main className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">Configurações da Demo</h1>

                <p className="text-sm text-muted-foreground">
                    Configurações exclusivas desta demonstração.
                </p>

                <Link href="/demo" className="inline-block text-sm underline">
                    Voltar para a Demo
                </Link>
            </header>

            <StoreSettingsForm key={settings.contextId} settings={settings} />
        </main>
    );
}
