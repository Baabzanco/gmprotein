import rateLimit from "express-rate-limit";

// Rate limiter for general public API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "تعداد درخواست‌های ارسالی بیش از حد مجاز است. لطفاً چند دقیقه دیگر دوباره تلاش کنید.",
    },
  },
});

// Stricter rate limiter for sensitive endpoints (login, inquiry submission)
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "تعداد تلاش‌های ناموفق یا درخواست‌های ارسالی بیش از حد مجاز است. لطفاً بعداً تلاش فرمایید.",
    },
  },
});
