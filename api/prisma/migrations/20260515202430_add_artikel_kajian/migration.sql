-- CreateTable
CREATE TABLE "ArtikelKajian" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "penulis" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "sampul" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArtikelKajian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtikelKajian_slug_key" ON "ArtikelKajian"("slug");
