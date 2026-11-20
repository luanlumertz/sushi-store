-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "deliveryBaseFeeInCents" INTEGER NOT NULL DEFAULT 600,
ADD COLUMN     "deliveryExtraFeePerKmInCents" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "deliveryIncludedDistanceInMeters" INTEGER NOT NULL DEFAULT 3000,
ADD COLUMN     "deliveryMaxDistanceInMeters" INTEGER NOT NULL DEFAULT 10000;

-- CreateTable
CREATE TABLE "StoreLocation" (
    "contextId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "formattedAddress" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreLocation_pkey" PRIMARY KEY ("contextId")
);

-- AddForeignKey
ALTER TABLE "StoreLocation" ADD CONSTRAINT "StoreLocation_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "StoreSettings"("contextId") ON DELETE CASCADE ON UPDATE CASCADE;
