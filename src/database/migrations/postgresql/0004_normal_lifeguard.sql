CREATE TABLE "capital_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"shareholder_id" integer NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"deposit_date" date NOT NULL,
	"payment_method" varchar(100) DEFAULT 'ক্যাশ' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"business_type" varchar(100) DEFAULT 'একক মালিকানা' NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"address" text,
	"trade_license" varchar(100),
	"tin_bin" varchar(100),
	"established_date" date,
	"printer_layout" varchar(50) DEFAULT 'pos',
	"print_header_show" varchar(10) DEFAULT 'yes',
	"receipt_prefix" varchar(50) DEFAULT 'MR-',
	"receipt_footer_note" text DEFAULT 'আমাদের সাথে লেনদেন করার জন্য ধন্যবাদ!',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "shareholders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"mobile" varchar(50),
	"share_percentage" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"role" varchar(100) DEFAULT 'শেয়ারহোল্ডার' NOT NULL,
	"nid" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"mobile" varchar(50) NOT NULL,
	"type" varchar(50) DEFAULT 'সাধারণ' NOT NULL,
	"organization_name" varchar(255),
	"address" text,
	"note" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider_id" integer,
	"provider_name" varchar(100) NOT NULL,
	"account_type" varchar(50) NOT NULL,
	"account_number" varchar(100) NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"note" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_offer_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider_id" integer,
	"title" varchar(150) NOT NULL,
	"transaction_type" varchar(50) DEFAULT 'সকল' NOT NULL,
	"trigger_type" varchar(50) DEFAULT 'target_amount' NOT NULL,
	"target_threshold" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"reward_type" varchar(50) DEFAULT 'percentage' NOT NULL,
	"reward_value" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"settlement_type" varchar(50) DEFAULT 'monthly' NOT NULL,
	"start_date" date,
	"end_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_fee_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"transaction_type" varchar(50) DEFAULT 'পে-বিল' NOT NULL,
	"biller_name" varchar(100),
	"fee_type" varchar(50) DEFAULT 'flat' NOT NULL,
	"flat_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"percentage_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"slabs_json" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"group" varchar(50) DEFAULT 'general' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"transfer_subtype" varchar(100),
	"customer_id" integer,
	"customer_mobile" varchar(50),
	"from_provider_id" integer,
	"to_provider_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"commission" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"other_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"net_amount" numeric(15, 2) NOT NULL,
	"tr_number" varchar(100),
	"biller_name" varchar(100),
	"bill_account_number" varchar(100),
	"status" varchar(50) DEFAULT 'সফল' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_transactions" integer;--> statement-breakpoint
ALTER TABLE "capital_transactions" ADD CONSTRAINT "capital_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "capital_transactions" ADD CONSTRAINT "capital_transactions_shareholder_id_shareholders_id_fk" FOREIGN KEY ("shareholder_id") REFERENCES "public"."shareholders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shareholders" ADD CONSTRAINT "shareholders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "merchant_providers" ADD CONSTRAINT "merchant_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "merchant_providers" ADD CONSTRAINT "merchant_providers_provider_id_financial_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."financial_providers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "company_offer_rules" ADD CONSTRAINT "company_offer_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "company_offer_rules" ADD CONSTRAINT "company_offer_rules_provider_id_merchant_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."merchant_providers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customer_fee_rules" ADD CONSTRAINT "customer_fee_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_provider_id_merchant_providers_id_fk" FOREIGN KEY ("from_provider_id") REFERENCES "public"."merchant_providers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_provider_id_merchant_providers_id_fk" FOREIGN KEY ("to_provider_id") REFERENCES "public"."merchant_providers"("id") ON DELETE set null ON UPDATE cascade;