import { SearchTarget } from "../components/GlobalSearchModal";

export interface SearchFeatureDefinition extends SearchTarget {
  keywords: string[];
  iconType:
    | "qrcode"
    | "shield"
    | "academic"
    | "utensils"
    | "dollar"
    | "announcement"
    | "calendar"
    | "photo"
    | "accessibility"
    | "moon"
    | "whatsapp"
    | "compare"
    | "sensory"
    | "profile"
    | "new_announcement"
    | "branding"
    | "drawer";
  roleSpecific?: ("pais" | "escola" | "aluno" | "landing")[];
}

export const APP_SYSTEM_FEATURES: SearchFeatureDefinition[] = [
  {
    type: "funcionalidade",
    id: "feat-qrcode",
    title: "Leitor QR Code de Portaria",
    subtitle: "Abrir scanner óptico de acesso e liberação de portaria",
    categoryName: "Segurança • Portaria",
    badge: "Scanner Óptico",
    actionKey: "open_qr_modal",
    targetTab: "acesso",
    schoolSubTab: "retiradas",
    iconType: "qrcode",
    keywords: [
      "qr",
      "qrcode",
      "portaria",
      "leitor",
      "scanner",
      "catraca",
      "check-in",
      "checkin",
      "entrada",
      "saida",
      "acesso",
      "camera",
      "seguranca",
      "validar"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-fila-retiradas",
    title: "Fila de Espera e Retiradas (Portaria)",
    subtitle: "Acompanhar carros no pátio e autorizar saída de estudantes",
    categoryName: "Operação • Portaria",
    badge: "Tempo Real",
    targetTab: "acesso",
    schoolSubTab: "retiradas",
    iconType: "shield",
    keywords: [
      "fila",
      "espera",
      "retirada",
      "saida",
      "buscar",
      "aluno",
      "liberacao",
      "carro",
      "patio",
      "veiculo",
      "embarque",
      "desembarque"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-boletim",
    title: "Boletim Escolar e Desempenho Pedagógico",
    subtitle: "Consultar notas por disciplina, faltas e parecer pedagógico",
    categoryName: "Pedagógico • Notas",
    badge: "Acadêmico",
    targetTab: "academico",
    schoolSubTab: "alunos",
    iconType: "academic",
    keywords: [
      "boletim",
      "notas",
      "faltas",
      "frequencia",
      "desempenho",
      "disciplinas",
      "matematica",
      "portugues",
      "provas",
      "avaliacoes",
      "parecer",
      "pedagogico",
      "academico"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-cardapio",
    title: "Cardápio Nutricional e Alimentação",
    subtitle: "Visualizar refeições do dia, almoço, lanches e registro alimentar",
    categoryName: "Rotina • Nutrição",
    badge: "Alimentação",
    targetTab: "diaadia",
    schoolSubTab: "alunos",
    iconType: "utensils",
    keywords: [
      "cardapio",
      "alimentacao",
      "almoco",
      "lanche",
      "refeicao",
      "fruta",
      "nutricao",
      "dieta",
      "comida",
      "menu",
      "jantar",
      "cafe"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-diario-rotina",
    title: "Diário de Rotina (Sono, Banho e Evacuação)",
    subtitle: "Acompanhamento em tempo real da rotina dos estudantes",
    categoryName: "Rotina • Diário",
    badge: "Tempo Real",
    targetTab: "diaadia",
    schoolSubTab: "alunos",
    iconType: "utensils",
    keywords: [
      "rotina",
      "diario",
      "sono",
      "soneca",
      "banho",
      "fralda",
      "evacuacao",
      "humor",
      "tempo real",
      "dia a dia"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-financeiro",
    title: "Financeiro: Faturas, Boletos e PIX Copia e Cola",
    subtitle: "Consultar mensalidades, comprovantes de pagamento e 2ª via",
    categoryName: "Financeiro • Mensalidades",
    badge: "PIX e Boletos",
    targetTab: "cobrancas",
    schoolSubTab: "erp",
    iconType: "dollar",
    keywords: [
      "financeiro",
      "boleto",
      "pix",
      "mensalidade",
      "fatura",
      "pagamento",
      "cobranca",
      "extrato",
      "segunda via",
      "recibo",
      "banco",
      "dinheiro",
      "atraso",
      "pendente"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-comunicados",
    title: "Mural de Avisos e Comunicados Oficiais",
    subtitle: "Circulares da direção, avisos de turma e informes gerais",
    categoryName: "Comunicação • Avisos",
    badge: "Mural",
    targetTab: "comunicados",
    schoolSubTab: "comunicados",
    iconType: "announcement",
    keywords: [
      "comunicados",
      "avisos",
      "mural",
      "circulares",
      "recados",
      "noticias",
      "direcao",
      "escola",
      "informes",
      "mensagens"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-agenda",
    title: "Agenda de Eventos e Calendário Escolar",
    subtitle: "Reuniões de pais, datas comemorativas, feriados e atividades",
    categoryName: "Agenda • Calendário",
    badge: "Calendário",
    targetTab: "comunicados",
    schoolSubTab: "agenda",
    iconType: "calendar",
    keywords: [
      "agenda",
      "calendario",
      "eventos",
      "reuniao",
      "datas",
      "feriado",
      "festa junina",
      "compromissos",
      "planejamento",
      "ano letivo"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-fotos",
    title: "Galeria de Fotos e Portfólio Pedagógico",
    subtitle: "Registros fotográficos das oficinas, salas e projetos didáticos",
    categoryName: "Mídia • Portfólio",
    badge: "Fotos",
    targetTab: "academico",
    schoolSubTab: "alunos",
    iconType: "photo",
    keywords: [
      "fotos",
      "galeria",
      "portfolio",
      "atividades",
      "sala",
      "projetos",
      "imagens",
      "albuns",
      "registros",
      "oficinas"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-acessibilidade",
    title: "Modo de Leitura Acessível (Alto Contraste)",
    subtitle: "Alternar modo de alto contraste e fontes ampliadas",
    categoryName: "Acessibilidade • Visão",
    badge: "Inclusão",
    actionKey: "toggle_accessible_mode",
    iconType: "accessibility",
    keywords: [
      "acessibilidade",
      "alto contraste",
      "contraste",
      "leitura acessivel",
      "leitor de tela",
      "fonte grande",
      "acessivel",
      "daltonismo",
      "inclusao"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-darkmode",
    title: "Alternar Modo Escuro / Modo Claro",
    subtitle: "Alternar entre interface noturna e clara para maior conforto visual",
    categoryName: "Preferências • Tema",
    badge: "Tema",
    actionKey: "toggle_dark_mode",
    iconType: "moon",
    keywords: [
      "modo escuro",
      "modo claro",
      "tema",
      "dark mode",
      "light mode",
      "noturno",
      "claro",
      "escuro",
      "cores",
      "aparencia"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-whatsapp-erp",
    title: "Automações WhatsApp e Régua de Cobrança ERP",
    subtitle: "Configurar lembretes preventivos de mensalidade e régua automática",
    categoryName: "Automação • ERP",
    badge: "WhatsApp",
    schoolSubTab: "erp",
    actionKey: "open_whatsapp_config",
    iconType: "whatsapp",
    keywords: [
      "whatsapp",
      "automacao",
      "regua",
      "lembretes",
      "erp",
      "cobranca preventiva",
      "disparo",
      "mensagens",
      "notificacao financeira"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-compare",
    title: "Comparador de Desempenho de Alunos",
    subtitle: "Análise pedagógica comparativa lado a lado entre estudantes",
    categoryName: "Inteligência • Métricas",
    badge: "Comparativo",
    schoolSubTab: "alunos",
    actionKey: "compare_students",
    iconType: "compare",
    keywords: [
      "comparar",
      "comparador",
      "desempenho comparativo",
      "metricas",
      "analise",
      "alunos lado a lado",
      "evolucao"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-sensory",
    title: "Assinatura Sensorial (Sons e Física Tátil)",
    subtitle: "Personalizar retorno acústico, bipes e efeitos táteis de clique",
    categoryName: "Personalização • Áudio",
    badge: "Acústica",
    actionKey: "open_sensory_panel",
    iconType: "sensory",
    keywords: [
      "sensorial",
      "som",
      "sons",
      "acustica",
      "bipes",
      "haptica",
      "efeitos sonoros",
      "clique",
      "feedback"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-drawer-historico",
    title: "Histórico de Acessos Recentes na Portaria",
    subtitle: "Visualizar log recente de entradas, saídas e bipes da catraca",
    categoryName: "Portaria • Histórico",
    badge: "Log de Acesso",
    actionKey: "open_qr_drawer",
    iconType: "drawer",
    keywords: [
      "historico",
      "acessos recentes",
      "entradas e saidas",
      "portaria log",
      "drawer",
      "ultimos acessos",
      "catraca"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-perfil",
    title: "Meu Perfil e Configurações de Acesso",
    subtitle: "Gerenciar dados cadastrais, senha, notificações e credenciais",
    categoryName: "Conta • Perfil",
    badge: "Usuário",
    targetTab: "perfil",
    iconType: "profile",
    keywords: [
      "perfil",
      "conta",
      "configuracoes",
      "senha",
      "dados",
      "avatar",
      "usuario",
      "notificacoes",
      "seguranca"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-conquistas",
    title: "Conquistas, Mérito Acadêmico & Selos",
    subtitle: "Acompanhar insígnias desbloqueadas, pontos de mérito e medalhas do estudante",
    categoryName: "Mérito • Conquistas",
    badge: "Gamificação",
    targetTab: "perfil",
    iconType: "academic",
    keywords: [
      "conquistas",
      "merito",
      "achievements",
      "sparks",
      "insignias",
      "selos",
      "medalhas",
      "trofeus",
      "gamificacao",
      "pontos",
      "recompensas",
      "certificado"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-novo-comunicado",
    title: "Publicar Novo Comunicado Escolar",
    subtitle: "Criar e disparar novo comunicado para as turmas",
    categoryName: "Gestão • Comunicação",
    badge: "Ação Rápida",
    actionKey: "new_announcement",
    schoolSubTab: "comunicados",
    iconType: "new_announcement",
    roleSpecific: ["escola"],
    keywords: [
      "novo comunicado",
      "criar aviso",
      "publicar",
      "enviar circular",
      "comunicacao oficial",
      "redigir"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-central-ajuda",
    title: "Central de Ajuda, Tutoriais & Manual do App",
    subtitle: "Consulte guias práticos, casos de uso, dicas de atalhos e FAQ completo",
    categoryName: "Suporte • Conhecimento",
    badge: "Ajuda",
    actionKey: "open_help_center",
    iconType: "accessibility",
    keywords: [
      "ajuda",
      "tutorial",
      "tutoriais",
      "manual",
      "guia",
      "como usar",
      "como funciona",
      "duvidas",
      "faq",
      "suporte",
      "secretaria",
      "dicas",
      "atalhos"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-tour-interativo",
    title: "Tour Guiado Interativo pelo Aplicativo",
    subtitle: "Iniciar passo a passo visual com destaque nos botões e abas da tela",
    categoryName: "Suporte • Conhecimento",
    badge: "Tour",
    actionKey: "start_guided_tour",
    iconType: "academic",
    keywords: [
      "tour",
      "tour guiado",
      "passo a passo",
      "apresentacao",
      "primeiros passos",
      "iniciar tour",
      "conhecer o app",
      "onboarding"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-guia-portaria",
    title: "Tutorial: Portaria Segura & QR Code",
    subtitle: "Passo a passo para liberação de alunos, autorização de parentes e modo offline",
    categoryName: "Portaria • Tutoriais",
    badge: "Guia",
    actionKey: "open_help_portaria",
    iconType: "shield",
    keywords: [
      "tutorial portaria",
      "guia portaria",
      "como autorizar saida",
      "autorizar tio",
      "buscar aluno",
      "van escolar",
      "qr code portaria"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-guia-pix",
    title: "Tutorial: Pagamento de Mensalidade com Pix",
    subtitle: "Como pagar faturas escolares com baixa imediata e desconto de pontualidade",
    categoryName: "Financeiro • Tutoriais",
    badge: "Guia",
    actionKey: "open_help_pix",
    iconType: "dollar",
    keywords: [
      "tutorial pix",
      "guia pix",
      "como pagar mensalidade",
      "desconto pontualidade",
      "recibo pix",
      "segunda via boleto"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-tutorial-financeiro",
    title: "Tutorial Interativo: Fluxo Financeiro Completo",
    subtitle: "Aprenda a gerar boletos, aplicar descontos em renegociações e usar a régua do ERP",
    categoryName: "Financeiro • Tutoriais",
    badge: "Interativo",
    actionKey: "open_help_finance_flow",
    iconType: "dollar",
    keywords: [
      "tutorial financeiro",
      "gerar boletos",
      "renegociacao",
      "desconto renegociacao",
      "alertas de vencimento",
      "regua erp",
      "totvs erp",
      "asaas",
      "linha digitavel",
      "como parcelar divida"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-tutorial-renegociacao",
    title: "Tutorial: Renegociação de Débitos & Descontos",
    subtitle: "Como parcelar faturas vencidas e obter isenção de multas e juros no portal",
    categoryName: "Financeiro • Tutoriais",
    badge: "Guia",
    actionKey: "open_help_finance_flow",
    iconType: "dollar",
    keywords: [
      "renegociar divida",
      "desconto de multa",
      "isencao juros",
      "parcelamento mensalidade",
      "acordo financeiro",
      "repactuacao",
      "cupom diretoria"
    ]
  },
  {
    type: "funcionalidade",
    id: "feat-tutorial-alertas-erp",
    title: "Tutorial: Alertas de Vencimento do ERP Escolar",
    subtitle: "Como funciona a régua preventiva via WhatsApp oficial, Notificação Push e E-mail",
    categoryName: "Financeiro • Tutoriais",
    badge: "Guia",
    actionKey: "open_help_finance_flow",
    iconType: "dollar",
    keywords: [
      "alertas de vencimento",
      "regua erp",
      "whatsapp mensalidade",
      "lembrete de pagamento",
      "notificacao push",
      "dias antes do vencimento",
      "evitar juros"
    ]
  }
];

export const POPULAR_SEARCH_SUGGESTIONS = [
  "Central de Ajuda",
  "Tutorial Financeiro",
  "Portaria QR",
  "Boletim",
  "Fatura PIX",
  "Renegociação",
  "Cardápio",
  "Tour Guiado"
];
