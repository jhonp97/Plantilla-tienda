-- Migration: Add Fase 2 models (PasswordResetToken, Coupon, Review, GoogleMapReview)
-- This migration is idempotent - safe to run multiple times

-- Step 1: Create DiscountType enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountType') THEN
        CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');
    END IF;
END $$;

-- Step 2: Create PasswordResetToken table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create Coupon table
CREATE TABLE IF NOT EXISTS "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "minOrderAmount" INTEGER,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "coupons_code_key" UNIQUE ("code")
);

-- Step 4: Create Review table
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Step 5: Create GoogleMapReview table
CREATE TABLE IF NOT EXISTS "google_map_reviews" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "google_map_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "google_map_reviews_placeId_authorName_reviewDate_key" UNIQUE ("placeId", "authorName", "reviewDate")
);

-- Step 6: Create unique constraint on password_reset_tokens (email, tokenHash)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'password_reset_tokens_email_tokenHash_key') THEN
        CREATE UNIQUE INDEX "password_reset_tokens_email_tokenHash_key" ON "password_reset_tokens"("email", "tokenHash");
    END IF;
END $$;

-- Step 7: Create indexes for PasswordResetToken
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'password_reset_tokens_tokenHash_idx') THEN
        CREATE INDEX "password_reset_tokens_tokenHash_idx" ON "password_reset_tokens"("tokenHash");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'password_reset_tokens_email_idx') THEN
        CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");
    END IF;
END $$;

-- Step 8: Create indexes for Coupon
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'coupons_code_idx') THEN
        CREATE INDEX "coupons_code_idx" ON "coupons"("code");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'coupons_isActive_idx') THEN
        CREATE INDEX "coupons_isActive_idx" ON "coupons"("isActive");
    END IF;
END $$;

-- Step 9: Create indexes for Review
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'reviews_productId_idx') THEN
        CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'reviews_userId_idx') THEN
        CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");
    END IF;
END $$;

-- Step 10: Create index for GoogleMapReview
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'google_map_reviews_placeId_idx') THEN
        CREATE INDEX "google_map_reviews_placeId_idx" ON "google_map_reviews"("placeId");
    END IF;
END $$;

-- Step 11: Add couponCode and discountAmount to orders table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'couponCode'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "couponCode" TEXT;
        ALTER TABLE "orders" ADD COLUMN "discountAmount" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

COMMENT ON TABLE "password_reset_tokens" IS 'Password reset tokens with bcrypt hash';
COMMENT ON TABLE "coupons" IS 'Discount coupons for the e-commerce';
COMMENT ON TABLE "reviews" IS 'Product reviews from customers';
COMMENT ON TABLE "google_map_reviews" IS 'Cached Google Maps reviews';
