import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import bcrypt from "bcryptjs";
import { config } from "../config";
import { UserDTO } from "../../../shared/types";
import { canonicalRoles } from "../validators";

// Default admin user in memory for bootstrap / testing
let inMemoryUsers: any[] = [
  {
    id: "user-super-admin",
    firstName: "مدیر",
    lastName: "کل سیستم",
    email: config.adminEmail,
    phone: "09120000000",
    passwordHash: bcrypt.hashSync(config.adminInitialPassword, 10),
    isActive: true,
    lastLoginAt: null,
    roles: ["SUPER_ADMIN"],
    permissions: [
      { action: "MANAGE", resource: "*" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class UserRepository {
  async findByEmail(email: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || user.deletedAt) return null;

        const roles: string[] = [];
        const permissions: { action: string; resource: string }[] = [];

        for (const ur of user.userRoles) {
          roles.push(ur.role.name);
          for (const rp of ur.role.rolePermissions) {
            permissions.push({
              action: rp.permission.action,
              resource: rp.permission.resource,
            });
          }
        }

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          passwordHash: user.passwordHash,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
          roles,
          permissions,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (err) {
        // Fallback
      }
    }

    return inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id: string) {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        });
        if (!user || user.deletedAt) return null;

        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => ({
            action: rp.permission.action,
            resource: rp.permission.resource,
          }))
        );

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
          roles,
          permissions,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (err) {}
    }

    const u = inMemoryUsers.find((item) => item.id === id);
    if (!u) return null;
    const { passwordHash, ...rest } = u;
    return rest;
  }

  async findAll(): Promise<any[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const users = await prisma.user.findMany({
          where: { deletedAt: null },
          include: {
            userRoles: {
              include: { role: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return users.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt?.toISOString() || null,
          roles: u.userRoles.map((ur) => ur.role.name),
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        }));
      } catch (err) {}
    }

    return inMemoryUsers.map((u) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });
  }

  async create(data: { firstName: string; lastName: string; email: string; phone?: string; password: string; roles: string[] }): Promise<any> {
    // Validate roles against canonical roles
    const validRoles = data.roles.filter((r) => (canonicalRoles as readonly string[]).includes(r));
    if (validRoles.length === 0) {
      throw new Error(`حداقل یک نقش کاربری معتبر از میان [${canonicalRoles.join(", ")}] الزامی است.`);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = `user-${Date.now()}`;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            passwordHash,
            isActive: true,
          },
        });

        for (const roleName of validRoles) {
          const role = await prisma.role.findUnique({ where: { name: roleName } });
          if (role) {
            await prisma.userRole.create({
              data: { userId: created.id, roleId: role.id },
            });
          }
        }

        return {
          id: created.id,
          firstName: created.firstName,
          lastName: created.lastName,
          email: created.email,
          phone: created.phone,
          isActive: created.isActive,
          roles: validRoles,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (err) {}
    }

    const newUser = {
      id: userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || "",
      passwordHash,
      isActive: true,
      lastLoginAt: null,
      roles: validRoles,
      permissions: [{ action: "READ", resource: "*" }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryUsers.push(newUser);
    const { passwordHash: _, ...userSafe } = newUser;
    return userSafe;
  }

  async updateStatus(id: string, isActive: boolean): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.user.update({
          where: { id },
          data: { isActive },
        });
        return true;
      } catch (err) {}
    }

    const u = inMemoryUsers.find((item) => item.id === id);
    if (u) {
      u.isActive = isActive;
      return true;
    }
    return false;
  }

  async delete(id: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.user.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
        return true;
      } catch (err) {}
    }

    const idx = inMemoryUsers.findIndex((item) => item.id === id);
    if (idx !== -1) {
      inMemoryUsers.splice(idx, 1);
      return true;
    }
    return false;
  }

  async updateLastLogin(id: string): Promise<void> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.user.update({
          where: { id },
          data: { lastLoginAt: new Date() },
        });
        return;
      } catch (err) {}
    }

    const u = inMemoryUsers.find((item) => item.id === id);
    if (u) {
      u.lastLoginAt = new Date().toISOString();
    }
  }
}

export const userRepository = new UserRepository();
