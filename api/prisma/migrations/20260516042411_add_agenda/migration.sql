-- CreateTable
CREATE TABLE "Agenda" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "waktuMulai" TIMESTAMP(3) NOT NULL,
    "waktuSelesai" TIMESTAMP(3) NOT NULL,
    "tempat" TEXT NOT NULL,
    "majelisId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agenda_slug_key" ON "Agenda"("slug");

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_majelisId_fkey" FOREIGN KEY ("majelisId") REFERENCES "MajelisLembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
