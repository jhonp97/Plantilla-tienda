-- Migration: Add taxRate field to OrderItem model
-- This migration is idempotent - safe to run multiple times

-- Add taxRate column to order_items table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'taxRate') THEN
        ALTER TABLE "order_items" ADD COLUMN "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 21.00;
    END IF;

    -- If column exists but doesn't have a default, set it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'taxRate') THEN
        -- Set default for existing rows
        UPDATE "order_items" SET "taxRate" = 21.00 WHERE "taxRate" IS NULL;
    END IF;
END $$;

COMMENT ON COLUMN "order_items"."taxRate" IS 'Tax rate percentage at time of purchase (0, 4, 10, or 21)';
