-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "referral_code" TEXT NOT NULL,
    "referred_by_id" TEXT,
    "email_consent" INTEGER NOT NULL DEFAULT 0,
    "sms_consent" INTEGER NOT NULL DEFAULT 0,
    "reset_token" TEXT,
    "reset_token_expires" BIGINT,
    "last_purchase_at" BIGINT,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "is_default" INTEGER NOT NULL DEFAULT 0,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" TEXT,
    "scientific_name" TEXT,
    "category_id" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "base_price" DOUBLE PRECISION NOT NULL,
    "compare_price_at" DOUBLE PRECISION,
    "cost_of_goods" DOUBLE PRECISION,
    "sku" TEXT NOT NULL,
    "purity" DOUBLE PRECISION,
    "molecular_formula" TEXT,
    "cas_number" TEXT,
    "storage_instructions" TEXT,
    "cycle_length_days" INTEGER,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "is_featured" INTEGER NOT NULL DEFAULT 0,
    "is_best_seller" INTEGER NOT NULL DEFAULT 0,
    "subscription_eligible" INTEGER NOT NULL DEFAULT 1,
    "subscription_discount" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "sold_count" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "compare_at" DOUBLE PRECISION,
    "sku" TEXT NOT NULL,
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "is_default" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "compare_at" DOUBLE PRECISION NOT NULL,
    "discount_percent" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_items" (
    "id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "bundle_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "items" TEXT NOT NULL DEFAULT '[]',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_code" TEXT,
    "shipping_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "shipping_address" TEXT NOT NULL,
    "tracking_number" TEXT,
    "tracking_carrier" TEXT,
    "tracking_url" TEXT,
    "is_subscription_order" INTEGER NOT NULL DEFAULT 0,
    "loyalty_points_earned" INTEGER NOT NULL DEFAULT 0,
    "loyalty_points_used" INTEGER NOT NULL DEFAULT 0,
    "crypto_currency" TEXT,
    "crypto_amount" DOUBLE PRECISION,
    "crypto_wallet_sent_to" TEXT,
    "crypto_tx_hash" TEXT,
    "admin_notes" TEXT,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,
    "confirmed_at" BIGINT,
    "shipped_at" BIGINT,
    "delivered_at" BIGINT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "interval_days" INTEGER NOT NULL DEFAULT 30,
    "next_billing_date" BIGINT NOT NULL,
    "discount_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "paused_until" BIGINT,
    "cancel_reason" TEXT,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,
    "cancelled_at" BIGINT,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_items" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "min_order_value" DOUBLE PRECISION,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" BIGINT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "applicable_product_ids" TEXT NOT NULL DEFAULT '[]',
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "order_id" TEXT,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "is_verified" INTEGER NOT NULL DEFAULT 0,
    "is_approved" INTEGER NOT NULL DEFAULT 0,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_reports" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "lab_name" TEXT NOT NULL,
    "purity" DOUBLE PRECISION NOT NULL,
    "report_url" TEXT NOT NULL,
    "tested_at" BIGINT NOT NULL,
    "is_current" INTEGER NOT NULL DEFAULT 1,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "lab_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_sequences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sequence_type" TEXT NOT NULL,
    "reference_id" TEXT,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "last_sent_at" BIGINT,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "email_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_email" TEXT,
    "referred_user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'clicked',
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,
    "converted_at" BIGINT,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_email" TEXT,
    "cart_data" TEXT NOT NULL,
    "email_step" INTEGER NOT NULL DEFAULT 0,
    "last_updated" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,
    "recovered" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "related_products" (
    "product_id" TEXT NOT NULL,
    "related_id" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL DEFAULT 'related',

    CONSTRAINT "related_products_pkey" PRIMARY KEY ("product_id","related_id")
);

-- CreateTable
CREATE TABLE "newsletter_signups" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consent" INTEGER NOT NULL DEFAULT 1,
    "created_at" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))::bigint,

    CONSTRAINT "newsletter_signups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "variants_sku_key" ON "variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "bundles_slug_key" ON "bundles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "discount_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_signups_email_key" ON "newsletter_signups"("email");
