-- CreateTable
CREATE TABLE "StoreSettings" (
    "contextId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Sushi Store',
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("contextId")
);

-- AddForeignKey
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "DataContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Inicializa as configurações dos contextos criados antes desta tabela.
INSERT INTO "StoreSettings" ("contextId", "updatedAt")
SELECT "id", CURRENT_TIMESTAMP
FROM "DataContext";
