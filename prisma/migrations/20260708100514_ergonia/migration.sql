-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'admin', 'staff');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'locked');

-- CreateEnum
CREATE TYPE "DialogueStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive', 'out_of_stock');

-- CreateEnum
CREATE TYPE "QrCodeStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('main', 'extended');

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "GuideMediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('quiz_option', 'body_part');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('primary', 'cross_sell', 'upsell');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percent', 'fixed');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('active', 'inactive', 'expired');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cod', 'vnpay', 'momo', 'zalopay', 'bank_transfer');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'shipping', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('pending', 'picked_up', 'in_transit', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255),
    "avatar_url" VARCHAR(255),
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "recipient_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address_line" VARCHAR(255) NOT NULL,
    "ward" VARCHAR(100),
    "district" VARCHAR(100),
    "province" VARCHAR(100),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mascot_characters" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "avatar_url" VARCHAR(255),
    "description" TEXT,

    CONSTRAINT "mascot_characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mascot_dialogues" (
    "id" BIGSERIAL NOT NULL,
    "mascot_id" BIGINT NOT NULL,
    "context_key" VARCHAR(100) NOT NULL,
    "emotion_state" VARCHAR(30) NOT NULL DEFAULT 'neutral',
    "dialogue_text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "DialogueStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "mascot_dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "parent_id" BIGINT,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "category_id" BIGINT,
    "short_description" VARCHAR(500),
    "description" TEXT,
    "base_price" DECIMAL(12,0) NOT NULL,
    "sale_price" DECIMAL(12,0),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "alt_text" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_thumbnail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "variant_name" VARCHAR(100) NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "price" DECIMAL(12,0),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "image_url" VARCHAR(255),

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "attribute_name" VARCHAR(100) NOT NULL,
    "attribute_value" VARCHAR(255) NOT NULL,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" BIGSERIAL NOT NULL,
    "code_value" VARCHAR(100) NOT NULL,
    "product_id" BIGINT,
    "batch_name" VARCHAR(100),
    "landing_url" VARCHAR(255) NOT NULL,
    "status" "QrCodeStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_scan_logs" (
    "id" BIGSERIAL NOT NULL,
    "qr_code_id" BIGINT NOT NULL,
    "session_token" VARCHAR(100) NOT NULL,
    "device_info" VARCHAR(255),
    "ip_address" VARCHAR(50),
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "quiz_type" "QuizType" NOT NULL DEFAULT 'main',
    "status" "QuizStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" BIGSERIAL NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "question_text" TEXT NOT NULL,
    "mascot_dialogue_id" BIGINT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "QuizStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
    "id" BIGSERIAL NOT NULL,
    "question_id" BIGINT NOT NULL,
    "option_label" VARCHAR(10),
    "option_text" VARCHAR(255) NOT NULL,
    "result_text" TEXT,
    "recommended_action" VARCHAR(255),
    "next_question_id" BIGINT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "id" BIGSERIAL NOT NULL,
    "session_token" VARCHAR(100) NOT NULL,
    "user_id" BIGINT,
    "quiz_id" BIGINT NOT NULL,
    "qr_code_id" BIGINT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_responses" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "option_id" BIGINT NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body_parts" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon_position_x" INTEGER,
    "icon_position_y" INTEGER,

    CONSTRAINT "body_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chair_types" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "chair_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pain_point_guides" (
    "id" BIGSERIAL NOT NULL,
    "body_part_id" BIGINT NOT NULL,
    "chair_type_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "guide_media_type" "GuideMediaType" NOT NULL,
    "guide_media_url" VARCHAR(255) NOT NULL,
    "instructions" TEXT,

    CONSTRAINT "pain_point_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_rules" (
    "id" BIGSERIAL NOT NULL,
    "source_type" "SourceType" NOT NULL,
    "quiz_option_id" BIGINT,
    "body_part_id" BIGINT,
    "recommended_product_id" BIGINT NOT NULL,
    "recommendation_type" "RecommendationType" NOT NULL DEFAULT 'primary',
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "recommendation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "session_token" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "variant_id" BIGINT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_at_add" DECIMAL(12,0) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "min_order_value" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "max_discount_amount" DECIMAL(12,0),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "VoucherStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGSERIAL NOT NULL,
    "order_code" VARCHAR(30) NOT NULL,
    "user_id" BIGINT,
    "quiz_session_id" BIGINT,
    "shipping_address_id" BIGINT,
    "voucher_id" BIGINT,
    "subtotal" DECIMAL(12,0) NOT NULL,
    "discount_amount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,0) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "order_status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "variant_id" BIGINT,
    "product_name_snapshot" VARCHAR(200) NOT NULL,
    "unit_price" DECIMAL(12,0) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,0) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "provider" VARCHAR(30) NOT NULL,
    "transaction_code" VARCHAR(100),
    "amount" DECIMAL(12,0) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "raw_response" JSONB,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_providers" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30) NOT NULL,

    CONSTRAINT "shipping_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "provider_id" BIGINT,
    "tracking_code" VARCHAR(100),
    "status" "ShipmentStatus" NOT NULL DEFAULT 'pending',
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "order_item_id" BIGINT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_images" (
    "id" BIGSERIAL NOT NULL,
    "review_id" BIGINT NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail_url" VARCHAR(255),
    "author_id" BIGINT,
    "status" "BlogStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_events" (
    "id" BIGSERIAL NOT NULL,
    "session_token" VARCHAR(100) NOT NULL,
    "user_id" BIGINT,
    "event_type" VARCHAR(50) NOT NULL,
    "event_data" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnel_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "mascot_dialogues_context_key_idx" ON "mascot_dialogues"("context_key");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_code_value_key" ON "qr_codes"("code_value");

-- CreateIndex
CREATE INDEX "qr_codes_code_value_idx" ON "qr_codes"("code_value");

-- CreateIndex
CREATE INDEX "qr_scan_logs_session_token_idx" ON "qr_scan_logs"("session_token");

-- CreateIndex
CREATE INDEX "quiz_sessions_session_token_idx" ON "quiz_sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "body_parts_code_key" ON "body_parts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "chair_types_code_key" ON "chair_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pain_point_guides_body_part_id_chair_type_id_product_id_key" ON "pain_point_guides"("body_part_id", "chair_type_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "orders"("order_code");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_order_code_idx" ON "orders"("order_code");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_providers_code_key" ON "shipping_providers"("code");

-- CreateIndex
CREATE INDEX "product_reviews_product_id_idx" ON "product_reviews"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "funnel_events_session_token_idx" ON "funnel_events"("session_token");

-- CreateIndex
CREATE INDEX "funnel_events_event_type_idx" ON "funnel_events"("event_type");

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mascot_dialogues" ADD CONSTRAINT "mascot_dialogues_mascot_id_fkey" FOREIGN KEY ("mascot_id") REFERENCES "mascot_characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_mascot_dialogue_id_fkey" FOREIGN KEY ("mascot_dialogue_id") REFERENCES "mascot_dialogues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_next_question_id_fkey" FOREIGN KEY ("next_question_id") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "quiz_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pain_point_guides" ADD CONSTRAINT "pain_point_guides_body_part_id_fkey" FOREIGN KEY ("body_part_id") REFERENCES "body_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pain_point_guides" ADD CONSTRAINT "pain_point_guides_chair_type_id_fkey" FOREIGN KEY ("chair_type_id") REFERENCES "chair_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pain_point_guides" ADD CONSTRAINT "pain_point_guides_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_rules" ADD CONSTRAINT "recommendation_rules_recommended_product_id_fkey" FOREIGN KEY ("recommended_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_rules" ADD CONSTRAINT "recommendation_rules_quiz_option_id_fkey" FOREIGN KEY ("quiz_option_id") REFERENCES "quiz_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_rules" ADD CONSTRAINT "recommendation_rules_body_part_id_fkey" FOREIGN KEY ("body_part_id") REFERENCES "body_parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_quiz_session_id_fkey" FOREIGN KEY ("quiz_session_id") REFERENCES "quiz_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "user_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "shipping_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_events" ADD CONSTRAINT "funnel_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
