/*
  Warnings:

  - You are about to drop the column `key` on the `Attachment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[blobName]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blobName` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "key",
ADD COLUMN     "blobName" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_blobName_key" ON "Attachment"("blobName");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
