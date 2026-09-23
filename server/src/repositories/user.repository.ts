import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import bcrypt from "bcryptjs";
import { config } from "../config";
import { UserDTO } from "../../../shared/types";
import { SYSTEM_PERMISSIONS } from "../validators";
import { roleRepository } from "./role.repository";

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
    status: "ACTIVE",
    lastLoginAt: null,
    roles: ["SUPER_ADMIN"],
    permissions: SYSTEM_PERMISSIONS.map((p) => p.code),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export interface UserQueryFilter {
  search?: string;
  role?: string;
  status?: "ACTIVE" | "SUSPENDED";
  page?: number;
  limit?: number;
}

export class UserRepository {
  async getEffectivePermissions(roles: string[]): Promise<string[]> {
    if (roles.includes("SUPER_ADMIN")) {
      return SYSTEM_PERMISSIONS.map((p) => p.code);
    }

    const permissionsSet = new Set<string>();
    for (const roleName of roles) {
      const role = await roleRepository.findByName(roleName);
      if (role && role.permissions) {
        for (const p of role.permissions) {
          permissionsSet.add(p);
        }
      }
    }
    return Array.from(permissionsSet);
  }

  async countActiveSuperAdmins(): Promise<number> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const superAdmins = await prisma.user.count({
          where: {
            isActive: true,
            deletedAt: null,
            userRoles: {
              some: {
                role: {
                  name: "SUPER_ADMIN",
                },
              },
            },
          },
        });
        return superAdmins;
      } catch (err) {}
    }

    return inMemoryUsers.filter(
      (u) => u.isActive && !u.deletedAt && u.roles.includes("SUPER_ADMIN")
    ).length;
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
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

        const roles: string[] = user.userRoles.map((ur) => ur.role.name);
        const permissions = await this.getEffectivePermissions(roles);

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          passwordHash: user.passwordHash,
          isActive: user.isActive,
          status: user.isActive ? ("ACTIVE" as const) : ("SUSPENDED" as const),
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

    const found = inMemoryUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail && !u.deletedAt
    );
    if (!found) return null;

    const permissions = await this.getEffectivePermissions(found.roles);
    return {
      ...found,
      status: found.isActive ? "ACTIVE" : "SUSPENDED",
      permissions,
    };
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
                role: true,
              },
            },
          },
        });
        if (!user || user.deletedAt) return null;

        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = await this.getEffectivePermissions(roles);

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          status: user.isActive ? ("ACTIVE" as const) : ("SUSPENDED" as const),
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
          roles,
          permissions,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (err) {}
    }

    const u = inMemoryUsers.find((item) => item.id === id && !item.deletedAt);
    if (!u) return null;
    const { passwordHash, ...rest } = u;
    const permissions = await this.getEffectivePermissions(u.roles);
    return {
      ...rest,
      status: rest.isActive ? "ACTIVE" : "SUSPENDED",
      permissions,
    };
  }

  async findAll(filter: UserQueryFilter = {}): Promise<{
    users: UserDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const where: any = { deletedAt: null };

        if (filter.status) {
          where.isActive = filter.status === "ACTIVE";
        }

        if (filter.role) {
          where.userRoles = {
            some: {
              role: {
                name: filter.role,
              },
            },
          };
        }

        if (filter.search) {
          const s = filter.search.trim();
          where.OR = [
            { firstName: { contains: s, mode: "insensitive" } },
            { lastName: { contains: s, mode: "insensitive" } },
            { email: { contains: s, mode: "insensitive" } },
            { phone: { contains: s, mode: "insensitive" } },
          ];
        }

        const [total, users] = await Promise.all([
          prisma.user.count({ where }),
          prisma.user.findMany({
            where,
            include: {
              userRoles: {
                include: { role: true },
              },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
        ]);

        const mappedUsers: UserDTO[] = await Promise.all(
          users.map(async (u) => {
            const roles = u.userRoles.map((ur) => ur.role.name);
            const permissions = await this.getEffectivePermissions(roles);
            return {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              phone: u.phone,
              isActive: u.isActive,
              status: u.isActive ? "ACTIVE" : "SUSPENDED",
              lastLoginAt: u.lastLoginAt?.toISOString() || null,
              roles,
              permissions,
              createdAt: u.createdAt.toISOString(),
              updatedAt: u.updatedAt.toISOString(),
            };
          })
        );

        return {
          users: mappedUsers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        };
      } catch (err) {}
    }

    // In-memory query
    let filtered = inMemoryUsers.filter((u) => !u.deletedAt);

    if (filter.status) {
      filtered = filtered.filter((u) =>
        filter.status === "ACTIVE" ? u.isActive : !u.isActive
      );
    }

    if (filter.role) {
      filtered = filtered.filter((u) => u.roles.includes(filter.role));
    }

    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    const users: UserDTO[] = await Promise.all(
      paginated.map(async (u) => {
        const { passwordHash, ...rest } = u;
        const permissions = await this.getEffectivePermissions(u.roles);
        return {
          ...rest,
          status: rest.isActive ? "ACTIVE" : "SUSPENDED",
          permissions,
        };
      })
    );

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    password: string;
    roles: string[];
  }): Promise<UserDTO> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new Error(`کاربری با ایمیل «${data.email}» قبلاً در سیستم ثبت شده است.`);
    }

    if (!data.roles || data.roles.length === 0) {
      throw new Error("حداقل یک نقش کاربری برای کاربر الزامی است.");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date().toISOString();
    const userId = `user-${Date.now()}`;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.user.create({
          data: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone?.trim() || null,
            passwordHash,
            isActive: true,
          },
        });

        for (const roleName of data.roles) {
          let role = await prisma.role.findUnique({ where: { name: roleName } });
          if (!role) {
            role = await prisma.role.create({
              data: { name: roleName, description: roleName, isSystem: false },
            });
          }
          await prisma.userRole.create({
            data: { userId: created.id, roleId: role.id },
          });
        }

        const permissions = await this.getEffectivePermissions(data.roles);

        return {
          id: created.id,
          firstName: created.firstName,
          lastName: created.lastName,
          email: created.email,
          phone: created.phone,
          isActive: created.isActive,
          status: "ACTIVE",
          lastLoginAt: null,
          roles: data.roles,
          permissions,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (err) {}
    }

    const permissions = await this.getEffectivePermissions(data.roles);
    const newUser = {
      id: userId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || "",
      passwordHash,
      isActive: true,
      status: "ACTIVE",
      lastLoginAt: null,
      roles: data.roles,
      permissions,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryUsers.push(newUser);
    const { passwordHash: _, ...userSafe } = newUser;
    return userSafe as UserDTO;
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string | null;
      roles?: string[];
      isActive?: boolean;
      status?: "ACTIVE" | "SUSPENDED";
    }
  ): Promise<UserDTO> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("کاربر مورد نظر یافت نشد.");
    }

    // SuperAdmin protection check
    const isTargetSuperAdmin = existing.roles.includes("SUPER_ADMIN");
    let willRemainSuperAdmin = isTargetSuperAdmin;

    if (data.roles) {
      willRemainSuperAdmin = data.roles.includes("SUPER_ADMIN");
    }

    const willBeActive = data.isActive !== undefined
      ? data.isActive
      : data.status !== undefined
      ? data.status === "ACTIVE"
      : existing.isActive;

    if (isTargetSuperAdmin && (!willRemainSuperAdmin || !willBeActive)) {
      const activeSuperAdminCount = await this.countActiveSuperAdmins();
      if (activeSuperAdminCount <= 1) {
        throw new Error(
          "امکان غیرفعال‌سازی، تعلیق یا سلب نقش آخرین مدیر ارشد سیستم (SUPER_ADMIN) وجود ندارد."
        );
      }
    }

    const now = new Date().toISOString();
    const finalIsActive = data.isActive !== undefined ? data.isActive : data.status !== undefined ? data.status === "ACTIVE" : existing.isActive;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.user.update({
          where: { id },
          data: {
            firstName: data.firstName ? data.firstName.trim() : undefined,
            lastName: data.lastName ? data.lastName.trim() : undefined,
            email: data.email ? data.email.toLowerCase().trim() : undefined,
            phone: data.phone !== undefined ? data.phone : undefined,
            isActive: finalIsActive,
          },
        });

        if (data.roles) {
          // Re-assign roles
          await prisma.userRole.deleteMany({ where: { userId: id } });
          for (const roleName of data.roles) {
            let role = await prisma.role.findUnique({ where: { name: roleName } });
            if (!role) {
              role = await prisma.role.create({
                data: { name: roleName, description: roleName, isSystem: false },
              });
            }
            await prisma.userRole.create({
              data: { userId: id, roleId: role.id },
            });
          }
        }
      } catch (err) {}
    }

    const memIdx = inMemoryUsers.findIndex((u) => u.id === id);
    if (memIdx !== -1) {
      inMemoryUsers[memIdx] = {
        ...inMemoryUsers[memIdx],
        firstName: data.firstName ? data.firstName.trim() : inMemoryUsers[memIdx].firstName,
        lastName: data.lastName ? data.lastName.trim() : inMemoryUsers[memIdx].lastName,
        email: data.email ? data.email.toLowerCase().trim() : inMemoryUsers[memIdx].email,
        phone: data.phone !== undefined ? data.phone : inMemoryUsers[memIdx].phone,
        roles: data.roles || inMemoryUsers[memIdx].roles,
        isActive: finalIsActive,
        status: finalIsActive ? "ACTIVE" : "SUSPENDED",
        updatedAt: now,
      };
    }

    const updated = await this.findById(id);
    return updated!;
  }

  async updateStatus(id: string, isActive: boolean): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("کاربر مورد نظر یافت نشد.");
    }

    // Superadmin protection
    if (existing.roles.includes("SUPER_ADMIN") && !isActive) {
      const activeSuperAdminCount = await this.countActiveSuperAdmins();
      if (activeSuperAdminCount <= 1) {
        throw new Error(
          "امکان غیرفعال‌سازی یا تعلیق آخرین مدیر ارشد سیستم (SUPER_ADMIN) وجود ندارد."
        );
      }
    }

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
      u.status = isActive ? "ACTIVE" : "SUSPENDED";
      return true;
    }
    return false;
  }

  async resetPassword(id: string, newPassword: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("کاربر مورد نظر یافت نشد.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.user.update({
          where: { id },
          data: { passwordHash },
        });
        return true;
      } catch (err) {}
    }

    const u = inMemoryUsers.find((item) => item.id === id);
    if (u) {
      u.passwordHash = passwordHash;
      u.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("کاربر مورد نظر برای حذف یافت نشد.");
    }

    // Superadmin protection
    if (existing.roles.includes("SUPER_ADMIN")) {
      const activeSuperAdminCount = await this.countActiveSuperAdmins();
      if (activeSuperAdminCount <= 1) {
        throw new Error("امکان حذف آخرین مدیر ارشد سیستم (SUPER_ADMIN) وجود ندارد.");
      }
    }

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
      inMemoryUsers[idx].deletedAt = new Date().toISOString();
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
