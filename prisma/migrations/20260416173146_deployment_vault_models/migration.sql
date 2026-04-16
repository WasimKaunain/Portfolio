-- CreateTable
CREATE TABLE "DeploymentVaultProject" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'live',
    "productionUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeploymentVaultProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultCredential" (
    "id" TEXT NOT NULL,
    "vaultProjectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "provider" TEXT,
    "identifier" TEXT,
    "metaJson" TEXT,
    "secretEnc" TEXT,
    "secretIv" TEXT,
    "secretTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeploymentVaultProject_projectId_key" ON "DeploymentVaultProject"("projectId");

-- CreateIndex
CREATE INDEX "VaultCredential_vaultProjectId_idx" ON "VaultCredential"("vaultProjectId");

-- AddForeignKey
ALTER TABLE "DeploymentVaultProject" ADD CONSTRAINT "DeploymentVaultProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultCredential" ADD CONSTRAINT "VaultCredential_vaultProjectId_fkey" FOREIGN KEY ("vaultProjectId") REFERENCES "DeploymentVaultProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
