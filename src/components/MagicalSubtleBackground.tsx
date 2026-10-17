import React from "react";

interface MagicalSubtleBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export const MagicalSubtleBackground: React.FC<MagicalSubtleBackgroundProps> = ({
  primaryColor = "#0077C0",
  secondaryColor = "#C4CED4"
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" id="institutional-ambient-bg">
      {/* 1. Subtle, low-contrast ambient illumination (Refined Dynamic Mesh) */}
      <div 
        className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-25 dark:opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 70%)`
        }}
      />
      <div 
        className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-20 dark:opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${secondaryColor}25 0%, transparent 75%)`
        }}
      />

      {/* 2. Micro Architectural Grid & Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* 3. Soft vignette for visual focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.02))] dark:bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.2))] pointer-events-none" />
    </div>
  );
};

