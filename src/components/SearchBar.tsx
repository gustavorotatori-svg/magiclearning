import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronRight,
  QrCode,
  ShieldCheck,
  GraduationCap,
  Utensils,
  Accessibility,
  Moon,
  MessageSquare,
  SlidersHorizontal,
  Clock,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Comunicado, Estudante, Cobranca, Evento, ClassroomPhoto } from "../types";
import { SearchTarget } from "./GlobalSearchModal";
import { APP_SYSTEM_FEATURES, POPULAR_SEARCH_SUGGESTIONS } from "../utils/searchFeatures";

export type SearchCategoryFilter =
  | "todos"
  | "funcionalidades"
  | "estudantes"
  | "comunicados"
  | "cobrancas"
  | "agenda"
  | "fotos";

export interface SearchBarProps {
  id?: string;
  placeholder?: string;
  comunicados: Comunicado[];
  estudantes: Estudante[];
  cobrancas: Cobranca[];
  eventos?: Evento[];
  portfolioPhotos?: ClassroomPhoto[];
  onSelectResult: (target: SearchTarget) => void;
  onOpenFullSearch?: () => void;
  compact?: boolean;
  className?: string;
  showCategoryFilters?: boolean;
  userRole?: "landing" | "pais" | "escola" | "aluno";
  customFeatures?: SearchTarget[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  id = "app-search-bar",
  placeholder = "Buscar alunos, avisos, faturas, portaria, eventos ou recursos...",
  comunicados,
  estudantes,
  cobrancas,
  eventos = [],
  portfolioPhotos = [],
  onSelectResult,
  onOpenFullSearch,
  compact = false,
  className = "",
  showCategoryFilters = true,
  userRole,
  customFeatures = []
}) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryFilter>("todos");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut listener Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        // If not already in an active text input or this input
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
          setIsFocused(true);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const cleanQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  // Available features tailored for role
  const availableFeatures = useMemo(() => {
    const combined = [...APP_SYSTEM_FEATURES, ...customFeatures];
    if (!userRole) return combined;
    return combined.filter((f) => {
      if (!("roleSpecific" in f) || !f.roleSpecific) return true;
      return f.roleSpecific.includes(userRole);
    });
  }, [userRole, customFeatures]);

  // Compute matched items per category
  const {
    matchedFeatures,
    matchedEstudantes,
    matchedComunicados,
    matchedCobrancas,
    matchedEventos,
    matchedFotos,
    allMatchedResults
  } = useMemo(() => {
    if (!cleanQuery) {
      return {
        matchedFeatures: [],
        matchedEstudantes: [],
        matchedComunicados: [],
        matchedCobrancas: [],
        matchedEventos: [],
        matchedFotos: [],
        allMatchedResults: []
      };
    }

    // 1. Funcionalidades & Recursos
    const featMatches: SearchTarget[] = [];
    availableFeatures.forEach((f) => {
      const matchTitle = f.title.toLowerCase().includes(cleanQuery);
      const matchSubtitle = f.subtitle?.toLowerCase().includes(cleanQuery);
      const matchCategory = f.categoryName?.toLowerCase().includes(cleanQuery);
      const matchBadge = f.badge?.toLowerCase().includes(cleanQuery);
      const matchKeywords =
        "keywords" in f && Array.isArray((f as any).keywords)
          ? (f as any).keywords.some((kw: string) => kw.toLowerCase().includes(cleanQuery))
          : false;

      if (matchTitle || matchSubtitle || matchCategory || matchBadge || matchKeywords) {
        featMatches.push(f);
      }
    });

    // 2. Estudantes (Alunos)
    const estMatches: SearchTarget[] = [];
    estudantes.forEach((e) => {
      const matchName = e.name.toLowerCase().includes(cleanQuery);
      const matchGrade = e.grade.toLowerCase().includes(cleanQuery);
      const matchParent = e.parentName ? e.parentName.toLowerCase().includes(cleanQuery) : false;
      const matchId = e.id.toLowerCase().includes(cleanQuery);

      if (matchName || matchGrade || matchParent || matchId) {
        estMatches.push({
          type: "estudante",
          id: e.id,
          studentId: e.id,
          title: e.name,
          subtitle: `Turma: ${e.grade} ${e.parentName ? "• Resp: " + e.parentName : ""} • Status: ${
            e.currentQueueStatus === "liberado"
              ? "Liberado na Portaria"
              : e.currentQueueStatus === "esperando_portaria"
              ? "Na Fila de Saída"
              : "Em Sala de Aula"
          }`,
          categoryName: `Aluno • ${e.grade}`,
          badge: e.grade,
          targetTab: "diaadia",
          schoolSubTab: "alunos"
        });
      }
    });

    // 3. Comunicados & Avisos
    const comMatches: SearchTarget[] = [];
    comunicados.forEach((c) => {
      const matchTitle = c.title.toLowerCase().includes(cleanQuery);
      const matchContent = c.content.toLowerCase().includes(cleanQuery);
      const matchPreview = c.previewText.toLowerCase().includes(cleanQuery);
      const matchCat = c.category.toLowerCase().includes(cleanQuery);
      const matchTags = c.tags && c.tags.some((t) => t.toLowerCase().includes(cleanQuery));

      if (matchTitle || matchContent || matchPreview || matchCat || matchTags) {
        comMatches.push({
          type: "comunicado",
          id: c.id,
          title: c.title,
          subtitle: c.previewText || c.content.slice(0, 85) + "...",
          categoryName: `Aviso • ${c.category}`,
          badge: c.category,
          targetTab: "comunicados",
          schoolSubTab: "comunicados"
        });
      }
    });

    // 4. Cobranças & Financeiro (Estritamente oculto para estudantes/alunos)
    const cobMatches: SearchTarget[] = [];
    if (userRole !== "aluno") {
      cobrancas.forEach((c) => {
        const matchTitle = c.title.toLowerCase().includes(cleanQuery);
        const matchCat = c.category.toLowerCase().includes(cleanQuery);
        const matchStatus = c.status.toLowerCase().includes(cleanQuery);
        const matchAmount = String(c.amount).includes(cleanQuery) || c.amount.toFixed(2).includes(cleanQuery);
        const matchDue = c.dueDate && c.dueDate.includes(cleanQuery);

        if (matchTitle || matchCat || matchStatus || matchAmount || matchDue) {
          cobMatches.push({
            type: "cobranca",
            id: c.id,
            title: c.title,
            subtitle: `Vencimento: ${c.dueDate} • R$ ${c.amount.toFixed(2)} • Situação: ${
              c.status === "pago" ? "Liquidado / Pago" : c.status === "pendente" ? "Em Aberto" : "Em Atraso"
            }`,
            categoryName: `Financeiro • ${c.status.toUpperCase()}`,
            badge: `R$ ${c.amount.toFixed(0)}`,
            targetTab: "cobrancas",
            schoolSubTab: "erp"
          });
        }
      });
    }

    // 5. Eventos & Agenda
    const evMatches: SearchTarget[] = [];
    eventos.forEach((ev) => {
      const matchTitle = ev.title.toLowerCase().includes(cleanQuery);
      const matchDesc = ev.description.toLowerCase().includes(cleanQuery);
      const matchLoc = ev.location.toLowerCase().includes(cleanQuery);
      const matchDate = ev.dateStr.toLowerCase().includes(cleanQuery);

      if (matchTitle || matchDesc || matchLoc || matchDate) {
        evMatches.push({
          type: "evento",
          id: ev.id,
          title: ev.title,
          subtitle: `${ev.dateStr} às ${ev.time} • Local: ${ev.location}`,
          categoryName: "Agenda Escolar",
          badge: ev.dateStr,
          targetTab: "comunicados",
          schoolSubTab: "agenda"
        });
      }
    });

    // 6. Fotos de Sala & Portfólio
    const fotMatches: SearchTarget[] = [];
    portfolioPhotos.forEach((p) => {
      const matchTitle = p.title.toLowerCase().includes(cleanQuery);
      const matchGrade = p.grade.toLowerCase().includes(cleanQuery);
      const matchTeacher = p.teacherName.toLowerCase().includes(cleanQuery);

      if (matchTitle || matchGrade || matchTeacher) {
        fotMatches.push({
          type: "foto",
          id: p.id,
          title: p.title,
          subtitle: `Turma: ${p.grade} • Prof(a). ${p.teacherName}`,
          categoryName: "Galeria de Fotos",
          badge: p.grade,
          targetTab: "academico",
          schoolSubTab: "alunos"
        });
      }
    });

    // Composite prioritized array
    const composite: SearchTarget[] = [
      ...featMatches,
      ...estMatches,
      ...comMatches,
      ...cobMatches,
      ...evMatches,
      ...fotMatches
    ];

    return {
      matchedFeatures: featMatches,
      matchedEstudantes: estMatches,
      matchedComunicados: comMatches,
      matchedCobrancas: cobMatches,
      matchedEventos: evMatches,
      matchedFotos: fotMatches,
      allMatchedResults: composite
    };
  }, [cleanQuery, availableFeatures, estudantes, comunicados, cobrancas, eventos, portfolioPhotos]);

  // Current active filtered list
  const displayList: SearchTarget[] = useMemo(() => {
    if (!cleanQuery) return [];
    switch (selectedCategory) {
      case "funcionalidades":
        return matchedFeatures;
      case "estudantes":
        return matchedEstudantes;
      case "comunicados":
        return matchedComunicados;
      case "cobrancas":
        return matchedCobrancas;
      case "agenda":
        return matchedEventos;
      case "fotos":
        return matchedFotos;
      case "todos":
      default:
        return allMatchedResults;
    }
  }, [
    cleanQuery,
    selectedCategory,
    matchedFeatures,
    matchedEstudantes,
    matchedComunicados,
    matchedCobrancas,
    matchedEventos,
    matchedFotos,
    allMatchedResults
  ]);

  // Auto-scroll selected element into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-result-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!displayList.length && !cleanQuery) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < displayList.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayList.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < displayList.length) {
        handleSelect(displayList[selectedIndex]);
      } else if (displayList.length > 0) {
        handleSelect(displayList[0]);
      } else if (onOpenFullSearch) {
        onOpenFullSearch();
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (target: SearchTarget) => {
    setIsFocused(false);
    setQuery("");
    onSelectResult(target);
  };

  // Icon resolver based on type or iconType
  const getResultIcon = (result: SearchTarget) => {
    if (result.type === "funcionalidade") {
      const iconKey = (result as any).iconType;
      switch (iconKey) {
        case "qrcode":
          return <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        case "shield":
          return <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
        case "academic":
          return <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
        case "utensils":
          return <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
        case "dollar":
          return <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        case "announcement":
          return <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
        case "calendar":
          return <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
        case "photo":
          return <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
        case "accessibility":
          return <Accessibility className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
        case "moon":
          return <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />;
        case "whatsapp":
          return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        case "compare":
          return <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
        case "sensory":
          return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
        case "drawer":
          return <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />;
        default:
          return <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      }
    }

    switch (result.type) {
      case "estudante":
        return <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case "comunicado":
        return <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
      case "cobranca":
        return <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      case "evento":
        return <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case "foto":
        return <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
      default:
        return <Search className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  // Match highlight component with mathematical contrast
  const renderHighlighted = (text: string) => {
    if (!cleanQuery || !text) return text;
    const parts = text.split(new RegExp(`(${cleanQuery})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === cleanQuery ? (
            <mark
              key={i}
              className="bg-amber-200/80 dark:bg-amber-500/30 text-slate-900 dark:text-amber-200 font-bold px-0.5 rounded-xs"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} id={id} className={`relative text-left ${className}`}>
      {/* 🔍 Primary Search Bar Input Surface */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 rounded-xl border ${
          isFocused
            ? "bg-white dark:bg-slate-900 border-amber-500 dark:border-amber-400 ring-2 ring-amber-400/20 dark:ring-amber-500/20 shadow-sm"
            : "bg-slate-50/90 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        } ${compact ? "h-9 text-xs" : "h-11 text-sm"}`}
      >
        <Search
          className={`shrink-0 transition-colors ${
            isFocused ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"
          } ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            if (!isFocused) setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Barra de busca por itens, recursos e conteúdo"
          aria-expanded={isFocused}
          aria-autocomplete="list"
          role="combobox"
          className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans"
        />

        {/* Clear input button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Limpar pesquisa"
            aria-label="Limpar campo de pesquisa"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Shortcut Badge (Ctrl K / ⌘K) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenFullSearch) {
              onOpenFullSearch();
            } else {
              inputRef.current?.focus();
              setIsFocused(true);
            }
          }}
          className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 hover:text-amber-900 dark:hover:text-amber-300 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0 select-none"
          title="Atalho de busca global (Ctrl + K)"
        >
          <span>Ctrl K</span>
        </button>
      </div>

      {/* 🧭 Category Navigation Tabs (Pills) */}
      {showCategoryFilters && isFocused && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-none text-[10.5px]">
          {[
            { key: "todos", label: "Todos", count: allMatchedResults.length },
            { key: "funcionalidades", label: "Recursos", count: matchedFeatures.length },
            ...(userRole !== "aluno" ? [{ key: "estudantes", label: "Alunos", count: matchedEstudantes.length }] : []),
            { key: "comunicados", label: "Avisos", count: matchedComunicados.length },
            ...(userRole !== "aluno" ? [{ key: "cobrancas", label: "Financeiro", count: matchedCobrancas.length }] : []),
            { key: "agenda", label: "Agenda", count: matchedEventos.length },
            { key: "fotos", label: "Fotos", count: matchedFotos.length }
          ].map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Keep focus on input
                  setSelectedCategory(cat.key as SearchCategoryFilter);
                  setSelectedIndex(-1);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span>{cat.label}</span>
                {cleanQuery && cat.count > 0 && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-950 font-bold"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 📦 Live Search Results Dropdown Panel */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col text-left max-h-[28rem] select-none"
          >
            {/* Header info strip */}
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {cleanQuery
                  ? `${displayList.length} ${
                      displayList.length === 1 ? "resultado encontrado" : "resultados encontrados"
                    }`
                  : "Recursos Frequentes & Acessos Rápidos"}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono hidden xs:inline">
                ↑↓ Navegar • ↵ Selecionar • Esc Fechar
              </span>
            </div>

            {/* Results Container */}
            <div ref={resultsContainerRef} className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5">
              {/* STATE A: User hasn't typed anything yet -> Show Quick Features & Popular Suggestions */}
              {!cleanQuery ? (
                <div className="p-3 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                      Acessos Mais Utilizados
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {availableFeatures.slice(0, 6).map((feat, idx) => (
                        <button
                          key={feat.id || idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelect(feat);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                            {getResultIcon(feat)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {feat.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {feat.subtitle}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular search terms chips */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                      Termos Populares
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SEARCH_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setQuery(sug);
                            inputRef.current?.focus();
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-950 dark:hover:text-amber-200 text-xs transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : displayList.length === 0 ? (
                /* STATE B: No match found */
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nenhum resultado encontrado para "{query}".
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Tente buscar por termos mais gerais, como nome do aluno, "portaria", "boletim", "fatura", "cardápio" ou altere a categoria selecionada.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                    {["Portaria", "Boletim", "Almoço", "Mensalidade", "Comunicado"].map((tip) => (
                      <button
                        key={tip}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setQuery(tip);
                          setSelectedCategory("todos");
                        }}
                        className="px-2 py-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        Buscar por "{tip}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* STATE C: Matches exist -> Clear structured list */
                displayList.map((result, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={`${result.type}-${result.id || idx}`}
                      data-result-index={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(result);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white border border-amber-200/60 dark:border-amber-800/60 shadow-2xs"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-transparent"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getResultIcon(result)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                            {renderHighlighted(result.title)}
                          </h4>
                          {result.badge ? (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                              {result.badge}
                            </span>
                          ) : result.categoryName ? (
                            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                              {result.categoryName}
                            </span>
                          ) : null}
                        </div>

                        {result.subtitle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {renderHighlighted(result.subtitle)}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 self-center flex items-center gap-1">
                        {isSelected && (
                          <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded hidden sm:inline">
                            ↵ Abrir
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Bar with Global Modal link */}
            {onOpenFullSearch && (
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 text-center">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsFocused(false);
                    onOpenFullSearch();
                  }}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 flex items-center justify-center gap-1.5 py-1 w-full cursor-pointer transition-colors"
                >
                  <Search className="w-3 h-3" />
                  <span>Abrir visualização completa na Busca Global (Ctrl + K)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
