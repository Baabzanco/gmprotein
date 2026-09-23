import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  status?: "ACTIVE" | "SUSPENDED";
  roles: string[];
  permissions?: (string | { action: string; resource: string })[];
  lastLoginAt?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (permissionOrAction: string, resource?: string) => boolean;
  canAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const TOKEN_KEY = "pg_admin_token";
const USER_KEY = "pg_admin_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate session on mount
  useEffect(() => {
    const verifyToken = async () => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUser(json.data);
            localStorage.setItem(USER_KEY, JSON.stringify(json.data));
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token is expired or revoked
          logout();
        }
      } catch (err) {
        console.warn("Auth verification network error, keeping cached session if present:", err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.error?.message || "نام کاربری یا رمز عبور اشتباه است.";
        setError(msg);
        setIsLoading(false);
        return false;
      }

      const { token: receivedToken, user: receivedUser } = json.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem(TOKEN_KEY, receivedToken);
      localStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError("خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی نمایید.");
      setIsLoading(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const hasRole = (...roles: string[]): boolean => {
    if (!user) return false;
    if (user.roles.includes("SUPER_ADMIN")) return true;
    return roles.some((r) => user.roles.includes(r));
  };

  const hasPermission = (permissionOrAction: string, resource?: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes("SUPER_ADMIN")) return true;
    if (!user.permissions || user.permissions.length === 0) return false;

    let targetCode = permissionOrAction;
    if (resource) {
      targetCode = `${resource}.${permissionOrAction.toLowerCase()}`;
    }

    return user.permissions.some((p) => {
      if (typeof p === "string") {
        if (p === "*" || p === "MANAGE:*" || p === "*.*") return true;
        if (p === targetCode) return true;
        const [res] = targetCode.split(".");
        if (p === `${res}.*` || p === `MANAGE:${res}`) return true;
        return false;
      }
      if (typeof p === "object" && p !== null) {
        if (p.action === "MANAGE" || p.resource === "*") return true;
        if (resource && p.action.toLowerCase() === permissionOrAction.toLowerCase() && p.resource === resource) return true;
        const [res, act] = targetCode.split(".");
        if (p.resource === res && (p.action.toLowerCase() === act?.toLowerCase() || p.action === "MANAGE")) return true;
      }
      return false;
    });
  };

  const canAccess = (module: string): boolean => {
    if (!user) return false;
    if (user.roles.includes("SUPER_ADMIN") || user.roles.includes("ADMIN")) return true;

    switch (module) {
      case "dashboard":
        return true;
      case "products":
      case "categories":
      case "prices":
      case "discounts":
        return hasRole("PRODUCT_MANAGER");
      case "campaigns":
      case "content":
        return hasRole("CONTENT_MANAGER", "PRODUCT_MANAGER");
      case "quotations":
        return hasRole("SALES_MANAGER");
      case "contacts":
        return hasRole("SUPPORT", "SALES_MANAGER");
      case "reports":
        return hasRole("SALES_MANAGER", "VIEWER");
      case "users":
      case "roles":
      case "audit-logs":
      case "system-logs":
      case "settings":
        return hasRole("SUPER_ADMIN", "ADMIN");
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        logout,
        hasRole,
        hasPermission,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
