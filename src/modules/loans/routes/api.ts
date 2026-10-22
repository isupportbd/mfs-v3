import { createRoute, group, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import {
  CreateLoanSchema,
  LoanIdParamsSchema,
  RecordPaymentSchema
} from "../controllers/loans.schema.js";
import {
  createLoan,
  deleteLoan,
  getLoansList,
  recordPayment
} from "../controllers/loans.controller.js";

const getLoansRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Loans"],
  description: "ঋণ ও দেনা তালিকা এবং সারসংক্ষেপ হিসাব",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Loans and payments summary")
  }
});

const createLoanRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Loans"],
  description: "নতুন ঋণ এন্ট্রি যুক্তকরণ",
  request: {
    body: jsonContent(CreateLoanSchema, "Create loan payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(z.any(), "Created loan")
  }
});

const recordPaymentRoute = createRoute({
  path: "/{id}/pay",
  method: "post",
  tags: ["Loans"],
  description: "ঋণের কিস্তি বা আংশিক পরিশোধ গ্রহণ",
  request: {
    params: LoanIdParamsSchema,
    body: jsonContent(RecordPaymentSchema, "Payment payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Payment recorded"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(z.any(), "Invalid amount"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(z.any(), "Not found")
  }
});

const deleteLoanRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Loans"],
  description: "ঋণ রেকর্ড মুছে ফেলা",
  request: {
    params: LoanIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Deleted successfully"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(z.any(), "Not found")
  }
});

export default group(authMiddleware)
  .api(getLoansRoute, getLoansList)
  .api(createLoanRoute, createLoan)
  .api(recordPaymentRoute, recordPayment)
  .api(deleteLoanRoute, deleteLoan);
