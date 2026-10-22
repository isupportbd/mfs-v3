import { createRoute, createRouter, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requireRole } from "@/middlewares/role-middleware.js";
import {
  approveSubscription,
  createPlan,
  listPendingSubscriptions,
  listPlans,
  getMySubscription,
  requestSubscription
} from "../controllers/subscription.controller.js";
import {
  ApproveSubscriptionSchema,
  CreatePlanSchema,
  PlanIdParamsSchema,
  PlanItemSchema,
  RequestSubscriptionSchema
} from "../controllers/subscription.schema.js";

// ১. OpenAPI রুট ডেফিনিশন (Swagger/Scalar Docs-এর জন্য)
const listPlansRoute = createRoute({
  path: "/plans",
  method: "get",
  tags: ["Subscription"],
  description: "Get all subscription plans",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(PlanItemSchema) }),
      "List of plans"
    )
  }
});

const listPlansRootRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Subscription"],
  description: "Get all subscription plans (root alias)",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(PlanItemSchema) }),
      "List of plans"
    )
  }
});

const createPlanRoute = createRoute({
  path: "/plans",
  method: "post",
  tags: ["Subscription"],
  description: "Create a new subscription plan (Superadmin only)",
  request: {
    body: jsonContent(CreatePlanSchema, "Create Plan Payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ message: z.string(), data: PlanItemSchema }),
      "Plan created"
    )
  }
});

const createPlanRootRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Subscription"],
  description: "Create a new subscription plan (root alias)",
  request: {
    body: jsonContent(CreatePlanSchema, "Create Plan Payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ message: z.string(), data: PlanItemSchema }),
      "Plan created"
    )
  }
});

const pendingSubscriptionsRoute = createRoute({
  path: "/subscriptions/pending",
  method: "get",
  tags: ["Subscription"],
  description: "Get all pending user subscriptions for manual approval",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(z.any()) }),
      "Pending subscriptions"
    )
  }
});

const approveSubscriptionRoute = createRoute({
  path: "/subscriptions/{id}/approve",
  method: "post",
  tags: ["Subscription"],
  description: "Approve user subscription payment proof",
  request: {
    params: PlanIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string(), data: z.any() }),
      "Subscription approved"
    )
  }
});

const mySubscriptionRoute = createRoute({
  path: "/my-subscription",
  method: "get",
  tags: ["Subscription"],
  description: "Get authenticated user active subscription and history",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ data: z.any() }), "User subscription details")
  }
});

const requestSubscriptionRoute = createRoute({
  path: "/request",
  method: "post",
  tags: ["Subscription"],
  description: "Request plan upgrade or purchase with payment proof",
  request: {
    body: jsonContent(RequestSubscriptionSchema, "Subscription Request Payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ message: z.string(), data: z.any() }),
      "Subscription request submitted"
    )
  }
});

// ২. রাউটার কনফিগারেশন ও রেজিস্ট্রি
const publicRouter = createRouter()
  .api(listPlansRoute, listPlans)
  .api(listPlansRootRoute, listPlans);

const userSubscriptionRouter = createRouter()
  .group(authMiddleware)
  .api(mySubscriptionRoute, getMySubscription)
  .api(requestSubscriptionRoute, requestSubscription);

const adminRouter = createRouter()
  .group(authMiddleware, requireRole("superadmin"))
  .api(createPlanRoute, createPlan)
  .api(createPlanRootRoute, createPlan)
  .api(pendingSubscriptionsRoute, listPendingSubscriptions)
  .api(approveSubscriptionRoute, approveSubscription);

export default createRouter()
  .route("/", publicRouter)
  .route("/", userSubscriptionRouter)
  .route("/", adminRouter);
