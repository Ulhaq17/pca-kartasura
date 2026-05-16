-- CreateTable
CREATE TABLE "PantiAsuhan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PantiAsuhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sekolah" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Sekolah_pkey" PRIMARY KEY ("id")
);
