import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Lock,
  FileText,
  CheckCircle2,
  X,
  GraduationCap
} from "lucide-react";
import { MagicLearningBrandLogo } from "./MagicLearningBrandLogo";

export interface InstitutionalFooterProps {
  schoolName?: string;
  primaryColor?: string;
  onOpenAuth?: (gate: "pais" | "escola", tab: "login" | "signup") => void;
  onNavigateToExternal?: () => void;
  onNavigateToDemo?: (role: "pais" | "escola" | "aluno") => void;
  className?: string;
}

export const InstitutionalFooter: React.FC<InstitutionalFooterProps> = ({
  schoolName = "Colégio Magic Learning",
  primaryColor = "#0F2942",
  onOpenAuth,
  onNavigateToExternal,
  onNavigateToDemo,
  className = ""
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<"privacidade" | "termos" | "regimento" | null>(null);

  return (
    <>
      <footer className={`border-t border-slate-700/80 bg-slate-950 text-slate-100 ${className}`}>
        {/* Main 4-Column Structured Institutional Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            
            {/* Coluna 1: Identidade, Credenciamento & Manifesto */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MagicLearningBrandLogo
                  size="sm"
                  schoolName={schoolName}
                  primaryColor={primaryColor}
                  showText={false}
                />
                <div>
                  <h3 className="font-serif font-black text-white text-base tracking-tight leading-tight">
                    {schoolName}
                  </h3>
                  <span className="text-xs font-mono text-slate-300 block font-semibold mt-0.5">
                    Educação Básica & Inovação Integrada
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal">
                Instituição de ensino dedicada à excelência acadêmica, desenvolvimento socioemocional, pensamento crítico e acolhimento familiar contínuo.
              </p>

              {/* Selos de Credenciamento Oficial */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Credenciamento CEE/MEC • Parecer 482/19</span>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  CNPJ: 14.829.102/0001-45 • Matriz SP
                </div>
              </div>
            </div>

            {/* Coluna 2: Portais & Acesso do Sistema */}
            <div className="space-y-3.5">
              <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5">
                Portais & Acesso Rápido
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuth) onOpenAuth("escola", "login");
                      else if (onNavigateToDemo) onNavigateToDemo("escola");
                    }}
                    className="text-slate-100 hover:text-amber-300 transition-colors cursor-pointer text-left flex items-center justify-between w-full py-1 group"
                  >
                    <span className="font-medium group-hover:underline underline-offset-2">Portal da Gestão Escolar</span>
                    <span className="text-[10px] font-mono text-slate-200 font-bold bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded">Diretoria</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuth) onOpenAuth("pais", "login");
                      else if (onNavigateToDemo) onNavigateToDemo("pais");
                    }}
                    className="text-slate-100 hover:text-amber-300 transition-colors cursor-pointer text-left flex items-center justify-between w-full py-1 group"
                  >
                    <span className="font-medium group-hover:underline underline-offset-2">Portal da Família & Alunos</span>
                    <span className="text-[10px] font-mono text-slate-200 font-bold bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded">Pais</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToDemo) onNavigateToDemo("aluno");
                    }}
                    className="text-slate-100 hover:text-amber-300 transition-colors cursor-pointer text-left flex items-center justify-between w-full py-1 group"
                  >
                    <span className="font-medium group-hover:underline underline-offset-2">Diário e Boletim do Estudante</span>
                    <span className="text-[10px] font-mono text-slate-200 font-bold bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded">Alunos</span>
                  </button>
                </li>
                {onNavigateToExternal && (
                  <li>
                    <button
                      type="button"
                      onClick={onNavigateToExternal}
                      className="text-amber-300 hover:text-amber-200 font-bold transition-colors cursor-pointer text-left flex items-center gap-1.5 py-1"
                    >
                      <span>Página Institucional da Escola</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalModal("regimento")}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left py-1 block hover:underline underline-offset-2"
                  >
                    Regimento Escolar Homologado 2026
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Atendimento & Expediente Oficial */}
            <div className="space-y-3.5">
              <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5">
                Atendimento & Expediente
              </h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Secretaria Geral</span>
                    <span className="text-xs font-mono text-slate-200">Seg a Sex • 07:30 às 18:30</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Central Telefônica</span>
                    <span className="text-xs font-mono text-slate-200">11 3456-7890</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Secretaria & Matrículas</span>
                    <span className="text-xs font-mono text-slate-200">secretaria@magiclearning.edu.br</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Campus Principal</span>
                    <span className="text-xs text-slate-200 font-sans">Al. das Acácias, 1420 - Jd. Europa, São Paulo/SP</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Governança, Segurança & Proteção de Dados */}
            <div className="space-y-3.5">
              <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2.5">
                Segurança & Proteção de Dados
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-normal">
                Privacidade estrita sob a Lei Geral de Proteção de Dados e o Estatuto da Criança e do Adolescente.
              </p>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-750">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Criptografia Ponta a Ponta</span>
                    <span className="text-xs text-slate-300 font-mono">TLS 256-bit • Dados Isolados</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className="text-slate-300">Encarregado DPO:</span>
                  <span className="text-white font-semibold">dpo@magiclearning.edu.br</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-semibold px-1 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sistemas e Portais 100% Operacionais</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Legal Sub-Bar */}
        <div className="border-t border-slate-800 bg-[#070b14] px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-200">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs">
              <span className="font-medium text-white">© {new Date().getFullYear()} {schoolName}. Todos os direitos reservados.</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setActiveLegalModal("privacidade")}
                className="text-slate-200 hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Política de Privacidade
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalModal("termos")}
                className="text-slate-200 hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Termos de Uso
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalModal("regimento")}
                className="text-slate-200 hover:text-white transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Regimento Interno
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="text-slate-200 font-semibold">SaaS Educacional v1.4</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">Ambiente Seguro</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Institucional: Privacidade / Termos / Regimento */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-left relative">
            <button
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {activeLegalModal === "privacidade" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    Política de Privacidade & Proteção de Dados
                  </h3>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  Em conformidade com a Lei Federal nº 13.709/2018 e o Estatuto da Criança e do Adolescente, o {schoolName} assegura que os registros pedagógicos, fotografias, avaliações bimestrais e dados de saúde dos alunos são mantidos em banco de dados encriptado e com acesso estritamente restrito aos responsáveis legais e corpo docente autorizado.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
                  <div>• Finalidade: Prestação de serviços educacionais e acompanhamento pedagógico.</div>
                  <div>• Compartilhamento: Proibido o repasse para fins de publicidade comercial.</div>
                  <div>• Canal DPO: dpo@magiclearning.edu.br para exclusão ou retificação.</div>
                </div>
              </div>
            )}

            {activeLegalModal === "termos" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    Termos de Uso do Portal Escolar
                  </h3>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  O acesso aos portais de gestão, secretaria virtual, fila de portaria por QR Code e diário de rotina é pessoal, intransferível e condicionado à matrícula ativa do estudante na instituição.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
                  <div>• Credenciais: Cada responsável deve utilizar seu próprio login.</div>
                  <div>• Portaria Segura: O QR Code de liberação é dinâmico e renovado diariamente.</div>
                  <div>• Notificações: Avisos e comunicados postados possuem validade institucional.</div>
                </div>
              </div>
            )}

            {activeLegalModal === "regimento" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    Regimento Escolar & Diretrizes Pedagógicas 2026
                  </h3>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  Homologado junto aos órgãos de educação competentes, estabelece as diretrizes de frequência com mínimo 75%, sistema de avaliação bimestral com média mínima 7.0, direitos e deveres do corpo discente e normas de convivência harmoniosa.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
                  <div>• Ano Letivo: 200 dias de efetivo trabalho escolar.</div>
                  <div>• Plantões Pedagógicos: Realizados a cada término de bimestre.</div>
                  <div>• Ouvidoria: Aberta para sugestões e acolhimento contínuo.</div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
