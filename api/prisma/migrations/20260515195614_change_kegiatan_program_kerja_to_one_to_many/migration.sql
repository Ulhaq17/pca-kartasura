/*
  Warnings:

  - You are about to drop the `_KegiatanToProgramKerja` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `programKerjaId` to the `Kegiatan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_KegiatanToProgramKerja" DROP CONSTRAINT "_KegiatanToProgramKerja_A_fkey";

-- DropForeignKey
ALTER TABLE "_KegiatanToProgramKerja" DROP CONSTRAINT "_KegiatanToProgramKerja_B_fkey";

-- AlterTable
ALTER TABLE "Kegiatan" ADD COLUMN     "programKerjaId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_KegiatanToProgramKerja";

-- AddForeignKey
ALTER TABLE "Kegiatan" ADD CONSTRAINT "Kegiatan_programKerjaId_fkey" FOREIGN KEY ("programKerjaId") REFERENCES "ProgramKerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
