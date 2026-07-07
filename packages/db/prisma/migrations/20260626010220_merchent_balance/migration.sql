-- CreateTable
CREATE TABLE "MerchentBalance" (
    "id" SERIAL NOT NULL,
    "merchentId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "MerchentBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchentBalance_merchentId_key" ON "MerchentBalance"("merchentId");

-- AddForeignKey
ALTER TABLE "MerchentBalance" ADD CONSTRAINT "MerchentBalance_merchentId_fkey" FOREIGN KEY ("merchentId") REFERENCES "Merchent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
