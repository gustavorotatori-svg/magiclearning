import React, { useState } from "react";
import { 
  ArrowRight, 
  ChevronRight, 
  Check, 
  Smartphone, 
  Monitor, 
  WifiOff, 
  Menu, 
  X, 
  GraduationCap,
  ShieldCheck,
  Zap,
  Sparkles,
  QrCode,
  BellRing,
  Award,
  Clock,
  Layers,
  Heart,
  Calendar,
  CheckCircle2,
  Lock,
  ChevronDown,
  Palette,
  PhoneCall,
  BookOpen,
  UserCheck,
  Star,
  ExternalLink,
  Shield
} from "lucide-react";
import { SchoolBranding } from "../types";
import { TranslationSet } from "../translations";
import { ThemePreference } from "../utils/themeManager";
import { ThemeSelector } from "./ThemeSelector";
import { LanguageSelector } from "./LanguageSelector";
import { SupportedLocale, getLandingText } from "../utils/i18n";
import { MagicLearningBrandLogo } from "./MagicLearningBrandLogo";
import { MagicalSubtleBackground } from "./MagicalSubtleBackground";
import schoolHeroStudents from "../assets/images/school_hero_students_1791766393767.jpg";
import schoolClassroomActivity from "../assets/images/school_classroom_activity_1791766404581.jpg";
import { InstitutionalFooter } from "./InstitutionalFooter";

export interface CampusOption {
  name: string;
  theme: string;
  primaryColor: string;
  secondaryColor?: string;
  badge: string;
}

export const CAMPUS_PRESETS: CampusOption[] = [
  { 
    name: "Colégio Alpha Integrado", 
    theme: "classic-navy", 
    primaryColor: "#0F2942", 
    secondaryColor: "#E29578", 
    badge: "Tradição & Excelência" 
  },
  { 
    name: "Maple Hill International", 
    theme: "forest-mint", 
    primaryColor: "#1B4332", 
    secondaryColor: "#D8F3DC", 
    badge: "Currículo Bilíngue" 
  },
  { 
    name: "Liceu Aurora Inovação", 
    theme: "cosmic-indigo", 
    primaryColor: "#3A0CA3", 
    secondaryColor: "#F72585", 
    badge: "Steam & Criatividade" 
  }
];

interface InstitutionalLandingProps {
  branding: SchoolBranding;
  activeThemePreset: string;
  locale: SupportedLocale;
  onLocaleChanged: (locale: SupportedLocale) => void;
  onEnterPortals: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  themePreference?: ThemePreference;
  onSelectThemePreference?: (pref: ThemePreference) => void;
  translations?: Record<string, TranslationSet>;
  onOpenWhiteLabel?: () => void;
  onOpenAuth?: (gate: "pais" | "escola", tab: "login" | "signup") => void;
  onEnterDemoPortal: (role: "pais" | "escola" | "aluno") => void;
  estudantes: Array<{ id: string; name: string; grade: string }>;
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  isOffline?: boolean;
  onSelectCampus?: (campus: CampusOption) => void;
}

// Subtle tactile sound cues for interactive feedback
const playTactileAudio = (freq = 880, duration = 0.06) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback if audio is blocked
  }
};

export const InstitutionalLanding: React.FC<InstitutionalLandingProps> = ({
  branding,
  locale = "pt",
  onLocaleChanged,
  onToggleDarkMode,
  isDarkMode,
  themePreference = "system",
  onSelectThemePreference,
  onOpenWhiteLabel,
  onOpenAuth,
  onEnterDemoPortal,
  estudantes,
  selectedStudentId,
  onSelectStudent,
  isOffline = false,
  onSelectCampus,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [heroInteractiveTab, setHeroInteractiveTab] = useState<"gestao" | "familia" | "portaria">("gestao");
  
  // Interactive preview live states
  const [liveGateScanSuccess, setLiveGateScanSuccess] = useState(false);
  const [liveRoutineChecked, setLiveRoutineChecked] = useState(true);
  const [activeInfoModal, setActiveInfoModal] = useState<"planos" | "contato" | null>(null);

  // Contact form modal state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const currentThemeColor = branding.primaryColor || "#0F2942";
  const schoolName = branding.schoolName || "Magic Learning";

  const handleSimulateGateScan = () => {
    playTactileAudio(1046, 0.1);
    setLiveGateScanSuccess(true);
    setTimeout(() => {
      setLiveGateScanSuccess(false);
    }, 3500);
  };

  const handleSelectCampusLocal = (campus: CampusOption) => {
    playTactileAudio(659, 0.08);
    if (onSelectCampus) {
      onSelectCampus(campus);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative z-10 w-full font-sans antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100 transition-colors">
      
      {/* Dynamic Ambient Background Illumination */}
      <MagicalSubtleBackground 
        primaryColor={currentThemeColor} 
        secondaryColor={branding.secondaryColor || "#C4CED4"} 
      />


      {/* =========================================================================
          TOP NAVIGATION BAR
      ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Crest Identity */}
          <div className="flex items-center gap-3">
            <MagicLearningBrandLogo
              size="sm"
              showText={false}
              schoolName={schoolName}
              primaryColor={currentThemeColor}
              logoType={branding.logoType}
              customLogoUrl={branding.customLogoUrl}
              logoPreset={branding.logoPreset}
            />
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                {schoolName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
                {getLandingText("heroBadge", locale)}
              </span>
            </div>
          </div>

          {/* Center Campus Multi-Tenant Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            {CAMPUS_PRESETS.map((campus) => {
              const isSelected = schoolName === campus.name;
              return (
                <button
                  key={campus.name}
                  onClick={() => handleSelectCampusLocal(campus)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected 
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                  title={`Alternar para ${campus.name}`}
                >
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: campus.primaryColor }} 
                  />
                  <span>{campus.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Right Actions Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isOffline && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            {/* Language Selector */}
            <LanguageSelector
              currentLocale={locale}
              onSelectLocale={onLocaleChanged}
              variant="compact"
              showLabel={true}
            />

            {/* Theme Selector (Auto: 6h-18h claro, 18h-24h escuro, ou manual) */}
            <ThemeSelector
              themePreference={themePreference}
              onSelectTheme={(pref) => {
                playTactileAudio(520, 0.05);
                if (onSelectThemePreference) {
                  onSelectThemePreference(pref);
                } else {
                  onToggleDarkMode();
                }
              }}
              variant="compact"
              locale={locale}
            />

            {/* Direct Portal Navigation Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {
                  playTactileAudio(784, 0.06);
                  if (onOpenAuth) onOpenAuth("pais", "login");
                  else onEnterDemoPortal("pais");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                {getLandingText("navLogin", locale)}
              </button>
              
              <button
                onClick={() => {
                  playTactileAudio(880, 0.08);
                  onEnterDemoPortal("escola");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95"
                style={{ backgroundColor: currentThemeColor }}
              >
                <span>{getLandingText("heroDeployBtn", locale)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
              aria-label="Menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="md:hidden pt-4 pb-3 border-t border-slate-200 dark:border-slate-800 mt-3 space-y-3.5 animate-in fade-in">
            {/* Quick Language & Theme Controls on Mobile */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  {locale === "en" ? "Interface Theme:" : "Tema da Interface:"}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {locale === "en" ? "6 AM - 6 PM light • 6 PM - 12 AM dark" : "6h-18h claro • 18h-24h escuro"}
                </span>
              </div>
              <ThemeSelector
                themePreference={themePreference}
                onSelectTheme={(pref) => {
                  playTactileAudio(520, 0.05);
                  if (onSelectThemePreference) {
                    onSelectThemePreference(pref);
                  } else {
                    onToggleDarkMode();
                  }
                }}
                variant="segmented"
                locale={locale}
                className="w-full justify-between"
              />

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  {locale === "en" ? "Language:" : "Idioma:"}
                </span>
                <LanguageSelector
                  currentLocale={locale}
                  onSelectLocale={onLocaleChanged}
                  variant="dropdown"
                  showLabel={true}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {locale === "en" ? "School Campus Unit:" : "Unidade Escolar:"}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {CAMPUS_PRESETS.map((campus) => (
                  <button
                    key={campus.name}
                    onClick={() => {
                      handleSelectCampusLocal(campus);
                      setShowMobileMenu(false);
                    }}
                    className="p-2.5 rounded-lg text-left text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: campus.primaryColor }} />
                    <span className="font-semibold">{campus.name}</span>
                    <span className="text-[10px] text-slate-400 ml-auto font-mono">{campus.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onEnterDemoPortal("escola");
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center cursor-pointer shadow-sm"
                style={{ backgroundColor: currentThemeColor }}
              >
                {locale === "en" ? "School Management Portal" : "Painel da Escola (Gestão)"}
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onEnterDemoPortal("pais");
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center cursor-pointer"
              >
                {locale === "en" ? "Family Portal (Parents)" : "Portal da Família (Pais)"}
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onEnterDemoPortal("aluno");
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center cursor-pointer"
              >
                {locale === "en" ? "Student Mode" : "Modo Estudante"}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION: EDITORIAL, FOCUSED AND RESPONSIVE
      ========================================================================= */}
      <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{branding?.schoolName || "Colégio Alpha Integrado"} · Ano Letivo 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
              {locale === "en" ? "Clear communication between families and school." : "Comunicação clara entre famílias e escola."}
            </h1>

            <p className="text-base sm:text-lg text-slate-650 dark:text-slate-300 font-sans max-w-xl leading-relaxed">
              {locale === "en"
                ? "Routine updates, secure gatekeeper QR release, and academic journey in a calm, focused environment."
                : "Rotina em tempo real, liberação ágil na portaria e acompanhamento pedagógico sem ruídos ou complexidade desnecessária."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onEnterDemoPortal("pais")}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-sans font-bold text-sm transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-2"
              >
                <span>{locale === "en" ? "Enter as Family" : "Acessar como Família"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onEnterDemoPortal("escola")}
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 font-sans font-bold text-sm transition-all shadow-2xs active:scale-98 cursor-pointer flex items-center gap-2"
              >
                <span>{locale === "en" ? "School Administration" : "Painel da Gestão"}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                {locale === "en" ? "Existing user login →" : "Já possui conta? Entrar →"}
              </button>
            </div>

            {/* Quiet Trust Points */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/60 dark:border-slate-800/60 max-w-lg text-left">
              <div>
                <strong className="block text-lg font-serif font-black text-slate-950 dark:text-white">99.8%</strong>
                <span className="text-[11px] text-slate-500 font-sans">Pontualidade na Portaria</span>
              </div>
              <div>
                <strong className="block text-lg font-serif font-black text-slate-950 dark:text-white">100%</strong>
                <span className="text-[11px] text-slate-500 font-sans">Privacidade & LGPD</span>
              </div>
              <div>
                <strong className="block text-lg font-serif font-black text-slate-950 dark:text-white">&lt; 2 min</strong>
                <span className="text-[11px] text-slate-500 font-sans">Tempo Médio de Saída</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Editorial Campus Imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
              <img
                src={schoolHeroStudents}
                alt="Estudantes em ambiente escolar"
                className="w-full h-[360px] sm:h-[440px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Campus Alpha Integrado
                </span>
                <p className="text-sm font-semibold leading-snug">
                  Ambiente seguro, focado no desenvolvimento integral de cada aluno.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          PILARES FUNCIONAIS (3 ARQUITETURAS PRINCIPAIS)
      ========================================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-left space-y-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
              Arquitetura Operacional
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 dark:text-white">
              {getLandingText("pillarsTitle", locale)}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pilar 1: Portaria */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-950 dark:text-white">
                  {getLandingText("feature1Title", locale)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {getLandingText("feature1Desc", locale)}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {getLandingText("feature1Metric", locale)}
                </span>
                <button
                  type="button"
                  onClick={() => onEnterDemoPortal("escola")}
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  Conferir →
                </button>
              </div>
            </div>

            {/* Pilar 2: Diário & Saúde */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-950 dark:text-white">
                  {getLandingText("feature2Title", locale)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {getLandingText("feature2Desc", locale)}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {getLandingText("feature2Metric", locale)}
                </span>
                <button
                  type="button"
                  onClick={() => onEnterDemoPortal("pais")}
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  Conferir →
                </button>
              </div>
            </div>

            {/* Pilar 3: Boletim & Acadêmico */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-950 dark:text-white">
                  {getLandingText("feature3Title", locale)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {getLandingText("feature3Desc", locale)}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {getLandingText("feature3Metric", locale)}
                </span>
                <button
                  type="button"
                  onClick={() => onEnterDemoPortal("escola")}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  Conferir →
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          WHITE-LABEL & MARCA PRÓPRIA (EXCLUSIVIDADE INSTITUCIONAL)
      ========================================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-10 relative overflow-hidden text-left border border-slate-800">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-semibold block">
                {getLandingText("whiteLabelBadge", locale)}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-tight">
                {getLandingText("whiteLabelTitle", locale)}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                {getLandingText("whiteLabelDesc", locale)}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                {onOpenWhiteLabel && (
                  <button
                    type="button"
                    onClick={onOpenWhiteLabel}
                    className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-slate-950 hover:bg-slate-100 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <Palette className="w-4 h-4 text-slate-900" />
                    <span>Personalizar Visual</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveInfoModal("planos")}
                  className="px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer border border-slate-700 active:scale-95"
                >
                  Condições
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative group">
                <img
                  src={schoolClassroomActivity}
                  alt="Atividades escolares diárias"
                  className="w-full h-56 sm:h-64 object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-wider text-slate-300 bg-slate-950/80 px-2 py-1 rounded backdrop-blur-xs">
                  {locale === "en" ? "Interactive Classroom" : "Ambiente Pedagógico Ativo"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER INSTITUCIONAL COMPLETO & PROFISSIONAL
      ========================================================================= */}
      <InstitutionalFooter
        schoolName={schoolName}
        primaryColor={currentThemeColor}
        onOpenAuth={onOpenAuth}
        onNavigateToDemo={onEnterDemoPortal}
        className="mt-auto"
      />

      {/* =========================================================================
          MODAL: PLANOS & VALORES
      ========================================================================= */}
      {activeInfoModal === "planos" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 text-left relative">
            
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
                {getLandingText("pricingBadge", locale)}
              </span>
              <h3 className="font-serif font-black text-2xl text-slate-950 dark:text-white">
                {getLandingText("pricingTitle", locale)}
              </h3>
              <p className="text-xs text-slate-500">
                {getLandingText("pricingDesc", locale)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {getLandingText("planTitle", locale)}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {getLandingText("planDesc", locale)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {getLandingText("planPrice", locale)}
                  </span>
                  <span className="text-xs text-slate-400">{getLandingText("planPeriod", locale)}</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{getLandingText("planFeat1", locale)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{getLandingText("planFeat2", locale)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Diário de rotina, comunicados com leitura e boletim 4 bimestres</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Módulo financeiro com Pix automático e réguas de cobrança</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveInfoModal(null);
                  onEnterDemoPortal("escola");
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer"
                style={{ backgroundColor: currentThemeColor }}
              >
                Começar Teste Livre de 60 Dias
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONTATO / ESPECIALISTA
      ========================================================================= */}
      {activeInfoModal === "contato" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5 text-left relative">
            
            <button
              onClick={() => {
                setActiveInfoModal(null);
                setContactSubmitted(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-black text-xl text-slate-900 dark:text-white">
                  {getLandingText("contactSuccessTitle", locale)}
                </h3>
                <p className="text-xs text-slate-500">
                  {getLandingText("contactSuccessDesc", locale)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveInfoModal(null);
                    setContactSubmitted(false);
                  }}
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: currentThemeColor }}
                >
                  Concluir
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-xl text-slate-950 dark:text-white">
                    {getLandingText("contactTitle", locale)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {getLandingText("contactSubtitle", locale)}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-3 pt-2"
                >
                  <div>
                    <label className="text-[11px] font-mono text-slate-800 dark:text-slate-200 block mb-1 font-semibold">
                      {getLandingText("contactFormName", locale)}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Diretora / Coordenador"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-800 dark:text-slate-200 block mb-1 font-semibold">
                      {getLandingText("contactFormEmail", locale)}
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contato@colegio.com.br"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer"
                    style={{ backgroundColor: currentThemeColor }}
                  >
                    Enviar Solicitação
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
