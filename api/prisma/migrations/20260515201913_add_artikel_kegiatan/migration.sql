-- CreateTable
CREATE TABLE "ArtikelKegiatan" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "penulis" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "sampul" TEXT NOT NULL,
    "majelisLembagaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArtikelKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtikelKegiatan_slug_key" ON "ArtikelKegiatan"("slug");

-- AddForeignKey
ALTER TABLE "ArtikelKegiatan" ADD CONSTRAINT "ArtikelKegiatan_majelisLembagaId_fkey" FOREIGN KEY ("majelisLembagaId") REFERENCES "MajelisLembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
