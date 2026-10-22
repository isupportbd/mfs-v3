import { createRoute, group, HttpStatusCodes, jsonContent } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { destroy, index, show, store, update } from "@/modules/providers/controllers/providers.controller.js";
import {
  CreateProviderSchema,
  ProviderIdParamsSchema,
  ProviderListResponseSchema,
  ProviderMessageSchema,
  ProviderSingleResponseSchema,
  UpdateProviderSchema
} from "@/modules/providers/controllers/providers.schema.js";

const indexRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Providers"],
  description: "মার্চেন্টের প্রোভাইডার তালিকা",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ProviderListResponseSchema, "Providers list")
  }
});

const showRoute = createRoute({
  path: "/{id}",
  method: "get",
  tags: ["Providers"],
  description: "প্রোভাইডার বিবরণ",
  request: {
    params: ProviderIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ProviderSingleResponseSchema, "Provider item"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ProviderMessageSchema, "Not found")
  }
});

const storeRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Providers"],
  description: "নতুন প্রোভাইডার তৈরি করুন",
  request: {
    body: jsonContent(CreateProviderSchema, "Create provider payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(ProviderSingleResponseSchema, "Created")
  }
});

const updateRoute = createRoute({
  path: "/{id}",
  method: "put",
  tags: ["Providers"],
  description: "প্রোভাইডার তথ্য আপডেট করুন",
  request: {
    params: ProviderIdParamsSchema,
    body: jsonContent(UpdateProviderSchema, "Update provider payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ProviderSingleResponseSchema, "Updated"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ProviderMessageSchema, "Not found")
  }
});

const destroyRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Providers"],
  description: "প্রোভাইডার মুছে ফেলুন",
  request: {
    params: ProviderIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ProviderMessageSchema, "Deleted"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ProviderMessageSchema, "Not found")
  }
});

export default group(authMiddleware)
  .api(indexRoute, index)
  .api(showRoute, show)
  .api(storeRoute, store)
  .api(updateRoute, update)
  .api(destroyRoute, destroy);
