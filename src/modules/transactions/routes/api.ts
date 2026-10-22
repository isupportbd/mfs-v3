import { createRoute, group, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import {
  CreateTransactionSchema,
  TransactionIdParamsSchema
} from "../controllers/transactions.schema.js";
import {
  createTransaction,
  deleteTransaction,
  getTransactionList
} from "../controllers/transactions.controller.js";

const getTransactionsRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Transactions"],
  description: "লেনদেন তালিকা ও সারসংক্ষেপ",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Transactions list and summary")
  }
});

const createTransactionRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Transactions"],
  description: "নতুন লেনদেন এন্ট্রি (ক্যাশ ইন, ক্যাশ আউট, পে-বিল, ট্রান্সফার)",
  request: {
    body: jsonContent(CreateTransactionSchema, "Create transaction payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(z.any(), "Created transaction")
  }
});

const deleteTransactionRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Transactions"],
  description: "লেনদেন মুছে ফেলা",
  request: {
    params: TransactionIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Deleted successfully"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(z.any(), "Not found")
  }
});

export default group(authMiddleware)
  .api(getTransactionsRoute, getTransactionList)
  .api(createTransactionRoute, createTransaction)
  .api(deleteTransactionRoute, deleteTransaction);
