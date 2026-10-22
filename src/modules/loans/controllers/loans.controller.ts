import { desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { loanPayments, loans } from "../database/models/loans.js";

let loanTablesEnsured = false;
async function ensureLoanTables() {
  if (loanTablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "loans" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "type" varchar(50) NOT NULL,
        "person_name" varchar(255) NOT NULL,
        "mobile" varchar(50),
        "address" text,
        "amount" numeric(15, 2) NOT NULL,
        "paid_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
        "remaining_amount" numeric(15, 2) NOT NULL,
        "payment_method" varchar(100) DEFAULT 'ক্যাশ' NOT NULL,
        "loan_date" date NOT NULL,
        "due_date" date,
        "status" varchar(50) DEFAULT 'active' NOT NULL,
        "note" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "loan_payments" (
        "id" serial PRIMARY KEY NOT NULL,
        "loan_id" integer NOT NULL REFERENCES "loans"("id") ON UPDATE cascade ON DELETE cascade,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "amount" numeric(15, 2) NOT NULL,
        "payment_date" date NOT NULL,
        "payment_method" varchar(100) DEFAULT 'ক্যাশ' NOT NULL,
        "note" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    loanTablesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure loan tables:", e);
  }
}

/**
 * ঋণ ও দেনা তালিকা এবং সারসংক্ষেপ হিসাব
 */
export const getLoansList: Handler = async (c: any) => {
  await ensureLoanTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const allLoans = await db.query.loans.findMany({
    where: eq(loans.userId, auth.id),
    orderBy: [desc(loans.id)]
  });

  const allPayments = await db.query.loanPayments.findMany({
    where: eq(loanPayments.userId, auth.id),
    orderBy: [desc(loanPayments.id)]
  });

  // সারসংক্ষেপ হিসাব
  let totalPayable = 0;      // মোট গৃহীত ঋণ (দেনা)
  let totalPayableDue = 0;   // অবশিষ্ট দেনা
  let totalReceivable = 0;   // মোট প্রদত্ত ঋণ (পাওনা)
  let totalReceivableDue = 0;// অবশিষ্ট পাওনা

  for (const l of allLoans) {
    const amt = Number(l.amount) || 0;
    const rem = Number(l.remainingAmount) || 0;
    if (l.type === "payable") {
      totalPayable += amt;
      totalPayableDue += rem;
    } else {
      totalReceivable += amt;
      totalReceivableDue += rem;
    }
  }

  return c.json(
    {
      message: "ঋণ ও দেনা ডাটা সফলভাবে পাওয়া গেছে",
      data: {
        summary: {
          totalPayable,
          totalPayableDue,
          totalReceivable,
          totalReceivableDue
        },
        loans: allLoans,
        payments: allPayments
      }
    },
    HttpStatusCodes.OK
  );
};

/**
 * নতুন ঋণ এন্ট্রি তৈরি
 */
export const createLoan: Handler = async (c: any) => {
  await ensureLoanTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const amountNum = Number(body.amount);

  const [created] = await db
    .insert(loans)
    .values({
      userId: auth.id,
      type: body.type,
      personName: body.personName.trim(),
      mobile: body.mobile ? body.mobile.trim() : null,
      address: body.address ? body.address.trim() : null,
      amount: String(amountNum.toFixed(2)),
      paidAmount: "0.00",
      remainingAmount: String(amountNum.toFixed(2)),
      paymentMethod: body.paymentMethod || "ক্যাশ",
      loanDate: body.loanDate,
      dueDate: body.dueDate || null,
      status: "active",
      note: body.note ? body.note.trim() : null
    })
    .returning();

  return c.json(
    {
      message: "ঋণ রেকর্ড সফলভাবে সংরক্ষণ করা হয়েছে",
      data: created
    },
    HttpStatusCodes.CREATED
  );
};

/**
 * ঋণের কিস্তি বা আংশিক পরিশোধ এন্ট্রি গ্রহণ
 */
export const recordPayment: Handler = async (c: any) => {
  await ensureLoanTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const payAmount = Number(body.amount);

  const loan = await db.query.loans.findFirst({
    where: eq(loans.id, Number(id))
  });

  if (!loan || loan.userId !== auth.id) {
    return c.json({ message: "ঋণের রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const currentRemaining = Number(loan.remainingAmount) || 0;
  if (payAmount > currentRemaining) {
    return c.json(
      { message: `পরিশোধের অংক অবশিষ্ট বকেয়া ৳${currentRemaining}-এর চেয়ে বেশি হতে পারে না` },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  // পেমেন্ট রেকর্ড ইনসার্ট
  const [paymentRecord] = await db
    .insert(loanPayments)
    .values({
      loanId: loan.id,
      userId: auth.id,
      amount: String(payAmount.toFixed(2)),
      paymentDate: body.paymentDate,
      paymentMethod: body.paymentMethod || "ক্যাশ",
      note: body.note ? body.note.trim() : null
    })
    .returning();

  const newPaid = (Number(loan.paidAmount) || 0) + payAmount;
  const newRemaining = Math.max(0, currentRemaining - payAmount);
  const newStatus = newRemaining === 0 ? "paid" : "active";

  // ঋণ টেবিল আপডেট
  const [updatedLoan] = await db
    .update(loans)
    .set({
      paidAmount: String(newPaid.toFixed(2)),
      remainingAmount: String(newRemaining.toFixed(2)),
      status: newStatus,
      updatedAt: new Date()
    })
    .where(eq(loans.id, loan.id))
    .returning();

  return c.json(
    {
      message: "পরিশোধ সফলভাবে রেকর্ড করা হয়েছে",
      data: {
        payment: paymentRecord,
        loan: updatedLoan
      }
    },
    HttpStatusCodes.OK
  );
};

/**
 * ঋণ রেকর্ড মুছে ফেলা
 */
export const deleteLoan: Handler = async (c: any) => {
  await ensureLoanTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const { id } = c.req.valid("param");
  const loan = await db.query.loans.findFirst({
    where: eq(loans.id, Number(id))
  });

  if (!loan || loan.userId !== auth.id) {
    return c.json({ message: "ঋণের রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  await db.delete(loans).where(eq(loans.id, loan.id));

  return c.json(
    { message: "ঋণ রেকর্ড সফলভাবে মুছে ফেলা হয়েছে" },
    HttpStatusCodes.OK
  );
};
