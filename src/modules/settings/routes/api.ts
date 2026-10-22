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
  toggleProviderStatus
} from "../controllers/settings.controller.js";
import {
  BulkUpdateSettingsSchema,
  CreateProviderSchema,
  ProviderIdParamSchema,
  ProviderItemSchema,
  SettingItemSchema,
  UpdateSettingSchema
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

// ২. রাউটার কনফিগারেশন
const publicRouter = createRouter()
  .api(publicSettingsRoute, getPublicSettings)
  .api(listProvidersRoute, listProviders);

const protectedRouter = createRouter()
  .group(authMiddleware, requireRole("superadmin"))
  .api(listSettingsRoute, listSettings)
  .api(saveSettingRoute, saveSetting)
  .api(bulkUpdateSettingsRoute, bulkUpdateSettings)
  .api(createProviderRoute, createProvider)
  .api(toggleProviderRoute, toggleProviderStatus)
  .api(deleteProviderRoute, blockDeleteProvider);

export default createRouter().route("/", publicRouter).route("/", protectedRouter);

