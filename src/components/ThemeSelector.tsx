import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Clock, Check, ChevronDown } from "lucide-react";
import { ThemePreference, isNightTimeSchedule } from "../utils/themeManager";
import { SupportedLocale, getPortalText } from "../utils/i18n";

interface ThemeSelectorProps {
  themePreference: ThemePreference;
  onSelectTheme: (pref: ThemePreference) => void;
  variant?: "segmented" | "dropdown" | "compact";
  locale?: string;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themePreference,
  onSelectTheme,
  variant = "segmented",
  locale = "pt",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNightNow = isNightTimeSchedule();

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

  const options: {
    id: ThemePreference;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "system",
      label: locale === "en" ? "System" : "Sistema",
      description: locale === "en"
        ? (isNightNow 
            ? "Dark • 6 PM to midnight" 
            : "Light • 6 AM to 6 PM")
        : (isNightNow 
            ? "Escuro • 18h às 24h" 
            : "Claro • 6h às 18h"),
      icon: <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />,
    },
    {
      id: "light",
      label: locale === "en" ? "Light" : "Claro",
      description: locale === "en" ? "Light mode" : "Modo claro fixo",
      icon: <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
    },
    {
      id: "dark",
      label: locale === "en" ? "Dark" : "Escuro",
      description: locale === "en" ? "Dark mode" : "Modo escuro fixo",
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />,
    },
  ];

  // Segmented control variant (e.g. for landing header or settings or mobile drawer)
  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 text-xs max-w-full overflow-x-auto ${className}`}
        role="group"
        aria-label="Seleção de Tema: Sistema, Claro ou Escuro"
      >
        {options.map((opt) => {
          const isSelected = themePreference === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectTheme(opt.id)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={
                opt.id === "system"
                  ? getPortalText("themeSystemSchedule", locale)
                  : opt.label
              }
            >
              {opt.icon}
              <span className="text-[11px]">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact icon button with popover (for tight navbars)
  const currentOpt =
    options.find((o) => o.id === themePreference) || options[0];

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
        aria-label="Menu de temas: Sistema, Claro ou Escuro"
        aria-expanded={isOpen}
      >
        {themePreference === "system" ? (
          isNightNow ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )
        ) : (
          currentOpt.icon
        )}
        <span className="text-[11px] font-semibold">{currentOpt.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-56 sm:w-60 max-w-[calc(100vw-1.5rem)] p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150"
          role="menu"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {getPortalText("themeSystemSchedule", locale)}
          </div>
          <div className="py-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = themePreference === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="block text-xs font-semibold leading-none">{opt.label}</span>
                        {opt.id === "system" && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold">
                            {locale === "en" ? "Default" : "Padrão"}
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        {opt.description}
                      </span>
                    </div>
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
