export interface TranslationSet {
  schoolPortalName: string;
  portalSubtitle: string;
  slogan: string;
  introText: string;
  
  parentAccessTitle: string;
  parentAccessDesc: string;
  parentBenefit1: string;
  parentBenefit2: string;
  parentBenefit3: string;
  parentBenefit4: string;
  parentBtn: string;

  schoolAccessTitle: string;
  schoolAccessDesc: string;
  schoolBenefit1: string;
  schoolBenefit2: string;
  schoolBenefit3: string;
  schoolBenefit4: string;
  schoolBtn: string;

  metricSynced: string;
  metricConnected: string;
  metricSecurity: string;

  backToLanding: string;
  toggleThemeLight: string;
  toggleThemeDark: string;
  activeReminders: string;
  onlineSecretary: string;
  bulletinBoard: string;
  starSparkCount: string;

  changePortal: string;
  switchToSchool: string;
  switchToParents: string;
  visualIdentity: string;
  exitDashboard: string;

  // Landing Page Translations
  landingHome: string;
  landingHowItWorks: string;
  landingFeatures: string;
  landingBudget: string;
  landingAccessDemo: string;
  landingHeroTitle: string;
  landingHeroSubtitle: string;
  landingSloganBadge: string;
  landingBtnDemo: string;
  landingBtnSales: string;
  landingArchTitle: string;
  landingHelpTitle: string;
  landingHelpSubtitle: string;
  
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;

  caseTitle: string;
  caseSubtitle: string;
  caseBadge: string;
  caseSchool: string;
  caseCustomBranding: string;
  caseDesc: string;
  caseResultsTitle: string;
  caseResult1: string;
  caseResult2: string;
  caseResult3: string;
  caseSandbox: string;
  caseAccessBtn: string;
  mockupTitle: string;

  customTitle: string;
  customSubtitle: string;
  customFormSchoolName: string;
  customFormPreset: string;
  customFormLogo: string;
  customWand: string;
  customShield: string;
  customBook: string;
  customGraduation: string;
  customSaveBtn: string;

  leadTitle: string;
  leadSubtitle: string;
  leadFormName: string;
  leadFormEmail: string;
  leadFormPhone: string;
  leadFormSchool: string;
  leadFormSize: string;
  leadFormMsg: string;
  leadFormBtn: string;
  leadSuccess: string;
  leadSuccessReset: string;
}

export const translations: Record<"pt" | "en" | "es" | "fr" | "ja" | "de" | "zh" | "ar" | "it" | "ru" | "ko" | "hi", TranslationSet> = {
  pt: {
    schoolPortalName: "Portal Escolar Integrado",
    portalSubtitle: "Portal Escolar Integrado",
    slogan: "Conexão inteligente e segura entre famílias e escola.",
    introText: "Acompanhe rotinas, boletins e portaria em tempo real. Um ambiente premium para pais acompanharem o desenvolvimento dos alunos e gestores coordenarem comunicados e acessos com máxima agilidade.",
    
    parentAccessTitle: "Portal dos Responsáveis",
    parentAccessDesc: "Espaço exclusivo para pais. Acompanhe a rotina diária, notas, boletins e portaria.",
    parentBenefit1: "Acompanhar diário de bordo (alimentação, sono e humor)",
    parentBenefit2: "Visualizar notas e boletins acadêmicos em tempo real",
    parentBenefit3: "Disparar aviso de chegada \"Estou a Caminho\"",
    parentBenefit4: "Consultar cobranças e realizar pagamentos via Pix",
    parentBtn: "Acessar como Responsável",

    schoolAccessTitle: "Portal de Gestão Escolar",
    schoolAccessDesc: "Painel interno para professores, secretaria e equipe de portaria.",
    schoolBenefit1: "Registrar ocorrências e diário de bordo dos alunos",
    schoolBenefit2: "Controlar fila de saída e acessos em tempo real",
    schoolBenefit3: "Publicar informativos imediatos no mural",
    schoolBenefit4: "Configurar integrações acadêmicas e financeiras",
    schoolBtn: "Acessar como Gestor",

    metricSynced: "Sincronizado",
    metricConnected: "Multi-Alunos",
    metricSecurity: "Seguro",

    backToLanding: "Voltar ao Início",
    toggleThemeLight: "Modo Claro",
    toggleThemeDark: "Modo Escuro",
    activeReminders: "Lembretes",
    onlineSecretary: "Secretaria",
    bulletinBoard: "Mural de Recados",
    starSparkCount: "Pontos",

    changePortal: "Alternar Portais",
    switchToSchool: "Portal Escolar",
    switchToParents: "Portal dos Pais",
    visualIdentity: "Identidade Visual",
    exitDashboard: "Sair",

    // Landing Page
    landingHome: "Início",
    landingHowItWorks: "Como Funciona",
    landingFeatures: "Recursos",
    landingBudget: "Orçamento",
    landingAccessDemo: "Acessar Demo",
    landingHeroTitle: "O aplicativo próprio white-label para a sua escola",
    landingHeroSubtitle: "Portaria inteligente, mural eletrônico, boletim e mensalidades. Tudo com a marca da sua instituição em um único aplicativo.",
    landingSloganBadge: "Tecnologia para Escolas de Excelência",
    landingBtnDemo: "Ver Demonstração",
    landingBtnSales: "Falar com Consultor",
    landingArchTitle: "ARQUITETURA DA PLATAFORMA",
    landingHelpTitle: "Como ajudamos sua escola",
    landingHelpSubtitle: "Elimine atritos operacionais, reduza custos e encante famílias com um aplicativo próprio.",
    
    feature1Title: "Portaria Inteligente",
    feature1Desc: "Aviso de chegada síncrono. Reduz as filas escolares organizando as saídas por aproximação geográfica e segurança.",
    feature2Title: "Mural Eletrônico",
    feature2Desc: "Envie comunicados rápidos com assinatura digital dos responsáveis. Acabe com os bilhetes de papel perdidos.",
    feature3Title: "Financeiro Integrado",
    feature3Desc: "Facilite o pagamento de mensalidades via Pix e Boleto, com canais amigáveis de negociação automática de pendências.",

    caseTitle: "Caso de Sucesso",
    caseSubtitle: "Confira os resultados obtidos por instituições parceiras que utilizam nossa marca própria.",
    caseBadge: "CASO DE SUCESSO",
    caseSchool: "Colégio Integrado Inovação",
    caseCustomBranding: "Identidade Visual Ativa",
    caseDesc: "O Colégio parceiro unificou sua comunicação acadêmica e financeira, conquistando altos índices de satisfação das famílias.",
    caseResultsTitle: "Resultados comprovados:",
    caseResult1: "Embarque de alunos reduzido para apenas 3 minutos",
    caseResult2: "98% de satisfação declarada pelas famílias",
    caseResult3: "Inadimplência escolar reduzida de forma amigável",
    caseSandbox: "DEMONSTRAÇÃO INTERATIVA",
    caseAccessBtn: "Entrar no Portal de Demonstração",
    mockupTitle: "PREVISÃO DO APP CUSTOMIZADO",

    customTitle: "Sua Marca em Destaque",
    customSubtitle: "Personalize o aplicativo com o nome, cores e logotipo de sua instituição e veja o resultado ao vivo.",
    customFormSchoolName: "Nome da Escola",
    customFormPreset: "Paleta de Cores",
    customFormLogo: "Ícone do Logotipo",
    customWand: "Símbolo Acadêmico",
    customShield: "Escudo Nobre",
    customBook: "Livro Clássico",
    customGraduation: "Capelo Acadêmico",
    customSaveBtn: "Salvar Configurações",

    leadTitle: "Solicite uma Demonstração & Orçamento",
    leadSubtitle: "Descubra como implantar o aplicativo próprio de sua escola em até 15 dias.",
    leadFormName: "Seu Nome",
    leadFormEmail: "E-mail Corporativo",
    leadFormPhone: "Telefone / WhatsApp",
    leadFormSchool: "Nome da Instituição",
    leadFormSize: "Porte da Escola (Alunos)",
    leadFormMsg: "Mensagem (Opcional)",
    leadFormBtn: "Enviar Solicitação",
    leadSuccess: "Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve.",
    leadSuccessReset: "Preencher outra solicitação"
  },
  en: {
    schoolPortalName: "School Portal Pro",
    portalSubtitle: "Integrated School Communication Portal",
    slogan: "Connecting families and school with maximum transparency, security, and fluidity.",
    introText: "Welcome to the official portal. Through this premium environment, parents can follow the student's daily routine, grades, and pickup notifications in real time, while school staff registers student occurrences, announcements, and manages the school entrance.",
    
    parentAccessTitle: "Parents & Guardians Portal",
    parentAccessDesc: "Exclusive parents' space. Track daily logs, student grades, reports, and release pickup alerts.",
    parentBenefit1: "Follow daily reports (meals, nap, mood states)",
    parentBenefit2: "View grades, performance sheets, and class reports",
    parentBenefit3: "Broadcast portal status 'I am on my way 🚗'",
    parentBenefit4: "Copy invoice Pix key and review history details",
    parentBtn: "Enter as Parent/Guardian",

    schoolAccessTitle: "School Management & Staff",
    schoolAccessDesc: "Internal administration dashboard for teachers, coordinators, principal and gatekeepers.",
    schoolBenefit1: "Post daily student logs, meals & sleep stats",
    schoolBenefit2: "Coordinate real-time gate pickup list and alerts",
    schoolBenefit3: "Draft and dispatch dynamic community newsletters",
    schoolBenefit4: "Tweak API configurations and enterprise ERP keys",
    schoolBtn: "Enter as School Administrator",

    metricSynced: "100% Real-Time",
    metricConnected: "Multi-Campus Connected",
    metricSecurity: "End-to-End Security",

    backToLanding: "Exit to Main Screen",
    toggleThemeLight: "Light Mode",
    toggleThemeDark: "Dark Mode",
    activeReminders: "Active Reminders",
    onlineSecretary: "Digital Secretary",
    bulletinBoard: "Bulletin Board",
    starSparkCount: "Stellar Sparks",

    changePortal: "Switch Portals",
    switchToSchool: "To School Dashboard",
    switchToParents: "To Parents Dashboard",
    visualIdentity: "Visual Identity",
    exitDashboard: "Log Out",

    // Landing Page
    landingHome: "The Solution",
    landingHowItWorks: "How It Works",
    landingFeatures: "SaaS Features",
    landingBudget: "Pricing & Quote",
    landingAccessDemo: "Access Demo Portal",
    landingHeroTitle: "The digital ecosystem that consolidates your school's identity and communication",
    landingHeroSubtitle: "Magic Learning is a comprehensive ecosystem for high-tier educational institutions. We deliver your school's own branded app complete with synchronized gate controls, automated push alerts, smart academic tools, and simplified billing workflows.",
    landingSloganBadge: "Exclusive Branded Technology for Schools of Excellence",
    landingBtnDemo: "View Interactive Demo",
    landingBtnSales: "Talk to a Consultant",
    landingArchTitle: "PLATFORM ARCHITECTURE",
    landingHelpTitle: "How Magic Learning empowers your school",
    landingHelpSubtitle: "Eliminate operational friction, cut administrative overhead, and delight families with a premium digital experience.",
    
    feature1Title: "Synchronized \"On My Way\" Gate Control",
    feature1Desc: "Parents alert their arrival via the app. The school gate monitors and automatically coordinates student staging in order of physical arrival, eliminating chaotic car queues and maximizing safety.",
    feature2Title: "Digital Board & Instant Circulars",
    feature2Desc: "Broadcast targeted announcements to specific grades or students. Parents receive push notifications, review terms, and electronically sign field-trip permissions instantly.",
    feature3Title: "Financial ERP & Smart Debt Settlement",
    feature3Desc: "Streamline tuition collections through custom Pix keys and bank slips. The app hosts a private, respectful renegotiation gateway to recover dues while preserving family relations.",

    caseTitle: "A Practical White-Label Case Study",
    caseSubtitle: "See how a premier institution leverages our customized branded platform in their daily operations.",
    caseBadge: "REFERENCE CLIENT PROFILE",
    caseSchool: "Magic Learning Academy",
    caseCustomBranding: "Active Customized Branding",
    caseDesc: "Magic Learning Academy is a prestigious institution using Magic Learning's white-label solutions. They tailored system color palettes to a prestigious deep classic tone, uploaded their coat-of-arms logo, and actively route pick-ups via our synchronized live gateway.",
    caseResultsTitle: "Impact at Magic Learning:",
    caseResult1: "School pickup queue reduced from 25 min to 3 min",
    caseResult2: "98% satisfaction rate reported by parents",
    caseResult3: "100% paperless institutional communication achieved",
    caseSandbox: "INTERACTIVE SANDBOX",
    caseAccessBtn: "Access Magic Learning Portal",
    mockupTitle: "CUSTOM ACADEMY APP PREVIEW",

    customTitle: "Configure Your School's Visual Identity",
    customSubtitle: "Tailor the digital app experience with your school's coat-of-arms, brand colors, and official name.",
    customFormSchoolName: "School Name",
    customFormPreset: "Color Palette",
    customFormLogo: "Brand Logo Icon",
    customWand: "Magic Wand",
    customShield: "Noble Shield",
    customBook: "Classic Book",
    customGraduation: "Graduation Cap",
    customSaveBtn: "Save Brand Settings",

    leadTitle: "Request a Custom Demo & Proposal",
    leadSubtitle: "Discover how to roll out your school's own branded application in less than 15 days.",
    leadFormName: "Your Full Name",
    leadFormEmail: "Corporate Email Address",
    leadFormPhone: "Phone / WhatsApp",
    leadFormSchool: "Institution Name",
    leadFormSize: "School Enrollment Size",
    leadFormMsg: "Your Message (Optional)",
    leadFormBtn: "Submit Demo Request",
    leadSuccess: "Proposal request sent successfully! Our executive team will reach out to you shortly.",
    leadSuccessReset: "Submit Another Request"
  },
  es: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "Portal de Comunicación Escolar Integrado",
    slogan: "Conectando familias y escuela con la máxima transparencia, seguridad y fluidez.",
    introText: "Bienvenido al portal oficial de la escuela. A través de este entorno premium, los padres siguen la rutina diaria, boletas de calificaciones y avisos de portones en tiempo real, mientras que la coordinación gestiona registros de alumnos, bitácoras y comunicados instantáneos.",
    
    parentAccessTitle: "Portal de los Padres",
    parentAccessDesc: "Espacio exclusivo para padres. Gestione la rutina diaria, boletas de notas y pedidos de recogida.",
    parentBenefit1: "Ver reportes diarios (comidas, siestas, estados de ánimo)",
    parentBenefit2: "Consultar libreta de calificaciones y desempeño bimensual",
    parentBenefit3: "Emitir aviso de puerta 'Estoy en camino 🚗'",
    parentBenefit4: "Copiar Pix de pago y verificar el historial de mensualidades",
    parentBtn: "Ingresar como Padre/Tutor",

    schoolAccessTitle: "Portal de Gestión Escolar",
    schoolAccessDesc: "Panel administrativo interno para profesores, coordinadores y vigilantes de puerta.",
    schoolBenefit1: "Registrar informes diarios y bitácora de los alumnos",
    schoolBenefit2: "Monitorear fila de recogida y portón escolar en vivo",
    schoolBenefit3: "Crear anuncios y circulares dirigidas al mural al instante",
    schoolBenefit4: "Configurar sincronización ERP y claves de seguridad globales",
    schoolBtn: "Ingresar como Gestor Escolar",

    metricSynced: "100% Sincronizado",
    metricConnected: "Multi-Alumnos Activos",
    metricSecurity: "Seguridad de Vanguardia",

    backToLanding: "Volver a Inicio",
    toggleThemeLight: "Modo Claro",
    toggleThemeDark: "Modo Oscuro",
    activeReminders: "Recordatorios Activos",
    onlineSecretary: "Secretaría Virtual",
    bulletinBoard: "Tablón de Anuncios",
    starSparkCount: "Chispas Estelares",

    changePortal: "Alternar Portales",
    switchToSchool: "Panel de la Escuela",
    switchToParents: "Panel de Padres",
    visualIdentity: "Identidad Visual",
    exitDashboard: "Salir del Panel",

    // Landing Page
    landingHome: "La Solución",
    landingHowItWorks: "Cómo Funciona",
    landingFeatures: "Recursos SaaS",
    landingBudget: "Presupuesto",
    landingAccessDemo: "Acceder a la Demo",
    landingHeroTitle: "El ecosistema digital que consolida la identidad y la comunicación de su escuela",
    landingHeroSubtitle: "Magic Learning es un ecosistema completo para instituciones educativas de alto nivel. Desarrollamos la aplicación propia de su escuela con control de portón sincronizado, notificaciones push automáticas, gestión académica inteligente y facturación simplificada.",
    landingSloganBadge: "Tecnología Exclusiva a la Medida para Escuelas de Excelencia",
    landingBtnDemo: "Ver Demostración Práctica",
    landingBtnSales: "Hablar con un Consultor",
    landingArchTitle: "ARQUITETURA DE LA PLATAFORMA",
    landingHelpTitle: "Cómo Magic Learning ayuda a su escuela",
    landingHelpSubtitle: "Elimine la fricción operativa, reduzca los costos administrativos y sorprenda a las familias con un servicio tecnológico de nivel premium.",
    
    feature1Title: "Portón Sincronizado \"Estoy en Camino\"",
    feature1Desc: "Los padres alertan su aproximación a través de la aplicación. El portón organiza automáticamente la fila de embarque por ordem de llegada física, ahorrando tiempo de tránsito y ofreciendo la máxima seguridad.",
    feature2Title: "Tablón de Anuncios y Circulares Instantáneas",
    feature2Desc: "Cree comunicados dirigidos a clases enteras o alumnos específicos. Los padres leen y firman electrónicamente los términos, autorizando excursiones y actividades directamente desde su teléfono.",
    feature3Title: "ERP Financiero y Negociación de Deuda",
    feature3Desc: "Facilite el pago de colegiaturas generando cobros vía Pix y boleto. La aplicación ofrece un canal amigable de renegociación de deudas, reduciendo la morosidad sin desgastar la relación pedagógica.",

    caseTitle: "Una Experiencia Práctica White-Label",
    caseSubtitle: "Entienda cómo una institución real utiliza nuestro ecosistema personalizado en su día a día.",
    caseBadge: "CLIENTE MODELO DE REFERENCIA",
    caseSchool: "Colegio Magic Learning",
    caseCustomBranding: "Personalización de Marca Activa",
    caseDesc: "El Colegio Magic Learning es un ejemplo de institución que adoptó las soluciones white-label de Magic Learning. Personalizaron los colores del sistema a un tono clásico sofisticado, subieron su propio logotipo y utilizan el módulo de portón sincronizado en tiempo real.",
    caseResultsTitle: "Impacto en Magic Learning:",
    caseResult1: "Fila escolar reducida de 25 min a solo 3 min",
    caseResult2: "98% de satisfacción declarada por los padres",
    caseResult3: "Comunicación institucional 100% libre de papel",
    caseSandbox: "SANDBOX INTERACTIVA",
    caseAccessBtn: "Acceder al Portal del Magic Learning",
    mockupTitle: "MOCKUP DE LA APLICACIÓN PERSONALIZADA",

    customTitle: "Configure la Identidad Visual de su Escuela",
    customSubtitle: "Personalice la experiencia digital con el logotipo, colores y nombre de su escuela.",
    customFormSchoolName: "Nombre de la Escuela",
    customFormPreset: "Paleta de Colores",
    customFormLogo: "Ícono del Logotipo",
    customWand: "Símbolo Académico",
    customShield: "Escudo Noble",
    customBook: "Libro Clásico",
    customGraduation: "Birrete Académico",
    customSaveBtn: "Guardar Ajustes de Marca",

    leadTitle: "Solicite una Demostración y Presupuesto",
    leadSubtitle: "Descubra cómo implementar la aplicación propia de su escuela en menos de 15 días.",
    leadFormName: "Su Nombre Completo",
    leadFormEmail: "Correo Corporativo",
    leadFormPhone: "Teléfono / WhatsApp",
    leadFormSchool: "Nombre de la Institución",
    leadFormSize: "Tamaño de la Escuela (Alumnos)",
    leadFormMsg: "Mensaje (Opcional)",
    leadFormBtn: "Enviar Solicitud de Demo",
    leadSuccess: "¡Solicitud enviada con éxito! Nuestro equipo corporativo se pondrá en contacto pronto.",
    leadSuccessReset: "Enviar Otra Solicitud"
  },
  fr: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "Portail Scolaire Intégré",
    slogan: "Connexion intelligente et sécurisée entre les familles et l'école.",
    introText: "Suivez la routine, les bulletins scolaires et les accès en temps réel. Un environnement de qualité supérieure pour les parents et les gestionnaires.",
    
    parentAccessTitle: "Portail des Parents",
    parentAccessDesc: "Espace exclusif pour les parents. Suivez la routine quotidienne, les notes et les accès.",
    parentBenefit1: "Suivre le journal quotidien (repas, sommeil, humeur)",
    parentBenefit2: "Consulter les notes et les bulletins scolaires en temps réel",
    parentBenefit3: "Déclencher l'alerte d'arrivée \"Je suis en chemin 🚗\"",
    parentBenefit4: "Consulter les factures et effectuer des paiements via Pix",
    parentBtn: "Se connecter comme Parent",

    schoolAccessTitle: "Portail de Gestion Scolaire",
    schoolAccessDesc: "Panneau interne pour les enseignants, le secrétariat et l'équipe d'accueil.",
    schoolBenefit1: "Enregistrer les événements et le journal de bord des élèves",
    schoolBenefit2: "Contrôler la file d'attente de sortie et les accès en temps réel",
    schoolBenefit3: "Publier des informations immédiates sur le tableau d'affichage",
    schoolBenefit4: "Configurer les intégrations académiques et financières",
    schoolBtn: "Se connecter comme Gestionnaire",

    metricSynced: "Synchrone",
    metricConnected: "Multi-élèves",
    metricSecurity: "Sécurisé",

    backToLanding: "Retour à l'accueil",
    toggleThemeLight: "Mode Clair",
    toggleThemeDark: "Mode Sombre",
    activeReminders: "Rappels Actifs",
    onlineSecretary: "Secrétariat Virtuel",
    bulletinBoard: "Tableau d'affichage",
    starSparkCount: "Étoiles",

    changePortal: "Changer de Portail",
    switchToSchool: "Portail de l'école",
    switchToParents: "Portail des parents",
    visualIdentity: "Identité Visuelle",
    exitDashboard: "Se déconnecter",

    // Landing Page
    landingHome: "Accueil",
    landingHowItWorks: "Comment ça marche",
    landingFeatures: "Fonctionnalités",
    landingBudget: "Tarifs",
    landingAccessDemo: "Accéder à la démo",
    landingHeroTitle: "L'application sur mesure et intégrée pour l'identité de votre école",
    landingHeroSubtitle: "Votre école avec une application exclusive : contrôle d'accès synchronisé, journal électronique, contrôle académique et facturation simplifiée.",
    landingSloganBadge: "Technologie sur Mesure pour Écoles d'Excellence",
    landingBtnDemo: "Voir la Démonstration",
    landingBtnSales: "Parler à un Conseiller",
    landingArchTitle: "ARCHITECTURE DE LA PLATEFORME",
    landingHelpTitle: "Comment nous aidons votre école",
    landingHelpSubtitle: "Éliminez les frictions opérationnelles, réduisez les coûts et surprenez les familles avec une communication de qualité.",
    
    feature1Title: "Contrôle d'Accès Synchronisé \"Je suis en chemin\"",
    feature1Desc: "Les parents signalent leur arrivée via l'application. L'accueil organise la file de sortie par ordre d'arrivée physique, garantissant sécurité et rapidité.",
    feature2Title: "Tableau de Bord & Circulaires Instantanées",
    feature2Desc: "Envoyez des communiqués ciblés. Les parents reçoivent des notifications et signent électroniquement les autorisations d'activités directement sur leur téléphone.",
    feature3Title: "Facturation Intégrée & Paiements",
    feature3Desc: "Simplifiez le paiement des frais de scolarité via des moyens numériques. L'application propose un canal confidentiel et respectueux pour le règlement des factures.",

    caseTitle: "Expérience White-Label",
    caseSubtitle: "Découvrez comment un établissement de référence utilise notre écosystème au quotidien.",
    caseBadge: "ÉTUDE DE CAS",
    caseSchool: "Académie Magic Learning",
    caseCustomBranding: "Identité Visuelle Personnalisée Active",
    caseDesc: "L'Académie Magic Learning a adopté notre solution white-label. Elle a personnalisé les couleurs du système, ajouté son propre logo et utilise notre système d'accès synchronisé en temps réel.",
    caseResultsTitle: "Impacts chez Magic Learning :",
    caseResult1: "Temps d'attente pour la sortie réduit de 25 min à 3 min",
    caseResult2: "98% de taux de satisfaction rapporté par les parents",
    caseResult3: "Communication institutionnelle 100% sans papier",
    caseSandbox: "SANDBOX INTERACTIVE",
    caseAccessBtn: "Accéder au Portail de Démo",
    mockupTitle: "APERÇU DE L'APPLICATION PERSONNALISÉE",

    customTitle: "Identité Visuelle de Votre École",
    customSubtitle: "Personnalisez l'application avec le logo, les couleurs et le nom de votre établissement.",
    customFormSchoolName: "Nom de l'école",
    customFormPreset: "Palette de Couleurs",
    customFormLogo: "Icône du Logo",
    customWand: "Baguette Magique",
    customShield: "Bouclier Noble",
    customBook: "Livre Classique",
    customGraduation: "Coiffe Académique",
    customSaveBtn: "Enregistrer les Paramètres",

    leadTitle: "Demander une Démo & un Devis",
    leadSubtitle: "Découvrez comment déployer l'application exclusive de votre école en moins de 15 jours.",
    leadFormName: "Votre Nom",
    leadFormEmail: "Adresse E-mail Professionnelle",
    leadFormPhone: "Téléphone / WhatsApp",
    leadFormSchool: "Nom de l'établissement",
    leadFormSize: "Nombre d'élèves",
    leadFormMsg: "Message (Optionnel)",
    leadFormBtn: "Envoyer la Demande",
    leadSuccess: "Demande envoyée avec succès ! Notre équipe vous contactera sous peu.",
    leadSuccessReset: "Soumettre une autre demande"
  },
  ja: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "統合型スクールポータル",
    slogan: "家庭と学校をつなぐ、スマートで安全なコミュニケーション",
    introText: "リアルタイムで日誌、成績、登下校状況を確認。保護者が生徒の成長を見守り、管理者が連絡やアクセスを迅速に調整できるプレミアムな環境です。",
    
    parentAccessTitle: "保護者ポータル",
    parentAccessDesc: "保護者専用のスペースです。日々の記録、成績、お迎えの通知を管理します。",
    parentBenefit1: "連絡帳の確認（食事、睡眠、機嫌）",
    parentBenefit2: "成績表や学習状況のリアルタイム閲覧",
    parentBenefit3: "「向かっています 🚗」到着予告の送信",
    parentBenefit4: "請求書の確認と決済",
    parentBtn: "保護者としてログイン",

    schoolAccessTitle: "スクール管理システム",
    schoolAccessDesc: "教職員、事務、および校門スタッフ用の内部管理パネルです。",
    schoolBenefit1: "生徒の日誌・イベントの記録",
    schoolBenefit2: "下校順のライブ整理とアクセス管理",
    schoolBenefit3: "連絡事項の掲示板への即時投稿",
    schoolBenefit4: "学習・財務連携の設定",
    schoolBtn: "管理者としてログイン",

    metricSynced: "同期中",
    metricConnected: "複数生徒対応",
    metricSecurity: "高セキュリティ",

    backToLanding: "ホームに戻る",
    toggleThemeLight: "ライトモード",
    toggleThemeDark: "ダークモード",
    activeReminders: "アクティブな通知",
    onlineSecretary: "オンライン事務局",
    bulletinBoard: "お知らせ掲示板",
    starSparkCount: "スター",

    changePortal: "ポータル切り替え",
    switchToSchool: "学校用パネル",
    switchToParents: "保護者用パネル",
    visualIdentity: "ビジュアルアイデンティティ",
    exitDashboard: "ログアウト",

    // Landing Page
    landingHome: "ホーム",
    landingHowItWorks: "仕組み",
    landingFeatures: "機能紹介",
    landingBudget: "料金プラン",
    landingAccessDemo: "デモサイト",
    landingHeroTitle: "学校のアイデンティティを確立する統合型カスタムアプリ",
    landingHeroSubtitle: "同期型校門管理、電子掲示板、学習管理、およびスマート決済を1つのホワイトレーベルプラットフォームで提供します。",
    landingSloganBadge: "エクセレンスな学校のためのオーダーメイドテクノロジー",
    landingBtnDemo: "デモを見る",
    landingBtnSales: "担当者に相談する",
    landingArchTitle: "プラットフォームのアーキテクチャ",
    landingHelpTitle: "学校運営のサポート",
    landingHelpSubtitle: "運用の摩擦を排除し、事務管理コストを削減し、プレミアムな体験を提供します。",
    
    feature1Title: "「今向かっています」同期型登下校管理",
    feature1Desc: "保護者がアプリからお迎えを通知。校門スタッフが物理的な到着順に生徒の下校を自動整理し、安全でスムーズな引き渡しを実現します。",
    feature2Title: "インスタント電子掲示板",
    feature2Desc: "特定の学年や生徒に向けた連絡を配信。保護者はアプリで通知を受け取り、電子署名で迅速に同意を送信できます。",
    feature3Title: "スマートな料金決済",
    feature3Desc: "授業料などの支払いをアプリ上で簡素化。プライバシーに配慮した丁寧な連絡チャンネルを構築します。",

    caseTitle: "ホワイトレーベル導入実績",
    caseSubtitle: "実際に導入している学校の日常的な活用例をご覧ください。",
    caseBadge: "導入事例",
    caseSchool: "マジックラーニング・アカデミー",
    caseCustomBranding: "カスタムブランディング適用中",
    caseDesc: "マジックラーニング・アカデミーでは、私たちのホワイトレーベルソリューションを導入。ブランドカラーの変更やロゴの適用、および登下校管理システムをご活用いただいています。",
    caseResultsTitle: "導入による成果：",
    caseResult1: "お迎えの待ち時間を25分から3分に短縮",
    caseResult2: "保護者の満足度98%を達成",
    caseResult3: "学校からの連絡を100%ペーパーレス化",
    caseSandbox: "インタラクティブデモ",
    caseAccessBtn: "デモサイトにアクセス",
    mockupTitle: "カスタムアプリプレビュー",

    customTitle: "学校のビジュアルアイデンティティ設定",
    customSubtitle: "ロゴ、学校名、ブランドカラーに合わせてアプリをパーソナライズします。",
    customFormSchoolName: "学校名",
    customFormPreset: "カラーパレット",
    customFormLogo: "ロゴアイコン",
    customWand: "魔法の杖",
    customShield: "高貴な盾",
    customBook: "古典的な本",
    customGraduation: "角帽",
    customSaveBtn: "設定を保存",

    leadTitle: "デモ依頼・お見積もり",
    leadSubtitle: "15日以内に学校専用アプリを導入する方法をご提案します。",
    leadFormName: "お名前",
    leadFormEmail: "法人メールアドレス",
    leadFormPhone: "電話番号",
    leadFormSchool: "学校・施設名",
    leadFormSize: "生徒数",
    leadFormMsg: "メッセージ (任意)",
    leadFormBtn: "デモをリクエストする",
    leadSuccess: "送信が完了しました。担当者より折り返しご連絡いたします。",
    leadSuccessReset: "別のお問い合わせを送信する"
  },
  de: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "Integriertes Schulportal",
    slogan: "Intelligente und sichere Verbindung zwischen Familien und Schule.",
    introText: "Verfolgen Sie Alltag, Zeugnisse und Zugänge in Echtzeit. Eine Premium-Umgebung für Eltern und Schulleiter zur einfachen Koordination.",
    
    parentAccessTitle: "Elternportal",
    parentAccessDesc: "Exklusiver Bereich für Eltern. Verfolgen Sie den täglichen Ablauf, Noten und Abholungen.",
    parentBenefit1: "Tagebuch einsehen (Mahlzeiten, Schlaf, Stimmung)",
    parentBenefit2: "Noten und akademische Berichte in Echtzeit anzeigen",
    parentBenefit3: "Abholhinweis aktivieren \"Ich bin auf dem Weg 🚗\"",
    parentBenefit4: "Gebühren einsehen und Zahlungen tätigen",
    parentBtn: "Als Elternteil anmelden",

    schoolAccessTitle: "Schulverwaltung",
    schoolAccessDesc: "Internes Dashboard für Lehrer, Sekretariat und Torpersonal.",
    schoolBenefit1: "Ereignisse und tägliches Protokoll der Schüler erfassen",
    schoolBenefit2: "Abhol-Warteschlange und Toreinlass live verwalten",
    schoolBenefit3: "Sofortige Mitteilungen am schwarzen Brett veröffentlichen",
    schoolBenefit4: "Akademische und finanzielle Integrationen konfigurieren",
    schoolBtn: "Als Schulleiter anmelden",

    metricSynced: "Echtzeit",
    metricConnected: "Mehrere Schüler",
    metricSecurity: "Gesichert",

    backToLanding: "Zur Startseite",
    toggleThemeLight: "Heller Modus",
    toggleThemeDark: "Dunkler Modus",
    activeReminders: "Aktive Erinnerungen",
    onlineSecretary: "Virtuelles Sekretariat",
    bulletinBoard: "Schwarzes Brett",
    starSparkCount: "Sterne",

    changePortal: "Portal wechseln",
    switchToSchool: "Schul-Dashboard",
    switchToParents: "Eltern-Dashboard",
    visualIdentity: "Visuelle Identität",
    exitDashboard: "Abmelden",

    // Landing Page
    landingHome: "Startseite",
    landingHowItWorks: "Wie es funktioniert",
    landingFeatures: "Funktionen",
    landingBudget: "Preise",
    landingAccessDemo: "Demo aufrufen",
    landingHeroTitle: "Die eigene, integrierte App für die Identität Ihrer Schule",
    landingHeroSubtitle: "Ihre Schule mit exklusiver App: synchrone Einlasskontrolle, elektronisches schwarzes Brett, akademische Verwaltung und einfache Abrechnung.",
    landingSloganBadge: "Maßgeschneiderte Technologie für exzellente Schulen",
    landingBtnDemo: "Demo ansehen",
    landingBtnSales: "Mit Berater sprechen",
    landingArchTitle: "PLATTFORM-ARCHITEKTUR",
    landingHelpTitle: "Wie wir Ihrer Schule helfen",
    landingHelpSubtitle: "Beseitigen Sie betriebliche Hürden, senken Sie Kosten und begeistern Sie Familien mit Premium-Kommunikation.",
    
    feature1Title: "Synchrone Einlasskontrolle \"Ich bin auf dem Weg\"",
    feature1Desc: "Eltern kündigen ihre Ankunft per App an. Das Torpersonal organisiert die Ausgangsschlange nach physischer Ankunft, was für Schnelligkeit und Sicherheit sorgt.",
    feature2Title: "Schwarzes Brett & Sofortbriefe",
    feature2Desc: "Senden Sie Mitteilungen gezielt an bestimmte Klassen. Eltern unterschreiben Zustimmungen zu Aktivitäten direkt auf dem Smartphone.",
    feature3Title: "Integriertes Abrechnungs-ERP",
    feature3Desc: "Vereinfachen Sie Schulgebührenzahlungen über digitale Kanäle. Die App bietet einen diskreten und respektvollen Kanal zur Klärung von Zahlungen.",

    caseTitle: "White-Label Praxiserfahrung",
    caseSubtitle: "Erfahren Sie, wie eine Referenzschule unser System im Alltag nutzt.",
    caseBadge: "ERFOLGSSTORY",
    caseSchool: "Magic Learning Akademie",
    caseCustomBranding: "Custom Branding Aktiv",
    caseDesc: "Die Magic Learning Akademie nutzt unsere White-Label-Lösung. Sie haben die Farben angepasst, ihr Logo hochgeladen und nutzen die synchrone Einlasskontrolle für den täglichen Ablauf.",
    caseResultsTitle: "Ergebnisse bei Magic Learning:",
    caseResult1: "Abholzeit von 25 Min. auf nur 3 Min. verkürzt",
    caseResult2: "98 % Zufriedenheit der Eltern berichtet",
    caseResult3: "Schulkommunikation zu 100 % papierlos",
    caseSandbox: "INTERAKTIVES SANDBOX-PORTAL",
    caseAccessBtn: "Demo-Portal aufrufen",
    mockupTitle: "PREVIEW DER CUSTOM APP",

    customTitle: "Visuelle Identität Ihrer Schule",
    customSubtitle: "Personalisieren Sie die App mit Namen, Farben und Logo Ihrer Institution.",
    customFormSchoolName: "Schulname",
    customFormPreset: "Farbpalette",
    customFormLogo: "Logo-Symbol",
    customWand: "Zauberstab",
    customShield: "Edler Schild",
    customBook: "Klassisches Buch",
    customGraduation: "Doktorhut",
    customSaveBtn: "Einstellungen speichern",

    leadTitle: "Demo & Angebot anfordern",
    leadSubtitle: "Erfahren Sie, wie Sie die eigene App Ihrer Schule in weniger als 15 Tagen starten.",
    leadFormName: "Ihr Name",
    leadFormEmail: "Geschäftliche E-Mail",
    leadFormPhone: "Telefon / WhatsApp",
    leadFormSchool: "Name der Institution",
    leadFormSize: "Schülerzahl",
    leadFormMsg: "Nachricht (Optional)",
    leadFormBtn: "Anfrage senden",
    leadSuccess: "Anfrage erfolgreich gesendet! Unser Team wird sich in Kürze bei Ihnen melden.",
    leadSuccessReset: "Weitere Anfrage senden"
  },
  zh: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "一体化智能校园门户",
    slogan: "家校智能互联，安全高效沟通",
    introText: "实时跟进学生日常、成绩及登校状态。为家长和管理者提供高端数字体验，确保信息流转与校园安全。",
    
    parentAccessTitle: "家长门户",
    parentAccessDesc: "家长的专属空间。查看日常日志、学习成绩和接送通知。",
    parentBenefit1: "查看学生日常（饮食、午睡及情绪状态）",
    parentBenefit2: "实时查看成绩及双月学习报告",
    parentBenefit3: "发送到达提醒“我在路上 🚗”",
    parentBenefit4: "查看账单并通过便捷方式完成支付",
    parentBtn: "家长/监护人登录",

    schoolAccessTitle: "校园管理系统",
    schoolAccessDesc: "教职工、行政秘书和门卫安保的内部管理面板。",
    schoolBenefit1: "记录学生日常表现和突发状况",
    schoolBenefit2: "实时协调校门接送和出入登记",
    schoolBenefit3: "向校园公告栏发布即时通知公告",
    schoolBenefit4: "设置教务和财务系统集成",
    schoolBtn: "教务管理登录",

    metricSynced: "实时同步",
    metricConnected: "关联多学生",
    metricSecurity: "端到端安全",

    backToLanding: "返回首页",
    toggleThemeLight: "浅色模式",
    toggleThemeDark: "深色模式",
    activeReminders: "未读提醒",
    onlineSecretary: "数字教务处",
    bulletinBoard: "校园公告栏",
    starSparkCount: "学术积分",

    changePortal: "切换系统",
    switchToSchool: "学校管理后台",
    switchToParents: "家长端面板",
    visualIdentity: "品牌视觉",
    exitDashboard: "安全退出",

    // Landing Page
    landingHome: "首页",
    landingHowItWorks: "工作原理",
    landingFeatures: "平台功能",
    landingBudget: "价格与预算",
    landingAccessDemo: "进入演示",
    landingHeroTitle: "彰显学校品牌个性的定制化校园智能管理系统",
    landingHeroSubtitle: "提供专属品牌定制App：包含校门到离校同步管理、电子通知书、学术考评和智能账单管理。",
    landingSloganBadge: "杰出学校的首选定制化教育科技",
    landingBtnDemo: "体验在线演示",
    landingBtnSales: "联系教育顾问",
    landingArchTitle: "平台系统架构",
    landingHelpTitle: "我们如何助力学校",
    landingHelpSubtitle: "消除日常运营障碍，降低行政开销，以非凡的数字沟通给家庭带来绝佳体验。",
    
    feature1Title: "“我在路上”同步校门安全管理",
    feature1Desc: "家长在应用中发出到达预警，安保系统根据家长物理抵达顺序自动编排离校队列，消除堵车混乱，确保出入安全。",
    feature2Title: "电子通知书与实时通知",
    feature2Desc: "向指定年级或学生推送公告。家长在手机上查阅并签署电子同意书，数秒内完成课外活动授权。",
    feature3Title: "教务财务一体化ERP",
    feature3Desc: "让学费缴纳更加顺畅安全，提供友善且尊重隐私的续费沟通渠道，在维护家校良好关系的同时降低欠费率。",

    caseTitle: "专属品牌定制实践",
    caseSubtitle: "了解一所领先学术机构如何在日常运营中应用本定制系统。",
    caseBadge: "参考客户档案",
    caseSchool: "Magic Learning 国际学校",
    caseCustomBranding: "已应用专属视觉品牌",
    caseDesc: "Magic Learning 国际学校采用了本系统的定制化方案。他们将界面颜色更改为经典高雅的主题，上传了学校校徽，并使用同步校门系统大幅提升了接送效率。",
    caseResultsTitle: "Magic Learning 国际学校应用成效：",
    caseResult1: "排队接送时间从25分钟降至仅3分钟",
    caseResult2: "家长总体满意度高达 98%",
    caseResult3: "实现 100% 无纸化家校信息流转",
    caseSandbox: "交互式演示沙盒",
    caseAccessBtn: "访问学校门户演示",
    mockupTitle: "定制学校App预览",

    customTitle: "配置您学校的专属品牌视觉",
    customSubtitle: "通过学校官方名称、专属品牌配色方案及校徽定制个性化App体验。",
    customFormSchoolName: "学校名称",
    customFormPreset: "品牌色系",
    customFormLogo: "品牌徽章/Logo",
    customWand: "魔法魔杖",
    customShield: "贵族盾牌",
    customBook: "经典书籍",
    customGraduation: "学术帽",
    customSaveBtn: "保存品牌设置",

    leadTitle: "获取量身定制的方案与报价",
    leadSubtitle: "了解如何在 15 实天内上线您学校的专属品牌校园应用。",
    leadFormName: "您的姓名",
    leadFormEmail: "学校官方邮箱",
    leadFormPhone: "电话号码 / 微信",
    leadFormSchool: "机构名称",
    leadFormSize: "学生总数规模",
    leadFormMsg: "您的留言 (选填)",
    leadFormBtn: "提交演示申请",
    leadSuccess: "申请提交成功！我们的教育顾问将在最短时间内与您取得联系。",
    leadSuccessReset: "提交另一个申请"
  },
  ar: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "بوابة المدرسة المتكاملة",
    slogan: "تواصل ذكي وآمن بين العائلات والمدرسة",
    introText: "تابعوا النشاط اليومي والدرجات والوصول في الوقت الفعلي. بيئة راقية مصممة خصيصاً لأولياء الأمور والإدارة لمتابعة تفوق الطلاب والتواصل السلس.",
    
    parentAccessTitle: "بوابة أولياء الأمور",
    parentAccessDesc: "مساحة خاصة بأولياء الأمور لمتابعة التفاصيل اليومية، الدرجات، الإشعارات وتسهيل عملية اصطحاب الطلاب.",
    parentBenefit1: "متابعة السجل اليومي (الوجبات، القيلولة والمزاج)",
    parentBenefit2: "الاطلاع على الدرجات والتقارير الأكاديمية لحظة بلحظة",
    parentBenefit3: "إرسال تنبيه اصطحاب \"أنا في طريقي 🚗\"",
    parentBenefit4: "الاطلاع على الفواتير وإتمام المدفوعات بسرعة وأمان",
    parentBtn: "الدخول كولي أمر",

    schoolAccessTitle: "بوابة إدارة المدرسة",
    schoolAccessDesc: "لوحة تحكم داخلية مخصصة للمعلمين والإدارة وفريق الأمن والسلامة عند البوابات.",
    schoolBenefit1: "تسجيل يوميات الطلاب والتقارير اليومية",
    schoolBenefit2: "تنظيم صفوف المغادرة وبوابات الدخول في الوقت الفعلي",
    schoolBenefit3: "نشر التعاميم والإعلانات العاجلة على لوحة الإعلانات",
    schoolBenefit4: "إعداد إدماج الأنظمة الأكاديمية والمالية",
    schoolBtn: "الدخول كإداري",

    metricSynced: "متزامن",
    metricConnected: "متعدد الطلاب",
    metricSecurity: "آمن للغاية",

    backToLanding: "العودة للرئيسية",
    toggleThemeLight: "الوضع المضيء",
    toggleThemeDark: "الوضع الداكن",
    activeReminders: "التنبيهات النشطة",
    onlineSecretary: "السكرتارية الرقمية",
    bulletinBoard: "لوحة الإعلانات",
    starSparkCount: "نقاط التميز",

    changePortal: "تبديل البوابات",
    switchToSchool: "بوابة المدرسة",
    switchToParents: "بوابة أولياء الأمور",
    visualIdentity: "الهوية البصرية",
    exitDashboard: "تسجيل الخروج",

    // Landing Page
    landingHome: "الرئيسية",
    landingHowItWorks: "آلية العمل",
    landingFeatures: "المزايا والخصائص",
    landingBudget: "الأسعار والميزانية",
    landingAccessDemo: "الدخول للتجربة",
    landingHeroTitle: "تطبيق ذكي متكامل يحمل الهوية البصرية الخاصة بمدرستكم",
    landingHeroSubtitle: "احصلوا على تطبيق مخصص لمدرستكم مع نظام ذكي لتنظيم خروج الطلاب عند البوابات، وإشعارات فورية، وإدارة أكاديمية ومالية شاملة في منصة واحدة.",
    landingSloganBadge: "تكنولوجيا متكاملة مصممة للمدارس المتميزة",
    landingBtnDemo: "مشاهدة العرض التجريبي",
    landingBtnSales: "تحدث مع مستشارنا",
    landingArchTitle: "بنية النظام والمنصة",
    landingHelpTitle: "كيف نساعد مدرستكم",
    landingHelpSubtitle: "القضاء على التعقيدات التشغيلية، تقليص التكاليف الإدارية، وإبهار أولياء الأمور بتواصل رقمي فاخر.",
    
    feature1Title: "نظام تنظيم البوابات \"أنا في طريقي\"",
    feature1Desc: "يرسل أولياء الأمور إشارة وصولهم عبر التطبيق. يقوم فريق بوابة المدرسة بتجهيز الطلاب تلقائياً وفقاً للوصول الفعلي للأهل، مما يمنع الازدحام ويضمن السلامة.",
    feature2Title: "التعاميم والإشعارات الفورية",
    feature2Desc: "إرسال تعاميم مخصصة لصفوف أو طلاب محددين. يقرأ الأهل التفاصيل ويوقعون بالموافقة الإلكترونية على الأنشطة والرحلات فوراً عبر هواتفهم.",
    feature3Title: "الربط المالي وإدارة الفواتير",
    feature3Desc: "تسهيل عملية دفع الأقساط والرسوم عبر قنوات دفع رقمية آمنة ومريحة، مع إتاحة قنوات للتواصل اللطيف والخاص لتسوية الدفعات.",

    caseTitle: "تجربة الهوية المخصصة",
    caseSubtitle: "شاهد كيف تستخدم مدرسة مرموقة نظامنا الرقمي المتكامل في عملياتها اليومية.",
    caseBadge: "قصة نجاح وشراكة",
    caseSchool: "أكاديمية ماجيك ليرنينغ",
    caseCustomBranding: "الهوية البصرية للمدرسة مفعلة",
    caseDesc: "اعتمدت أكاديمية ماجيك ليرنينغ حلولنا الرقمية المخصصة؛ حيث قامت باختيار ألوانها الفاخرة وشعارها الخاص، وتستخدم نظام البوابات المتزامن لتسهيل مغادرة الطلاب يومياً.",
    caseResultsTitle: "النتائج والآثار في الأكاديمية:",
    caseResult1: "تقليص وقت مغادرة الطلاب من 25 دقيقة إلى 3 دقائق فقط",
    caseResult2: "نسبة رضا أولياء الأمور بلغت 98%",
    caseResult3: "تواصل إداري ومدرسي رقمي وخالٍ من الورق بنسبة 100%",
    caseSandbox: "بيئة التجربة التفاعلية",
    caseAccessBtn: "الدخول إلى بوابة الأكاديمية",
    mockupTitle: "معاينة التطبيق المخصص",

    customTitle: "تخصيص الهوية البصرية لمدرستكم",
    customSubtitle: "قم بتخصيص التطبيق وتعديله ليتناسب مع شعار مدرستكم، ألوانها الرسمية واسمها.",
    customFormSchoolName: "اسم المدرسة",
    customFormPreset: "لوحة الألوان",
    customFormLogo: "أيقونة شعار المدرسة",
    customWand: "العصا السحرية",
    customShield: "الدرع النبيل",
    customBook: "الكتاب الكلاسيكي",
    customGraduation: "قبعة التخرج الأكاديمية",
    customSaveBtn: "حفظ إعدادات الهوية",

    leadTitle: "طلب عرض تجريبي ودراسة التكلفة",
    leadSubtitle: "اكتشف كيف يمكن إطلاق تطبيق مدرستكم المخصص بالكامل في أقل من 15 يوماً.",
    leadFormName: "الاسم الكامل",
    leadFormEmail: "البريد الإلكتروني للمؤسسة",
    leadFormPhone: "رقم الهاتف / واتساب",
    leadFormSchool: "اسم المؤسسة التعليمية",
    leadFormSize: "عدد الطلاب في المدرسة",
    leadFormMsg: "الرسالة (اختياري)",
    leadFormBtn: "إرسال طلب العرض التجريبي",
    leadSuccess: "تم إرسال طلبكم بنجاح! سيتواصل معكم مستشارنا التعليمي قريباً جداً.",
    leadSuccessReset: "تقديم طلب آخر"
  },
  it: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "Portale Scolastico Integrato",
    slogan: "Connessione intelligente e sicura tra famiglie e scuola.",
    introText: "Segui routine, pagelle e accessi in tempo reale. Un ambiente premium per i genitori per monitorare lo sviluppo degli studenti e per i gestori per coordinare comunicazioni e accessi con la massima agilità.",
    
    parentAccessTitle: "Portale dei Genitori",
    parentAccessDesc: "Spazio esclusivo per i genitori. Segui la routine quotidiana, i voti, le pagelle e l'ingresso/uscita.",
    parentBenefit1: "Seguire il diario di bordo (alimentazione, sonno e umore)",
    parentBenefit2: "Visualizzare voti e pagelle accademiche in tempo reale",
    parentBenefit3: "Inviare l'avviso di arrivo \"Sto arrivando 🚗\"",
    parentBenefit4: "Consultare le fatture e pagare comodamente tramite Pix",
    parentBtn: "Accedi come Genitore",

    schoolAccessTitle: "Portale di Gestione Scolastica",
    schoolAccessDesc: "Pannello interno per insegnanti, segreteria e personale di portineria.",
    schoolBenefit1: "Registrare occorrenze e diario di bordo degli studenti",
    schoolBenefit2: "Controllare la fila di uscita e gli accessi in tempo reale",
    schoolBenefit3: "Pubblicare avvisi immediati sulla bacheca",
    schoolBenefit4: "Configurare integrazioni accademiche e finanziarie",
    schoolBtn: "Accedi come Gestore",

    metricSynced: "Sincronizzato",
    metricConnected: "Multi-Studente",
    metricSecurity: "Sicuro",

    backToLanding: "Torna alla Home",
    toggleThemeLight: "Modalità Chiara",
    toggleThemeDark: "Modalità Scura",
    activeReminders: "Promemoria Attivi",
    onlineSecretary: "Segreteria Virtuale",
    bulletinBoard: "Bacheca degli Avvisi",
    starSparkCount: "Stelle",

    changePortal: "Cambia Portale",
    switchToSchool: "Portale Scuola",
    switchToParents: "Portale Genitori",
    visualIdentity: "Identità Visuale",
    exitDashboard: "Esci",

    // Landing Page
    landingHome: "Home",
    landingHowItWorks: "Come Funziona",
    landingFeatures: "Funzionalità SaaS",
    landingBudget: "Tariffe",
    landingAccessDemo: "Accedi alla Demo",
    landingHeroTitle: "L'applicazione personalizzata e integrata per l'identità della tua scuola",
    landingHeroSubtitle: "La tua scuola con un'app esclusiva: controllo accessi sincronizzato, bacheca elettronica, gestione accademica e fatturazione semplificata tutto in un'unica piattaforma white-label.",
    landingSloganBadge: "Tecnologia su Misura per Scuole d'Eccellenza",
    landingBtnDemo: "Visualizza la Demo",
    landingBtnSales: "Parla con un Consulente",
    landingArchTitle: "ARCHITETTURA DELLA PIATTAFORMA",
    landingHelpTitle: "Come aiutiamo la tua scuola",
    landingHelpSubtitle: "Elimina gli attriti operativi, riduci i costi amministrativi e sorprendi le famiglie con una comunicazione premium.",
    
    feature1Title: "Controllo Accessi Sincronizzato \"Sto arrivando\"",
    feature1Desc: "I genitori segnalano l'arrivo tramite l'app. La portineria organizza la fila di uscita in base all'ordine di arrivo fisico, garantendo rapidità e massima sicurezza.",
    feature2Title: "Bacheca e Avvisi Istantanei",
    feature2Desc: "Invia comunicazioni rapide alle classi. I genitori autorizzano gite e attività pedagogiche firmando elettronicamente direttamente dal cellulare.",
    feature3Title: "ERP Finanziario Integrato",
    feature3Desc: "Semplifica il pagamento delle rette con Pix e bollettini. L'applicazione offre un canale riservato e rispettoso per negoziare i pagamenti, riducendo le morosità.",

    caseTitle: "Esperienza White-Label",
    caseSubtitle: "Scopri come una scuola di riferimento utilizza il nostro ecosistema personalizzato ogni giorno.",
    caseBadge: "STORIA DI SUCCESSO",
    caseSchool: "Collegio Magic Learning",
    caseCustomBranding: "Identità Visiva Attiva",
    caseDesc: "Il Collegio Magic Learning ha adottato la nostra soluzione white-label. Ha personalizzato i colori, caricato il proprio logo e utilizza la gestione degli accessi sincronizzata in tempo reale.",
    caseResultsTitle: "Impatti su Magic Learning:",
    caseResult1: "Tempo di attesa all'uscita ridotto da 25 min a soli 3 min",
    caseResult2: "98% di soddisfazione dichiarata dai genitori",
    caseResult3: "Comunicazione istituzionale 100% senza carta",
    caseSandbox: "SANDBOX INTERATTIVO",
    caseAccessBtn: "Entra nel Portale Demo",
    mockupTitle: "PREVISIONE APP PERSONALIZZATA",

    customTitle: "Identità Visiva della tua Scuola",
    customSubtitle: "Personalizza l'applicazione con nome, colori e logo della tua istituzione.",
    customFormSchoolName: "Nome della Scuola",
    customFormPreset: "Tavolozza dei Colori",
    customFormLogo: "Icona del Logo",
    customWand: "Bacchetta Magica",
    customShield: "Scudo Nobile",
    customBook: "Libro Classico",
    customGraduation: "Tocco Accademico",
    customSaveBtn: "Salva Impostazioni",

    leadTitle: "Richiedi una Demo e un Preventivo",
    leadSubtitle: "Scopri come implementare l'applicazione esclusiva della tua scuola in meno di 15 giorni.",
    leadFormName: "Tuo Nome",
    leadFormEmail: "Email Aziendale",
    leadFormPhone: "Telefono / WhatsApp",
    leadFormSchool: "Nome dell'Istituzione",
    leadFormSize: "Numero di Alunni",
    leadFormMsg: "Messaggio (Opzionale)",
    leadFormBtn: "Invia Richiesta",
    leadSuccess: "Richiesta inviata con successo! Il nostro team ti contatterà al più presto.",
    leadSuccessReset: "Invia un'altra richiesta"
  },
  ru: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "Интегрированный школьный портал",
    slogan: "Умная и безопасная связь между семьями и школой.",
    introText: "Следите за расписанием, оценками и посещаемостью в реальном времени. Премиальная среда для родителей и администрации для быстрой координации общения и доступа.",
    
    parentAccessTitle: "Портал для родителей",
    parentAccessDesc: "Эксклюзивное пространство для родителей. Следите за ежедневными отчетами, оценками и отправляйте уведомления о прибытии.",
    parentBenefit1: "Просмотр ежедневного журнала (питание, сон, настроение)",
    parentBenefit2: "Просмотр оценок и табелей успеваемости в реальном времени",
    parentBenefit3: "Отправка сигнала прибытия \"Я уже еду 🚗\"",
    parentBenefit4: "Просмотр счетов и быстрая оплата через Pix",
    parentBtn: "Войти как родитель",

    schoolAccessTitle: "Школьное управление",
    schoolAccessDesc: "Внутренняя панель для учителей, секретариата и охраны на воротах.",
    schoolBenefit1: "Регистрация событий и ежедневных отчетов учеников",
    schoolBenefit2: "Контроль очереди на выходе и посещаемости в реальном времени",
    schoolBenefit3: "Публикация мгновенных объявлений на доске уведомлений",
    schoolBenefit4: "Настройка интеграции учебных и финансовых систем",
    schoolBtn: "Войти как администратор",

    metricSynced: "Синхронизировано",
    metricConnected: "Несколько учеников",
    metricSecurity: "Безопасно",

    backToLanding: "На главную",
    toggleThemeLight: "Светлая тема",
    toggleThemeDark: "Темная тема",
    activeReminders: "Активные напоминания",
    onlineSecretary: "Онлайн-секретариат",
    bulletinBoard: "Доска объявлений",
    starSparkCount: "Звезды",

    changePortal: "Сменить портал",
    switchToSchool: "Школьный портал",
    switchToParents: "Портал родителей",
    visualIdentity: "Визуальный стиль",
    exitDashboard: "Выйти",

    // Landing Page
    landingHome: "Главная",
    landingHowItWorks: "Как это работает",
    landingFeatures: "Функции SaaS",
    landingBudget: "Цены",
    landingAccessDemo: "Открыть демо",
    landingHeroTitle: "Собственное интегрированное приложение для вашей школы",
    landingHeroSubtitle: "Ваша школа с эксклюзивным приложением: синхронный контроль прохода, электронная доска объявлений, академический учет и упрощенный биллинг в одной white-label платформе.",
    landingSloganBadge: "Индивидуальные технологии для передовых школ",
    landingBtnDemo: "Посмотреть демо",
    landingBtnSales: "Связаться с консультантом",
    landingArchTitle: "АРХИТЕКТУРА ПЛАТФОРМЫ",
    landingHelpTitle: "Как мы помогаем вашей школе",
    landingHelpSubtitle: "Устраните операционные сложности, сократите административные расходы и удивите семьи премиальным качеством связи.",
    
    feature1Title: "Синхронный контроль прохода \"Я в пути\"",
    feature1Desc: "Родители предупреждают о прибытии через приложение. Охрана организует очередь на выход по физическому прибытию, гарантируя быстроту и безопасность.",
    feature2Title: "Мгновенные объявления и циркуляры",
    feature2Desc: "Отправляйте быстрые уведомления классам. Родители подписывают согласия на экскурсии и мероприятия прямо со смартфона.",
    feature3Title: "Интегрированная финансовая ERP-система",
    feature3Desc: "Упростите оплату обучения с помощью Pix и квитанций. Приложение предоставляет конфиденциальный канал для урегулирования платежей.",

    caseTitle: "Опыт White-Label решений",
    caseSubtitle: "Узнайте, как ведущая школа использует нашу систему в повседневной работе.",
    caseBadge: "ИСТОРИЯ УСПЕХА",
    caseSchool: "Колледж Magic Learning",
    caseCustomBranding: "Активный визуальный бренд",
    caseDesc: "Колледж Magic Learning внедрил наше white-label решение. Они адаптировали цвета системы, загрузили свой логотип и используют синхронный контроль прохода.",
    caseResultsTitle: "Результаты в Magic Learning:",
    caseResult1: "Время ожидания на выходе сокращено с 25 до 3 минут",
    caseResult2: "98% удовлетворенности родителей",
    caseResult3: "100% безбумажный документооборот и общение",
    caseSandbox: "ИНТЕРАКТИВНОЕ ДЕМО-ПРОСТРАНСТВО",
    caseAccessBtn: "Войти в демо-портал",
    mockupTitle: "ПРЕВЬЮ КАСТОМНОГО ПРИЛОЖЕНИЯ",

    customTitle: "Визуальный стиль вашей школы",
    customSubtitle: "Персонализируйте приложение с названием, цветами и логотипом вашей школы.",
    customFormSchoolName: "Название школы",
    customFormPreset: "Цветовая палитра",
    customFormLogo: "Иконка логотипа",
    customWand: "Волшебная палочка",
    customShield: "Благородный щит",
    customBook: "Классическая книга",
    customGraduation: "Академическая шапочка",
    customSaveBtn: "Сохранить настройки",

    leadTitle: "Запросить демо и расчет стоимости",
    leadSubtitle: "Узнайте, как запустить собственное брендированное приложение вашей школы менее чем за 15 дней.",
    leadFormName: "Ваше имя",
    leadFormEmail: "Рабочий e-mail",
    leadFormPhone: "Телефон / WhatsApp",
    leadFormSchool: "Название учреждения",
    leadFormSize: "Количество учеников",
    leadFormMsg: "Сообщение (необязательно)",
    leadFormBtn: "Отправить запрос",
    leadSuccess: "Запрос успешно отправлен! Наша команда свяжется с вами в ближайшее время.",
    leadSuccessReset: "Отправить еще один запрос"
  },
  ko: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "통합 학교 포털",
    slogan: "가정과 학교를 연결하는 스마트하고 안전한 소통.",
    introText: "학생들의 일과, 성적표, 출입 현황을 실시간으로 확인하세요. 학부모는 자녀의 성장을 지켜보고, 학교 관리자는 신속하게 공지사항과 출입을 조정하는 프리미엄 환경입니다.",
    
    parentAccessTitle: "학부모 포털",
    parentAccessDesc: "학부모를 위한 전용 공간입니다. 일일 보고서, 성적표, 하교 알림 등을 확인하세요.",
    parentBenefit1: "일일 알림장 확인 (식사, 수면, 기분)",
    parentBenefit2: "성적 및 학업 성취도 실시간 조회",
    parentBenefit3: "도착 예고 알림 전송 \"지금 가고 있습니다 🚗\"",
    parentBenefit4: "청구서 확인 및 Pix를 통한 간편 결제",
    parentBtn: "학부모로 로그인",

    schoolAccessTitle: "학교 관리 포털",
    schoolAccessDesc: "교사, 행정실 및 교문 직원을 위한 내부 관리 패널입니다.",
    schoolBenefit1: "학생 일지 및 일일 이벤트 기록",
    schoolBenefit2: "하교 대기열 및 교문 출입 실시간 관리",
    schoolBenefit3: "공지사항 게시판에 즉시 공지 등록",
    schoolBenefit4: "학업 및 재정 통합 시스템 설정",
    schoolBtn: "관리자로 로그인",

    metricSynced: "동기화됨",
    metricConnected: "다자녀 지원",
    metricSecurity: "안전함",

    backToLanding: "홈으로 돌아가기",
    toggleThemeLight: "라이트 모드",
    toggleThemeDark: "다크 모드",
    activeReminders: "알림",
    onlineSecretary: "온라인 행정실",
    bulletinBoard: "공지 게시판",
    starSparkCount: "스파크",

    changePortal: "포털 전환",
    switchToSchool: "학교 포털",
    switchToParents: "학부모 포털",
    visualIdentity: "비주얼 아이덴티티",
    exitDashboard: "로그아웃",

    // Landing Page
    landingHome: "홈",
    landingHowItWorks: "이용 방법",
    landingFeatures: "SaaS 기능",
    landingBudget: "요금 안내",
    landingAccessDemo: "데모 접속",
    landingHeroTitle: "학교의 아이덴티티를 담은 통합 맞춤형 앱",
    landingHeroSubtitle: "동기화된 교문 제어, 전자 게시판, 학업 관리, 간편 결제 등 학교만의 단독 화이트라벨 플랫폼 앱을 제공합니다.",
    landingSloganBadge: "우수한 학교를 위한 맞춤형 교육 기술",
    landingBtnDemo: "데모 보기",
    landingBtnSales: "전문가 상담 신청",
    landingArchTitle: "플랫폼 아키텍처",
    landingHelpTitle: "학교 운영 지원 방법",
    landingHelpSubtitle: "운영상의 마찰을 줄이고, 행정 비용을 절감하며, 학부모에게 프리미엄 소통 경험을 선사하세요.",
    
    feature1Title: "실시간 하교 제어 \"지금 가고 있습니다\"",
    feature1Desc: "학부모가 앱으로 도착을 알리면 교문 스태프가 도착 순서대로 학생 하교를 자동 정리하여, 대기 시간을 줄이고 안전을 극대화합니다.",
    feature2Title: "즉각적인 안내장 및 동의서",
    feature2Desc: "학년 또는 학생별로 공지사항을 발송합니다. 학부모는 스마트폰에서 직접 전자서명으로 간편하게 동의를 전송할 수 있습니다.",
    feature3Title: "학업-재정 통합 ERP",
    feature3Desc: "수업료 결제를 간편화하고, 사생활을 존중하는 친근한 커뮤니케이션 채널을 구축하여 신뢰 관계를 유지합니다.",

    caseTitle: "화이트라벨 도입 사례",
    caseSubtitle: "실제 도입 학교가 시스템을 일상에서 어떻게 활용하고 있는지 확인하세요.",
    caseBadge: "우수 도입 사례",
    caseSchool: "Magic Learning 컬리지",
    caseCustomBranding: "맞춤 브랜딩 적용 중",
    caseDesc: "Magic Learning 컬리지는 당사의 화이트라벨 솔루션을 도입했습니다. 학교 고유의 브랜드 컬러를 적용하고, 로고를 업로드하여 실시간 하교 제어 시스템을 운영하고 있습니다.",
    caseResultsTitle: "도입 후 성과:",
    caseResult1: "학생 하교 대기 시간 25분에서 3분으로 단축",
    caseResult2: "학부모 소통 만족도 98% 달성",
    caseResult3: "학교 통신문 100% 종이 없는 페이퍼리스 달성",
    caseSandbox: "대화형 데모 샌드박스",
    caseAccessBtn: "데모 포털 접속",
    mockupTitle: "맞춤형 앱 미리보기",

    customTitle: "학교 비주얼 아이덴티티 설정",
    customSubtitle: "학교 이름, 브랜드 컬러, 로고에 맞춰 스마트폰 앱 환경을 맞춤 설정하세요.",
    customFormSchoolName: "학교 이름",
    customFormPreset: "컬러 팔레트",
    customFormLogo: "로고 아이콘",
    customWand: "마법 지팡이",
    customShield: "고귀한 방패",
    customBook: "고전 서적",
    customGraduation: "학사모",
    customSaveBtn: "설정 저장",

    leadTitle: "데모 신청 및 맞춤 견적",
    leadSubtitle: "15일 이내에 학교 전용 맞춤형 앱을 시작하는 방법을 확인하세요.",
    leadFormName: "이름",
    leadFormEmail: "학교 이메일",
    leadFormPhone: "전화번호 / WhatsApp",
    leadFormSchool: "학교/기관 이름",
    leadFormSize: "재학생 수 규모",
    leadFormMsg: "문의 사항 (선택)",
    leadFormBtn: "데모 신청하기",
    leadSuccess: "데모 신청이 완료되었습니다! 담당자가 신속하게 연락드리겠습니다.",
    leadSuccessReset: "추가 신청 제출"
  },
  hi: {
    schoolPortalName: "Magic Learning",
    portalSubtitle: "एकीकृत स्कूल पोर्टल",
    slogan: "परिवारों और स्कूल के बीच स्मार्ट और सुरक्षित संबंध।",
    introText: "वास्तविक समय में दिनचर्या, रिपोर्ट कार्ड और उपस्थिति देखें। माता-पिता के लिए छात्र विकास पर नज़र रखने और प्रबंधकों के लिए त्वरित संचार समन्वय करने का एक प्रीमियम माहौल।",
    
    parentAccessTitle: "अभिभावक पोर्टल",
    parentAccessDesc: "अभिभावकों के लिए विशेष स्थान। दैनिक गतिविधियों, अंकों, रिपोर्ट कार्ड और गेट पास को ट्रैक करें।",
    parentBenefit1: "दैनिक लॉग देखना (भोजन, नींद और मूड की स्थिति)",
    parentBenefit2: "वास्तविक समय में अंक और शैक्षणिक रिपोर्ट देखना",
    parentBenefit3: "आगमन अलर्ट भेजना \"मैं रास्ते में हूँ 🚗\"",
    parentBenefit4: "बिल देखना और Pix के माध्यम से आसान भुगतान करना",
    parentBtn: "अभिभावक के रूप में लॉगिन करें",

    schoolAccessTitle: "School Management",
    schoolAccessDesc: "शिक्षकों, कार्यालय और गेट स्टाफ के लिए आंतरिक प्रबंधन पैनल।",
    schoolBenefit1: "छात्रों की दैनिक गतिविधियों और घटनाओं को दर्ज करना",
    schoolBenefit2: "निकास कतार और स्कूल गेट उपस्थिति को लाइव प्रबंधित करना",
    schoolBenefit3: "नोटिस बोर्ड पर तुरंत घोषणाएं पोस्ट करना",
    schoolBenefit4: "शैक्षणिक और वित्तीय एकीकरण कॉन्फ़िगर करना",
    schoolBtn: "प्रबंधक के रूप में लॉगिन करें",

    metricSynced: "सिंक्रनाइज़",
    metricConnected: "मल्टी-स्टूडेंट",
    metricSecurity: "सुरक्षित",

    backToLanding: "होम पर वापस जाएं",
    toggleThemeLight: "लाइट मोड",
    toggleThemeDark: "डार्क मोड",
    activeReminders: "सक्रिय अनुस्मारक",
    onlineSecretary: "ऑनलाइन सचिवालय",
    bulletinBoard: "सूचना पट्ट",
    starSparkCount: "तारे",

    changePortal: "पोर्टल बदलें",
    switchToSchool: "स्कूल पोर्टल",
    switchToParents: "अभिभावक पोर्टल",
    visualIdentity: "दृश्य पहचान",
    exitDashboard: "लॉगआउट",

    // Landing Page
    landingHome: "होम",
    landingHowItWorks: "यह कैसे काम करता है",
    landingFeatures: "साँस सुविधाएँ",
    landingBudget: "मूल्य निर्धारण",
    landingAccessDemo: "डेमो एक्सेस करें",
    landingHeroTitle: "आपकी स्कूल की पहचान के लिए आपका अपना एकीकृत ऐप",
    landingHeroSubtitle: "विशेष ऐप वाला आपका स्कूल: सिंक्रनाइज़ गेट नियंत्रण, इलेक्ट्रॉनिक नोटिस बोर्ड, शैक्षणिक प्रबंधन और एकीकृत बिलिंग सब एक ही प्लेटफॉर्म पर।",
    landingSloganBadge: "उत्कृष्ट स्कूलों के लिए अनुकूलित तकनीक",
    landingBtnDemo: "डेमो देखें",
    landingBtnSales: "सलाहकार से बात करें",
    landingArchTitle: "प्लेटफॉर्म आर्किटेक्चर",
    landingHelpTitle: "हम आपके स्कूल की कैसे मदद करते हैं",
    landingHelpSubtitle: "परिचालन बाधाओं को दूर करें, लागत कम करें और परिवारों को प्रीमियम संचार से प्रसन्न करें।",
    
    feature1Title: "सिंक्रनाइज़ गेट नियंत्रण \"मैं रास्ते में हूँ\"",
    feature1Desc: "अभिभावक ऐप से अपने आगमन की सूचना देते हैं। गेट स्टाफ भौतिक आगमन के क्रम में छात्रों की निकासी कतार व्यवस्थित करता है, जिससे सुरक्षा और गति सुनिश्चित होती है।",
    feature2Title: "त्वरित सूचनाएं और परिपत्र",
    feature2Desc: "कक्षाओं को त्वरित सूचनाएं भेजें। माता-पिता सीधे स्मार्टफोन से गतिविधियों के लिए इलेक्ट्रॉनिक रूप से हस्ताक्षर करके सहमति देते हैं।",
    feature3Title: "एकीकृत वित्तीय ईआरपी",
    feature3Desc: "डिजिटल चैनलों के माध्यम से शुल्क भुगतान को आसान बनाएं। ऐप भुगतान बातचीत के लिए एक गोपनीय और सम्मानजनक चैनल प्रदान करता है।",

    caseTitle: "व्हाइट-लेबल व्यावहारिक अनुभव",
    caseSubtitle: "देखें कि कैसे एक संदर्भ स्कूल दैनिक रूप से हमारे अनुकूलित पारिस्थितिकी तंत्र का उपयोग करता है।",
    caseBadge: "सफलता की कहानी",
    caseSchool: "मैजिक लर्निंग कॉलेज",
    caseCustomBranding: "कस्टम ब्रांडिंग सक्रिय",
    caseDesc: "मैजिक लर्निंग कॉलेज ने हमारे व्हाइट-लेबल समाधान को अपनाया। उन्होंने सिस्टम के रंगों को अनुकूलित किया, अपना लोगो अपलोड किया और वास्तविक समय गेट नियंत्रण का उपयोग किया।",
    caseResultsTitle: "मैजिक लर्निंग पर प्रभाव:",
    caseResult1: "निकास समय 25 मिनट से घटकर केवल 3 मिनट रह गया",
    caseResult2: "अभिभावकों द्वारा 98% संतुष्टि दर्ज की गई",
    caseResult3: "स्कूल संचार 100% कागज रहित हो गया",
    caseSandbox: "इंटरैक्टिव सैंडबॉक्स",
    caseAccessBtn: "डेमो पोर्टल पर जाएं",
    mockupTitle: "कस्टम ऐप का पूर्वावलोकन",

    customTitle: "अपने स्कूल की दृश्य पहचान",
    customSubtitle: "संस्थान के नाम, रंगों और लोगो के साथ एप्लिकेशन को कस्टमाइज़ करें।",
    customFormSchoolName: "स्कूल का नाम",
    customFormPreset: "रंग पैलेट",
    customFormLogo: "लोगो आइकन",
    customWand: "जादुई छड़ी",
    customShield: "कुलीन ढाल",
    customBook: "क्लासिक पुस्तक",
    customGraduation: "अकादमिक टोपी",
    customSaveBtn: "सेटिंग्स सहेजें",

    leadTitle: "डेमो और उद्धरण का अनुरोध करें",
    leadSubtitle: "जानें कि 15 दिनों से भी कम समय में अपने स्कूल का अपना ब्रांडेड एप्लिकेशन कैसे लॉन्च करें।",
    leadFormName: "आपका नाम",
    leadFormEmail: "कॉर्पोरेट ईमेल",
    leadFormPhone: "फ़ोन / व्हाट्सएप",
    leadFormSchool: "संस्थान का नाम",
    leadFormSize: "छात्रों की संख्या",
    leadFormMsg: "संदेश (वैकल्पिक)",
    leadFormBtn: "अनुरोध भेजें",
    leadSuccess: "अनुरोध सफलतापूर्वक भेजा गया! हमारी टीम शीघ्र ही आपसे संपर्क करेगी।",
    leadSuccessReset: "दूसरा अनुरोध भेजें"
  }
};
