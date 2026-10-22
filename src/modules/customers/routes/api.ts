import { createRoute, group, HttpStatusCodes, jsonContent } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { destroy, index, show, store, update } from "@/modules/customers/controllers/customers.controller.js";
import {
  CreateCustomerSchema,
  CustomerIdParamsSchema,
  CustomerListResponseSchema,
  CustomerMessageSchema,
  CustomerSingleResponseSchema,
  UpdateCustomerSchema
} from "@/modules/customers/controllers/customers.schema.js";

const indexRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Customers"],
  description: "মার্চেন্টের কাস্টমার তালিকা",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CustomerListResponseSchema, "Customers list")
  }
});

const showRoute = createRoute({
  path: "/{id}",
  method: "get",
  tags: ["Customers"],
  description: "কাস্টমার বিবরণ",
  request: {
    params: CustomerIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CustomerSingleResponseSchema, "Customer item"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(CustomerMessageSchema, "Not found")
  }
});

const storeRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Customers"],
  description: "নতুন কাস্টমার তৈরি করুন",
  request: {
    body: jsonContent(CreateCustomerSchema, "Create customer payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(CustomerSingleResponseSchema, "Created")
  }
});

const updateRoute = createRoute({
  path: "/{id}",
  method: "put",
  tags: ["Customers"],
  description: "কাস্টমার তথ্য আপডেট করুন",
  request: {
    params: CustomerIdParamsSchema,
    body: jsonContent(UpdateCustomerSchema, "Update customer payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CustomerSingleResponseSchema, "Updated"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(CustomerMessageSchema, "Not found")
  }
});

const destroyRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Customers"],
  description: "কাস্টমার মুছে ফেলুন",
  request: {
    params: CustomerIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CustomerMessageSchema, "Deleted"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(CustomerMessageSchema, "Not found")
  }
});

export default group(authMiddleware)
  .api(indexRoute, index)
  .api(showRoute, show)
  .api(storeRoute, store)
  .api(updateRoute, update)
  .api(destroyRoute, destroy);
