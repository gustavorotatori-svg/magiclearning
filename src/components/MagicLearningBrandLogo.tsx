import React from "react";
import { SchoolBranding } from "../types";

export interface MagicLearningBrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  schoolName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoType?: "preset" | "custom_url" | "upload";
  customLogoUrl?: string;
  logoPreset?: "magic_hat" | "classic_oz" | "emerald_shield" | "magic_wand" | "rainbow_unicorn" | "academic_crest" | "modern_monogram" | "open_book";
  forceWhiteText?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * 🎩✨ Authentic Magic Learning Original Vector Insignia & Brand Component
 * Renders the original iconic Wizard's Hat or any custom institutional logo (image/SVG/presets).
 */
export const MagicLearningBrandLogo: React.FC<MagicLearningBrandLogoProps> = ({
  size = "md",
  showText = true,
  schoolName = "Magic Learning",
  primaryColor = "#0077C0",
  secondaryColor = "#C4CED4",
  logoType = "preset",
  customLogoUrl,
  logoPreset = "magic_hat",
  forceWhiteText = false,
  subtitle,
  className = "",
  onClick,
}) => {
  // Dimensions according to size
  const iconDimensions = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-8.5 h-8.5",
    lg: "w-11 h-11",
    xl: "w-16 h-16",
  }[size];

  const titleSizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  }[size];

  const subtextSizes = {
    xs: "text-[7px]",
    sm: "text-[8.5px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-sm",
  }[size];

  // If custom logo image is specified, render image
  if ((logoType === "custom_url" || logoType === "upload") && customLogoUrl) {
    return (
      <div
        onClick={onClick}
        className={`group inline-flex items-center gap-2.5 select-none transition-all ${onClick ? "cursor-pointer" : ""} ${className}`}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <img
            src={customLogoUrl}
            alt={schoolName}
            referrerPolicy="no-referrer"
            className={`${iconDimensions} object-contain rounded-md drop-shadow-xs`}
            onError={(e) => {
              // fallback if custom URL fails to load
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        {showText && (
          <div className="flex flex-col text-left leading-none">
            <span className={`font-sans font-black tracking-tight ${titleSizes} ${forceWhiteText ? "text-white" : "text-slate-900 dark:text-white"}`}>
              {schoolName}
            </span>
            <span className={`font-mono font-bold uppercase tracking-[0.18em] ${subtextSizes} mt-0.5 ${forceWhiteText ? "text-slate-300" : "text-slate-500 dark:text-slate-400"} hidden min-[440px]:inline-block`}>
              {subtitle || "Sistema Integrado de Gestão"}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Render vector graphic based on preset
  const renderVectorIcon = () => {
    switch (logoPreset) {
      case "academic_crest":
        // 🏛️ Academic Crest & Laurel Wreath
        return (
          <svg className={`${iconDimensions} flex-shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-105`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 12 2 L 19 6 V 12 C 19 17 16 20.5 12 22 C 8 20.5 5 17 5 12 V 6 Z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.12" strokeLinejoin="round" />
            <path d="M 12 7 V 17" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 8.5 10.5 C 10 9 14 9 15.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 8.5 13.5 C 10 12 14 12 15.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="12" cy="5" r="1.2" fill="#facc15" />
          </svg>
        );

      case "open_book":
        // 📖 Open Book & Torch of Knowledge
        return (
          <svg className={`${iconDimensions} flex-shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-105`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 3 19 C 7 18 10 19 12 20.5 C 14 19 17 18 21 19 V 6 C 17 5 14 6 12 7.5 C 10 6 7 5 3 6 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
            <path d="M 12 7.5 V 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 12 3 C 11.5 4 12.5 5 12 6 C 11.5 5 12.5 4 12 3 Z" fill="#facc15" stroke="#facc15" strokeWidth="0.8" />
          </svg>
        );

      case "modern_monogram":
        // ⚡ Modern Monogram Geometric Emblem
        return (
          <svg className={`${iconDimensions} flex-shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-105`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" />
            <path d="M 7 17 L 12 7 L 17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 9 13.5 H 15" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="11" r="1.5" fill="#facc15" />
          </svg>
        );
      case "classic_oz":
        // 🎓 Academic Mortarboard & Golden Laurel Insignia
        return (
          <svg className={`${iconDimensions} flex-shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-105`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cap Top Diamond */}
            <path d="M 12 3 L 22 8 L 12 13 L 2 8 Z" fill="currentColor" />
            {/* Cap Skull Underneath */}
            <path d="M 6 10.5 V 15.5 C 6 18.5, 18 18.5, 18 15.5 V 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            {/* Tassel & Ribbon */}
            <path d="M 20 9 V 16 C 20 17.5, 21.5 17.5, 21.5 16" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="21.5" cy="16.5" r="1" fill="#facc15" />
          </svg>
        );

      case "emerald_shield":
        // 🛡️ Classic Institutional Shield & Open Book
        return (
          <svg className={`${iconDimensions} flex-shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-105`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 12 2 L 20 5.5 V 11.5 C 20 16.5, 16.5 20.5, 12 22 C 7.5 20.5, 4 16.5, 4 11.5 V 5.5 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            {/* Central Book */}
            <path d="M 7 14 C 9 13, 11 13.5, 12 14.5 C 13 13.5, 15 13, 17 14 V 9 C 15 8, 13 8.5, 12 9.5 C 11 8.5, 9 8, 7 9 Z" fill="currentColor" stroke="currentColor" strokeWidth="0.8" />
            <path d="M 12 9.5 V 14.5" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="6" r="1" fill="#facc15" />
          </svg>
        );

      case "magic_wand":
        // 📚 Knowledge Book & Shooting Star Wand
        return (
          <svg className={`${iconDimensions} flex-shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-105`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 4 19.5 C 4 19.5, 7.5 18, 12 18 C 16.5 18, 20 19.5, 20 19.5 V 6 C 20 6, 16.5 4.5, 12 4.5 C 7.5 4.5, 4 6, 4 6 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
            <path d="M 12 4.5 V 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 17 3 L 21 7" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <circle cx="21" cy="3" r="1.2" fill="#facc15" />
            <circle cx="15" cy="5" r="0.6" fill="#facc15" />
          </svg>
        );

      case "rainbow_unicorn":
      case "magic_hat":
      default:
        // 🎩✨ THE ICONIC ORIGINAL MAGIC LEARNING WIZARD'S HAT & MAGIC WAND LOGO:
        // Pointed Wizard's Hat with golden spark stars & crossed wand
        return (
          <svg 
            className={`${iconDimensions} flex-shrink-0 drop-shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-105`} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Magic Wand crossed behind */}
            <path d="M 3 21 L 21 3" stroke={secondaryColor || "#cbd5e1"} strokeWidth="1.8" strokeLinecap="round" />
            {/* Wand Glowing Gold Tip */}
            <path d="M 18 6 L 21 3" stroke="#facc15" strokeWidth="2.4" strokeLinecap="round" />
            {/* Wizard Hat pointed crown with rich curve */}
            <path 
              d="M 6.2 15 C 6.2 15, 5 7.5, 10 3.5 C 11.5 2.3, 13.5 1.8, 14.2 2.8 C 14.8 3.8, 13 5.8, 14 7.8 C 15 9.8, 17.8 15, 17.8 15" 
              fill="currentColor" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              strokeLinejoin="round" 
            />
            {/* Gold Star Emblems on Hat */}
            <path d="M 10 6.2 L 10.3 7 L 11.2 7 L 10.5 7.5 L 10.7 8.3 L 10 7.8 L 9.3 8.3 L 9.5 7.5 L 8.8 7 L 9.7 7 Z" fill="#facc15" />
            <path d="M 13.8 9.5 L 14 10.1 L 14.7 10.1 L 14.1 10.5 L 14.3 11.1 L 13.8 10.7 L 13.3 11.1 L 13.5 10.5 L 12.9 10.1 L 13.6 10.1 Z" fill="#facc15" />
            {/* Hat Contrast Ribbon */}
            <path d="M 6.1 13.5 C 8.2 12.5, 15.8 12.5, 17.9 13.5 L 17.8 15 C 15.5 14, 8.5 14, 6.2 15 Z" fill={secondaryColor || "#cbd5e1"} />
            {/* Hat Brim */}
            <path d="M 3 17 C 3 15.2, 21 15.2, 21 17 C 21 18.8, 3 18.8, 3 17 Z" fill="currentColor" />
            {/* Sparkle Glints around the wand tip */}
            <circle cx="21" cy="1" r="0.65" fill="#facc15" />
            <circle cx="23" cy="3" r="0.55" fill="#facc15" />
            <circle cx="17.5" cy="1.5" r="0.55" fill="#facc15" />
          </svg>
        );
    }
  };

  // Typographic styling
  const renderFormattedName = () => {
    const cleanName = schoolName.replace(/\s+/g, "");
    if (cleanName.toLowerCase().startsWith("magiclearning")) {
      return (
        <span className={`font-sans font-black tracking-tight ${titleSizes} ${forceWhiteText ? "text-white" : "text-slate-900 dark:text-white"}`}>
          Magic<span className="font-semibold" style={{ color: primaryColor }}>Learning</span>
        </span>
      );
    }

    const parts = schoolName.split(" ");
    if (parts.length > 1) {
      const lastWord = parts[parts.length - 1];
      const firstWords = parts.slice(0, parts.length - 1).join(" ");
      return (
        <span className={`font-sans font-black tracking-tight ${titleSizes} ${forceWhiteText ? "text-white" : "text-slate-900 dark:text-white"}`}>
          {firstWords} <span className="font-semibold" style={{ color: primaryColor }}>{lastWord}</span>
        </span>
      );
    }

    return (
      <span className={`font-sans font-black tracking-tight ${titleSizes} ${forceWhiteText ? "text-white" : "text-slate-900 dark:text-white"}`}>
        {schoolName}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 select-none transition-all ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ color: primaryColor }}
    >
      {/* Icon with glowing aura */}
      <div className="relative flex items-center justify-center">
        {renderVectorIcon()}
      </div>

      {/* Brand & Subtitle Typography */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          {renderFormattedName()}
          <span className={`font-mono font-bold uppercase tracking-[0.18em] ${subtextSizes} mt-0.5 ${forceWhiteText ? "text-slate-300" : "text-slate-500 dark:text-slate-400"} hidden min-[440px]:inline-block`}>
            {subtitle || "Sistema Integrado de Gestão"}
          </span>
        </div>
      )}
    </div>
  );
};

export default MagicLearningBrandLogo;
