import { Comunicado, Momento, Evento, Cobranca, Estudante } from "./types";

// Dynamic dates based on current years to keep it fresh
const now = new Date();
const d = (daysOffset: number) => {
  const target = new Date();
  target.setDate(now.getDate() + daysOffset);
  return target;
};

export const initialComunicados: Comunicado[] = [
  {
    id: "com-1",
    title: "Festa Junina do Colégio Magic Learning! 🌽🎒",
    date: "Hoje às 11:04",
    timestamp: d(0).getTime(),
    previewText: "Preparem os trajes caipiras! Venha comemorar conosco com muita pipoca, doces e dança quadrilha.",
    category: "Eventos e Festas",
    content: "Queridas famílias,\n\nEstá chegando a nossa tradicional Festa Junina do Colégio Magic Learning! No próximo sábado, nosso campus se transformará em um verdadeiro arraial caipira com gostinho de pura diversão!\n\nHorário: das 10h às 18h.\n\nTeremos barraquinhas de comidas típicas dirigidas por nossos alunos, pescaria, brincadeiras tradicionais e, claro, as nossas tradicionais apresentações de quadrilha de todas as turmas!\n\nEsperamos todos vocês para este dia de muita integração e união comunitária!",
    authorName: "Diretoria Pedagógica",
    tags: ["festa", "cultura", "junina", "quadrilha", "comunidade"],
    likesCount: 15,
    dislikesCount: 0,
    comments: [
      { id: "com-c-1", authorName: "Mariana Silva (Mãe da Alice)", text: "Mal podemos esperar! A fantasia do Nicolas já está prontinha. ❤️", timestamp: Date.now() - 5000000 },
      { id: "com-c-2", authorName: "Carlos Souza (Pai do Benício)", text: "Excelente iniciativa, estaremos presentes com toda a família!", timestamp: Date.now() - 2000000 }
    ]
  },
  {
    id: "com-2",
    title: "Experimentos de Ciências da Natureza & Laboratório 🧪🔬",
    date: "Ontem",
    timestamp: d(-1).getTime(),
    previewText: "Informações sobre o novo cronograma de experimentos práticos e protocolos de segurança.",
    category: "Diretrizes Acadêmicas",
    content: "Srs. Pais e Responsáveis,\n\nGostaríamos de reforçar que as aulas no laboratório de Ciências da Natureza têm sido um grande sucesso. No entanto, solicitamos atenção às seguintes orientações para garantir a segurança de todos:\n\n1. Uso obrigatório de jaleco de algodão de manga comprida.\n2. Sapatos totalmente fechados são indispensáveis.\n3. Cabelos compridos devem estar sempre presos.\n\nSeguimos focados em proporcionar descobertas inspiradoras e científicas seguras para nossos alunos!",
    authorName: "Coordenação de Ciências",
    tags: ["ciencia", "laboratorio", "seguranca", "regras"],
    likesCount: 9,
    dislikesCount: 1,
    comments: [
      { id: "com-c-3", authorName: "Ana Paula (Mãe da Luna)", text: "Anotado! Vou providenciar o calçado fechado hoje mesmo.", timestamp: Date.now() - 10000000 }
    ]
  },
  {
    id: "com-3",
    title: "Atividades Pedagógicas: Destaques da Semana 📸💻",
    date: "3 dias atrás",
    timestamp: d(-3).getTime(),
    previewText: "Confira as fotos e registros das atividades interdisciplinares realizadas ao ar livre.",
    category: "Mídia e Redes",
    content: "Nesta semana, nossos canais institucionais registraram momentos enriquecedores de aprendizado colaborativo!\n\nNossos alunos da Ed. Infantil exploraram as texturas das folhas no jardim sensorial, descobrindo insetos e a biodiversidade local sob a supervisão da equipe de biologia.\n\nAcompanhe diariamente a evolução e o desenvolvimento dos seus filhos através do nosso portal!",
    authorName: "Equipe de Comunicação",
    tags: ["comunicacao", "fotos", "atividades", "comunidade"],
    likesCount: 22,
    dislikesCount: 2,
    comments: []
  },
  {
    id: "com-4",
    title: "Registro de Imagem Escolar 2026 - Novo Termo ✍️📜",
    date: "1 semana atrás",
    timestamp: d(-7).getTime(),
    previewText: "Envio do termo de consentimento atualizado para atividades extracurriculares externas.",
    category: "Secretaria",
    content: "Prezados,\n\nTendo em vista as próximas atividades externas e saídas culturais de estudo de campo, disponibilizamos o formulário eletrônico de atualização de autorização para registro de imagens em mídias institucionais.\n\nPor favor, confirmem o envio assinado eletronicamente pelo nosso portal ou tragam a via impressa preenchida até o dia 22 de Junho.\n\nAgradecemos a colaboração constante na transparência e zelo institucional.",
    authorName: "Secretaria Geral",
    tags: ["documento", "matricula", "termo", "autorizacao"],
    likesCount: 4,
    dislikesCount: 0,
    comments: []
  }
];

export const initialMomentos: Momento[] = [
  {
    id: "mom-1",
    title: "Experimento de Física & Ótica das Cores",
    description: "Alunos do 3º ano demonstrando princípios de refração e dispersão da luz através de prismas e experimentos práticos.",
    date: "19 Jun 2026",
    timestamp: d(-1).getTime(),
    image: "https://picsum.photos/seed/science/800/600",
    isUserGenerated: false,
    tags: ["ciencia", "fisica", "experimento", "sala-de-aula"],
  },
  {
    id: "mom-2",
    title: "Oficina de Educação Ambiental e Botânica",
    description: "Compreensão dos ciclos ecológicos cultivando pequenas mudas e suculentas em vasos sustentáveis desenvolvidos pelos próprios alunos.",
    date: "15 Jun 2026",
    timestamp: d(-5).getTime(),
    image: "https://picsum.photos/seed/garden/800/600",
    isUserGenerated: false,
    tags: ["jardinagem", "reciclagem", "ecologia", "outdoor"],
  }
];

export const initialEventos: Evento[] = [
  {
    id: "evt-1",
    title: "Grande Festa Junina da Família",
    dateStr: "27 Jun",
    dayOfWeek: "Sábado",
    timestamp: d(7).getTime(),
    time: "10:00 - 18:00",
    description: "Comidas típicas, apresentações folclóricas, jogos cooperativos e quadrilha de todas as turmas do colégio.",
    location: "Quadra Central e Bosque das Bromélias",
    isJoined: true,
    tags: ["festa", "junina", "quadrilha", "comida", "ao-vivo"],
  },
  {
    id: "evt-2",
    title: "Reunião de Pais e Mestres (2º Bimestre)",
    dateStr: "03 Jul",
    dayOfWeek: "Sexta",
    timestamp: d(13).getTime(),
    time: "19:00 - 21:00",
    description: "Conversa com os professores regentes para entrega de avaliações, pareceres pedagógicos e fechamento do semestre.",
    location: "Salas de aula respectivas",
    isJoined: false,
    tags: ["reuniao", "pedagogico", "fechamento-bimestre", "notas"],
  },
  {
    id: "evt-3",
    title: "Feira de Ciências, Tecnologia e Inovação",
    dateStr: "15 Jul",
    dayOfWeek: "Quarta",
    timestamp: d(25).getTime(),
    time: "08:30 - 15:00",
    description: "Mostra científica onde os alunos apresentam maquetes ecológicas, robôs reciclados e inovações sustentáveis.",
    location: "Pavilhão Principal",
    isJoined: false,
    tags: ["feira", "tecnologia", "ciencia", "projetos"],
  }
];

export const initialCobrancas: Cobranca[] = [
  {
    id: "cob-1",
    title: "Mensalidade Escolar - Setembro 2026",
    dueDate: "25/09/2026",
    timestamp: d(5).getTime(),
    amount: 1850.00,
    status: "pendente",
    documentId: "FAT-2026-09A",
    category: "Mensalidades",
    tags: ["financeiro", "mensalidade", "setembro"],
  },
  {
    id: "cob-2",
    title: "Material Didático & Bilíngue 2026",
    dueDate: "30/09/2026",
    timestamp: d(10).getTime(),
    amount: 680.00,
    status: "pendente",
    documentId: "FAT-2026-09B",
    category: "Material Didático",
    tags: ["material", "bilingue", "livros"],
  },
  {
    id: "cob-3",
    title: "Taxa Extracurricular (Robótica & Artes)",
    dueDate: "05/10/2026",
    timestamp: d(15).getTime(),
    amount: 320.00,
    status: "pendente",
    documentId: "FAT-2026-10A",
    category: "Atividades Extracurriculares",
    tags: ["robotica", "artes", "extracurricular"],
  },
  {
    id: "cob-4",
    title: "Seguro Educacional & Passeio Planetário",
    dueDate: "10/10/2026",
    timestamp: d(20).getTime(),
    amount: 150.00,
    status: "pendente",
    documentId: "FAT-2026-10B",
    category: "Passeios Culturais",
    tags: ["passeio", "seguro", "planetario"],
  },
  {
    id: "cob-5",
    title: "Mensalidade Escolar - Outubro 2026",
    dueDate: "20/10/2026",
    timestamp: d(30).getTime(),
    amount: 1850.00,
    status: "pendente",
    documentId: "FAT-2026-10C",
    category: "Mensalidades",
    tags: ["financeiro", "mensalidade", "outubro"],
  },
  {
    id: "cob-6",
    title: "Mensalidade Escolar - Agosto 2026",
    dueDate: "25/08/2026",
    timestamp: d(-25).getTime(),
    amount: 1850.00,
    status: "vencido",
    documentId: "FAT-2026-08",
    category: "Mensalidades",
    tags: ["financeiro", "mensalidade", "agosto", "vencido"],
  },
  {
    id: "cob-7",
    title: "Mensalidade Escolar - Julho 2026",
    dueDate: "25/07/2026",
    timestamp: d(-55).getTime(),
    amount: 1850.00,
    status: "pago",
    documentId: "FAT-2026-07",
    category: "Mensalidades",
    tags: ["financeiro", "mensalidade", "julho", "pago"],
  }
];

export const initialEstudantes: Estudante[] = [
  {
    id: "est-1",
    name: "Nicolas Nogueira",
    grade: "4º Ano - Ensino Fundamental (Turma B)",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=nicolas",
    reEnrollmentStatus: "pendente",
    pickupQueueStatus: "fila_espera",
    parentName: "Mariana Silva Nogueira",
    parentPhone: "(11) 98888-1234",
    parentEmail: "mariana.nogueira@gmail.com",
    pickupQueueStatusUpdatedAt: "10:15:22",
    occurrences: [
      {
        id: "occ-1",
        date: "Hoje (Sexta-feira)",
        meals: {
          lunch: "excelente",
          snack: "excelente",
          details: "Nicolas almoçou muito bem, aceitou a salada e bebeu todo o suco de acerola."
        },
        medicated: {
          wasMedicated: true,
          medicationName: "Paracetamol Gotas",
          doseTime: "13:30",
          details: "Ministrado para desconforto leve relatado na testa. Melhorou logo em seguida e voltou a brincar."
        },
        sleep: {
          durationStr: "1h 15min",
          details: "Dormiu tranquilamente no cantinho de leitura ao som de música clássica."
        },
        behaviorState: "otimo",
        teacherNote: "O Nicolas participou ativamente da prática de laboratório! Demonstrou forte liderança ao guiar o seu grupo com a vidraria de segurança escolar e ajudou a organizar a sala ao final."
      },
      {
        id: "occ-2",
        date: "Ontem (Quinta-feira)",
        meals: {
          lunch: "parcial",
          snack: "excelente",
          details: "Comeu a massa, mas evitou o purê de mandioquinha. No lanche da tarde comeu duas bananas."
        },
        medicated: {
          wasMedicated: false,
          details: "Não necessitou de medicações."
        },
        sleep: {
          durationStr: "Não dormiu",
          details: "Estava muito ativo produzindo ensaios de teatro caipira e preferiu desenhar."
        },
        behaviorState: "agitado",
        teacherNote: "Estava extremamente focado e ansioso com os preparativos da Festa Junina, muito participativo e animado!"
      }
    ],
    grades: [
      { subject: "Matemática & Raciocínio Lógico", firstBimester: 9.0, secondBimester: 9.5, feedback: "Excelente raciocínio lógico na resolução de problemas e geometria espacial." },
      { subject: "Ciências da Natureza & Experimentação", firstBimester: 8.8, secondBimester: 9.5, feedback: "Muito participativo nas aulas de laboratório. Cuidadoso e rigoroso no manuseio de vidrarias." },
      { subject: "Língua Portuguesa & Produção Textual", firstBimester: 9.0, secondBimester: 9.5, feedback: "Escreve redações coerentes, com vocabulário rico e excelente estrutura argumentativa." },
      { subject: "Ciências Humanas (História & Geografia)", firstBimester: 9.1, secondBimester: 9.5, feedback: "Excelente compreensão das dinâmicas sociais e respeito histórico nas apresentações." }
    ],
    withdrawalRules: [
      { id: "pick-1", name: "Maria de Souza", relationship: "Avó Materna", rg: "12.345.678-9", isAuthorized: true },
      { id: "pick-2", name: "Thiago Nogueira", relationship: "Tio Paterno", rg: "98.765.432-1", isAuthorized: true },
      { id: "pick-3", name: "Reginaldo Silva", relationship: "Motorista de Van Particular", rg: "45.678.901-2", isAuthorized: false }
    ]
  },
  {
    id: "est-2",
    name: "Luna Nogueira",
    grade: "Educação Infantil (Maternal I)",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=luna",
    reEnrollmentStatus: "concluido",
    pickupQueueStatus: "liberado_chamado",
    parentName: "Mariana Silva Nogueira",
    parentPhone: "(11) 98888-1234",
    parentEmail: "mariana.nogueira@gmail.com",
    pickupQueueStatusUpdatedAt: "10:28:45",
    occurrences: [
      {
        id: "occ-3",
        date: "Hoje (Sexta-feira)",
        meals: {
          lunch: "recusou",
          snack: "parcial",
          details: "Recusou a sopinha de legumes no começo. Oferecemos papinha de maçã com aveia e ela aceitou bem."
        },
        medicated: {
          wasMedicated: false,
          details: "Sem febre ou queixas hoje."
        },
        sleep: {
          durationStr: "2h 00min",
          details: "Soneca tranquila após o almoço. Acordou com boa disposição."
        },
        behaviorState: "triste",
        teacherNote: "Luna sentiu um pouquinho de saudades da família na acolhida matinal, mas logo se entrosou na oficina de artes e participou com alegria das brincadeiras com os colegas."
      },
      {
        id: "occ-4",
        date: "Ontem (Quinta-feira)",
        meals: {
          lunch: "excelente",
          snack: "excelente",
          details: "Comeu toda a canja e aceitou a sobremesa de frutas."
        },
        medicated: {
          wasMedicated: true,
          medicationName: "Prevenar Gotas (Cólica)",
          doseTime: "11:00",
          details: "Ministrado conforme receita médica arquivada na secretaria."
        },
        sleep: {
          durationStr: "1h 30min",
          details: "Dormiu a soneca da manhã."
        },
        behaviorState: "cansado",
        teacherNote: "Estava mais calma devido à adaptação da rotina, recebendo o acolhimento necessário da equipe."
      }
    ],
    grades: [
      { subject: "Expressão Corporal e Movimento", firstBimester: 9.5, secondBimester: 9.7, feedback: "Luna adora as atividades em roda e demonstra ótima coordenação motora." },
      { subject: "Artes Visuais e Exploração Sensorial", firstBimester: 9.6, secondBimester: 9.8, feedback: "Explora com curiosidade diferentes texturas e materiais pedagógicos." },
      { subject: "Natureza e Sociedade", firstBimester: 9.5, secondBimester: 9.6, feedback: "Interage ativamente com as atividades no jardim e demonstra carinho pelos colegas." }
    ],
    withdrawalRules: [
      { id: "pick-4", name: "Maria de Souza", relationship: "Avó Materna", rg: "12.345.678-9", isAuthorized: true },
      { id: "pick-5", name: "Thiago Nogueira", relationship: "Tio Paterno", rg: "98.765.432-1", isAuthorized: false }
    ]
  }
];

export const initialModerationReports: import("./types").ContentReport[] = [
  {
    id: "rep-1",
    contentType: "comment",
    contentId: "com-c-bad-1",
    contentParentId: "com-1",
    contentTitle: "Festa Junina do Colégio Magic Learning! 🌽🎒",
    contentSnippet: "Absurdo cobrarem taxa de barraca! Essa gestão só quer lucrar em cima das famílias, bando de aproveitadores!",
    contentAuthorName: "Marcos Vinicius (Pai de Aluno)",
    contentAuthorId: "user-mv-99",
    reporterUserId: "user-mariana-01",
    reporterName: "Mariana Silva (Mãe da Alice)",
    reporterRole: "pais",
    reason: "bullying_harassment",
    reasonDetails: "Mensagem ofensiva e difamatória direcionada à coordenação e à comunidade no mural público de avisos.",
    timestamp: Date.now() - 1000 * 60 * 35, // 35 min ago
    status: "pending"
  },
  {
    id: "rep-2",
    contentType: "photo",
    contentId: "photo-lab-02",
    contentParentId: "portfolio-photos",
    contentTitle: "Experimento com Soluções Químicas",
    contentSnippet: "Registro em laboratório com alunos manipulando tubos de ensaio sem máscara de proteção facial.",
    contentImageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80",
    contentAuthorName: "Prof. Henrique (Química)",
    contentAuthorId: "teacher-hq-02",
    reporterUserId: "user-roberto-02",
    reporterName: "Roberto Mendes (Pai do Theo)",
    reporterRole: "pais",
    reason: "minor_privacy",
    reasonDetails: "Meu filho Theo aparece em primeiro plano sem o termo de cessão de imagem assinado para este ano letivo (Art. 14 LGPD). Solicito a remoção.",
    timestamp: Date.now() - 1000 * 60 * 120, // 2h ago
    status: "pending"
  },
  {
    id: "rep-3",
    contentType: "comment",
    contentId: "com-c-spam-1",
    contentParentId: "com-2",
    contentTitle: "Experimentos de Ciências da Natureza & Laboratório 🧪🔬",
    contentSnippet: "Vendo jalecos de algodão e calçados escolares com 40% de desconto! Acessem meu site www.loja-uniformes-sp.com.br ou zap (11) 99887-1122!",
    contentAuthorName: "Distribuidora Uniformes Express",
    contentAuthorId: "user-spam-04",
    reporterUserId: "user-carlos-03",
    reporterName: "Carlos Souza (Pai do Benício)",
    reporterRole: "pais",
    reason: "spam_advertising",
    reasonDetails: "Divulgação comercial não autorizada no mural institucional de avisos da escola.",
    timestamp: Date.now() - 1000 * 60 * 240, // 4h ago
    status: "pending"
  },
  {
    id: "rep-4",
    contentType: "comment",
    contentId: "com-c-resolved-1",
    contentParentId: "com-3",
    contentTitle: "Atividades Pedagógicas: Destaques da Semana 📸💻",
    contentSnippet: "Seu filho é um folgado que não deixa os outros estudarem, aprenda a educar em casa antes de mandar pra escola!",
    contentAuthorName: "Usuário Anônimo",
    contentAuthorId: "user-anon-88",
    reporterUserId: "user-ana-04",
    reporterName: "Ana Paula (Mãe da Luna)",
    reporterRole: "pais",
    reason: "bullying_harassment",
    reasonDetails: "Ataque direto e desrespeitoso entre responsáveis na seção de comentários da atividade.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    status: "resolved_warned",
    reviewedAt: Date.now() - 1000 * 60 * 60 * 18,
    reviewedBy: "Coordenação Pedagógica",
    moderatorNotes: "Comentário removido imediatamente por violar o Regimento Interno e o Código de Convivência Digital. Advertência formal moderada emitida ao autor.",
    actionTaken: "removed_and_warned",
    warningIssued: {
      id: "warn-seed-1",
      userId: "user-anon-88",
      userName: "Usuário Advertido",
      reason: "Violação do Código de Convivência e Conduta Respeitosa",
      severity: "moderada",
      message: "Seu comentário foi removido por conter agressões verbais a outros membros da comunidade escolar. Reiterações podem levar à suspensão do acesso aos canais interativos.",
      issuedBy: "Coordenação Pedagógica",
      issuedAt: Date.now() - 1000 * 60 * 60 * 18,
      acknowledged: true,
      acknowledgedAt: Date.now() - 1000 * 60 * 60 * 12,
      relatedReportId: "rep-4",
      relatedContentSnippet: "Seu filho é um folgado que não deixa os outros estudarem..."
    }
  }
];

export const initialUserWarnings: import("./types").UserWarning[] = [
  {
    id: "warn-seed-active",
    userId: "user-demo",
    userName: "Família do Aluno",
    userRole: "pais",
    reason: "Orientações de Convivência: Uso de Imagem e Privacidade (LGPD)",
    severity: "leve",
    message: "Relembramos à comunidade escolar que fotos e vídeos contendo outros alunos não devem ser divulgados em redes sociais abertas sem a devida autorização expressa dos responsáveis legais, em conformidade com o Art. 14 da LGPD e o Regimento Interno.",
    issuedBy: "Coordenação Pedagógica & DPO",
    issuedAt: Date.now() - 1000 * 60 * 90,
    acknowledged: false,
    relatedContentSnippet: "Compartilhamento de registros visuais de atividades pedagógicas em canais públicos"
  },
  {
    id: "warn-seed-1",
    userId: "user-anon-88",
    userName: "Usuário Advertido",
    reason: "Violação do Código de Convivência e Conduta Respeitosa",
    severity: "moderada",
    message: "Seu comentário foi removido por conter agressões verbais a outros membros da comunidade escolar. Reiterações podem levar à suspensão do acesso aos canais interativos.",
    issuedBy: "Coordenação Pedagógica",
    issuedAt: Date.now() - 1000 * 60 * 60 * 18,
    acknowledged: true,
    acknowledgedAt: Date.now() - 1000 * 60 * 60 * 12,
    relatedReportId: "rep-4",
    relatedContentSnippet: "Seu filho é um folgado que não deixa os outros estudarem..."
  }
];
