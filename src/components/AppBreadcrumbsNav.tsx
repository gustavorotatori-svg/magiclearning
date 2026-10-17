import React from "react";
import { ChevronRight, ArrowLeft, Home, Sparkles, GraduationCap, Building2, User } from "lucide-react";

export interface BreadcrumbStep {
  id: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface AppBreadcrumbsNavProps {
  userRole: "pais" | "escola" | "aluno" | "landing";
  activeTab: string;
  tabLabel: string;
  tabDescription?: string;
  studentName?: string;
  primaryColor?: string;
  onGoBack: () => void;
  onGoHome: () => void;
  onGoToLanding?: () => void;
  backTargetLabel?: string;
  extraBreadcrumbs?: BreadcrumbStep[];
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: "primary" | "secondary" | "accent";
  };
}

export const AppBreadcrumbsNav: React.FC<AppBreadcrumbsNavProps> = ({
  userRole,
  activeTab,
  tabLabel,
  tabDescription,
  studentName,
  primaryColor = "#0077C0",
  onGoBack,
  onGoHome,
  onGoToLanding,
  backTargetLabel,
  extraBreadcrumbs = [],
  primaryAction,
}) => {
  const isHomeTab = activeTab === "dashboard";
  const defaultBackLabel = userRole === "escola" ? "Painel Geral" : userRole === "aluno" ? "Início do Aluno" : "Dashboard";
  const effectiveBackLabel = backTargetLabel || defaultBackLabel;
  const roleName = userRole === "escola" ? "Portal da Escola" : userRole === "aluno" ? "Portal do Aluno" : "Portal da Família";
  const RoleIcon = userRole === "escola" ? Building2 : userRole === "aluno" ? Sparkles : GraduationCap;

  return (
    <nav
      aria-label="Navegação Estrutural e Botão Voltar"
      className="w-full mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Prominent Back Button & Breadcrumbs trail */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Primary Back Button */}
            <button
              type="button"
              onClick={isHomeTab && onGoToLanding ? onGoToLanding : onGoBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              aria-label={isHomeTab ? "Voltar ao Site Institucional" : `Voltar para ${effectiveBackLabel}`}
              title={isHomeTab ? "Voltar ao Site Institucional (Alt + ←)" : `Voltar para ${effectiveBackLabel} (Alt + ←)`}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
              <span className="font-sans">
                {isHomeTab ? "Voltar ao Site" : effectiveBackLabel ? `Voltar (${effectiveBackLabel})` : "Voltar"}
              </span>
            </button>

            {/* Breadcrumbs Trail */}
            <ol className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onGoToLanding || onGoHome}
                  className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer text-[11px]"
                  title="Página Inicial Institucional"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="hidden xs:inline">Início</span>
                </button>
              </li>

              <li aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</li>

              <li className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onGoHome}
                  className="hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer text-[11px] truncate max-w-[130px] sm:max-w-none flex items-center gap-1"
                >
                  <RoleIcon className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{roleName}</span>
                </button>
              </li>

              {studentName && userRole === "pais" && (
                <>
                  <li aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</li>
                  <li className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[120px] sm:max-w-none">
                    {studentName}
                  </li>
                </>
              )}

              {!isHomeTab && (
                <>
                  <li aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</li>
                  <li
                    className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px] sm:max-w-none"
                    aria-current="page"
                  >
                    {tabLabel}
                  </li>
                </>
              )}

              {extraBreadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.id}>
                  <li aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</li>
                  <li>
                    {crumb.onClick && !crumb.active ? (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        className="hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer text-[11px]"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span
                        className="text-[11px] font-semibold text-slate-900 dark:text-slate-100"
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </div>

          {/* Section Title */}
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-base sm:text-lg font-serif font-black tracking-tight text-slate-950 dark:text-white">
              {tabLabel}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        {primaryAction && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={primaryAction.onClick}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] ${
                primaryAction.variant === "secondary"
                  ? "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50"
                  : primaryAction.variant === "accent"
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                  : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950"
              }`}
              style={
                primaryAction.variant === "primary" && primaryColor
                  ? { backgroundColor: primaryColor, color: "#ffffff" }
                  : undefined
              }
            >
              {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
              <span>{primaryAction.label}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
