import React, { useState } from "react";
import { ContactRequestPayload } from "../../types";
import { contactService } from "../../services";
import { MessageSquareText, Phone, Mail, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactRequestPayload>({
    fullName: "",
    phone: "",
    companyName: "",
    subject: "درخواست همکاری تجاری و تأمین رستوران",
    message: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await contactService.submitRequest(formData);
      setSuccessMsg(res.message);
      setFormData({
        fullName: "",
        phone: "",
        companyName: "",
        subject: "درخواست همکاری تجاری و تأمین رستوران",
        message: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "خطا در ارسال پیام. لطفاً اطلاعات وارد شده را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-t border-[var(--border)] relative"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left / Info Side */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-xs text-[#CD78B3] mb-4">
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>پشتیبانی و فروش سازمانی</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
                درخواست تماس
              </h2>

              <p className="text-[var(--text-secondary)] text-sm sm:text-base font-light mt-3 leading-relaxed">
                مشاوران فنی ما آماده‌اند در کوتاه‌ترین زمان، نیازمندی‌های تأمین گوشت و پروتئین مجموعه شما را بررسی و بهترین شرایط قیمتی را ارائه کنند.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] shrink-0 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)] block">خط ویژه سفارشات تلفنی:</span>
                  <a
                    href="tel:02122000000"
                    dir="ltr"
                    className="text-base font-bold text-[var(--text-primary)] hover:text-[#CD78B3] font-mono transition-colors"
                  >
                    021 - 2200 0000
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] shrink-0 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)] block">ساعات پاسخگویی واحد بازرگانی:</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    شنبه تا پنج‌شنبه: ۸:۳۰ الی ۲۰:۰۰
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[var(--card-shadow)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#124A57] flex items-center justify-center text-[#CD78B3] shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)] block">پست الکترونیکی امور مشتریان:</span>
                  <span className="text-sm font-mono text-[var(--text-secondary)]">
                    info@golmohamadi.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right / Form Side */}
          <div className="lg:col-span-7 bg-[var(--surface-card)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-2xl relative">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              فرم ارسال مشخصات و درخواست جلسه مشاوره
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-8 font-light">
              اطلاعات فرم مستقیماً به مدیریت امور قراردادها ارجاع داده خواهد شد.
            </p>

            {successMsg ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-500 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[var(--text-primary)]">درخواست تماس ثبت گردید</h4>
                <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">{successMsg}</p>
                <button
                  type="button"
                  onClick={() => setSuccessMsg("")}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#124A57] hover:bg-[#1a5b6a] text-xs font-semibold text-white cursor-pointer"
                >
                  ارسال پیام دیگر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      نام و نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="مثال: مهدی کاظمی"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      شماره تماس همراه *
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912xxxxxxx"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3] text-left"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      نام مجموعه، رستوران یا شرکت (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="مثال: هتل اسپیناس پالاس"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      موضوع درخواست *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#CD78B3]"
                    >
                      <option value="درخواست همکاری تجاری و تأمین رستوران">
                        درخواست همکاری تجاری و تأمین رستوران
                      </option>
                      <option value="استعلام قیمت عمده و خرید دوره‌ای">
                        استعلام قیمت عمده و خرید دوره‌ای
                      </option>
                      <option value="سفارش استیک‌های سفارشی و درای‌ایج">
                        سفارش استیک‌های سفارشی و درای‌ایج
                      </option>
                      <option value="انتقادات، پیشنهادات و روابط عمومی">
                        انتقادات، پیشنهادات و روابط عمومی
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    توضیحات و نیازمندی‌ها *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="لطفاً مشخصات یا حجم تقریبی سفارش خود را بنویسید..."
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#CD78B3] resize-none"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-[#CD78B3] hover:bg-[#b8619e] text-white font-bold text-sm transition-all shadow-xl shadow-[#CD78B3]/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
                >
                  {loading ? (
                    <span>در حال ارسال اطلاعات...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ارسال درخواست</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
