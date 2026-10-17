import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  DollarSign,
  TrendingUp,
  Sliders,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Info,
  ShieldCheck,
  Award,
  Users,
  Target,
  BarChart3,
  Percent
} from "lucide-react";

export interface StudentProfileLtvConfig {
  id: string;
  profileName: string;
  badge: string;
  gradesIncluded: string[];
  tuition: number; // Ticket Médio Mensal
  retentionYears: number; // Tempo de permanência esperado em anos
  additionalMonthlyServices: number; // Cantina, Cursos Extras, Material Digital (R$/mês)
  annualReenrollmentFee: number; // Taxa de Rematrícula Anual (R$)
  historicalRetentionRate: number; // Taxa de Retenção Histórica (%)
  averageDiscountPercent: number; // Desconto Médio Concedido (%)
}

export const DEFAULT_LTV_PROFILES: StudentProfileLtvConfig[] = [
  {
    id: "infantil",
    profileName: "Educação Infantil",
    badge: "Maternal & Jardim",
    gradesIncluded: ["Berçário", "Maternal I", "Maternal II", "Jardim I", "Jardim II"],
    tuition: 1800,
    retentionYears: 5,
    additionalMonthlyServices: 250,
    annualReenrollmentFee: 1500,
    historicalRetentionRate: 96,
    averageDiscountPercent: 5
  },
  {
    id: "fundamental1",
    profileName: "Ensino Fundamental I",
    badge: "1º ao 5º Ano",
    gradesIncluded: ["1º Ano EF", "2º Ano EF", "3º Ano EF", "4º Ano EF", "5º Ano EF"],
    tuition: 2100,
    retentionYears: 5,
    additionalMonthlyServices: 320,
    annualReenrollmentFee: 1800,
    historicalRetentionRate: 94,
    averageDiscountPercent: 6
  },
  {
    id: "fundamental2",
    profileName: "Ensino Fundamental II",
    badge: "6º ao 9º Ano",
    gradesIncluded: ["6º Ano EF", "7º Ano EF", "8º Ano EF", "9º Ano EF"],
    tuition: 2350,
    retentionYears: 4,
    additionalMonthlyServices: 380,
    annualReenrollmentFee: 2000,
    historicalRetentionRate: 91,
    averageDiscountPercent: 7
  },
  {
    id: "medio",
    profileName: "Ensino Médio",
    badge: "1º ao 3º EM",
    gradesIncluded: ["1º EM", "2º EM", "3º EM"],
    tuition: 2800,
    retentionYears: 3,
    additionalMonthlyServices: 450,
    annualReenrollmentFee: 2400,
    historicalRetentionRate: 97,
    averageDiscountPercent: 4
  }
];

interface CrmLtvConfigPanelProps {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  onParamsSaved?: (profiles: StudentProfileLtvConfig[]) => void;
}

export const CrmLtvConfigPanel: React.FC<CrmLtvConfigPanelProps> = ({
  onToast,
  onParamsSaved
}) => {
  const [profiles, setProfiles] = useState<StudentProfileLtvConfig[]>(() => {
    const saved = localStorage.getItem("school_crm_ltv_profile_params");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_LTV_PROFILES;
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string>("infantil");
  const [hasChanges, setHasChanges] = useState(false);

  const activeProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const handleUpdateProfileField = (
    field: keyof StudentProfileLtvConfig,
    value: number
  ) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === selectedProfileId) {
          return {
            ...p,
            [field]: isNaN(value) ? 0 : value
          };
        }
        return p;
      })
    );
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    localStorage.setItem("school_crm_ltv_profile_params", JSON.stringify(profiles));
    window.dispatchEvent(new Event("school_ltv_params_updated"));
    setHasChanges(false);

    onToast(
      "✨ Parâmetros de LTV salvos com sucesso! As previsões de retenção do CRM de rematrículas foram atualizadas.",
      "success"
    );

    if (onParamsSaved) {
      onParamsSaved(profiles);
    }
  };

  const handleResetDefaults = () => {
    setProfiles(DEFAULT_LTV_PROFILES);
    localStorage.setItem("school_crm_ltv_profile_params", JSON.stringify(DEFAULT_LTV_PROFILES));
    window.dispatchEvent(new Event("school_ltv_params_updated"));
    setHasChanges(false);
    onToast("Valores padrões de LTV restaurados.", "info");
  };

  // LTV Mathematical Formula Outputs
  const monthlyTotal = activeProfile.tuition + activeProfile.additionalMonthlyServices;
  const annualTotalNoFee = monthlyTotal * 12;
  const annualTotalWithFee = annualTotalNoFee + activeProfile.annualReenrollmentFee;
  const grossLtv = annualTotalWithFee * activeProfile.retentionYears;
  const discountMultiplier = 1 - activeProfile.averageDiscountPercent / 100;
  const retentionMultiplier = activeProfile.historicalRetentionRate / 100;
  const netLtvAjustado = Math.round(grossLtv * discountMultiplier * retentionMultiplier);

  // Total Portfolio Forecast
  const totalLtvSum = profiles.reduce((acc, p) => {
    const ann = (p.tuition + p.additionalMonthlyServices) * 12 + p.annualReenrollmentFee;
    const ltv = ann * p.retentionYears * (1 - p.averageDiscountPercent / 100) * (p.historicalRetentionRate / 100);
    return acc + ltv;
  }, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl space-y-6 text-left font-sans shadow-xs animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/40">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Parametrização de LTV (Lifetime Value) por Perfil</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-extrabold border border-amber-300/50">
                CRM Previsões
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize o ticket médio, permanência esperada e serviços adicionais para calcular a receita vitalícia e refinar o dashboard de retenção de rematrículas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
          >
            Restaurar Padrão
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              hasChanges
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 scale-102"
                : "bg-emerald-700 hover:bg-emerald-800 text-white"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasChanges ? "Salvar Alterações" : "Salvo"}</span>
          </button>
        </div>
      </div>

      {/* PROFILE SELECTOR TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {profiles.map((p) => {
          const isSelected = p.id === selectedProfileId;
          const profileAnn = (p.tuition + p.additionalMonthlyServices) * 12 + p.annualReenrollmentFee;
          const profileLtv = Math.round(profileAnn * p.retentionYears * (1 - p.averageDiscountPercent / 100) * (p.historicalRetentionRate / 100));

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProfileId(p.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-br from-amber-500/10 to-indigo-500/5 border-amber-500/80 shadow-xs ring-2 ring-amber-500/20"
                  : "bg-slate-50/70 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400 block tracking-wider">
                {p.badge}
              </span>
              <strong className="text-xs font-black text-slate-900 dark:text-slate-100 block truncate">
                {p.profileName}
              </strong>
              <div className="pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">LTV Líquido</span>
                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                  R$ {(profileLtv / 1000).toFixed(1)}k
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE PROFILE EDITING PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/80 dark:bg-slate-950/60 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <strong className="text-xs text-slate-800 dark:text-slate-200 uppercase font-mono tracking-wider">
              Variáveis do Perfil: {activeProfile.profileName} ({activeProfile.badge})
            </strong>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Ticket Médio Mensal */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span>Ticket Médio Mensal (R$)</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              </label>
              <input
                type="number"
                value={activeProfile.tuition}
                onChange={(e) => handleUpdateProfileField("tuition", parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-[10px] text-slate-400 block">Mensalidade base praticada para o segmento.</span>
            </div>

            {/* Tempo de Permanência Esperado */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span>Permanência Esperada (Anos)</span>
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={activeProfile.retentionYears}
                onChange={(e) => handleUpdateProfileField("retentionYears", parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-[10px] text-slate-400 block">Anos até a formatura ou término do ciclo.</span>
            </div>

            {/* Atividades / Serviços Secundários Mensais */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span>Serviços Extras (R$/mês)</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              </label>
              <input
                type="number"
                value={activeProfile.additionalMonthlyServices}
                onChange={(e) => handleUpdateProfileField("additionalMonthlyServices", parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-[10px] text-slate-400 block">Cantina, esportes, período integral, transporte.</span>
            </div>

            {/* Taxa de Rematrícula Anual */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span>Taxa Rematrícula Anual (R$)</span>
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </label>
              <input
                type="number"
                value={activeProfile.annualReenrollmentFee}
                onChange={(e) => handleUpdateProfileField("annualReenrollmentFee", parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-[10px] text-slate-400 block">Cobrança única anual de reserva de vaga.</span>
            </div>

            {/* Taxa de Retenção Histórica (%) */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span>Retenção Histórica (%)</span>
                <Percent className="w-3.5 h-3.5 text-blue-500" />
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={activeProfile.historicalRetentionRate}
                onChange={(e) => handleUpdateProfileField("historicalRetentionRate", parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-[10px] text-slate-400 block">Percentual histórico de re-matrícula do perfil.</span>
            </div>

            {/* Desconto Médio Concedido (%) */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span>Desconto Médio Concedido (%)</span>
                <Target className="w-3.5 h-3.5 text-rose-500" />
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={activeProfile.averageDiscountPercent}
                onChange={(e) => handleUpdateProfileField("averageDiscountPercent", parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-[10px] text-slate-400 block">Bolsas, desconto pontualidade ou irmãos.</span>
            </div>
          </div>
        </div>

        {/* Right Calculated Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white p-5 rounded-2xl border border-amber-500/30 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono uppercase font-black text-amber-400 tracking-wider">
                Simulação em Tempo Real (LTV)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {activeProfile.profileName}
              </span>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Receita Mensal Bruta (aluno):</span>
                <span className="font-extrabold text-white">
                  R$ {monthlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Receita Anual Bruta (aluno):</span>
                <span className="font-extrabold text-white">
                  R$ {annualTotalWithFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Permanência do Ciclo:</span>
                <span className="font-bold text-amber-300">
                  {activeProfile.retentionYears} {activeProfile.retentionYears === 1 ? "ano" : "anos"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">LTV Bruto Estimado:</span>
                <span className="font-extrabold text-amber-400">
                  R$ {grossLtv.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block font-sans">
                  💎 LTV Líquido Ponderado (Ajustado)
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  R$ {netLtvAjustado.toLocaleString("pt-BR")}
                </div>
                <p className="text-[10px] text-slate-400 font-sans italic">
                  Considera {activeProfile.historicalRetentionRate}% de retenção e {activeProfile.averageDiscountPercent}% de desconto médio.
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Summary Card */}
          <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-800/40 p-4 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Sincronização com Dashboard de Rematrículas</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Ao salvar estes parâmetros, a fórmula de LTV de cada aluno no funil de rematrículas responderá aos novos valores, atualizando a previsão total de retenção de receita do colégio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrmLtvConfigPanel;
