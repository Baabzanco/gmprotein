import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "../../../context/RouterContext";
import { AdminButton } from "../ui/AdminButton";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export const AdminLoginView: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState("admin@golmohamadi.com");
  const [password, setPassword] = useState("Admin@PG2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError("لطفاً ایمیل سازمانی و رمز عبور را وارد نمایید.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate("/admin/dashboard");
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@golmohamadi.com");
    setPassword("Admin@PG2026!");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#071318] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#124A57]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#CD78B3]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Public Website */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به وب‌سایت عمومی</span>
        </button>
        <span className="text-[11px] text-slate-500 font-mono">PG Enterprise v1.0</span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0b1c22]/90 border border-[#184550] rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        {/* Brand Monogram */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#124A57] border border-[#CD78B3]/60 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#124A57]/40 mb-3">
            <span className="text-[#CD78B3]">PG</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            سامانه مدیریت پروتئین گلمحمدی
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ورود ایمن مدیران، کارشناسان کاتالوگ و امور فروش B2B
          </p>
        </div>

        {/* Error Notification */}
        {(error || localError) && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              ایمیل سازمانی
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@golmohamadi.com"
                required
                className="w-full bg-[#071318] border border-[#1b434e] focus:border-[#CD78B3] rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#CD78B3] transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              رمز عبور امنیتی
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#071318] border border-[#1b434e] focus:border-[#CD78B3] rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#CD78B3] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <AdminButton
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-[#124A57] hover:bg-[#1a5b6a] text-white border border-[#CD78B3]/40 shadow-lg shadow-[#124A57]/30"
              icon={<Lock className="w-4 h-4 text-[#CD78B3]" />}
            >
              احراز هویت و ورود به سیستم
            </AdminButton>
          </div>
        </form>

        {/* Demo Credentials Quick Fill Hint */}
        <div className="mt-6 pt-5 border-t border-[#184550]/80">
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-2">
            <span>حساب کاربری پیش‌فرض آزمایشی:</span>
            <button
              onClick={handleQuickFill}
              className="text-[#CD78B3] hover:underline font-bold"
            >
              تکمیل خودکار
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-[#071318]/70 border border-[#143942] font-mono text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>ایمیل:</span>
              <span className="text-slate-200 select-all">admin@golmohamadi.com</span>
            </div>
            <div className="flex justify-between">
              <span>رمز عبور:</span>
              <span className="text-slate-200 select-all">Admin@PG2026!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="mt-8 text-center text-xs text-slate-500 font-light">
        سامانه احراز هویت متمرکز پروتئین گلمحمدی • تمامی دسترسی‌ها در ردپای امنیتی ثبت می‌شوند.
      </div>
    </div>
  );
};
