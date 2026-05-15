-- CreateTable
CREATE TABLE "MajelisLembaga" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "namaKetua" TEXT NOT NULL,
    "bioKetua" TEXT NOT NULL,
    "fotoKetua" TEXT,
    "sampulMajelis" TEXT,
    "videoProfil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MajelisLembaga_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MajelisLembaga_slug_key" ON "MajelisLembaga"("slug");
