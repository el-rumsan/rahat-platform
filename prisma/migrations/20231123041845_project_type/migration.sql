/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `tbl_beneficiaries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `tbl_vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "phone" SET DEFAULT '';

-- AlterTable
ALTER TABLE "tbl_vendors" ALTER COLUMN "phone" SET DEFAULT '';

-- CreateTable
CREATE TABLE "tbl_project_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_project_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_project_types_name_key" ON "tbl_project_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_phone_key" ON "tbl_beneficiaries"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_vendors_phone_key" ON "tbl_vendors"("phone");

-- AddForeignKey
ALTER TABLE "tbl_projects" ADD CONSTRAINT "tbl_projects_projectType_fkey" FOREIGN KEY ("projectType") REFERENCES "tbl_project_types"("name") ON DELETE SET NULL ON UPDATE CASCADE;
