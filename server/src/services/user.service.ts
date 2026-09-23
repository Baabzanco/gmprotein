import { userRepository, UserQueryFilter } from "../repositories/user.repository";
import { roleRepository } from "../repositories/role.repository";
import { auditRepository } from "../repositories/audit.repository";
import { UserDTO, RoleDTO, PermissionDTO } from "../../../shared/types";
import { AppError } from "../middleware/errorHandler";

export class UserService {
  async getUsers(filter: UserQueryFilter = {}): Promise<{
    users: UserDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return userRepository.findAll(filter);
  }

  async getUserById(id: string): Promise<UserDTO> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("کاربر مورد نظر یافت نشد.", 404, "USER_NOT_FOUND");
    }
    return user;
  }

  async createUser(
    actorId: string | undefined,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      password: string;
      roles: string[];
    }
  ): Promise<UserDTO> {
    const created = await userRepository.create(data);

    await auditRepository.log({
      userId: actorId,
      action: "USER_CREATED",
      entity: "User",
      entityId: created.id,
      metadata: {
        email: created.email,
        roles: created.roles,
        name: `${created.firstName} ${created.lastName}`,
      },
    });

    return created;
  }

  async updateUser(
    actorId: string | undefined,
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
    const previous = await userRepository.findById(id);
    if (!previous) {
      throw new AppError("کاربر مورد نظر یافت نشد.", 404, "USER_NOT_FOUND");
    }

    const updated = await userRepository.update(id, data);

    const rolesChanged = data.roles && JSON.stringify(data.roles) !== JSON.stringify(previous.roles);
    const action = rolesChanged ? "USER_ROLE_CHANGED" : "USER_UPDATED";

    await auditRepository.log({
      userId: actorId,
      action,
      entity: "User",
      entityId: id,
      metadata: {
        previousRoles: previous.roles,
        newRoles: updated.roles,
        previousStatus: previous.status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  async updateUserStatus(
    actorId: string | undefined,
    id: string,
    isActive: boolean
  ): Promise<boolean> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("کاربر مورد نظر یافت نشد.", 404, "USER_NOT_FOUND");
    }

    const success = await userRepository.updateStatus(id, isActive);

    await auditRepository.log({
      userId: actorId,
      action: isActive ? "USER_ACTIVATED" : "USER_SUSPENDED",
      entity: "User",
      entityId: id,
      metadata: {
        userEmail: user.email,
        previousStatus: user.status,
        newStatus: isActive ? "ACTIVE" : "SUSPENDED",
      },
    });

    return success;
  }

  async resetPassword(
    actorId: string | undefined,
    id: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("کاربر مورد نظر یافت نشد.", 404, "USER_NOT_FOUND");
    }

    if (!newPassword || newPassword.length < 6) {
      throw new AppError("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.", 400, "VALIDATION_ERROR");
    }

    const success = await userRepository.resetPassword(id, newPassword);

    await auditRepository.log({
      userId: actorId,
      action: "USER_PASSWORD_RESET",
      entity: "User",
      entityId: id,
      metadata: {
        userEmail: user.email,
        resetBy: actorId,
      },
    });

    return success;
  }

  async deleteUser(actorId: string | undefined, id: string): Promise<boolean> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("کاربر برای حذف یافت نشد.", 404, "USER_NOT_FOUND");
    }

    const success = await userRepository.delete(id);

    await auditRepository.log({
      userId: actorId,
      action: "USER_DELETED",
      entity: "User",
      entityId: id,
      metadata: {
        userEmail: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
    });

    return success;
  }

  // --- Roles & Permissions ---

  async getRoles(): Promise<RoleDTO[]> {
    return roleRepository.findAll();
  }

  async getRoleById(id: string): Promise<RoleDTO> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new AppError("نقش کاربری مورد نظر یافت نشد.", 404, "ROLE_NOT_FOUND");
    }
    return role;
  }

  async createRole(
    actorId: string | undefined,
    data: { name: string; title: string; description?: string | null; permissions: string[] }
  ): Promise<RoleDTO> {
    const created = await roleRepository.create(data);

    await auditRepository.log({
      userId: actorId,
      action: "ROLE_CREATED",
      entity: "Role",
      entityId: created.id,
      metadata: {
        roleName: created.name,
        permissionsCount: created.permissions.length,
      },
    });

    return created;
  }

  async updateRole(
    actorId: string | undefined,
    id: string,
    data: { name?: string; title?: string; description?: string | null; permissions?: string[] }
  ): Promise<RoleDTO> {
    const previous = await roleRepository.findById(id);
    if (!previous) {
      throw new AppError("نقش کاربری مورد نظر یافت نشد.", 404, "ROLE_NOT_FOUND");
    }

    const updated = await roleRepository.update(id, data);

    await auditRepository.log({
      userId: actorId,
      action: "ROLE_UPDATED",
      entity: "Role",
      entityId: id,
      metadata: {
        roleName: updated.name,
        permissionsCount: updated.permissions.length,
      },
    });

    return updated;
  }

  async updateRolePermissions(
    actorId: string | undefined,
    roleId: string,
    permissions: string[]
  ): Promise<RoleDTO> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new AppError("نقش کاربری مورد نظر یافت نشد.", 404, "ROLE_NOT_FOUND");
    }

    if (role.name === "SUPER_ADMIN") {
      throw new AppError("دسترسی‌های مدیر کل سیستم (SUPER_ADMIN) همیشه جامع و غیرقابل محدودسازی است.", 400, "CANNOT_MODIFY_SUPERADMIN");
    }

    const updated = await roleRepository.update(roleId, { permissions });

    await auditRepository.log({
      userId: actorId,
      action: "ROLE_PERMISSIONS_CHANGED",
      entity: "Role",
      entityId: roleId,
      metadata: {
        roleName: role.name,
        newPermissions: permissions,
      },
    });

    return updated;
  }

  async deleteRole(actorId: string | undefined, id: string): Promise<boolean> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new AppError("نقش کاربری مورد نظر یافت نشد.", 404, "ROLE_NOT_FOUND");
    }

    // Check if any user in userRepository has this role
    const usersList = await userRepository.findAll({ role: role.name, limit: 100 });
    if (usersList.total > 0) {
      throw new AppError(
        `این نقش به ${usersList.total} کاربر تخصیص داده شده است و امکان حذف آن وجود ندارد. ابتدا نقش این کاربران را تغییر دهید.`,
        400,
        "ROLE_IN_USE"
      );
    }

    const success = await roleRepository.delete(id, usersList.total);

    await auditRepository.log({
      userId: actorId,
      action: "ROLE_DELETED",
      entity: "Role",
      entityId: id,
      metadata: {
        roleName: role.name,
      },
    });

    return success;
  }

  async getPermissions(): Promise<PermissionDTO[]> {
    return roleRepository.getAllPermissions();
  }
}

export const userService = new UserService();
