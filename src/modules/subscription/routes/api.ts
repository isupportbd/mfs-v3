import { createRouter } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requireRole } from "@/middlewares/role-middleware.js";
import {
  approveSubscription,
  createPlan,
  listPendingSubscriptions,
  listPlans,
  togglePlanStatus
} from "../controllers/subscription.controller.js";
import {
  CreatePlanSchema,
  PlanIdParamsSchema
} from "../controllers/subscription.schema.js";

const router = createRouter();

// পাবলিক বা অথেন্টিকেটেড ইউজারের জন্য প্ল্যান দেখার রুট
router.get("/", listPlans);
router.get("/plans", listPlans);

// শুধুমাত্র সুপারএডমিনের জন্য প্রোটেক্টেড রুটস
router.post(
  "/",
  authMiddleware,
  requireRole("superadmin"),
  async (c, next) => {
    const body = await c.req.json();
    const parsed = CreatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ message: "Validation error", errors: parsed.error.issues }, 422);
    }
    c.req.valid = (type: string) => (type === "json" ? parsed.data : undefined);
    return next();
  },
  createPlan
);

router.patch(
  "/:id/toggle",
  authMiddleware,
  requireRole("superadmin"),
  async (c, next) => {
    const params = c.req.param();
    const parsed = PlanIdParamsSchema.safeParse(params);
    if (!parsed.success) {
      return c.json({ message: "Invalid ID parameter" }, 422);
    }
    c.req.valid = (type: string) => (type === "param" ? parsed.data : undefined);
    return next();
  },
  togglePlanStatus
);

router.patch(
  "/plans/:id/toggle",
  authMiddleware,
  requireRole("superadmin"),
  async (c, next) => {
    const params = c.req.param();
    const parsed = PlanIdParamsSchema.safeParse(params);
    if (!parsed.success) {
      return c.json({ message: "Invalid ID parameter" }, 422);
    }
    c.req.valid = (type: string) => (type === "param" ? parsed.data : undefined);
    return next();
  },
  togglePlanStatus
);

router.get("/subscriptions/pending", authMiddleware, requireRole("superadmin"), listPendingSubscriptions);

router.post(
  "/subscriptions/:id/approve",
  authMiddleware,
  requireRole("superadmin"),
  async (c, next) => {
    const params = c.req.param();
    const parsed = PlanIdParamsSchema.safeParse(params);
    if (!parsed.success) {
      return c.json({ message: "Invalid ID parameter" }, 422);
    }
    c.req.valid = (type: string) => (type === "param" ? parsed.data : undefined);
    return next();
  },
  approveSubscription
);

export default router;
