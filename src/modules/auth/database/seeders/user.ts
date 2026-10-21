import { eq } from "drizzle-orm";
import { db, password } from "@/framework/facade.js";
import { roles } from "@/modules/auth/database/models/role.js";
import { users } from "@/modules/auth/database/models/user.js";

export const table = users;

export default async function UserSeeder() {
  const superAdminRole = await db.query.roles.findFirst({ where: eq(roles.name, "superadmin") });
  const adminRole = await db.query.roles.findFirst({ where: eq(roles.name, "admin") });
  const userRole = await db.query.roles.findFirst({ where: eq(roles.name, "user") });

  const superAdminEmail = process.env.SUPERADMIN_EMAIL || "isupportbd.info@gmail.com";
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "Expw.17@";
  const superAdminName = process.env.SUPERADMIN_NAME || "Super Admin";

  // নিশ্চিত করা যে সর্বোচ্চ ১টি সুপারএডমিন থাকবে
  if (superAdminRole) {
    const existingSuperAdmin = await db.query.users.findFirst({
      where: eq(users.roleId, superAdminRole.id)
    });

    if (!existingSuperAdmin) {
      await db.insert(users).values({
        name: superAdminName,
        email: superAdminEmail,
        password: await password.hashPassword(superAdminPassword),
        roleId: superAdminRole.id
      });
      console.log(`Superadmin created: ${superAdminEmail}`);
    } else {
      console.log("Superadmin already exists (Max 1 allowed). Skipping creation.");
    }
  }

  console.log("User seeder completed");
}
