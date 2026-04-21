-- Migration: Create Invoice table and migrate Verifactu data from Order
-- This migration is idempotent - safe to run multiple times

-- Step 1: Create Invoice table if it doesn't exist
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerSnapshot" JSONB NOT NULL,
    "itemsSnapshot" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 21.00,
    "verifactuUuid" TEXT,
    "verifactuQrCode" TEXT,
    "verifactuUrl" TEXT,
    "verifactuStatus" TEXT,
    "verifactuRegisteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invoices_orderId_key" UNIQUE ("orderId"),
    CONSTRAINT "invoices_invoiceNumber_key" UNIQUE ("invoiceNumber")
);

-- Step 2: Create indexes on Invoice table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'invoices_orderId_idx') THEN
        CREATE INDEX "invoices_orderId_idx" ON "invoices"("orderId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'invoices_invoiceNumber_idx') THEN
        CREATE INDEX "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'invoices_verifactuUuid_idx') THEN
        CREATE INDEX "invoices_verifactuUuid_idx" ON "invoices"("verifactuUuid");
    END IF;
END $$;

-- Step 3: Migrate existing Verifactu data from Order to Invoice
-- Only migrate orders that have verifactuUuid and don't already have an invoice
INSERT INTO "invoices" (
    "id",
    "orderId",
    "invoiceNumber",
    "customerSnapshot",
    "itemsSnapshot",
    "subtotal",
    "taxAmount",
    "total",
    "taxRate",
    "verifactuUuid",
    "verifactuQrCode",
    "verifactuUrl",
    "verifactuStatus",
    "verifactuRegisteredAt",
    "createdAt"
)
SELECT
    gen_random_uuid()::TEXT,
    o."id",
    'F-' || EXTRACT(YEAR FROM o."createdAt")::TEXT || '-' || LPAD(EXTRACT(DOY FROM o."createdAt")::TEXT, 3, '0') || '-' || LPAD(o."id"::TEXT, 5, '0'),
    json_build_object(
        'name', COALESCE(o."guestFullName", ''),
        'email', COALESCE(o."guestEmail", ''),
        'nifCif', COALESCE(o."guestNifCif", ''),
        'address', json_build_object(
            'street', COALESCE(a."street", ''),
            'postalCode', COALESCE(a."postalCode", ''),
            'city', COALESCE(a."city", ''),
            'province', COALESCE(a."province", ''),
            'country', COALESCE(a."country", 'España')
        )
    )::JSONB,
    (SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'productId', oi."productId",
            'productName', oi."productName",
            'productPrice', oi."productPrice",
            'quantity', oi."quantity",
            'taxRate', oi."taxRate"
        )
    ) FROM "order_items" oi WHERE oi."orderId" = o."id"),
    o."subtotal",
    o."taxAmount",
    o."totalAmount",
    21.00,
    o."verifactuUuid",
    o."verifactuQrCode",
    o."verifactuUrl",
    o."verifactuStatus",
    o."verifactuRegisteredAt",
    CURRENT_TIMESTAMP
FROM "orders" o
LEFT JOIN "addresses" a ON o."shippingAddressId" = a."id"
WHERE o."verifactuUuid" IS NOT NULL
  AND o."verifactuUuid" != ''
  AND NOT EXISTS (SELECT 1 FROM "invoices" WHERE "orderId" = o."id");

-- Step 4: Remove verifactu columns from Order (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verifactuUuid') THEN
        ALTER TABLE "orders" DROP COLUMN IF EXISTS "verifactuUuid";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verifactuQrCode') THEN
        ALTER TABLE "orders" DROP COLUMN IF EXISTS "verifactuQrCode";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verifactuUrl') THEN
        ALTER TABLE "orders" DROP COLUMN IF EXISTS "verifactuUrl";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verifactuStatus') THEN
        ALTER TABLE "orders" DROP COLUMN IF EXISTS "verifactuStatus";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verifactuRegisteredAt') THEN
        ALTER TABLE "orders" DROP COLUMN IF EXISTS "verifactuRegisteredAt";
    END IF;
END $$;

-- Step 5: Clean up orphaned indexes from the old migration
DROP INDEX IF EXISTS "orders_verifactuUuid_idx";
DROP INDEX IF EXISTS "orders_verifactuStatus_idx";

COMMENT ON TABLE "invoices" IS 'Invoice records for tax compliance (Verifactu)';
