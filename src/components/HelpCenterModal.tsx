import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  BookOpen,
  Compass,
  CheckCircle2,
  HelpCircle,
  QrCode,
  ShieldCheck,
  DollarSign,
  Calendar,
  Sparkles,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smartphone,
  WifiOff,
  Copy,
  Check,
  Award,
  Users,
  GraduationCap,
  Play,
  RotateCcw,
  Clock,
  Send,
  Building2,
  BadgePercent
} from "lucide-react";
import { FinanceInteractiveTutorial } from "./FinanceInteractiveTutorial";

export type HelpCenterTab = "features" | "finance_flow" | "use_cases" | "tips" | "simulator" | "faq" | "contact";
export type AudienceFilter = "todos" | "pais" | "escola" | "aluno";

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "pais" | "escola" | "aluno" | "landing";
  initialTab?: HelpCenterTab;
  initialSearchQuery?: string;
  onNavigateToTab?: (tabName: string) => void;
  onStartGuidedTour?: () => void;
}

interface CoreFeatureItem {
  id: string;
  title: string;
  category: string;
  audience: "pais" | "escola" | "aluno" | "todos";
  summary: string;
  details: string[];
  tips: string;
  actionTab?: string;
  actionLabel?: string;
}

interface UseCaseGuide {
  id: string;
  title: string;
  audience: "pais" | "escola" | "aluno" | "todos";
  timeEstimate: string;
  summary: string;
  steps: {
    number: number;
    title: string;
    description: string;
    highlight?: string;
  }[];
  importantNote?: string;
  actionTab?: string;
  actionLabel?: string;
}

interface ProTip {
  id: string;
  title: string;
  tag: string;
  audience: "pais" | "escola" | "aluno" | "todos";
  description: string;
  shortcut?: string;
  actionTab?: string;
  actionLabel?: string;
}

interface FaqItem {
  id: string;
  question: string;
  category: "portaria" | "financeiro" | "comunicacao" | "academico" | "sistema";
  audience: "pais" | "escola" | "aluno" | "todos";
  answer: string;
  quickLink?: {
    label: string;
    tab: string;
  };
}

const CORE_FEATURES: CoreFeatureItem[] = [
  {
    id: "portaria_qrcode",
    title: "Portaria Segura & Crachá Digital QR Code",
    category: "Segurança & Portaria",
    audience: "todos",
    summary: "Sistema antifraude de liberação de estudantes na portaria com QR Code criptografado dinâmico e contingência offline.",
    details: [
      "Crachá Digital dos Pais: QR Code com rotação de segurança temporária para evitar impressões ou cópias estáticas desatualizadas.",
      "Leitor da Portaria Escolar: Câmera ou totem óptico dedicado com retorno sonoro (bip metálico ou chimes acústicos) e confirmação em tela.",
      "Autorização de Terceiros: Cadastro de tios, avós e motoristas de van com nome completo, documento (RG/CPF) e fotografia para conferência física.",
      "Resiliência Offline: Caso a escola ou o smartphone fique sem internet, a portaria valida os dados criptografados localmente e sincroniza assim que a conexão restabelece."
    ],
    tips: "Ative o 'Modo Contínuo' no leitor da portaria para fluxo ágil em horários de pico de saída de turmas.",
    actionTab: "acesso",
    actionLabel: "Abrir Portaria & Crachá"
  },
  {
    id: "comunicados_oficiais",
    title: "Mural de Comunicados & Secretaria Digital",
    category: "Comunicação",
    audience: "todos",
    summary: "Canal oficial da diretoria e coordenação pedagógica com confirmação de leitura obrigatória e protocolo assinado.",
    details: [
      "Disparo Segmentado: Comunicados podem ser direcionados para toda a escola, anos letivos específicos, turmas ou famílias individuais.",
      "Confirmação Obrigatória: Circulares críticas exigem que o responsável toque em 'Confirmar Leitura', gerando registro com data, hora e IP de protocolo.",
      "Chat com a Secretaria: Mensagens diretas entre famílias e equipe pedagógica sem depender de números particulares de WhatsApp.",
      "Galeria Pedagógica: Fotos de projetos, aulas práticas e vivências escolares com controle estrito de privacidade e consentimento."
    ],
    tips: "Comunicados com carimbo 'Urgente' disparam notificações em destaque e permanecem fixados no topo do painel até a confirmação.",
    actionTab: "comunicados",
    actionLabel: "Ver Mural de Avisos"
  },
  {
    id: "diario_rotina",
    title: "Agenda & Diário de Bordo Escolar",
    category: "Rotina Diária",
    audience: "pais",
    summary: "Acompanhamento minucioso da rotina diária: registros de alimentação, sono, evacuação, medicamentos e recados dos professores.",
    details: [
      "Alimentação & Aceitação: Relatório sobre lanche e almoço (comeu tudo, parcial ou recusou), além de hidratação ao longo do dia.",
      "Repouso & Soneca: Registro de horários de descanso em minutos para educação infantil e anos iniciais.",
      "Medicamentos Prescritos: Envio de autorização médica pelos pais e confirmação de administração de doses pela enfermagem escolar.",
      "Ocorrências Pedagógicas: Anotações com acolhimento socioemocional e observações de convivência em grupo."
    ],
    tips: "Para solicitar remédio, anexe a receita médica em PDF ou foto direto pelo diário antes das 08h da manhã.",
    actionTab: "diaadia",
    actionLabel: "Abrir Diário de Bordo"
  },
  {
    id: "boletim_bncc",
    title: "Boletim Escolar & Competências da BNCC",
    category: "Acadêmico",
    audience: "todos",
    summary: "Histórico bimestral de notas, conceitos pedagógicos, controle de frequência e painel de acompanhamento emocional.",
    details: [
      "Quatro Ciclos Bimestrais: Médias ponderadas por disciplina, status de aprovação e simulados formativos.",
      "Matriz de Competências BNCC: Indicadores de aprendizado por áreas (Linguagens, Matemática, Ciências da Natureza e Humanas).",
      "Painel Socioemocional: Mapeamento de sentimentos e engajamento registrados nas ocorrências diárias da turma.",
      "Exportação em PDF: Emissão de boletins oficiais e relatórios médicos/psicopedagógicos prontos para impressão."
    ],
    tips: "Notas iguais ou superiores a 9,0 em todas as disciplinas desbloqueiam o selo 'Quadro de Excelência' no perfil do estudante.",
    actionTab: "academico",
    actionLabel: "Consultar Boletim"
  },
  {
    id: "financeiro_pix",
    title: "Financeiro, Boletos & Pix Copia e Cola",
    category: "Financeiro",
    audience: "pais",
    summary: "Emissão de cobranças escolares com código Pix instantâneo, desconto de pontualidade e extrato unificado.",
    details: [
      "Pix Copia e Cola: Chave instantânea com baixa automática no sistema escolar em menos de 10 segundos.",
      "Desconto de Pontualidade: Aplicação automática de até 5% para pagamentos realizados antes do vencimento estipulado.",
      "Linha Digitável & Boleto: Código de barras bancário completo para pagamento em qualquer aplicativo de banco ou lotérica.",
      "Canal de Acordo Transparente: Proposta de parcelamento e renegociação integrada para famílias com pendências financeiras."
    ],
    tips: "Ao pagar com Pix, o comprovante fica disponível imediatamente no extrato para download sem necessidade de envio à tesouraria.",
    actionTab: "cobrancas",
    actionLabel: "Acessar Financeiro"
  },
  {
    id: "gestao_erp_escola",
    title: "Sincronização ERP, Webhooks & CRM de Matrículas",
    category: "Gestão Escolar",
    audience: "escola",
    summary: "Integração bidirecional com sistemas de gestão (TOTVS, Asaas, Sophia) e régua automatizada de retenção.",
    details: [
      "Webhooks Bidirecionais: Disparo e recepção de eventos financeiros, acadêmicos e cadastrais com logs de auditoria.",
      "Régua de Cobrança WhatsApp: Disparos automáticos e amigáveis para faturas a 5, 3 e 1 dia do vencimento.",
      "CRM de Rematrícula & LTV: Acompanhamento de probabilidade de retenção, ticket médio e pipeline de renovação contratual.",
      "Grade Curricular & Horários: Montagem de grade de aulas semanais com alocação inteligente de professores e salas."
    ],
    tips: "Use a simulação de conectividade no painel de ERP para testar o envio de webhooks antes de rodar o lote mensal de cobranças.",
    actionTab: "erp",
    actionLabel: "Painel de ERP"
  }
];

const USE_CASE_GUIDES: UseCaseGuide[] = [
  {
    id: "guia_autorizar_terceiro",
    title: "Como autorizar uma pessoa (tio, avó ou van) para retirar o aluno hoje?",
    audience: "pais",
    timeEstimate: "1 minuto",
    summary: "Libere com segurança um parente ou responsável eventual para buscar seu filho na portaria sem burocracia em papel.",
    steps: [
      {
        number: 1,
        title: "Acesse a aba 'Portaria & Crachá'",
        description: "Toque na aba 'Portaria & Crachá' no menu de navegação ou use o atalho rápido do topo.",
        highlight: "Aba Portaria (ou atalho de chave)"
      },
      {
        number: 2,
        title: "Localize 'Pessoas Autorizadas'",
        description: "Role até a seção de Pessoas Autorizadas e clique no botão '+ Nova Autorização'.",
        highlight: "Botão '+ Nova Autorização'"
      },
      {
        number: 3,
        title: "Preencha dados e documento",
        description: "Informe o nome completo da pessoa, parentesco, RG ou CPF e selecione o período da liberação (apenas hoje ou permanente).",
        highlight: "Nome, RG/CPF e data limite"
      },
      {
        number: 4,
        title: "Confirme e gere o comprovante",
        description: "Toque em 'Salvar Autorização'. A portaria da escola terá acesso imediato à foto e aos dados no momento da saída.",
        highlight: "Sincronizado na hora com a portaria"
      }
    ],
    importantNote: "Para maior segurança, o terceiro autorizado deverá apresentar um documento oficial com foto na portaria da escola.",
    actionTab: "acesso",
    actionLabel: "Cadastrar Autorização"
  },
  {
    id: "guia_pagamento_pix",
    title: "Como pagar a mensalidade com Pix Copia e Cola e ter baixa imediata?",
    audience: "pais",
    timeEstimate: "45 segundos",
    summary: "Realize a quitação da mensalidade escolar com desconto de pontualidade sem esperar compensação bancária de boleto.",
    steps: [
      {
        number: 1,
        title: "Abra a aba 'Financeiro'",
        description: "Clique em 'Financeiro & Mensalidades' para visualizar todas as faturas do ciclo letivo atual.",
        highlight: "Menu 'Financeiro'"
      },
      {
        number: 2,
        title: "Selecione a fatura pendente",
        description: "Localize a mensalidade do mês desejado e clique no botão 'Pagar com Pix' ou 'Ver Detalhes'.",
        highlight: "Botão 'Pagar com Pix'"
      },
      {
        number: 3,
        title: "Copie o código Pix ou aponte a câmera",
        description: "Toque em 'Copiar Chave Pix' ou aponte o app do seu banco para o QR Code exibido na tela.",
        highlight: "Chave Copia e Cola"
      },
      {
        number: 4,
        title: "Confirmação instantânea",
        description: "Após a aprovação no seu banco, o status no portal mudará automaticamente para 'Pago' e o recibo será liberado.",
        highlight: "Baixa em até 10 segundos"
      }
    ],
    importantNote: "Pagamentos via Pix efetuados até a data de vencimento calculam automaticamente o desconto pontualidade de até 5%.",
    actionTab: "cobrancas",
    actionLabel: "Abrir Financeiro"
  },
  {
    id: "guia_portaria_offline",
    title: "O que fazer se a internet da portaria cair ou o celular ficar sem sinal?",
    audience: "todos",
    timeEstimate: "1 minuto",
    summary: "O aplicativo possui arquitetura resiliente desenvolvida especificamente para não travar a saída de alunos sem internet.",
    steps: [
      {
        number: 1,
        title: "Abra o aplicativo normalmente",
        description: "Mesmo sem conexão, o aplicativo abre no modo PWA local com os dados dos estudantes armazenados em cache criptografado.",
        highlight: "Funciona sem internet"
      },
      {
        number: 2,
        title: "Exiba o QR Code gerado",
        description: "O crachá do aluno contém uma assinatura digital com timestamp que valida o vínculo com a família sem consultar a nuvem.",
        highlight: "Código assinado digitalmente"
      },
      {
        number: 3,
        title: "Leitura pelo totem ou celular da portaria",
        description: "O leitor da portaria verifica a chave pública da escola e confirma a liberação do aluno com alerta verde na tela.",
        highlight: "Validação matemática local"
      },
      {
        number: 4,
        title: "Sincronização em segundo plano",
        description: "Assim que a internet for restabelecida, todos os registros da fila de saída sobem automaticamente para os servidores da nuvem.",
        highlight: "Fila de sincronização automática"
      }
    ],
    importantNote: "Nenhum aluno fica retido na portaria por indisponibilidade de sinal de internet da operadora.",
    actionTab: "acesso",
    actionLabel: "Ver Crachá Digital"
  },
  {
    id: "guia_confirmar_comunicado",
    title: "Como confirmar leitura de comunicado obrigatório e responder à escola?",
    audience: "pais",
    timeEstimate: "30 segundos",
    summary: "Mantenha a coordenação pedagógica ciente de que você tomou ciência de circulares, passeios e reuniões.",
    steps: [
      {
        number: 1,
        title: "Identifique o aviso no mural",
        description: "Na aba 'Comunicados', avisos pendentes de confirmação exibem a tarja 'Confirmação Obrigatória'.",
        highlight: "Aviso com tarja de atenção"
      },
      {
        number: 2,
        title: "Leia a íntegra do comunicado",
        description: "Clique no card do aviso para expandir as instruções pedagógicas, horários e anexos.",
        highlight: "Texto completo e anexos"
      },
      {
        number: 3,
        title: "Toque em 'Confirmar Leitura'",
        description: "Acione o botão 'Confirmar Leitura'. O sistema registra seu nome de responsável e gera um protocolo eletrônico.",
        highlight: "Botão 'Confirmar Leitura'"
      },
      {
        number: 4,
        title: "Envie uma mensagem se tiver dúvidas",
        description: "Se precisar tirar dúvidas, clique em 'Falar com a Secretaria' no rodapé do comunicado para abrir o chat seguro.",
        highlight: "Canal direto de chat"
      }
    ],
    actionTab: "comunicados",
    actionLabel: "Ver Comunicados"
  },
  {
    id: "guia_publicar_comunicado_escola",
    title: "Como a equipe escolar publica comunicado urgente com notificação celular?",
    audience: "escola",
    timeEstimate: "2 minutos",
    summary: "Dispare informativos oficiais com segmentação por turma, anexos e confirmação de leitura em lote.",
    steps: [
      {
        number: 1,
        title: "Acesse o Mural de Comunicados",
        description: "No perfil da Escola, clique na aba 'Mural de Comunicados' no menu lateral ou use a busca Ctrl+K.",
        highlight: "Mural da Escola"
      },
      {
        number: 2,
        title: "Clique em '+ Novo Comunicado'",
        description: "Abra o modal de criação no topo direito da página.",
        highlight: "Botão '+ Novo Comunicado'"
      },
      {
        number: 3,
        title: "Defina título, texto e urgência",
        description: "Marque a caixa 'Exigir Confirmação de Leitura' e ative 'Disparar Notificação Push' para envio sonoro ao celular dos pais.",
        highlight: "Confirmação & Push"
      },
      {
        number: 4,
        title: "Selecione a turma e publique",
        description: "Escolha 'Todas as Turmas' ou selecione uma sala específica (ex.: 5º Ano A) e clique em 'Publicar Agora'.",
        highlight: "Segmentação imediata"
      }
    ],
    actionTab: "comunicados",
    actionLabel: "Publicar Comunicado"
  },
  {
    id: "guia_alternar_estudantes",
    title: "Como alternar entre irmãos cadastrados na mesma escola?",
    audience: "pais",
    timeEstimate: "15 segundos",
    summary: "Se você tem mais de um filho matriculado, gerencie a rotina, notas e mensalidades de cada um em um único acesso.",
    steps: [
      {
        number: 1,
        title: "Localize a barra de estudantes no topo",
        description: "No topo do painel familiar, há uma barra horizontal listando os nomes e turmas dos seus filhos matriculados.",
        highlight: "Barra de seleção de estudantes"
      },
      {
        number: 2,
        title: "Clique no nome do filho desejado",
        description: "O sistema atualizará instantaneamente todas as telas (diário, boletim, crachá de portaria e faturas) para o aluno selecionado.",
        highlight: "Troca instantânea sem deslogar"
      }
    ],
    actionTab: "dashboard",
    actionLabel: "Ver Meus Filhos"
  }
];

const PRO_TIPS: ProTip[] = [
  {
    id: "tip_ctrl_k",
    title: "Atalho Universal de Teclado (Ctrl + K / ⌘ + K)",
    tag: "Produtividade",
    audience: "todos",
    description: "Pressione Ctrl + K (ou ⌘ + K no Mac) a qualquer momento para abrir a busca global instantânea. Você pode pular direto para um aluno, fatura, circular ou ferramenta em menos de 1 segundo.",
    shortcut: "Ctrl + K / ⌘ + K"
  },
  {
    id: "tip_pwa_install",
    title: "Instale como Aplicativo Nativo (PWA) no Celular",
    tag: "Mobilidade",
    audience: "todos",
    description: "Toque no botão 'Compartilhar' do Safari (iOS) ou nos 3 pontinhos do Chrome (Android) e escolha 'Adicionar à Tela de Início'. O app abrirá em tela cheia com carregamento instantâneo e suporte offline.",
    shortcut: "Tela de Início (PWA)"
  },
  {
    id: "tip_audio_modes",
    title: "Modo de Áudio & Retorno Sonoro da Portaria",
    tag: "Acessibilidade",
    audience: "escola",
    description: "Na barra superior da portaria, você pode alternar o tipo de som entre 'Bip Metálico de Totem' e 'Chimes Sintetizados', além de testar o volume para ambientes barulhentos.",
    actionTab: "retiradas",
    actionLabel: "Ajustar Sons da Portaria"
  },
  {
    id: "tip_sparks_gamification",
    title: "Gamificação Formativa & Certificados de Mérito (Sparks)",
    tag: "Engajamento",
    audience: "pais",
    description: "O cumprimento de leituras, frequência exemplar e tarefas de casa acumulam pontos de mérito ('Sparks'). Na aba de Perfil, você pode visualizar e imprimir o Certificado Oficial de Mérito Escolar.",
    actionTab: "perfil",
    actionLabel: "Ver Conquistas & Sparks"
  },
  {
    id: "tip_contrast_reading",
    title: "Modo de Leitura Acessível (Alto Contraste)",
    tag: "Inclusão",
    audience: "todos",
    description: "Ative o botão de acessibilidade no topo para aplicar tipografia com corpo 18px e contraste WCAG AAA para visualização sob luz solar intensa ou para pessoas com baixa visão.",
    shortcut: "Ícone de Acessibilidade"
  }
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq_1",
    question: "O QR Code do crachá é sempre o mesmo ou muda?",
    category: "portaria",
    audience: "pais",
    answer: "Por segurança e para evitar que terceiros não autorizados usem prints antigos de celular, o QR Code de saída é dinâmico e renova seus parâmetros de segurança periodicamente. Mesmo assim, se seu telefone estiver sem internet, o código emitido na última sessão continua válido para liberação.",
    quickLink: { label: "Abrir Crachá de Portaria", tab: "acesso" }
  },
  {
    id: "faq_2",
    question: "Como comprovar que paguei a mensalidade se o banco ainda não processou o boleto?",
    category: "financeiro",
    audience: "pais",
    answer: "Se você pagou via Pix Copia e Cola, a compensação ocorre em poucos segundos e o recibo digital com carimbo de quitação é gerado na hora. Se você pagou via boleto bancário tradicional, o sistema leva entre 24 e 48 horas úteis para receber a baixa da câmara bancária, mas você pode enviar o comprovante em PDF pelo chat da secretaria.",
    quickLink: { label: "Consultar Faturas", tab: "cobrancas" }
  },
  {
    id: "faq_3",
    question: "Como o professor registra se meu filho almoçou bem ou tomou remédio?",
    category: "academico",
    audience: "pais",
    answer: "A equipe de professores e berçário possui acesso ao Diário de Turma na plataforma. Eles selecionam o estudante e assinalam a quantidade de alimentação, tempo de soneca e administração de remédio prescrito. As famílias recebem a atualização em tempo real no Diário de Bordo.",
    quickLink: { label: "Ver Diário de Bordo", tab: "diaadia" }
  },
  {
    id: "faq_4",
    question: "Posso autorizar meu filho a sair sozinho da escola?",
    category: "portaria",
    audience: "pais",
    answer: "Sim, caso a escola e o regulamento pedagógico permitam (geralmente a partir do 6º ano do Ensino Fundamental). O responsável deve preencher o 'Termo de Saída Desacompanhada' na aba de Acesso & Portaria, que ficará sinalizado no sistema dos porteiros.",
    quickLink: { label: "Gerenciar Regras de Saída", tab: "acesso" }
  },
  {
    id: "faq_5",
    question: "Como a escola integra as notas e faturas com o sistema TOTVS ou Asaas?",
    category: "sistema",
    audience: "escola",
    answer: "A integração ocorre por meio de Webhooks e API RESTful segura. Ao emitir uma nota no diário ou uma fatura no ERP financeiro, os dados são transmitidos em milissegundos para o portal, sincronizando em tempo real com o aplicativo dos pais.",
    quickLink: { label: "Ver Painel de ERP", tab: "erp" }
  },
  {
    id: "faq_6",
    question: "Como funciona a segurança e privacidade das fotos das crianças?",
    category: "comunicacao",
    audience: "todos",
    answer: "Todas as fotos registradas em atividades escolares seguem estritamente a LGPD e o termo de uso de imagem assinado na matrícula. O acesso é restrito exclusivamente aos responsáveis de alunos daquela turma, com bloqueio para indexação em motores de busca públicos.",
    quickLink: { label: "Ver Mural de Fotos", tab: "comunicados" }
  },
  {
    id: "faq_7",
    question: "O que fazer se esqueci a senha ou preciso atualizar o telefone de contato?",
    category: "sistema",
    audience: "todos",
    answer: "Você pode atualizar seu nome, biografia, foto de perfil e e-mail no painel 'Meu Perfil'. Se precisar alterar a senha cadastrada no Firebase, utilize o link 'Esqueci minha senha' na tela de login para receber um e-mail de redefinição seguro.",
    quickLink: { label: "Abrir Meu Perfil", tab: "perfil" }
  }
];

export function HelpCenterModal({
  isOpen,
  onClose,
  userRole = "pais",
  initialTab = "features",
  initialSearchQuery = "",
  onNavigateToTab,
  onStartGuidedTour
}: HelpCenterModalProps) {
  const [activeTab, setActiveTab] = useState<HelpCenterTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("todos");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq_1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Simulator States
  const [simScanState, setSimScanState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [simPixState, setSimPixState] = useState<"copied" | "paid" | "idle">("idle");
  const [simComState, setSimComState] = useState<"unread" | "confirmed">("unread");

  // Keep state synced when props change
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (initialSearchQuery) setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  // Filter core features
  const filteredFeatures = useMemo(() => {
    return CORE_FEATURES.filter((feat) => {
      const matchAudience = audienceFilter === "todos" || feat.audience === "todos" || feat.audience === audienceFilter;
      if (!matchAudience) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        feat.title.toLowerCase().includes(q) ||
        feat.summary.toLowerCase().includes(q) ||
        feat.category.toLowerCase().includes(q) ||
        feat.details.some(d => d.toLowerCase().includes(q))
      );
    });
  }, [audienceFilter, searchQuery]);

  // Filter use cases
  const filteredUseCases = useMemo(() => {
    return USE_CASE_GUIDES.filter((guide) => {
      const matchAudience = audienceFilter === "todos" || guide.audience === "todos" || guide.audience === audienceFilter;
      if (!matchAudience) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        guide.title.toLowerCase().includes(q) ||
        guide.summary.toLowerCase().includes(q) ||
        guide.steps.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      );
    });
  }, [audienceFilter, searchQuery]);

  // Filter pro tips
  const filteredTips = useMemo(() => {
    return PRO_TIPS.filter((tip) => {
      const matchAudience = audienceFilter === "todos" || tip.audience === "todos" || tip.audience === audienceFilter;
      if (!matchAudience) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tip.title.toLowerCase().includes(q) ||
        tip.description.toLowerCase().includes(q) ||
        tip.tag.toLowerCase().includes(q)
      );
    });
  }, [audienceFilter, searchQuery]);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((faq) => {
      const matchAudience = audienceFilter === "todos" || faq.audience === "todos" || faq.audience === audienceFilter;
      if (!matchAudience) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
      );
    });
  }, [audienceFilter, searchQuery]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleActionClick = (tabName?: string) => {
    if (tabName && onNavigateToTab) {
      onNavigateToTab(tabName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto" style={{ pointerEvents: "auto" }}>
      {/* Backdrop with controlled opacity */}
      <div 
        className="fixed inset-0 bg-slate-950/70 dark:bg-black/80 transition-opacity" 
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Main Container - Editorial aesthetic, no AI slop, no cards-in-cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 z-50"
      >
        {/* Top Header & Search Bar Bar */}
        <header className="px-5 sm:px-7 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                </span>
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Central de Conhecimento • Magic Learning
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
                Guia de Uso & Tutoriais da Aplicação
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-2xl leading-relaxed">
                Tudo o que você precisa saber para acompanhar a rotina escolar, utilizar a portaria segura, emitir pagamentos Pix e manter a comunicação transparente.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onStartGuidedTour && (
                <button
                  onClick={() => {
                    onClose();
                    onStartGuidedTour();
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-102"
                  title="Iniciar passo a passo interativo na interface"
                >
                  <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Tour Guiado na Tela</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                title="Voltar ao portal"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Voltar</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fechar Central de Ajuda"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Input and Audience Filter */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por palavra-chave (ex: 'Pix', 'Portaria', 'Remédio', 'Falta', 'Boletim')..."
                className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  aria-label="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Audience filter pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-750 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 font-mono">
                Visão:
              </span>
              {[
                { id: "todos", label: "Todos" },
                { id: "pais", label: "Famílias" },
                { id: "escola", label: "Gestão Escolar" },
                { id: "aluno", label: "Estudantes" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAudienceFilter(f.id as AudienceFilter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    audienceFilter === f.id
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Navigation Tabs (Same Plane, Clean Architecture) */}
          <nav aria-label="Abas da Central de Ajuda" className="flex items-center gap-1 sm:gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "features", label: "Funcionalidades Principais", count: filteredFeatures.length },
              { id: "finance_flow", label: "Tutorial Financeiro Interativo", count: 3, badge: "Novo" },
              { id: "use_cases", label: "Casos de Uso & Passo a Passo", count: filteredUseCases.length },
              { id: "tips", label: "Dicas & Atalhos", count: filteredTips.length },
              { id: "simulator", label: "Simulador Geral", count: 3 },
              { id: "faq", label: "Perguntas Frequentes (FAQ)", count: filteredFaqs.length },
              { id: "contact", label: "Suporte & Contato" }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as HelpCenterTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase bg-amber-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && !tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                          : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: FUNCIONALIDADES PRINCIPAIS */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white">
                    Módulos & Capacidades do Sistema
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Visão estruturada de como cada pilar da plataforma funciona na prática.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {filteredFeatures.length} {filteredFeatures.length === 1 ? "módulo" : "módulos"}
                </span>
              </div>

              {filteredFeatures.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Search className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                  <p className="text-sm font-semibold">Nenhuma funcionalidade encontrada para "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setAudienceFilter("todos");
                    }}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Limpar filtros de busca
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFeatures.map((feat) => (
                    <article
                      key={feat.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-3.5 flex flex-col justify-between hover:border-amber-400/80 transition-colors"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            {feat.category}
                          </span>
                          <span className="text-[9.5px] px-2 py-0.5 rounded-md font-bold font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {feat.audience === "todos" ? "Geral" : feat.audience === "pais" ? "Família" : feat.audience === "escola" ? "Escola" : "Aluno"}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {feat.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                          {feat.summary}
                        </p>

                        <ul className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-light">
                          {feat.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">▪</span>
                              <span className="leading-snug">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 italic">
                          💡 {feat.tips}
                        </span>
                        {feat.actionTab && (
                          <button
                            onClick={() => handleActionClick(feat.actionTab)}
                            className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
                          >
                            <span>{feat.actionLabel || "Acessar"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CASOS DE USO & PASSO A PASSO */}
          {activeTab === "use_cases" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white">
                    Casos de Uso Comuns & Guias Práticos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Passo a passo objetivo para as situações reais mais frequentes do dia a dia.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {filteredUseCases.length} {filteredUseCases.length === 1 ? "guia" : "guias"}
                </span>
              </div>

              {filteredUseCases.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                  <p className="text-sm font-semibold">Nenhum caso de uso encontrado para "{searchQuery}".</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUseCases.map((guide) => (
                    <article
                      key={guide.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                              Fluxo Prático
                            </span>
                            <span className="text-[9.5px] px-2 py-0.5 rounded-md font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              Tempo: {guide.timeEstimate}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {guide.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                            {guide.summary}
                          </p>
                        </div>

                        {guide.actionTab && (
                          <button
                            onClick={() => handleActionClick(guide.actionTab)}
                            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-102 flex items-center gap-1.5 shrink-0"
                          >
                            <span>{guide.actionLabel || "Executar Agora"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Steps sequence */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {guide.steps.map((step) => (
                          <div
                            key={step.number}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-mono font-black flex items-center justify-center">
                                {step.number}
                              </span>
                              {step.highlight && (
                                <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                                  {step.highlight}
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {step.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-light">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {guide.importantNote && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="font-medium">{guide.importantNote}</span>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DICAS & ATALHOS */}
          {activeTab === "tips" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white">
                    Dicas Avançadas & Atalhos de Produtividade
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recursos inteligentes criados para economizar seu tempo e tirar o máximo proveito da ferramenta.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {filteredTips.length} dicas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTips.map((tip) => (
                  <article
                    key={tip.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          {tip.tag}
                        </span>
                        {tip.shortcut && (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                            {tip.shortcut}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {tip.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                        {tip.description}
                      </p>
                    </div>

                    {tip.actionTab && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleActionClick(tip.actionTab)}
                          className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
                        >
                          <span>{tip.actionLabel || "Experimentar"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TUTORIAL DO FLUXO FINANCEIRO (BOLETOS, DESCONTOS & ALERTAS ERP) */}
          {activeTab === "finance_flow" && (
            <FinanceInteractiveTutorial
              onNavigateToTab={onNavigateToTab}
              onCloseParentModal={onClose}
              userRole={userRole}
            />
          )}

          {/* TAB 4: SIMULADOR INTERATIVO / PRÁTICA RÁPIDA */}
          {activeTab === "simulator" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white">
                  Simulador Interativo & Treinamento Prático
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Experimente as principais ações do sistema em um ambiente de treino seguro antes de usar no dia a dia.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Simulator 1: QR Code Scan */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                        Treino 1 • Portaria
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Simular Leitura de QR na Portaria
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                      Veja o que acontece na tela do porteiro quando o crachá do aluno é posicionado diante da câmera.
                    </p>

                    {/* Simulation Stage */}
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                      <div className="w-20 h-20 mx-auto rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 relative overflow-hidden">
                        <QrCode className="w-full h-full text-slate-800 dark:text-slate-200" />
                        {simScanState === "scanning" && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-amber-500 animate-bounce" />
                        )}
                      </div>

                      {simScanState === "idle" && (
                        <p className="text-[11px] text-slate-500 font-mono">Crachá pronto para leitura</p>
                      )}
                      {simScanState === "scanning" && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold font-mono animate-pulse">
                          Validando assinatura digital...
                        </p>
                      )}
                      {simScanState === "success" && (
                        <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold space-y-0.5">
                          <p>✓ ALUNO LIBERADO COM SUCESSO</p>
                          <p className="text-[10px] font-mono font-normal">Nicolas Rotatori • 5º Ano A</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSimScanState("scanning");
                        setTimeout(() => setSimScanState("success"), 1200);
                      }}
                      disabled={simScanState === "scanning"}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {simScanState === "scanning" ? "Escaneando..." : "Testar Leitura"}
                    </button>
                    {simScanState === "success" && (
                      <button
                        onClick={() => setSimScanState("idle")}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Resetar"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulator 2: Pix Payment */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                        Treino 2 • Financeiro
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Simular Pagamento com Pix Copia e Cola
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                      Entenda como funciona a cópia da chave Pix e a baixa em lote no sistema escolar.
                    </p>

                    <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-600 dark:text-slate-400">Mensalidade Setembro:</span>
                        <span className="text-emerald-700 dark:text-emerald-400">R$ 1.890,00</span>
                      </div>

                      {simPixState === "idle" && (
                        <div className="text-left space-y-1">
                          <span className="text-[10px] text-slate-400 font-mono">Chave Pix simulada:</span>
                          <div className="p-1.5 rounded bg-white dark:bg-slate-950 border font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate">
                            00020126580014br.gov.bcb.pix0136magiclearning-escola-fatura-984
                          </div>
                        </div>
                      )}

                      {simPixState === "copied" && (
                        <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
                          ✓ Código Pix copiado para a área de transferência!
                        </div>
                      )}

                      {simPixState === "paid" && (
                        <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold space-y-0.5">
                          <p>✓ FATURA QUITADA VIA PIX</p>
                          <p className="text-[10px] font-mono font-normal">Recibo #98421 gerado na nuvem</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {simPixState !== "paid" ? (
                      <>
                        <button
                          onClick={() => {
                            handleCopyText("00020126580014br.gov.bcb.pix0136magiclearning-escola-fatura-984", "sim_pix");
                            setSimPixState("copied");
                          }}
                          className="flex-1 py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Chave</span>
                        </button>
                        <button
                          onClick={() => setSimPixState("paid")}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Simular Baixa
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSimPixState("idle")}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                      >
                        Reiniciar Simulação
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulator 3: Announcement Confirmation */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                        Treino 3 • Comunicação
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Simular Leitura de Circular Escolar
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                      Experimente como os pais assinam eletronicamente uma circular pedagógica com protocolo seguro.
                    </p>

                    <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 font-mono font-bold uppercase">
                        Aviso Urgente
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Feira de Ciências & Inovação 2026
                      </h5>
                      <p className="text-[11px] text-slate-500 font-light leading-snug">
                        Autorização para participação na oficina de robótica no laboratório de ciências.
                      </p>

                      {simComState === "confirmed" && (
                        <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold space-y-0.5 mt-2">
                          <p>✓ LEITURA CONFIRMADA</p>
                          <p className="text-[9.5px] font-mono font-normal">Protocolo SHA256 registrado</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {simComState === "unread" ? (
                      <button
                        onClick={() => setSimComState("confirmed")}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs cursor-pointer shadow-xs hover:scale-102 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        <span>Confirmar Ciência da Leitura</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSimComState("unread")}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                      >
                        Resetar Confirmação
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERGUNTAS FREQUENTES (FAQ) */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white">
                    Perguntas Frequentes (FAQ)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Respostas claras e sem jargões para as dúvidas mais comuns de pais e professores.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {filteredFaqs.length} dúvidas
                </span>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                  <p className="text-sm font-semibold">Nenhuma pergunta encontrada para "{searchQuery}".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                              {faq.category}
                            </span>
                            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {faq.question}
                            </span>
                          </div>
                          <span className="text-slate-400 shrink-0">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light border-t border-slate-100 dark:border-slate-800/60"
                            >
                              <p>{faq.answer}</p>
                              {faq.quickLink && (
                                <div className="mt-3 pt-2">
                                  <button
                                    onClick={() => handleActionClick(faq.quickLink?.tab)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                                  >
                                    <span>{faq.quickLink.label}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SUPORTE & CONTATO */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white">
                  Canais de Atendimento da Secretaria & Coordenação
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estamos à disposição para tirar dúvidas operacionais, pedagógicas ou financeiras.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secretaria Online</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    Atendimento ágil para declarações escolares, históricos e emissão de boletos.
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 pt-1">
                    secretaria@magiclearning.edu.br
                  </p>
                  <span className="text-[10px] text-slate-400 block">Segunda a Sexta, das 07h30 às 18h30</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Plantão da Portaria</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    Comunicação direta com o posto de guarda para liberações de emergência.
                  </p>
                  <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 pt-1">
                    (11) 98844-3200 (Ramal Portaria)
                  </p>
                  <span className="text-[10px] text-slate-400 block">Disponível nos horários de entrada e saída</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Coordenação Pedagógica</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    Agendamento de reuniões individuais com professores regentes e orientadores.
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 pt-1">
                    coordenacao@magiclearning.edu.br
                  </p>
                  <span className="text-[10px] text-slate-400 block">Atendimento com agendamento prévio</span>
                </div>
              </div>

              {onStartGuidedTour && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Prefere que o sistema mostre cada botão na tela?
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                      O tour guiado ilumina os elementos reais da aplicação com explicações passo a passo.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onStartGuidedTour();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-extrabold cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Iniciar Tour Guiado</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer - High-Contrast Readability */}
        <footer className="px-5 sm:px-7 py-3.5 bg-slate-100/90 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs text-slate-700 dark:text-slate-200 font-medium">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Manual Interativo v2.4
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[11.5px] text-slate-700 dark:text-slate-300">
              Dica: use <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-900 dark:text-slate-100 font-bold shadow-2xs">Ctrl + K</kbd> para buscar qualquer tela
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-xs"
          >
            Entendido, fechar manual
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
