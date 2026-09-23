/**
 * Utility functions for Persian digits and formatting with Vazirmatn typography
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts any Latin or Arabic digits in a string or number to Persian digits.
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  let str = String(input);
  
  // Replace Latin digits
  str = str.replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
  
  // Replace Arabic digits if any
  for (let i = 0; i < ARABIC_DIGITS.length; i++) {
    str = str.replaceAll(ARABIC_DIGITS[i], PERSIAN_DIGITS[i]);
  }
  
  return str;
}

/**
 * Formats a number with commas and converts to Persian digits.
 */
export function formatPersianNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return toPersianDigits(value);
  
  const formatted = num.toLocaleString("fa-IR");
  return toPersianDigits(formatted);
}

/**
 * Formats a price in Tomans with Persian digits.
 */
export function formatPersianPrice(amount: number | string | null | undefined, suffix: string = "تومان"): string {
  if (amount === null || amount === undefined || amount === "") return `۰ ${suffix}`.trim();
  const formatted = formatPersianNumber(amount);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

export const formatPrice = (amount: number | string | null | undefined): string => {
  return formatPersianNumber(amount);
};

/**
 * Formats phone numbers into Persian digits with standard separators.
 */
export function formatPersianPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return toPersianDigits(phone);
}
