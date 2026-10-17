import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  SupportedLocale,
  SUPPORTED_LANGUAGES,
  getPortalText,
} from "../utils/i18n";

interface LanguageSelectorProps {
  currentLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  variant?: "dropdown" | "pills" | "compact";
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLocale,
  onSelectLocale,
  variant = "dropdown",
  className = "",
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLocale) ||
    SUPPORTED_LANGUAGES[0];

  if (variant === "pills") {
    return (
      <div
        className={`inline-flex items-center gap-1 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-w-full overflow-x-auto ${className}`}
        role="group"
        aria-label="Seleção de idioma"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = currentLocale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLocale(lang.code)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={`${lang.name} (${lang.country})`}
            >
              <span className="text-xs">{lang.flag}</span>
              <span className="text-[11px] font-mono">{lang.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
        aria-label={getPortalText("selectLanguage", currentLocale)}
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{activeLang.flag}</span>
        {showLabel && (
          <span className="text-[11px] font-bold tracking-wider font-mono">
            {activeLang.label}
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-48 sm:w-52 max-w-[calc(100vw-1.5rem)] p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150"
          role="menu"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{getPortalText("selectLanguage", currentLocale)}</span>
            </span>
          </div>
          <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLocale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onSelectLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span className="text-xs">{lang.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({lang.label})
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
