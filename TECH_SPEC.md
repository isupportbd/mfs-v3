# Project Technology Stack Specification

## 1. ফিক্সড কোর রানটাইম ও ডাটাবেজ (Fixed Requirements)
- **Runtime:** Node.js (Version >= 20 LTS)
- **Database:** PostgreSQL (`pg` / `postgres` driver)
- **Connection URL Pattern:** `postgres://username:password@host:port/database`

---

## 2. ফ্রেমওয়ার্ক টেকনোলজি স্ট্যাক (Framework Built-in)

| লেয়ার | টেকনোলজি |
| :--- | :--- |
| **Backend Runtime** | Node.js |
| **Backend Framework** | Hono.js (`@hono/node-server`) |
| **Database** | PostgreSQL |
| **Database ORM** | Drizzle ORM (`drizzle-orm`, `drizzle-kit`) |
| **PostgreSQL Driver** | `postgres` |
| **Frontend Framework** | Vue 3 (Composition API) + Vite |
| **State Management** | Pinia |
| **UI / Styling** | Bootstrap 5 + SCSS |
| **Validation** | Zod (`zod`, `@hono/zod-openapi`) |

---

## 3. এনভায়রনমেন্ট ফাইল রিকোয়ারমেন্ট (.env)
```env
APP_ENV=development
APP_NAME=mfs-ledger
APP_PORT=3000

# ফিক্সড PostgreSQL কানেকশন (Default Credentials)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mfs_ledger
```
