import { getPrismaClient, isDatabaseConnected } from "../config/prisma";
import { SYSTEM_PERMISSIONS } from "../validators";
import { RoleDTO, PermissionDTO } from "../../../shared/types";

// In-Memory initial roles with default permissions
let inMemoryRoles: Array<{
  id: string;
  name: string;
  title: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "role-super-admin",
    name: "SUPER_ADMIN",
    title: "مدیر ارشد کل سیستم (Super Admin)",
    description: "دسترسی کامل، تام و نامحدود به تمامی بخش‌ها و تنظیمات سامانه",
    isSystem: true,
    permissions: SYSTEM_PERMISSIONS.map((p) => p.code),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role-admin",
    name: "ADMIN",
    title: "مدیر ارشد عملیات (Admin)",
    description: "مدیریت عمومی پلتفرم، کاتالوگ، کاربران، وبلاگ و تنظیمات",
    isSystem: true,
    permissions: [
      "users.view", "users.create", "users.update", "users.suspend",
      "roles.view", "roles.create", "roles.update",
      "products.view", "products.create", "products.update", "products.delete",
      "categories.view", "categories.create", "categories.update", "categories.delete",
      "pricing.view", "pricing.update",
      "campaigns.view", "campaigns.create", "campaigns.update", "campaigns.delete",
      "landing.view", "landing.update",
      "blog.view", "blog.create", "blog.update", "blog.delete",
      "media.view", "media.create", "media.delete",
      "contacts.view", "contacts.update",
      "settings.view", "settings.update",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role-product-manager",
    name: "PRODUCT_MANAGER",
    title: "مدیر محصولات و قیمت‌گذاری",
    description: "مدیریت قیمت‌ها، محصولات، دسته‌بندی‌ها و جشنواره‌های فصلی",
    isSystem: false,
    permissions: [
      "products.view", "products.create", "products.update", "products.delete",
      "categories.view", "categories.create", "categories.update",
      "pricing.view", "pricing.update",
      "campaigns.view", "campaigns.create", "campaigns.update",
      "media.view", "media.create",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role-content-manager",
    name: "CONTENT_MANAGER",
    title: "مدیر محتوا و وبلاگ",
    description: "تولید و ویرایش مقالات وبلاگ، تنظیمات سئو، بخش‌های صفحه اصلی و رسانه",
    isSystem: false,
    permissions: [
      "landing.view", "landing.update",
      "blog.view", "blog.create", "blog.update", "blog.delete",
      "media.view", "media.create", "media.delete",
      "campaigns.view",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role-sales-manager",
    name: "SALES_MANAGER",
    title: "مدیر فروش و ارتباطات",
    description: "مشاهده کاتالوگ، بررسی درخواست‌ها و تعامل با مشتریان عمده",
    isSystem: false,
    permissions: [
      "products.view",
      "categories.view",
      "pricing.view",
      "contacts.view", "contacts.update",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role-support",
    name: "SUPPORT",
    title: "کارشناس پشتیبانی",
    description: "پاسخگویی به پیام‌های تماس، استعلام‌ها و تیکت‌های مشتریان",
    isSystem: false,
    permissions: [
      "contacts.view", "contacts.update",
      "products.view",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "role-viewer",
    name: "VIEWER",
    title: "بیننده (فقط خواندنی)",
    description: "مشاهده گزارش‌ها و کاتالوگ به صورت فقط-خواندنی بدون امکان تغییر داده‌ها",
    isSystem: false,
    permissions: [
      "products.view",
      "categories.view",
      "pricing.view",
      "campaigns.view",
      "landing.view",
      "blog.view",
      "contacts.view",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export class RoleRepository {
  async getAllPermissions(): Promise<PermissionDTO[]> {
    return SYSTEM_PERMISSIONS.map((p, idx) => ({
      id: `perm-${idx + 1}`,
      code: p.code,
      action: p.action,
      resource: p.resource,
      category: p.category,
      description: p.description,
    }));
  }

  async findAll(): Promise<RoleDTO[]> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const roles = await prisma.role.findMany({
          include: {
            userRoles: {
              where: {
                user: {
                  deletedAt: null,
                },
              },
            },
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        if (roles.length > 0) {
          return roles.map((r) => {
            const permissions: string[] = [];
            for (const rp of r.rolePermissions) {
              // Convert action + resource to code format
              const code = `${rp.permission.resource}.${rp.permission.action.toLowerCase()}`;
              permissions.push(code);
            }

            // If SUPER_ADMIN, ensure full permission list
            const finalPermissions = r.name === "SUPER_ADMIN"
              ? SYSTEM_PERMISSIONS.map((p) => p.code)
              : permissions;

            const memRole = inMemoryRoles.find((mr) => mr.name === r.name);

            return {
              id: r.id,
              name: r.name,
              title: memRole?.title || r.name,
              description: r.description || memRole?.description || null,
              isSystem: r.isSystem,
              permissions: finalPermissions,
              usersCount: r.userRoles.length,
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString(),
            };
          });
        }
      } catch (err) {
        // Fallback to inMemoryRoles
      }
    }

    return inMemoryRoles.map((r) => ({
      ...r,
      usersCount: r.name === "SUPER_ADMIN" ? 1 : 0,
    }));
  }

  async findById(id: string): Promise<RoleDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const role = await prisma.role.findUnique({
          where: { id },
          include: {
            userRoles: { where: { user: { deletedAt: null } } },
            rolePermissions: { include: { permission: true } },
          },
        });

        if (role) {
          const permissions = role.name === "SUPER_ADMIN"
            ? SYSTEM_PERMISSIONS.map((p) => p.code)
            : role.rolePermissions.map((rp) => `${rp.permission.resource}.${rp.permission.action.toLowerCase()}`);

          const memRole = inMemoryRoles.find((mr) => mr.name === role.name);

          return {
            id: role.id,
            name: role.name,
            title: memRole?.title || role.name,
            description: role.description || memRole?.description || null,
            isSystem: role.isSystem,
            permissions,
            usersCount: role.userRoles.length,
            createdAt: role.createdAt.toISOString(),
            updatedAt: role.updatedAt.toISOString(),
          };
        }
      } catch (err) {}
    }

    const r = inMemoryRoles.find((item) => item.id === id);
    if (!r) return null;
    return {
      ...r,
      usersCount: r.name === "SUPER_ADMIN" ? 1 : 0,
    };
  }

  async findByName(name: string): Promise<RoleDTO | null> {
    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const role = await prisma.role.findUnique({
          where: { name },
          include: {
            userRoles: { where: { user: { deletedAt: null } } },
            rolePermissions: { include: { permission: true } },
          },
        });
        if (role) {
          const permissions = role.name === "SUPER_ADMIN"
            ? SYSTEM_PERMISSIONS.map((p) => p.code)
            : role.rolePermissions.map((rp) => `${rp.permission.resource}.${rp.permission.action.toLowerCase()}`);

          const memRole = inMemoryRoles.find((mr) => mr.name === role.name);

          return {
            id: role.id,
            name: role.name,
            title: memRole?.title || role.name,
            description: role.description || memRole?.description || null,
            isSystem: role.isSystem,
            permissions,
            usersCount: role.userRoles.length,
            createdAt: role.createdAt.toISOString(),
            updatedAt: role.updatedAt.toISOString(),
          };
        }
      } catch (err) {}
    }

    const r = inMemoryRoles.find((item) => item.name.toUpperCase() === name.toUpperCase());
    if (!r) return null;
    return {
      ...r,
      usersCount: r.name === "SUPER_ADMIN" ? 1 : 0,
    };
  }

  async create(data: { name: string; title: string; description?: string | null; permissions: string[] }): Promise<RoleDTO> {
    const roleName = data.name.toUpperCase().trim();
    const existing = await this.findByName(roleName);
    if (existing) {
      throw new Error(`نقش کاربری با شناسه «${roleName}» قبلاً در سیستم تعریف شده است.`);
    }

    const now = new Date().toISOString();
    const newId = `role-${Date.now()}`;

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        const created = await prisma.role.create({
          data: {
            name: roleName,
            description: data.description || data.title,
            isSystem: false,
          },
        });

        // Link permissions in DB
        for (const code of data.permissions) {
          const [resource, action] = code.split(".");
          if (resource && action) {
            let perm = await prisma.permission.findFirst({
              where: { action: action.toUpperCase(), resource },
            });
            if (!perm) {
              perm = await prisma.permission.create({
                data: { action: action.toUpperCase(), resource, description: code },
              });
            }
            await prisma.rolePermission.create({
              data: { roleId: created.id, permissionId: perm.id },
            });
          }
        }

        const memEntry = {
          id: created.id,
          name: created.name,
          title: data.title,
          description: data.description || data.title,
          isSystem: false,
          permissions: data.permissions,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
        inMemoryRoles.push(memEntry);

        return {
          ...memEntry,
          usersCount: 0,
        };
      } catch (err) {}
    }

    const memEntry = {
      id: newId,
      name: roleName,
      title: data.title,
      description: data.description || data.title,
      isSystem: false,
      permissions: data.permissions,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryRoles.push(memEntry);

    return {
      ...memEntry,
      usersCount: 0,
    };
  }

  async update(id: string, data: { name?: string; title?: string; description?: string | null; permissions?: string[] }): Promise<RoleDTO> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("نقش کاربری مورد نظر یافت نشد.");
    }

    if (existing.isSystem && data.name && data.name !== existing.name) {
      throw new Error("شناسه انگلیسی نقش‌های سیستمی قابل تغییر نمی‌باشد.");
    }

    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.role.update({
          where: { id },
          data: {
            name: data.name ? data.name.toUpperCase().trim() : undefined,
            description: data.description !== undefined ? data.description : undefined,
          },
        });

        if (data.permissions && existing.name !== "SUPER_ADMIN") {
          // Re-link permissions
          await prisma.rolePermission.deleteMany({ where: { roleId: id } });
          for (const code of data.permissions) {
            const [resource, action] = code.split(".");
            if (resource && action) {
              let perm = await prisma.permission.findFirst({
                where: { action: action.toUpperCase(), resource },
              });
              if (!perm) {
                perm = await prisma.permission.create({
                  data: { action: action.toUpperCase(), resource, description: code },
                });
              }
              await prisma.rolePermission.create({
                data: { roleId: id, permissionId: perm.id },
              });
            }
          }
        }
      } catch (err) {}
    }

    const memIdx = inMemoryRoles.findIndex((r) => r.id === id || r.name === existing.name);
    if (memIdx !== -1) {
      inMemoryRoles[memIdx] = {
        ...inMemoryRoles[memIdx],
        title: data.title || inMemoryRoles[memIdx].title,
        description: data.description !== undefined ? data.description : inMemoryRoles[memIdx].description,
        permissions: data.permissions !== undefined && existing.name !== "SUPER_ADMIN" ? data.permissions : inMemoryRoles[memIdx].permissions,
        updatedAt: now,
      };
    }

    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string, assignedUsersCount = 0): Promise<boolean> {
    const role = await this.findById(id);
    if (!role) {
      throw new Error("نقش کاربری مورد نظر یافت نشد.");
    }

    if (role.isSystem || role.name === "SUPER_ADMIN" || role.name === "ADMIN") {
      throw new Error(`نقش سیستمی «${role.name}» غیرقابل حذف است.`);
    }

    if (assignedUsersCount > 0 || (role.usersCount && role.usersCount > 0)) {
      throw new Error(`این نقش به ${role.usersCount || assignedUsersCount} کاربر اختصاص داده شده است. لطفاً ابتدا نقش این کاربران را تغییر دهید.`);
    }

    if (isDatabaseConnected()) {
      try {
        const prisma = getPrismaClient();
        await prisma.role.delete({ where: { id } });
      } catch (err) {}
    }

    const idx = inMemoryRoles.findIndex((r) => r.id === id || r.name === role.name);
    if (idx !== -1) {
      inMemoryRoles.splice(idx, 1);
      return true;
    }

    return true;
  }
}

export const roleRepository = new RoleRepository();
