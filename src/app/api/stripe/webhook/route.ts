import Stripe from "stripe";
import { constructStripeWebhookEvent } from "@/lib/stripe-webhook";
import { processDemoCheckoutWebhook } from "@/services/stripe-webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return Response.json({ message: "Assinatura Stripe ausente." }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        const rawBody = await request.text();

        event = constructStripeWebhookEvent(rawBody, signature);
    } catch (error) {
        if (
            error instanceof Stripe.errors.StripeSignatureVerificationError ||
            error instanceof SyntaxError
        ) {
            return Response.json({ message: "Evento Stripe inválido." }, { status: 400 });
        }

        console.error("Erro ao verificar evento Stripe:", error);

        return Response.json({ message: "Não foi possível verificar o evento." }, { status: 500 });
    }

    try {
        const result = await processDemoCheckoutWebhook(event);

        return Response.json({
            received: true,
            result,
        });
    } catch (error) {
        console.error("Erro ao processar webhook Stripe:", error);

        return Response.json({ message: "Não foi possível processar o evento." }, { status: 500 });
    }
}
