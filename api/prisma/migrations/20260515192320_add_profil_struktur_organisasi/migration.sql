-- CreateTable
CREATE TABLE "ProfilStrukturOrganisasi" (
    "id" SERIAL NOT NULL,
    "foto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProfilStrukturOrganisasi_pkey" PRIMARY KEY ("id")
);
