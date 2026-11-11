-- CreateEnum
CREATE TYPE "ContextType" AS ENUM ('STORE', 'DEMO');

-- CreateTable
CREATE TABLE "DataContext" (
    "id" TEXT NOT NULL,
    "type" "ContextType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "contextType" "ContextType" NOT NULL DEFAULT 'DEMO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataContext_id_type_key" ON "DataContext"("id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DemoSession_tokenHash_key" ON "DemoSession"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "DemoSession_contextId_contextType_key" ON "DemoSession"("contextId", "contextType");

-- AddForeignKey
ALTER TABLE "DemoSession" ADD CONSTRAINT "DemoSession_contextId_contextType_fkey" FOREIGN KEY ("contextId", "contextType") REFERENCES "DataContext"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Uma sessao demonstrativa so pode referenciar contextos DEMO
ALTER TABLE "DemoSession"
ADD CONSTRAINT "DemoSession_contextType_demo_check"
CHECK ("contextType" = 'DEMO');

-- Permite no maximo um contexto oficial da Loja
CREATE UNIQUE INDEX "DataContext_single_store_key"
ON "DataContext" ("type")
WHERE "type" = 'STORE';
