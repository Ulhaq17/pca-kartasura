-- CreateTable
CREATE TABLE "ProgramKerja" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "majelisLembagaId" INTEGER NOT NULL,
    "foto" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProgramKerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kegiatan" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "foto" TEXT[],
    "deskripsi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_KegiatanToProgramKerja" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KegiatanToProgramKerja_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramKerja_slug_key" ON "ProgramKerja"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Kegiatan_slug_key" ON "Kegiatan"("slug");

-- CreateIndex
CREATE INDEX "_KegiatanToProgramKerja_B_index" ON "_KegiatanToProgramKerja"("B");

-- AddForeignKey
ALTER TABLE "ProgramKerja" ADD CONSTRAINT "ProgramKerja_majelisLembagaId_fkey" FOREIGN KEY ("majelisLembagaId") REFERENCES "MajelisLembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KegiatanToProgramKerja" ADD CONSTRAINT "_KegiatanToProgramKerja_A_fkey" FOREIGN KEY ("A") REFERENCES "Kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KegiatanToProgramKerja" ADD CONSTRAINT "_KegiatanToProgramKerja_B_fkey" FOREIGN KEY ("B") REFERENCES "ProgramKerja"("id") ON DELETE CASCADE ON UPDATE CASCADE;
