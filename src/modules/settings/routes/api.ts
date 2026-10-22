import { createRoute, createRouter, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requireRole } from "@/middlewares/role-middleware.js";
import {
  blockDeleteProvider,
  bulkUpdateSettings,
  createProvider,
  getPublicSettings,
  listProviders,
  listSettings,
  saveSetting,
  toggleProviderStatus,
  listCompanyOffers,
  createCompanyOffer,
  updateCompanyOffer,
  deleteCompanyOffer,
  toggleCompanyOfferStatus,
  listCustomerFees,
  createCustomerFee,
  updateCustomerFee,
  deleteCustomerFee,
  toggleCustomerFeeStatus
} from "../controllers/settings.controller.js";
import {
  BulkUpdateSettingsSchema,
  CreateProviderSchema,
  ProviderIdParamSchema,
  ProviderItemSchema,
  SettingItemSchema,
  UpdateSettingSchema,
  RuleIdParamSchema,
  CompanyOfferRuleSchema,
  CustomerFeeRuleSchema
} from "../controllers/settings.schema.js";

// ১. OpenAPI রাউট ডেফিনিশনসমূহ
const publicSettingsRoute = createRoute({
  path: "/public",
  method: "get",
  tags: ["Settings"],
  description: "Get public general settings",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(SettingItemSchema) }),
      "Public settings"
    )
  }
});

const listProvidersRoute = createRoute({
  path: "/providers",
  method: "get",
  tags: ["Settings"],
  description: "Get all financial providers (Banks and MFS)",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(ProviderItemSchema) }),
      "List of providers"
    )
  }
});

const listSettingsRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Settings"],
  description: "Get all global settings (Superadmin)",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(SettingItemSchema) }),
      "All settings"
    )
  }
});

const saveSettingRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Settings"],
  description: "Create or update a setting",
  request: {
    body: jsonContent(UpdateSettingSchema, "Setting data")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string(), data: SettingItemSchema }),
      "Setting updated"
    ),
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ message: z.string(), data: SettingItemSchema }),
      "Setting created"
    )
  }
});

const bulkUpdateSettingsRoute = createRoute({
  path: "/bulk",
  method: "post",
  tags: ["Settings"],
  description: "Bulk update settings map",
  request: {
    body: jsonContent(BulkUpdateSettingsSchema, "Settings map")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string(), data: z.array(SettingItemSchema) }),
      "Settings bulk updated"
    )
  }
});

const createProviderRoute = createRoute({
  path: "/providers",
  method: "post",
  tags: ["Settings"],
  description: "Create a new bank or MFS provider (Superadmin)",
  request: {
    body: jsonContent(CreateProviderSchema, "Provider data")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ message: z.string(), data: ProviderItemSchema }),
      "Provider created"
    )
  }
});

const toggleProviderRoute = createRoute({
  path: "/providers/{id}/toggle",
  method: "patch",
  tags: ["Settings"],
  description: "Toggle provider active/inactive status (Superadmin)",
  request: {
    params: ProviderIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string(), data: ProviderItemSchema }),
      "Provider status toggled"
    )
  }
});

const deleteProviderRoute = createRoute({
  path: "/providers/{id}",
  method: "delete",
  tags: ["Settings"],
  description: "Permanently delete provider (Strictly Forbidden Guard)",
  request: {
    params: ProviderIdParamSchema
  },
  responses: {
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      z.object({ message: z.string() }),
      "Permanent deletion is prohibited"
    )
  }
});

// ==========================================
// কোম্পানি অফার রাউটস (Company Offers)
// ==========================================

const listCompanyOffersRoute = createRoute({
  path: "/company-offers",
  method: "get",
  tags: ["Company Offers"],
  description: "Get all company offer rules for current user",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ data: z.array(z.any()) }), "Offers list")
  }
});

const createCompanyOfferRoute = createRoute({
  path: "/company-offers",
  method: "post",
  tags: ["Company Offers"],
  description: "Create company offer rule",
  request: {
    body: jsonContent(CompanyOfferRuleSchema, "Offer data")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(z.object({ message: z.string(), data: z.any() }), "Offer created")
  }
});

const updateCompanyOfferRoute = createRoute({
  path: "/company-offers/{id}",
  method: "put",
  tags: ["Company Offers"],
  description: "Update company offer rule",
  request: {
    params: RuleIdParamSchema,
    body: jsonContent(CompanyOfferRuleSchema, "Offer data")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string(), data: z.any() }), "Offer updated")
  }
});

const deleteCompanyOfferRoute = createRoute({
  path: "/company-offers/{id}",
  method: "delete",
  tags: ["Company Offers"],
  description: "Delete company offer rule",
  request: {
    params: RuleIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), "Offer deleted")
  }
});

const toggleCompanyOfferRoute = createRoute({
  path: "/company-offers/{id}/toggle",
  method: "patch",
  tags: ["Company Offers"],
  description: "Toggle company offer status",
  request: {
    params: RuleIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string(), data: z.any() }), "Offer status toggled")
  }
});

// ==========================================
// গ্রাহক সার্ভিস চার্জ পলিসি রাউটস (Customer Fees)
// ==========================================

const listCustomerFeesRoute = createRoute({
  path: "/customer-fees",
  method: "get",
  tags: ["Customer Fees"],
  description: "Get customer fee rules for current user",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ data: z.array(z.any()) }), "Fee rules list")
  }
});

const createCustomerFeeRoute = createRoute({
  path: "/customer-fees",
  method: "post",
  tags: ["Customer Fees"],
  description: "Create customer fee rule",
  request: {
    body: jsonContent(CustomerFeeRuleSchema, "Fee rule data")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(z.object({ message: z.string(), data: z.any() }), "Fee rule created")
  }
});

const updateCustomerFeeRoute = createRoute({
  path: "/customer-fees/{id}",
  method: "put",
  tags: ["Customer Fees"],
  description: "Update customer fee rule",
  request: {
    params: RuleIdParamSchema,
    body: jsonContent(CustomerFeeRuleSchema, "Fee rule data")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string(), data: z.any() }), "Fee rule updated")
  }
});

const deleteCustomerFeeRoute = createRoute({
  path: "/customer-fees/{id}",
  method: "delete",
  tags: ["Customer Fees"],
  description: "Delete customer fee rule",
  request: {
    params: RuleIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), "Fee rule deleted")
  }
});

const toggleCustomerFeeRoute = createRoute({
  path: "/customer-fees/{id}/toggle",
  method: "patch",
  tags: ["Customer Fees"],
  description: "Toggle customer fee status",
  request: {
    params: RuleIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string(), data: z.any() }), "Fee rule status toggled")
  }
});

// ২. রাউটার কনফিগারেশন
const publicRouter = createRouter()
  .api(publicSettingsRoute, getPublicSettings)
  .api(listProvidersRoute, listProviders);

const userSettingsRouter = createRouter()
  .group(authMiddleware)
  .api(listCompanyOffersRoute, listCompanyOffers)
  .api(createCompanyOfferRoute, createCompanyOffer)
  .api(updateCompanyOfferRoute, updateCompanyOffer)
  .api(deleteCompanyOfferRoute, deleteCompanyOffer)
  .api(toggleCompanyOfferRoute, toggleCompanyOfferStatus)
  .api(listCustomerFeesRoute, listCustomerFees)
  .api(createCustomerFeeRoute, createCustomerFee)
  .api(updateCustomerFeeRoute, updateCustomerFee)
  .api(deleteCustomerFeeRoute, deleteCustomerFee)
  .api(toggleCustomerFeeRoute, toggleCustomerFeeStatus);

const adminRouter = createRouter()
  .group(authMiddleware, requireRole("superadmin"))
  .api(listSettingsRoute, listSettings)
  .api(saveSettingRoute, saveSetting)
  .api(bulkUpdateSettingsRoute, bulkUpdateSettings)
  .api(createProviderRoute, createProvider)
  .api(toggleProviderRoute, toggleProviderStatus)
  .api(deleteProviderRoute, blockDeleteProvider);

export default createRouter()
  .route("/", publicRouter)
  .route("/", userSettingsRouter)
  .route("/", adminRouter);

