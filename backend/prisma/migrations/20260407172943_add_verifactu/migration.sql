-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "verifactuQrCode" TEXT,
ADD COLUMN     "verifactuRegisteredAt" TIMESTAMP(3),
ADD COLUMN     "verifactuStatus" TEXT,
ADD COLUMN     "verifactuUrl" TEXT,
ADD COLUMN     "verifactuUuid" TEXT;

-- CreateTable
CREATE TABLE "verifactu_invoices" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fechaExpedicion" TEXT NOT NULL,
    "tipoFactura" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "nif" TEXT,
    "nombre" TEXT NOT NULL,
    "lineas" JSONB NOT NULL,
    "importeTotal" TEXT NOT NULL,
    "uuid" TEXT,
    "qrCode" TEXT,
    "urlVerificacion" TEXT,
    "estado" TEXT,
    "codigoError" TEXT,
    "mensajeError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifactu_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verifactu_invoices_orderId_key" ON "verifactu_invoices"("orderId");

-- CreateIndex
CREATE INDEX "verifactu_invoices_orderId_idx" ON "verifactu_invoices"("orderId");

-- CreateIndex
CREATE INDEX "verifactu_invoices_uuid_idx" ON "verifactu_invoices"("uuid");

-- CreateIndex
CREATE INDEX "verifactu_invoices_estado_idx" ON "verifactu_invoices"("estado");

-- CreateIndex
CREATE INDEX "orders_verifactuUuid_idx" ON "orders"("verifactuUuid");

-- CreateIndex
CREATE INDEX "orders_verifactuStatus_idx" ON "orders"("verifactuStatus");
