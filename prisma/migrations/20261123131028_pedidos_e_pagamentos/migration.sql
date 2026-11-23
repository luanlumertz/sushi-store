/*
  Warnings:

  - A unique constraint covering the columns `[id,contextId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_PAYMENT', 'RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'READY_FOR_PICKUP', 'PICKED_UP', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatusChangeSource" AS ENUM ('CHECKOUT', 'STRIPE_WEBHOOK', 'CUSTOMER', 'ADMIN', 'DEMO_SIMULATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "StripeWebhookEventOutcome" AS ENUM ('PROCESSED', 'IGNORED');

-- CreateTable
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "guestSessionId" TEXT,
    "checkoutRequestId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "fulfillmentType" "FulfillmentType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 0,
    "subtotalInCents" INTEGER NOT NULL,
    "deliveryFeeInCents" INTEGER NOT NULL,
    "totalInCents" INTEGER NOT NULL,
    "storeLocationSnapshot" JSONB,
    "deliveryAddressSnapshot" JSONB,
    "deliveryDistanceInMeters" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT NOT NULL,
    "unitPriceInCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "lineTotalInCents" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountInCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'brl',
    "livemode" BOOLEAN NOT NULL DEFAULT false,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "orderVersion" INTEGER NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "source" "OrderStatusChangeSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "contextId" TEXT,
    "orderId" TEXT,
    "paymentId" TEXT,
    "outcome" "StripeWebhookEventOutcome" NOT NULL,
    "eventCreatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_tokenHash_key" ON "GuestSession"("tokenHash");

-- CreateIndex
CREATE INDEX "GuestSession_expiresAt_id_idx" ON "GuestSession"("expiresAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_id_contextId_key" ON "GuestSession"("id", "contextId");

-- CreateIndex
CREATE INDEX "Order_contextId_status_createdAt_idx" ON "Order"("contextId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_guestSessionId_contextId_createdAt_idx" ON "Order"("guestSessionId", "contextId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_contextId_key" ON "Order"("id", "contextId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_contextId_checkoutRequestId_key" ON "Order"("contextId", "checkoutRequestId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_contextId_idx" ON "OrderItem"("productId", "contextId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_productId_key" ON "OrderItem"("orderId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_contextId_status_createdAt_idx" ON "Payment"("contextId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_contextId_key" ON "Payment"("id", "contextId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_attemptNumber_key" ON "Payment"("orderId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OrderStatusHistory_orderId_orderVersion_key" ON "OrderStatusHistory"("orderId", "orderVersion");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_contextId_processedAt_idx" ON "StripeWebhookEvent"("contextId", "processedAt");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_objectId_type_livemode_idx" ON "StripeWebhookEvent"("objectId", "type", "livemode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_contextId_key" ON "Product"("id", "contextId");

-- AddForeignKey
ALTER TABLE "GuestSession" ADD CONSTRAINT "GuestSession_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "DataContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "DataContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_guestSessionId_contextId_fkey" FOREIGN KEY ("guestSessionId", "contextId") REFERENCES "GuestSession"("id", "contextId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_contextId_fkey" FOREIGN KEY ("orderId", "contextId") REFERENCES "Order"("id", "contextId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_contextId_fkey" FOREIGN KEY ("productId", "contextId") REFERENCES "Product"("id", "contextId") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_contextId_fkey" FOREIGN KEY ("orderId", "contextId") REFERENCES "Order"("id", "contextId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_contextId_fkey" FOREIGN KEY ("orderId", "contextId") REFERENCES "Order"("id", "contextId") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_amounts_check"
CHECK (
    "subtotalInCents" > 0
    AND "deliveryFeeInCents" >= 0
    AND "totalInCents"::BIGINT =
        "subtotalInCents"::BIGINT + "deliveryFeeInCents"::BIGINT
),
ADD CONSTRAINT "Order_version_check"
CHECK ("version" >= 0);

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_quantity_and_amounts_check"
CHECK (
    "quantity" > 0
    AND "unitPriceInCents" > 0
    AND "lineTotalInCents"::BIGINT =
        "unitPriceInCents"::BIGINT * "quantity"::BIGINT
);

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_amount_and_attempt_check"
CHECK (
    "amountInCents" > 0
    AND "attemptNumber" > 0
);

ALTER TABLE "OrderStatusHistory"
ADD CONSTRAINT "OrderStatusHistory_orderVersion_check"
CHECK ("orderVersion" >= 0);
