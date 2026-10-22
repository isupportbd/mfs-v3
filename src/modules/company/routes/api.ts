import { createRoute, group, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import {
  SaveCompanyProfileSchema,
  SavePrintSettingsSchema,
  SaveReceiptSettingsSchema,
  SaveShareholderSchema,
  ShareholderIdParamsSchema
} from "../controllers/company.schema.js";
import {
  createShareholder,
  deleteShareholder,
  getCompanySettings,
  saveCompanyProfile,
  savePrintSettings,
  saveReceiptSettings,
  updateShareholder
} from "../controllers/company.controller.js";

const getSettingsRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Company"],
  description: "কোম্পানি প্রোফাইল ও শেয়ারহোল্ডারদের তথ্য",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Company settings data")
  }
});

const saveProfileRoute = createRoute({
  path: "/profile",
  method: "post",
  tags: ["Company"],
  description: "কোম্পানি প্রোফাইল সংরক্ষণ",
  request: {
    body: jsonContent(SaveCompanyProfileSchema, "Save company profile payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Saved company profile")
  }
});

const createShareholderRoute = createRoute({
  path: "/shareholders",
  method: "post",
  tags: ["Company"],
  description: "নতুন শেয়ারহোল্ডার যুক্তকরণ",
  request: {
    body: jsonContent(SaveShareholderSchema, "Create shareholder payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(z.any(), "Created shareholder")
  }
});

const updateShareholderRoute = createRoute({
  path: "/shareholders/{id}",
  method: "put",
  tags: ["Company"],
  description: "শেয়ারহোল্ডার তথ্য আপডেট",
  request: {
    params: ShareholderIdParamsSchema,
    body: jsonContent(SaveShareholderSchema, "Update shareholder payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Updated shareholder")
  }
});

const deleteShareholderRoute = createRoute({
  path: "/shareholders/{id}",
  method: "delete",
  tags: ["Company"],
  description: "শেয়ারহোল্ডার মুছে ফেলা",
  request: {
    params: ShareholderIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Deleted successfully"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(z.any(), "Not found")
  }
});

const savePrintSettingsRoute = createRoute({
  path: "/print-settings",
  method: "post",
  tags: ["Company"],
  description: "প্রিন্ট সেটিংস সংরক্ষণ",
  request: {
    body: jsonContent(SavePrintSettingsSchema, "Save print settings payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Saved print settings")
  }
});

const saveReceiptSettingsRoute = createRoute({
  path: "/receipt-settings",
  method: "post",
  tags: ["Company"],
  description: "মানি রিসিট সেটিংস সংরক্ষণ",
  request: {
    body: jsonContent(SaveReceiptSettingsSchema, "Save receipt settings payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Saved receipt settings")
  }
});

export default group(authMiddleware)
  .api(getSettingsRoute, getCompanySettings)
  .api(saveProfileRoute, saveCompanyProfile)
  .api(createShareholderRoute, createShareholder)
  .api(updateShareholderRoute, updateShareholder)
  .api(deleteShareholderRoute, deleteShareholder)
  .api(savePrintSettingsRoute, savePrintSettings)
  .api(saveReceiptSettingsRoute, saveReceiptSettings);
