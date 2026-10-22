import { createRoute, group, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import {
  CapitalIdParamsSchema,
  SaveCapitalSchema
} from "../controllers/capital.schema.js";
import {
  createCapitalTransaction,
  deleteCapitalTransaction,
  getCapitalList
} from "../controllers/capital.controller.js";

const getCapitalRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Capital"],
  description: "পুঁজি লেনদেন ও শেয়ারহোল্ডার অনুপাত হিসাব",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Capital transaction list and summary")
  }
});

const createCapitalRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Capital"],
  description: "নতুন পুঁজি যুক্তকরণ",
  request: {
    body: jsonContent(SaveCapitalSchema, "Create capital transaction payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(z.any(), "Created capital transaction")
  }
});

const deleteCapitalRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Capital"],
  description: "পুঁজি লেনদেন মুছে ফেলা",
  request: {
    params: CapitalIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Deleted successfully"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(z.any(), "Not found")
  }
});

export default group(authMiddleware)
  .api(getCapitalRoute, getCapitalList)
  .api(createCapitalRoute, createCapitalTransaction)
  .api(deleteCapitalRoute, deleteCapitalTransaction);
