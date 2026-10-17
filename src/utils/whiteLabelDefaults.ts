import { SchoolBranding } from "../types";

export interface SystemModuleDefinition {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  category: "pedagogico" | "comunicacao" | "financeiro" | "seguranca" | "gestao";
  defaultEnabled: boolean;
  canBeInFeed: boolean;
  feedLabel?: string;
}

export const SYSTEM_MODULES: SystemModuleDefinition[] = [
  {
    id: "metas",
    name: "Metas Diárias de Aprendizado",
    shortLabel: "Metas do Dia",
    description: "Metas de foco cognitivo e objetivos educacionais diários para os alunos.",
    category: "pedagogico",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "🎯 Metas de Aprendizado",
  },
  {
    id: "diaadia",
    name: "Diário de Bordo & Rotina Escolar",
    shortLabel: "Diário & Rotina",
    description: "Registros de refeição, sono, bem-estar, parecer da professora e relatório médico.",
    category: "pedagogico",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "🍱 Resumo da Rotina Diária",
  },
  {
    id: "engajamento",
    name: "Evolução do Humor & Bem-Estar",
    shortLabel: "Humor & Bem-Estar",
    description: "Gráfico contínuo de monitoramento socioemocional e engajamento escolar.",
    category: "pedagogico",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "📊 Evolução Socioemocional",
  },
  {
    id: "academico",
    name: "Boletim & Desempenho Acadêmico",
    shortLabel: "Boletim & Notas",
    description: "Notas bimestrais, faltas, médias gerais e selos de excelência curricular.",
    category: "pedagogico",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "🎓 Desempenho Acadêmico",
  },
  {
    id: "comunicados",
    name: "Mural de Comunicados Oficiais",
    shortLabel: "Comunicados",
    description: "Informativos institucionais, circulares pedagógicas e convocações.",
    category: "comunicacao",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "📢 Mural de Comunicados",
  },
  {
    id: "agenda",
    name: "Calendário Escolar & Próximos Eventos",
    shortLabel: "Eventos & Agenda",
    description: "Passeios, reuniões de pais, avaliações, feriados e datas comemorativas.",
    category: "comunicacao",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "📅 Próximos Eventos",
  },
  {
    id: "cobrancas",
    name: "Módulo Financeiro & Mensalidades",
    shortLabel: "Financeiro",
    description: "Extrato de cobranças, 2ª via de boletos bancários, PIX Copia e Cola e histórico.",
    category: "financeiro",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "💳 Status Financeiro",
  },
  {
    id: "acesso",
    name: "Portaria Segura & Acesso QR Code",
    shortLabel: "Portaria & QR",
    description: "Validação de retirada presencial, autorizações de saída e fila de trânsito.",
    category: "seguranca",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "🛡️ Acesso & Retirada",
  },
  {
    id: "momentos",
    name: "Galeria de Fotos & Momentos",
    shortLabel: "Fotos da Turma",
    description: "Registros fotográficos em sala de aula, oficinas criativas e celebrações.",
    category: "comunicacao",
    defaultEnabled: true,
    canBeInFeed: true,
    feedLabel: "🖼️ Galeria de Momentos",
  },
  {
    id: "erp",
    name: "Integração ERP & Faturamento",
    shortLabel: "Integração ERP",
    description: "Sincronização com TOTVS, Omie, ContaAzul e exportação contábil.",
    category: "gestao",
    defaultEnabled: true,
    canBeInFeed: false,
  },
  {
    id: "crm",
    name: "CRM de Captação & Matrículas",
    shortLabel: "CRM de Matrículas",
    description: "Funil de admissão de novos alunos, agendamento de visitas e rematrícula.",
    category: "gestao",
    defaultEnabled: true,
    canBeInFeed: false,
  },
];

export const DEFAULT_FEED_MODULE_ORDER: string[] = [
  "metas",
  "diaadia",
  "engajamento",
  "academico",
  "cobrancas",
  "agenda",
  "comunicados",
  "acesso",
  "momentos",
];

export interface ThemePresetOption {
  id: SchoolBranding["themePreset"];
  name: string;
  category: string;
  desc: string;
  primary: string;
  secondary: string;
  accent: string;
  logo: SchoolBranding["logoPreset"];
}

export const THEME_PRESET_OPTIONS: ThemePresetOption[] = [
  {
    id: "orlando_magic",
    name: "Magic Oficial (Orlando Blue)",
    category: "Identidade Original",
    desc: "Azul primário e cinza metálico",
    primary: "#0077C0",
    secondary: "#C4CED4",
    accent: "#F59E0B",
    logo: "magic_hat",
  },
  {
    id: "oxford_blue",
    name: "Azul Oxford Acadêmico",
    category: "Tradicional & Formal",
    desc: "Marinho nobre e prateado clássico",
    primary: "#0F2A4A",
    secondary: "#94A3B8",
    accent: "#2563EB",
    logo: "academic_crest",
  },
  {
    id: "amber_warm",
    name: "Âmbar Real Magic",
    category: "Acolhedor & Vivo",
    desc: "Dourado quente, carvalho e âmbar solar",
    primary: "#78350F",
    secondary: "#FDE68A",
    accent: "#D97706",
    logo: "magic_wand",
  },
  {
    id: "fairy_emerald",
    name: "Esmeralda Waldorf",
    category: "Ecológico & Sustentável",
    desc: "Verde floresta profundo e menta suave",
    primary: "#064E3B",
    secondary: "#A7F3D0",
    accent: "#059669",
    logo: "emerald_shield",
  },
  {
    id: "bordeaux_tradition",
    name: "Bordô Britânico Clássico",
    category: "Colégio Tradicional",
    desc: "Vinho refinado e dourado nobre",
    primary: "#4A044E",
    secondary: "#FBCFE8",
    accent: "#BE185D",
    logo: "open_book",
  },
  {
    id: "wizard_indigo",
    name: "Índigo Contemporâneo",
    category: "Inovação & Tecnologia",
    desc: "Azul cósmico profundo e lilás digital",
    primary: "#312E81",
    secondary: "#C7D2FE",
    accent: "#4F46E5",
    logo: "modern_monogram",
  },
  {
    id: "slate_minimal",
    name: "Grafite Minimalista",
    category: "Design Escandinavo",
    desc: "Cinza ardósia e acabamento monocromático",
    primary: "#1E293B",
    secondary: "#CBD5E1",
    accent: "#475569",
    logo: "academic_crest",
  },
];

export function getDefaultBranding(): SchoolBranding {
  const defaultEnabledModules: Record<string, boolean> = {};
  SYSTEM_MODULES.forEach((m) => {
    defaultEnabledModules[m.id] = m.defaultEnabled;
  });

  return {
    schoolId: "white-label-1",
    schoolName: "Magic Learning Academy",
    schoolSlogan: "Sistema Integrado de Gestão Escolar & Família",
    logoType: "preset",
    logoPreset: "magic_hat",
    customLogoUrl: "",
    primaryColor: "#0077C0",
    secondaryColor: "#C4CED4",
    accentColor: "#F59E0B",
    themePreset: "orlando_magic",
    fontPreset: "sans",
    borderRadius: "rounded",
    enableStarsBackground: true,
    enabledModules: defaultEnabledModules,
    feedModuleOrder: [...DEFAULT_FEED_MODULE_ORDER],
  };
}

export function applyBrandingToCssVariables(branding: SchoolBranding) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const primary = branding.primaryColor || "#0077C0";
  const secondary = branding.secondaryColor || "#C4CED4";
  const accent = branding.accentColor || "#F59E0B";

  root.style.setProperty("--school-primary", primary);
  root.style.setProperty("--school-secondary", secondary);
  root.style.setProperty("--school-accent", accent);

  // Convert hex to RGB for alpha support
  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return `${r}, ${g}, ${b}`;
    }
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }
    return "0, 119, 192";
  };

  root.style.setProperty("--school-primary-rgb", hexToRgb(primary));
  root.style.setProperty("--school-secondary-rgb", hexToRgb(secondary));
  root.style.setProperty("--school-accent-rgb", hexToRgb(accent));
}
