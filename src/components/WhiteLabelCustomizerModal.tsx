import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Palette,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Check,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Layers,
  ArrowLeft
} from "lucide-react";
import { SchoolBranding } from "../types";
import { MagicLearningBrandLogo } from "./MagicLearningBrandLogo";
import {
  SYSTEM_MODULES,
  THEME_PRESET_OPTIONS,
  DEFAULT_FEED_MODULE_ORDER,
  getDefaultBranding,
  applyBrandingToCssVariables,
} from "../utils/whiteLabelDefaults";

interface WhiteLabelCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: SchoolBranding;
  onSaveBranding: (updated: SchoolBranding) => void;
  onToast: (message: string, type: "success" | "info" | "error" | "mastery") => void;
}

export const WhiteLabelCustomizerModal: React.FC<WhiteLabelCustomizerModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSaveBranding,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<"identidade" | "temas" | "modulos" | "feed">("identidade");
  
  // Internal copy of configuration for editing before committing
  const [currentConfig, setCurrentConfig] = useState<SchoolBranding>(() => {
    return {
      ...getDefaultBranding(),
      ...branding,
      enabledModules: branding.enabledModules || getDefaultBranding().enabledModules,
      feedModuleOrder: branding.feedModuleOrder && branding.feedModuleOrder.length > 0
        ? branding.feedModuleOrder
        : [...DEFAULT_FEED_MODULE_ORDER],
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if branding changes externally
  React.useEffect(() => {
    if (isOpen) {
      setCurrentConfig({
        ...getDefaultBranding(),
        ...branding,
        enabledModules: branding.enabledModules || getDefaultBranding().enabledModules,
        feedModuleOrder: branding.feedModuleOrder && branding.feedModuleOrder.length > 0
          ? branding.feedModuleOrder
          : [...DEFAULT_FEED_MODULE_ORDER],
      });
    }
  }, [isOpen, branding]);

  if (!isOpen) return null;

  const handleUpdate = (patch: Partial<SchoolBranding>) => {
    setCurrentConfig((prev) => {
      const updated = { ...prev, ...patch };
      return updated;
    });
  };

  const handleSaveAndApply = () => {
    onSaveBranding(currentConfig);
    applyBrandingToCssVariables(currentConfig);
    onToast(`✨ Identidade White-Label salva e aplicada para "${currentConfig.schoolName}"!`, "success");
    onClose();
  };

  const handleResetDefaults = () => {
    const defaultData = getDefaultBranding();
    setCurrentConfig(defaultData);
    onSaveBranding(defaultData);
    applyBrandingToCssVariables(defaultData);
    onToast("Identidade visual restaurada para os padrões oficiais.", "info");
  };

  // Image file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onToast("Selecione um arquivo de imagem válido (PNG, JPG, SVG ou WebP).", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onToast("A imagem do logotipo deve ter no máximo 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleUpdate({
        logoType: "upload",
        customLogoUrl: base64,
      });
      onToast("Logotipo carregado com sucesso!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Module toggle handler
  const toggleModule = (moduleId: string) => {
    const currentModules = currentConfig.enabledModules || {};
    const updated = {
      ...currentModules,
      [moduleId]: !currentModules[moduleId],
    };
    handleUpdate({ enabledModules: updated });
  };

  // Feed reorder handler
  const moveFeedItem = (index: number, direction: "up" | "down") => {
    const list = [...(currentConfig.feedModuleOrder || DEFAULT_FEED_MODULE_ORDER)];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    handleUpdate({ feedModuleOrder: list });
  };

  const moveFeedItemToTop = (index: number) => {
    const list = [...(currentConfig.feedModuleOrder || DEFAULT_FEED_MODULE_ORDER)];
    if (index === 0) return;
    const [moved] = list.splice(index, 1);
    list.unshift(moved);
    handleUpdate({ feedModuleOrder: list });
  };

  // Preset order sequences
  const applyPresetFeedOrder = (preset: "pedagogico" | "comunicacao" | "rotina") => {
    if (preset === "pedagogico") {
      handleUpdate({
        feedModuleOrder: ["metas", "academico", "diaadia", "engajamento", "comunicados", "agenda", "cobrancas", "acesso", "momentos"]
      });
      onToast("Ordem aplicada: Foco Pedagógico & Metas no topo!", "info");
    } else if (preset === "comunicacao") {
      handleUpdate({
        feedModuleOrder: ["comunicados", "agenda", "momentos", "diaadia", "metas", "academico", "cobrancas", "acesso", "engajamento"]
      });
      onToast("Ordem aplicada: Foco em Comunicação & Eventos no topo!", "info");
    } else if (preset === "rotina") {
      handleUpdate({
        feedModuleOrder: ["diaadia", "engajamento", "metas", "acesso", "comunicados", "agenda", "academico", "cobrancas", "momentos"]
      });
      onToast("Ordem aplicada: Foco em Rotina Diária & Portaria no topo!", "info");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: `${currentConfig.primaryColor}15`,
                color: currentConfig.primaryColor,
              }}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Central de Customização White-Label
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  100% Customizável
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize logotipo, temas, paleta de cores, módulos ativos e sequência do feed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
          {[
            { id: "identidade", label: "1. Logotipo & Nome", icon: Sparkles },
            { id: "temas", label: "2. Cores & Temas", icon: Palette },
            { id: "modulos", label: "3. Módulos Ativos", icon: LayoutGrid },
            { id: "feed", label: "4. Sequência do Feed", icon: ArrowUpDown },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-3.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-amber-500 text-slate-900 dark:text-white font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-amber-500" : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: LOGOTIPO & IDENTIDADE */}
          {activeTab === "identidade" && (
            <div className="space-y-6">
              
              {/* Institution Identity Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Nome Oficial da Instituição de Ensino
                  </label>
                  <input
                    type="text"
                    value={currentConfig.schoolName}
                    onChange={(e) => handleUpdate({ schoolName: e.target.value })}
                    placeholder="Ex: Colégio Anglo Americano"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    Aparece no cabeçalho, boletins, tela de login e comunicados da escola.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Slogan / Subtítulo Institucional
                  </label>
                  <input
                    type="text"
                    value={currentConfig.schoolSlogan || ""}
                    onChange={(e) => handleUpdate({ schoolSlogan: e.target.value })}
                    placeholder="Ex: Educação que Transforma o Futuro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    Exibido logo abaixo do nome nas telas institucionais.
                  </p>
                </div>
              </div>

              {/* Logo Source Toggle */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Tipo de Logotipo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "preset", label: "Presets Vetoriais", desc: "8 insígnias prontas" },
                    { id: "custom_url", label: "URL de Imagem", desc: "Link PNG/SVG direto" },
                    { id: "upload", label: "Upload de Arquivo", desc: "PNG/SVG do seu computador" },
                  ].map((mode) => {
                    const isSelected = (currentConfig.logoType || "preset") === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleUpdate({ logoType: mode.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{mode.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{mode.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LOGO SELECTION ACCORDING TO TYPE */}
              {currentConfig.logoType === "preset" || !currentConfig.logoType ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Escolha um Preset de Insígnia Escolar
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "magic_hat", label: "Chapéu Mágico", desc: "Original Magic Learning" },
                      { id: "academic_crest", label: "Brasão Acadêmico", desc: "Universitário / Tradição" },
                      { id: "emerald_shield", label: "Escudo Institucional", desc: "Segurança & Rigor" },
                      { id: "open_book", label: "Livro do Saber", desc: "Pedagógico & Leitura" },
                      { id: "modern_monogram", label: "Monograma Moderno", desc: "Geométrico / Tech" },
                      { id: "classic_oz", label: "Capelo de Formatura", desc: "Conquista & Futuro" },
                      { id: "magic_wand", label: "Varinha do Conhecimento", desc: "Criatividade & Arte" },
                      { id: "rainbow_unicorn", label: "Inovação Vibrante", desc: "Educação Infantil" },
                    ].map((preset) => {
                      const isSelected = currentConfig.logoPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleUpdate({ logoPreset: preset.id as any })}
                          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white ring-1 ring-amber-500"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div
                            className="p-2 rounded-lg"
                            style={{ color: currentConfig.primaryColor }}
                          >
                            <MagicLearningBrandLogo
                              size="sm"
                              showText={false}
                              logoPreset={preset.id as any}
                              primaryColor={currentConfig.primaryColor}
                              secondaryColor={currentConfig.secondaryColor}
                            />
                          </div>
                          <div className="space-y-0.5">
                            <strong className="text-xs font-bold block">{preset.label}</strong>
                            <span className="text-[9.5px] text-slate-400 block">{preset.desc}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                              Ativo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : currentConfig.logoType === "custom_url" ? (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <LinkIcon className="w-4 h-4 text-amber-500" />
                    <span>URL Externa da Imagem do Logotipo</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentConfig.customLogoUrl || ""}
                      onChange={(e) => handleUpdate({ customLogoUrl: e.target.value })}
                      placeholder="https://suaescola.com.br/assets/logo.png"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Recomendado: imagem PNG ou SVG com fundo transparente, proporção aproximada de 1:1 ou 3:1.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-center space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                      Carregar Imagem do Logo Institucional
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Suporta PNG, JPG, SVG ou WebP (máx. 2MB).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Selecionar Arquivo
                  </button>
                  {currentConfig.customLogoUrl && (
                    <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Imagem carregada e pronta para uso!
                    </span>
                  )}
                </div>
              )}

              {/* LIVE LOGO PREVIEW DOCK */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    Pré-visualização do Logotipo ao Vivo
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Renderização em Tempo Real</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Navbar appearance */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Na Barra Superior</span>
                      <div className="mt-2">
                        <MagicLearningBrandLogo
                          size="md"
                          showText={true}
                          schoolName={currentConfig.schoolName}
                          subtitle={currentConfig.schoolSlogan}
                          logoType={currentConfig.logoType}
                          customLogoUrl={currentConfig.customLogoUrl}
                          logoPreset={currentConfig.logoPreset}
                          primaryColor={currentConfig.primaryColor}
                          secondaryColor={currentConfig.secondaryColor}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dark mode / Contrasting appearance */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Em Superfície Escura</span>
                      <div className="mt-2">
                        <MagicLearningBrandLogo
                          size="md"
                          showText={true}
                          forceWhiteText={true}
                          schoolName={currentConfig.schoolName}
                          subtitle={currentConfig.schoolSlogan}
                          logoType={currentConfig.logoType}
                          customLogoUrl={currentConfig.customLogoUrl}
                          logoPreset={currentConfig.logoPreset}
                          primaryColor={currentConfig.primaryColor}
                          secondaryColor={currentConfig.secondaryColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CORES & TEMAS */}
          {activeTab === "temas" && (
            <div className="space-y-6">
              
              {/* Presets Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Temas Institucionais Prontos (1-Clique)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Design Systems Curados</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {THEME_PRESET_OPTIONS.map((theme) => {
                    const isSelected = currentConfig.themePreset === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          handleUpdate({
                            themePreset: theme.id,
                            primaryColor: theme.primary,
                            secondaryColor: theme.secondary,
                            accentColor: theme.accent,
                            logoPreset: theme.logo,
                          });
                          onToast(`Tema "${theme.name}" selecionado!`, "info");
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white ring-1 ring-amber-500"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            {theme.category}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                              Ativo
                            </span>
                          )}
                        </div>

                        <div>
                          <strong className="text-xs font-bold block">{theme.name}</strong>
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            {theme.desc}
                          </span>
                        </div>

                        {/* Swatches */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20"
                            style={{ backgroundColor: theme.primary }}
                            title={`Primária: ${theme.primary}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20"
                            style={{ backgroundColor: theme.secondary }}
                            title={`Secundária: ${theme.secondary}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20"
                            style={{ backgroundColor: theme.accent }}
                            title={`Destaque: ${theme.accent}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Custom Color Pickers */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                    Personalização Granular de Cores
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Hexadecimal & Color Picker</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Primary color */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Cor Primária da Instituição
                    </span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={currentConfig.primaryColor}
                        onChange={(e) => {
                          handleUpdate({
                            primaryColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentConfig.primaryColor}
                        onChange={(e) => {
                          handleUpdate({
                            primaryColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-24 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Botões principais, ícones de destaque e links.</p>
                  </div>

                  {/* Secondary color */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Cor Secundária / Superfície
                    </span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={currentConfig.secondaryColor}
                        onChange={(e) => {
                          handleUpdate({
                            secondaryColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentConfig.secondaryColor}
                        onChange={(e) => {
                          handleUpdate({
                            secondaryColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-24 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Bordas secundárias, badges e acentos sutis.</p>
                  </div>

                  {/* Accent color */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Cor de Destaque (Accent)
                    </span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={currentConfig.accentColor || "#F59E0B"}
                        onChange={(e) => {
                          handleUpdate({
                            accentColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentConfig.accentColor || "#F59E0B"}
                        onChange={(e) => {
                          handleUpdate({
                            accentColor: e.target.value,
                            themePreset: "custom",
                          });
                        }}
                        className="w-24 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Notificações, estrelas de avaliação e medalhas.</p>
                  </div>

                </div>
              </div>

              {/* Design System Style: Border Radius & Typography */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Border Radius */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Raio de Borda dos Cartões & Botões
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "compact", label: "Reto (6px)" },
                      { id: "rounded", label: "Padrão (14px)" },
                      { id: "curved", label: "Suave (22px)" },
                    ].map((radius) => {
                      const isSelected = (currentConfig.borderRadius || "rounded") === radius.id;
                      return (
                        <button
                          key={radius.id}
                          type="button"
                          onClick={() => handleUpdate({ borderRadius: radius.id as any })}
                          className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {radius.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Preset */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Família Tipográfica
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "sans", label: "Sans Contemporâneo", sample: "Inter / Modern UI" },
                      { id: "serif", label: "Serif Acadêmico", sample: "Playfair / Tradição" },
                    ].map((font) => {
                      const isSelected = (currentConfig.fontPreset || "sans") === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => handleUpdate({ fontPreset: font.id as any })}
                          className={`py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span className="text-xs font-bold block">{font.label}</span>
                          <span className="text-[10px] text-slate-400">{font.sample}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: MÓDULOS ATIVOS (HABILITAR / DESABILITAR) */}
          {activeTab === "modulos" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2 text-xs">
                  <Layers className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>Controle Modular White-Label:</strong> Desmarque qualquer módulo que a escola não desejar disponibilizar para famílias ou equipe. As abas de navegação, rotas e buscas respeitarão essas escolhas.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {SYSTEM_MODULES.map((mod) => {
                  const isEnabled = currentConfig.enabledModules?.[mod.id] !== false;
                  return (
                    <div
                      key={mod.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isEnabled
                          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                          : "bg-slate-50 dark:bg-slate-950/60 border-slate-200/50 dark:border-slate-800/40 opacity-70"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-slate-900 dark:text-white">
                            {mod.name}
                          </strong>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              mod.category === "pedagogico"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                : mod.category === "financeiro"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : mod.category === "comunicacao"
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                                : mod.category === "seguranca"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {mod.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {mod.description}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1">
                          {isEnabled ? "✓ Módulo visível no sistema" : "✕ Módulo oculto no sistema"}
                        </span>
                      </div>

                      {/* Interactive toggle switch */}
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className={`relative w-12 h-6.5 rounded-full transition-colors shrink-0 cursor-pointer p-0.5 ${
                          isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        title={isEnabled ? "Desativar Módulo" : "Ativar Módulo"}
                        aria-label={`Alternar ${mod.name}`}
                      >
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs ${
                            isEnabled ? "ml-auto" : "mr-auto"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 4: SEQUÊNCIA DO FEED (ORDENAÇÃO DE BLOCOS) */}
          {activeTab === "feed" && (
            <div className="space-y-6">
              
              {/* Informative banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ArrowUpDown className="w-4 h-4 text-amber-500" />
                    Ordem de Exibição dos Blocos no Feed da Família
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Sequenciamento Dinâmico</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Defina o que os responsáveis e estudantes visualizam com prioridade máxima ao abrir o app. Reordene com as setas para cima/baixo ou use um dos presets recomendados.
                </p>

                {/* Feed presets quick action */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase font-mono">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPresetFeedOrder("pedagogico")}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    🎯 Foco Pedagógico & Metas
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFeedOrder("comunicacao")}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    📢 Foco em Comunicados & Eventos
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFeedOrder("rotina")}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    🍱 Foco em Rotina Diária & Portaria
                  </button>
                </div>
              </div>

              {/* Feed Items Order List */}
              <div className="space-y-2.5">
                {(currentConfig.feedModuleOrder || DEFAULT_FEED_MODULE_ORDER).map((modId, index) => {
                  const modDef = SYSTEM_MODULES.find((m) => m.id === modId);
                  const isEnabledInSystem = currentConfig.enabledModules?.[modId] !== false;
                  const isFirst = index === 0;
                  const isLast = index === (currentConfig.feedModuleOrder?.length || 1) - 1;

                  return (
                    <motion.div
                      key={modId}
                      layout
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isEnabledInSystem
                          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
                          : "bg-slate-100/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/40 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Numerical Badge */}
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                          #{index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-slate-900 dark:text-white">
                              {modDef?.feedLabel || modDef?.name || modId}
                            </strong>
                            {!isEnabledInSystem && (
                              <span className="text-[9px] font-bold uppercase font-mono text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                                Desativado na plataforma
                              </span>
                            )}
                          </div>
                          <span className="text-[10.5px] text-slate-400 block">
                            {modDef?.description || "Bloco interativo do feed"}
                          </span>
                        </div>
                      </div>

                      {/* Reordering Controls */}
                      <div className="flex items-center gap-1">
                        {!isFirst && (
                          <button
                            type="button"
                            onClick={() => moveFeedItemToTop(index)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold font-mono transition-colors cursor-pointer"
                            title="Fixar no Topo (#1)"
                          >
                            Topo
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveFeedItem(index, "up")}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Mover para Cima"
                          aria-label="Mover para Cima"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moveFeedItem(index, "down")}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Mover para Baixo"
                          aria-label="Mover para Baixo"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão do Sistema</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltar ao Painel</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar & Publicar Alterações</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default WhiteLabelCustomizerModal;
