-- CreateTable
CREATE TABLE "ProfilVisiMisi" (
    "id" SERIAL NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProfilVisiMisi_pkey" PRIMARY KEY ("id")
);
