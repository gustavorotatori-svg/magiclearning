import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Activity, 
  Check, 
  Eye, 
  ShieldAlert,
  Layers,
  Sliders,
  Maximize2
} from "lucide-react";

export type PulseSpeedMode = "lento" | "medio" | "emergencial";

export interface OccurrenceGlowConfig {
  pulseSpeedMode: PulseSpeedMode;
  pulseSpeedSeconds: number;
  glowOpacity: number;
  glowIntensity: number;
  insetIntensity: number;
  shadowSpread: number;
  borderWidth: number;
  highContrast: boolean;
}

interface OccurrenceGlowConfigPanelProps {
  initialConfig?: Partial<OccurrenceGlowConfig>;
  onChange?: (config: OccurrenceGlowConfig) => void;
  compact?: boolean;
  showCardPreview?: boolean;
  className?: string;
  onOpenDetailPreview?: () => void;
}

const SPEED_PRESETS: Record<PulseSpeedMode, { label: string; speed: number; desc: string }> = {
  lento: { label: "Lento", speed: 4.5, desc: "4.5s suave" },
  medio: { label: "Médio", speed: 2.5, desc: "2.5s padrão" },
  emergencial: { label: "Emergencial", speed: 0.8, desc: "0.8s urgente" },
};

export const DEFAULT_GLOW_CONFIG: OccurrenceGlowConfig = {
  pulseSpeedMode: "medio",
  pulseSpeedSeconds: 2.5,
  glowOpacity: 1.0,
  glowIntensity: 1.0,
  insetIntensity: 1.0,
  shadowSpread: 0,
  borderWidth: 1.5,
  highContrast: false,
};

export default function OccurrenceGlowConfigPanel({
  initialConfig,
  onChange,
  compact = false,
  showCardPreview = true,
  className = "",
  onOpenDetailPreview,
}: OccurrenceGlowConfigPanelProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [speedMode, setSpeedMode] = useState<PulseSpeedMode>(() => {
    if (initialConfig?.pulseSpeedMode) return initialConfig.pulseSpeedMode;
    const saved = typeof localStorage !== "undefined" ? (localStorage.getItem("occurrence_pulse_mode") as PulseSpeedMode) : null;
    return saved && SPEED_PRESETS[saved] ? saved : "medio";
  });

  const [speedSeconds, setSpeedSeconds] = useState<number>(() => {
    if (initialConfig?.pulseSpeedSeconds !== undefined) return initialConfig.pulseSpeedSeconds;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("occurrence_pulse_speed") : null;
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 6) return parsed;
    }
    return 2.5;
  });

  const [glowOpacity, setGlowOpacity] = useState<number>(() => {
    if (initialConfig?.glowOpacity !== undefined) return initialConfig.glowOpacity;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("occurrence_glow_opacity") : null;
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.2 && parsed <= 3.0) return parsed;
    }
    return 1.0;
  });

  const [glowIntensity, setGlowIntensity] = useState<number>(() => {
    if (initialConfig?.glowIntensity !== undefined) return initialConfig.glowIntensity;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("occurrence_glow_intensity") : null;
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 3.5) return parsed;
    }
    return 1.0;
  });

  const [insetIntensity, setInsetIntensity] = useState<number>(() => {
    if (initialConfig?.insetIntensity !== undefined) return initialConfig.insetIntensity;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("occurrence_inset_intensity") : null;
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 3.5) return parsed;
    }
    return 1.0;
  });

  const [shadowSpread, setShadowSpread] = useState<number>(() => {
    if (initialConfig?.shadowSpread !== undefined) return initialConfig.shadowSpread;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("occurrence_shadow_spread") : null;
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 12) return parsed;
    }
    return 0;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (initialConfig?.highContrast !== undefined) return initialConfig.highContrast;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("occurrence_high_contrast") : null;
    return saved === "true";
  });

  // Apply variables to document root
  const applyVariables = useCallback((
    sec: number, 
    opacity: number, 
    intensity: number, 
    inset: number, 
    spread: number, 
    hc: boolean, 
    mode: PulseSpeedMode
  ) => {
    const calculatedBorderWidth = hc ? 3.5 : 1.5;
    const calculatedSpread = hc ? Math.max(spread, 6) : spread;
    const calculatedIntensity = hc ? Math.max(intensity, 1.6) : intensity;
    const calculatedInset = hc ? Math.max(inset, 2.0) : inset;

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--occurrence-pulse-speed", `${sec}s`);
      document.documentElement.style.setProperty("--occurrence-glow-opacity", `${opacity}`);
      document.documentElement.style.setProperty("--occurrence-glow-intensity", `${calculatedIntensity}`);
      document.documentElement.style.setProperty("--occurrence-inset-intensity", `${calculatedInset}`);
      document.documentElement.style.setProperty("--occurrence-shadow-spread", `${calculatedSpread}px`);
      document.documentElement.style.setProperty("--occurrence-border-width", `${calculatedBorderWidth}px`);
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("occurrence_pulse_mode", mode);
      localStorage.setItem("occurrence_pulse_speed", `${sec}s`);
      localStorage.setItem("occurrence_glow_opacity", `${opacity}`);
      localStorage.setItem("occurrence_glow_intensity", `${calculatedIntensity}`);
      localStorage.setItem("occurrence_inset_intensity", `${calculatedInset}`);
      localStorage.setItem("occurrence_shadow_spread", `${calculatedSpread}`);
      localStorage.setItem("occurrence_high_contrast", hc ? "true" : "false");
    }

    if (onChangeRef.current) {
      onChangeRef.current({
        pulseSpeedMode: mode,
        pulseSpeedSeconds: sec,
        glowOpacity: opacity,
        glowIntensity: calculatedIntensity,
        insetIntensity: calculatedInset,
        shadowSpread: calculatedSpread,
        borderWidth: calculatedBorderWidth,
        highContrast: hc,
      });
    }
  }, []);

  // Initialize CSS variables on mount
  useEffect(() => {
    applyVariables(speedSeconds, glowOpacity, glowIntensity, insetIntensity, shadowSpread, highContrast, speedMode);
  }, []);

  const handleSpeedModeChange = (mode: PulseSpeedMode) => {
    const sec = SPEED_PRESETS[mode].speed;
    setSpeedMode(mode);
    setSpeedSeconds(sec);
    applyVariables(sec, glowOpacity, glowIntensity, insetIntensity, shadowSpread, highContrast, mode);
  };

  const handleSpeedSliderChange = (sec: number) => {
    let mode: PulseSpeedMode = "medio";
    if (sec <= 1.2) mode = "emergencial";
    else if (sec >= 3.5) mode = "lento";
    setSpeedSeconds(sec);
    setSpeedMode(mode);
    applyVariables(sec, glowOpacity, glowIntensity, insetIntensity, shadowSpread, highContrast, mode);
  };

  const handleInsetChange = (inset: number) => {
    setInsetIntensity(inset);
    applyVariables(speedSeconds, glowOpacity, glowIntensity, inset, shadowSpread, highContrast, speedMode);
  };

  const handleGlowIntensityChange = (intensity: number) => {
    setGlowIntensity(intensity);
    setGlowOpacity(Math.min(intensity, 1.5));
    applyVariables(speedSeconds, Math.min(intensity, 1.5), intensity, insetIntensity, shadowSpread, highContrast, speedMode);
  };

  const handleShadowSpreadChange = (spread: number) => {
    setShadowSpread(spread);
    applyVariables(speedSeconds, glowOpacity, glowIntensity, insetIntensity, spread, highContrast, speedMode);
  };

  const handleHighContrastToggle = (enabled: boolean) => {
    setHighContrast(enabled);
    if (enabled) {
      setShadowSpread(prev => Math.max(prev, 6));
      setGlowIntensity(prev => Math.max(prev, 1.8));
      setInsetIntensity(prev => Math.max(prev, 2.2));
    }
    applyVariables(speedSeconds, glowOpacity, enabled ? Math.max(glowIntensity, 1.8) : glowIntensity, enabled ? Math.max(insetIntensity, 2.2) : insetIntensity, enabled ? Math.max(shadowSpread, 6) : shadowSpread, enabled, speedMode);
  };

  // Quick Environment Luminance Presets
  const applySolarHighLuminance = () => {
    setGlowOpacity(1.8);
    setGlowIntensity(2.2);
    setInsetIntensity(2.4);
    setShadowSpread(4);
    applyVariables(speedSeconds, 1.8, 2.2, 2.4, 4, highContrast, speedMode);
  };

  const applyBalancedRoom = () => {
    setGlowOpacity(1.0);
    setGlowIntensity(1.0);
    setInsetIntensity(1.0);
    setShadowSpread(0);
    applyVariables(speedSeconds, 1.0, 1.0, 1.0, 0, highContrast, speedMode);
  };

  const applyNightSoft = () => {
    setGlowOpacity(0.75);
    setGlowIntensity(0.75);
    setInsetIntensity(0.8);
    setShadowSpread(0);
    applyVariables(speedSeconds, 0.75, 0.75, 0.8, 0, highContrast, speedMode);
  };

  return (
    <div id="occurrence-glow-config-panel" className={`space-y-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 p-4 sm:p-5 ${className}`}>
      {/* Header & Quick Environment Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/60 dark:border-rose-900/50">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-100 font-serif">
              Controle de Itens Críticos (.occurrence-item.is-critical)
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Ajuste a intensidade do <strong className="text-rose-800 dark:text-rose-300">box-shadow</strong>, velocidade da pulsação CSS e modo de alto contraste para visibilidade total.
          </p>
        </div>

        {/* High Contrast Accessibility Toggle & Presets */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* High Contrast Mode Switch */}
          <button
            type="button"
            id="toggle-high-contrast-critical"
            onClick={() => handleHighContrastToggle(!highContrast)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              highContrast
                ? "bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-rose-400"
            }`}
            title="Aumenta a espessura da borda (border-width: 3.5px) e a dispersão da sombra (box-shadow spread) para deficientes visuais e ambientes de luz intensa"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Alto Contraste {highContrast ? "Ativo" : "Desativado"}</span>
          </button>

          {/* 1-Touch Environment Luminance Modes */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-xl border border-rose-200/60 dark:border-rose-900/60">
            <button
              type="button"
              onClick={applySolarHighLuminance}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                glowIntensity >= 2.0 && insetIntensity >= 2.0
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800"
              }`}
              title="Solar: brilho reforçado e borda dupla para luz solar direta"
            >
              <Sun className="w-3 h-3 text-amber-300" />
              <span>Solar</span>
            </button>

            <button
              type="button"
              onClick={applyBalancedRoom}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                glowIntensity === 1.0 && insetIntensity === 1.0 && !highContrast
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800"
              }`}
              title="Padrão: equilíbrio para salas de aula e ambientes internos"
            >
              <Sparkles className="w-3 h-3" />
              <span>Padrão</span>
            </button>

            <button
              type="button"
              onClick={applyNightSoft}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                glowIntensity <= 0.8 && insetIntensity <= 0.85
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800"
              }`}
              title="Noturno: suave para baixa luminosidade"
            >
              <Moon className="w-3 h-3" />
              <span>Noturno</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Grid: Box-Shadow Intensity, Inset/Spread, Speed Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* 1. Box-Shadow Intensity Slider */}
        <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-rose-200/60 dark:border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-rose-600" />
              <span>Intensidade do Box-Shadow</span>
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
              {glowIntensity.toFixed(1)}x ({Math.round(glowIntensity * 100)}%)
            </span>
          </div>

          <input
            type="range"
            id="slider-box-shadow-intensity"
            min={0.4}
            max={3.0}
            step={0.1}
            value={glowIntensity}
            onChange={(e) => handleGlowIntensityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-rose-600"
          />

          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0.4x (Mínimo)</span>
            <span>1.0x (Padrão)</span>
            <span>3.0x (Extremo)</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-tight">
            Controla o alcance e vibração do brilho externo (<code className="font-mono text-[9px]">box-shadow</code>) do item crítico.
          </p>
        </div>

        {/* 2. Inset & Dispersão (Spread) */}
        <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-rose-200/60 dark:border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Borda Interna & Expansão</span>
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
              {insetIntensity.toFixed(1)}x / +{shadowSpread}px
            </span>
          </div>

          <input
            type="range"
            id="slider-inset-intensity"
            min={0.5}
            max={3.0}
            step={0.1}
            value={insetIntensity}
            onChange={(e) => handleInsetChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-amber-600"
          />

          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0.5x (Fina)</span>
            <span>1.0x (Padrão)</span>
            <span>3.0x (Marcante)</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-tight">
            Aumenta a borda interna (<code className="font-mono text-[9px]">inset shadow</code>) mantendo a legibilidade em alta luminosidade.
          </p>
        </div>

        {/* 3. CSS Pulse Speed Variable Slider */}
        <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-rose-200/60 dark:border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span>Velocidade da Pulsação CSS</span>
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
              {speedSeconds.toFixed(1)}s ({speedMode})
            </span>
          </div>

          <input
            type="range"
            id="slider-pulse-speed"
            min={0.5}
            max={5.5}
            step={0.1}
            value={speedSeconds}
            onChange={(e) => handleSpeedSliderChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-rose-600"
          />

          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0.5s (Emergência)</span>
            <span>2.5s (Médio)</span>
            <span>5.5s (Lento)</span>
          </div>
          <div className="flex items-center gap-1 pt-0.5">
            {(["lento", "medio", "emergencial"] as PulseSpeedMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleSpeedModeChange(mode)}
                className={`flex-1 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  speedMode === mode
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100/50"
                }`}
              >
                {SPEED_PRESETS[mode].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Interactive Simulation Card (.occurrence-item.is-critical) */}
      {showCardPreview && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1.5">
              <span>Pré-visualização do Item Crítico:</span>
              {highContrast && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-black uppercase">
                  Alto Contraste Ativo
                </span>
              )}
            </span>
            <span className="font-mono text-[10px] text-rose-700 dark:text-rose-300">
              --occurrence-pulse-speed: {speedSeconds.toFixed(1)}s | --occurrence-glow-intensity: {glowIntensity.toFixed(1)}
            </span>
          </div>

          <div 
            id="critical-preview-card"
            data-high-contrast={highContrast ? "true" : "false"}
            style={{
              "--occurrence-pulse-speed": `${speedSeconds}s`,
              "--occurrence-glow-opacity": glowOpacity,
              "--occurrence-glow-intensity": glowIntensity,
              "--occurrence-inset-intensity": insetIntensity,
              "--occurrence-shadow-spread": `${highContrast ? Math.max(shadowSpread, 6) : shadowSpread}px`,
              "--occurrence-border-width": `${highContrast ? 3.5 : 1.5}px`,
            } as React.CSSProperties}
            onClick={onOpenDetailPreview}
            className={`occurrence-item is-critical ${highContrast ? "high-contrast-alert" : ""} p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-500 dark:border-rose-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none transition-all shadow-sm cursor-pointer hover:scale-[1.008]`}
            title="Clique para abrir modal com histórico detalhado deste evento crítico"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-xs animate-bounce">
                🚨
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-rose-950 dark:text-rose-100 text-xs">
                    Ocorrência Crítica (.occurrence-item.is-critical)
                  </span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">
                    Toque para abrir Detalhes Completos
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Box-Shadow: <strong>{glowIntensity.toFixed(1)}x</strong> | Inset: <strong>{insetIntensity.toFixed(1)}x</strong> | Borda: <strong>{highContrast ? "3.5px (Alto Contraste)" : "1.5px"}</strong> | Pulso: <strong>{speedSeconds.toFixed(1)}s</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-rose-600" />
                <span>Ver Modal de Detalhes</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
