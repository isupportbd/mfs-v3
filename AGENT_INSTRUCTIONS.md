# Instructions for Agent: Project Setup & Initialization

## 📌 Context & Objective
এই প্রজেক্টটি একটি **MFS ও Bank Ledger System**। 
আপনার কাজ হলো [TECH_SPEC.md](file:///d:/LARAGON/www/MFS%20Ledger/TECH_SPEC.md) ফাইলে উল্লেখিত নির্দিষ্ট টেকনোলজি স্ট্যাক অনুযায়ী প্রজেক্টটি কনফিগার ও ইনিশিয়ালাইজ করা।

---

## 🛠️ Mandatory Technical Stack
- **Runtime:** Node.js (v20+ LTS)
- **Database:** PostgreSQL (`pg` / `postgres`)
- **Backend Framework:** Hono.js (`@hono/node-server`)
- **ORM / Migrations:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`) with PostgreSQL dialect
- **Frontend Framework:** Vue 3 + Vite + Pinia + Bootstrap 5

---

## 📋 Action Items for Setup

### 1. Database Configuration (.env)
- `.env` ফাইলে `DATABASE_URL` চেক করুন এবং নিশ্চিত করুন এটি PostgreSQL ফরম্যাটে রয়েছে:
  ```env
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/mfs_ledger
  ```
- ডাটাবেজ ডায়ালেকটি যেন `postgresql` হিসেবে হ্যান্ডেল হয়।

### 2. Drizzle ORM Configuration
- [drizzle.config.ts](file:///d:/LARAGON/www/MFS%20Ledger/drizzle.config.ts) নিশ্চিত করুন `postgres` ডায়ালেকট সঠিকভাবে ডিটেক্ট ও কনফিগার করছে:
  - আউটপুট মাইগ্রেশন ফোল্ডার: `./src/database/migrations/postgresql`
  - স্কিমা পাথ: `./src/database/schema.ts`

### 3. Verify Dependencies
- নিশ্চিত করুন `postgres` ড্রাইভার ইনস্টল আছে (প্রজেক্টে ইতিমধ্যে `postgres: ^3.4.9` ও `drizzle-orm` উপস্থিত রয়েছে)।

### 4. Database Migration & Health Check
- PostgreSQL কানেকশন স্ট্যাবল রেখে মাইগ্রেশন জেনারেট ও রান করার কমান্ড প্রস্তুত করুন:
  ```bash
  npm run maker db:generate
  # অথবা drizzle-kit generate / push
  ```

### 5. Application Launch Validation
- প্রজেক্টটি বিল্ড ও রান করার উপযুক্ত কিনা তা যাচাই করুন:
  ```bash
  npm run build
  npm run dev
  ```
