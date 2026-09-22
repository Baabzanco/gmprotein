import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-button"
      aria-label={isDark ? "تغییر پوسته به حالت روشن" : "تغییر پوسته به حالت تاریک"}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
      className={`group relative flex items-center justify-center gap-2 p-2.5 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#CD78B3]/50 active:scale-95 cursor-pointer ${
        isDark
          ? "bg-[#0e272f]/80 hover:bg-[#124A57] border-[#184550] text-slate-200 hover:text-white shadow-md shadow-black/20"
          : "bg-white/80 hover:bg-white border-[rgba(18,74,87,0.16)] text-[#124A57] hover:text-[#124A57] shadow-sm shadow-[rgba(18,74,87,0.08)]"
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {isDark ? (
          <Sun
            className="w-4 h-4 text-amber-300 transform transition-transform duration-300 group-hover:rotate-45"
            aria-hidden="true"
          />
        ) : (
          <Moon
            className="w-4 h-4 text-[#124A57] transform transition-transform duration-300 group-hover:-rotate-12"
            aria-hidden="true"
          />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-medium font-sans">
          {isDark ? "روشن" : "تاریک"}
        </span>
      )}
    </button>
  );
};
