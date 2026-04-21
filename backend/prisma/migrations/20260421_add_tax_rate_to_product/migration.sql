-- Migration: Add taxRate field to Product model
-- This migration is idempotent - safe to run multiple times

-- Add taxRate column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'taxRate') THEN
        ALTER TABLE "products" ADD COLUMN "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 21.00;
    END IF;

    -- If column exists but doesn't have a default, set it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'taxRate') THEN
        -- Set default for existing rows
        UPDATE "products" SET "taxRate" = 21.00 WHERE "taxRate" IS NULL;
    END IF;
END $$;

-- Add index on taxRate for querying products by tax rate
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'products_taxRate_idx') THEN
        CREATE INDEX "products_taxRate_idx" ON "products"("taxRate");
    END IF;
END $$;

COMMENT ON COLUMN "products"."taxRate" IS 'Tax rate percentage (0, 4, 10, or 21)';
