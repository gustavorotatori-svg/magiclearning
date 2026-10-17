import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  FileText,
  User,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  Bell,
  Key,
  ChevronRight,
  Filter,
  Layers,
  MessageSquare,
  Bookmark
} from "lucide-react";
import { Comunicado, Estudante, Cobranca, Evento, Momento, ClassroomPhoto } from "../types";
import { APP_SYSTEM_FEATURES } from "../utils/searchFeatures";

export type SearchCategory = "todos" | "funcionalidades" | "comunicados" | "estudantes" | "cobrancas" | "agenda" | "fotos" | "atalhos";

export interface SearchTarget {
  type: "comunicado" | "estudante" | "cobranca" | "evento" | "foto" | "atalho" | "funcionalidade";
  id?: string;
  title: string;
  subtitle?: string;
  categoryName?: string;
  targetTab?: "dashboard" | "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso" | "premium_hub" | "perfil";
  schoolSubTab?: "dashboard" | "agenda" | "comunicados" | "alunos" | "retiradas" | "erp" | "metricas" | "planejador" | "benchmarking" | "premium_hub";
  studentId?: string;
  actionKey?: string;
  badge?: string;
  keywords?: string[];
  iconType?: string;
}

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  comunicados: Comunicado[];
  estudantes: Estudante[];
  cobrancas: Cobranca[];
  eventos?: Evento[];
  moments?: Momento[];
  portfolioPhotos?: ClassroomPhoto[];
  userRole: "landing" | "pais" | "escola" | "aluno";
  onSelectResult: (target: SearchTarget) => void;
}

const POPULAR_SUGGESTIONS = [
  "Mensalidade",
  "Boletim",
  "Ocorrências",
  "Reunião de Pais",
  "Refeições",
  "Fotos de Sala",
  "Autorização de Retirada",
  "Régua WhatsApp"
];

const QUICK_SHORTCUTS: SearchTarget[] = [
  {
    type: "atalho",
    title: "Comunicados e Avisos Oficiais",
    subtitle: "Acessar todos os avisos da escola e comunicados em aberto",
    categoryName: "Avisos",
    targetTab: "comunicados",
    schoolSubTab: "comunicados"
  },
  {
    type: "atalho",
    title: "Situação Financeira e Faturas",
    subtitle: "Consultar boletos, mensalidades e comprovantes de pagamento",
    categoryName: "Financeiro",
    targetTab: "cobrancas",
    schoolSubTab: "erp"
  },
  {
    type: "atalho",
    title: "Diário do Aluno e Alimentação",
    subtitle: "Acompanhar refeições, sono e rotina diária em tempo real",
    categoryName: "Rotina",
    targetTab: "diaadia",
    schoolSubTab: "alunos"
  },
  {
    type: "atalho",
    title: "Boletim e Desempenho Acadêmico",
    subtitle: "Notas por disciplina, frequências e parecer pedagógico",
    categoryName: "Pedagógico",
    targetTab: "academico",
    schoolSubTab: "alunos"
  },
  {
    type: "atalho",
    title: "Fila de Busca e Retiradas (Portaria)",
    subtitle: "Gerenciar pessoas autorizadas e autorizar saída de alunos",
    categoryName: "Segurança",
    targetTab: "acesso",
    schoolSubTab: "retiradas"
  },
  {
    type: "atalho",
    title: "Lembretes Automáticos WhatsApp (ERP)",
    subtitle: "Configurar cobrança preventiva e envio de links PIX",
    categoryName: "Automação",
    schoolSubTab: "erp",
    actionKey: "open_whatsapp_config"
  },
  {
    type: "atalho",
    title: "Meu Perfil e Configurações de Conta",
    subtitle: "Editar nome de exibição, foto de perfil, @username, notificações e senha",
    categoryName: "Perfil",
    targetTab: "perfil"
  },
  {
    type: "atalho",
    title: "Comparar Desempenho de Alunos",
    subtitle: "Análise comparativa de métricas pedagógicas lado a lado",
    categoryName: "Métricas",
    schoolSubTab: "alunos",
    actionKey: "compare_students"
  }
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  comunicados,
  estudantes,
  cobrancas,
  eventos = [],
  portfolioPhotos = [],
  userRole,
  onSelectResult
}) => {
  const [query, setQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<SearchCategory>("todos");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("school_recent_global_searches");
      return saved ? JSON.parse(saved) : ["Mensalidade", "Reunião de Pais"];
    } catch {
      return ["Mensalidade", "Reunião de Pais"];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut listener Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const saveRecentSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    const filtered = recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("school_recent_global_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem("school_recent_global_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Perform search matching
  const cleanQuery = query.trim().toLowerCase();

  const matchedComunicados: SearchTarget[] = comunicados
    .filter((c) => {
      if (!cleanQuery) return false;
      return (
        c.title.toLowerCase().includes(cleanQuery) ||
        c.content.toLowerCase().includes(cleanQuery) ||
        c.previewText.toLowerCase().includes(cleanQuery) ||
        c.category.toLowerCase().includes(cleanQuery) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(cleanQuery)))
      );
    })
    .map((c) => ({
      type: "comunicado",
      id: c.id,
      title: c.title,
      subtitle: c.previewText || c.content.slice(0, 80),
      categoryName: c.category,
      targetTab: "comunicados",
      schoolSubTab: "comunicados"
    }));

  const matchedEstudantes: SearchTarget[] = estudantes
    .filter((e) => {
      if (!cleanQuery) return false;
      return (
        e.name.toLowerCase().includes(cleanQuery) ||
        e.grade.toLowerCase().includes(cleanQuery) ||
        (e.parentName && e.parentName.toLowerCase().includes(cleanQuery))
      );
    })
    .map((e) => ({
      type: "estudante",
      id: e.id,
      studentId: e.id,
      title: e.name,
      subtitle: `Turma: ${e.grade} ${e.parentName ? "• Resp: " + e.parentName : ""}`,
      categoryName: "Estudante",
      targetTab: "diaadia",
      schoolSubTab: "alunos"
    }));

  const matchedCobrancas: SearchTarget[] = cobrancas
    .filter((c) => {
      if (!cleanQuery) return false;
      return (
        c.title.toLowerCase().includes(cleanQuery) ||
        c.category.toLowerCase().includes(cleanQuery) ||
        c.status.toLowerCase().includes(cleanQuery) ||
        String(c.amount).includes(cleanQuery) ||
        (c.dueDate && c.dueDate.includes(cleanQuery))
      );
    })
    .map((c) => ({
      type: "cobranca",
      id: c.id,
      title: c.title,
      subtitle: `Vencimento: ${c.dueDate} • R$ ${c.amount.toFixed(2)} (${c.status.toUpperCase()})`,
      categoryName: `Fatura ${c.status}`,
      targetTab: "cobrancas",
      schoolSubTab: "erp"
    }));

  const matchedEventos: SearchTarget[] = eventos
    .filter((ev) => {
      if (!cleanQuery) return false;
      return (
        ev.title.toLowerCase().includes(cleanQuery) ||
        ev.description.toLowerCase().includes(cleanQuery) ||
        ev.location.toLowerCase().includes(cleanQuery) ||
        ev.dateStr.toLowerCase().includes(cleanQuery)
      );
    })
    .map((ev) => ({
      type: "evento",
      id: ev.id,
      title: ev.title,
      subtitle: `${ev.dateStr} às ${ev.time} • Local: ${ev.location}`,
      categoryName: "Agenda Escolar",
      targetTab: "comunicados",
      schoolSubTab: "agenda"
    }));

  const matchedFotos: SearchTarget[] = portfolioPhotos
    .filter((p) => {
      if (!cleanQuery) return false;
      return (
        p.title.toLowerCase().includes(cleanQuery) ||
        p.grade.toLowerCase().includes(cleanQuery) ||
        p.teacherName.toLowerCase().includes(cleanQuery)
      );
    })
    .map((p) => ({
      type: "foto",
      id: p.id,
      title: p.title,
      subtitle: `Turma: ${p.grade} • Prof(a). ${p.teacherName} (${p.date})`,
      categoryName: "Galeria de Fotos",
      targetTab: "academico",
      schoolSubTab: "alunos"
    }));

  const allShortcutsAndFeatures = [...APP_SYSTEM_FEATURES, ...QUICK_SHORTCUTS];
  const matchedAtalhos: SearchTarget[] = allShortcutsAndFeatures.filter((s) => {
    if (!cleanQuery) return true; // show all when typing or searching
    const titleMatch = s.title.toLowerCase().includes(cleanQuery);
    const subMatch = s.subtitle ? s.subtitle.toLowerCase().includes(cleanQuery) : false;
    const catMatch = s.categoryName ? s.categoryName.toLowerCase().includes(cleanQuery) : false;
    const kwMatch =
      "keywords" in s && Array.isArray((s as any).keywords)
        ? (s as any).keywords.some((kw: string) => kw.toLowerCase().includes(cleanQuery))
        : false;
    return titleMatch || subMatch || catMatch || kwMatch;
  });

  // Category counts
  const totalResults =
    matchedComunicados.length +
    matchedEstudantes.length +
    matchedCobrancas.length +
    matchedEventos.length +
    matchedFotos.length +
    (cleanQuery ? matchedAtalhos.length : 0);

  const getFilteredList = (): SearchTarget[] => {
    if (!cleanQuery) return matchedAtalhos;

    let list: SearchTarget[] = [];
    if (activeCategoryFilter === "todos" || activeCategoryFilter === "comunicados") {
      list = [...list, ...matchedComunicados];
    }
    if (activeCategoryFilter === "todos" || activeCategoryFilter === "estudantes") {
      list = [...list, ...matchedEstudantes];
    }
    if (activeCategoryFilter === "todos" || activeCategoryFilter === "cobrancas") {
      list = [...list, ...matchedCobrancas];
    }
    if (activeCategoryFilter === "todos" || activeCategoryFilter === "agenda") {
      list = [...list, ...matchedEventos];
    }
    if (activeCategoryFilter === "todos" || activeCategoryFilter === "fotos") {
      list = [...list, ...matchedFotos];
    }
    if (activeCategoryFilter === "todos" || activeCategoryFilter === "atalhos") {
      list = [...list, ...matchedAtalhos];
    }

    return list;
  };

  const currentResults = getFilteredList();

  const handleSelect = (target: SearchTarget) => {
    if (query) {
      saveRecentSearch(query);
    }
    onSelectResult(target);
    onClose();
  };

  // Helper to highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-800/80 text-amber-950 dark:text-amber-100 rounded px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Top Search Input Bar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/80 dark:bg-slate-950/60">
            <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite palavras-chave (ex: mensalidade, boletim, reunião, fotos)..."
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-2xs">
                ESC
              </kbd>
            )}
          </div>

          {/* Category Filter Pills (When search active) */}
          {cleanQuery && (
            <div className="px-3.5 py-2 border-b border-slate-150 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-500" /> Filtrar:
              </span>

              <button
                onClick={() => setActiveCategoryFilter("todos")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategoryFilter === "todos"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                Todos ({totalResults})
              </button>

              {matchedComunicados.length > 0 && (
                <button
                  onClick={() => setActiveCategoryFilter("comunicados")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategoryFilter === "comunicados"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Avisos ({matchedComunicados.length})
                </button>
              )}

              {matchedEstudantes.length > 0 && (
                <button
                  onClick={() => setActiveCategoryFilter("estudantes")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategoryFilter === "estudantes"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Alunos ({matchedEstudantes.length})
                </button>
              )}

              {matchedCobrancas.length > 0 && (
                <button
                  onClick={() => setActiveCategoryFilter("cobrancas")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategoryFilter === "cobrancas"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Faturas ({matchedCobrancas.length})
                </button>
              )}

              {matchedEventos.length > 0 && (
                <button
                  onClick={() => setActiveCategoryFilter("agenda")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategoryFilter === "agenda"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Agenda ({matchedEventos.length})
                </button>
              )}

              {matchedFotos.length > 0 && (
                <button
                  onClick={() => setActiveCategoryFilter("fotos")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategoryFilter === "fotos"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Fotos ({matchedFotos.length})
                </button>
              )}
            </div>
          )}

          {/* Results & Quick Suggestions Body */}
          <div className="p-3 sm:p-4 overflow-y-auto space-y-4 max-h-[60vh] divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Empty Input State: Suggestions & Recent Searches */}
            {!cleanQuery && (
              <div className="space-y-4 pt-1">
                {/* Popular Keywords / Tags */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Palavras-chave sugeridas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SUGGESTIONS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1 hover:border-amber-300"
                      >
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-150 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> Buscas recentes:
                      </span>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem("school_recent_global_searches");
                        }}
                        className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
                      >
                        Limpar histórico
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-900 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-900 transition-all cursor-pointer flex items-center gap-1.5 group"
                        >
                          <span>{term}</span>
                          <button
                            onClick={(e) => removeRecentSearch(term, e)}
                            className="text-blue-400 hover:text-rose-600 transition-colors"
                            title="Remover termo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Shortcuts */}
                <div className="space-y-2 pt-3 border-t border-slate-150 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
                    <Compass className="w-3.5 h-3.5 text-amber-500" /> Navegação rápida e atalhos:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_SHORTCUTS.map((shortcut, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(shortcut)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-amber-50/80 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 text-left transition-all group flex items-center justify-between cursor-pointer"
                      >
                        <div className="space-y-0.5 pr-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 block">
                            {shortcut.title}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {shortcut.subtitle}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            {cleanQuery && currentResults.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between font-mono">
                  <span>Resultados ({currentResults.length}):</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">Clique para navegar</span>
                </span>

                <div className="space-y-1.5">
                  {currentResults.map((item, index) => {
                    let IconComponent = FileText;
                    let iconBgClass = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

                    if (item.type === "estudante") {
                      IconComponent = User;
                      iconBgClass = "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
                    } else if (item.type === "cobranca") {
                      IconComponent = DollarSign;
                      iconBgClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
                    } else if (item.type === "evento") {
                      IconComponent = Calendar;
                      iconBgClass = "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
                    } else if (item.type === "foto") {
                      IconComponent = ImageIcon;
                      iconBgClass = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
                    } else if (item.type === "atalho") {
                      IconComponent = ArrowRight;
                      iconBgClass = "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleSelect(item)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${iconBgClass}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-950 dark:group-hover:text-amber-300 truncate">
                                {highlightText(item.title, cleanQuery)}
                              </h4>
                              {item.categoryName && (
                                <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0">
                                  {item.categoryName}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {highlightText(item.subtitle, cleanQuery)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <span>Acessar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State when Query yields no results */}
            {cleanQuery && currentResults.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Nenhum resultado para "{query}"
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Tente buscar por palavras mais genéricas como "mensalidade", "boletim", "reunião", "refeição" ou navegue pelos atalhos rápidos.
                  </p>
                </div>
                <button
                  onClick={() => setQuery("")}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono text-[9px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono text-[9px]">K</kbd> Abrir Busca
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline font-mono">Garantia de privacidade e criptografia</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
