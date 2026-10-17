export type SupportedLocale =
  | "pt"
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "ja"
  | "zh";

export interface LanguageOption {
  code: SupportedLocale;
  label: string;
  name: string;
  flag: string;
  country: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "pt", label: "PT", name: "Português", flag: "🇧🇷", country: "Brasil" },
  { code: "en", label: "EN", name: "English", flag: "🇺🇸", country: "United States" },
  { code: "es", label: "ES", name: "Español", flag: "🇪🇸", country: "España" },
  { code: "fr", label: "FR", name: "Français", flag: "🇫🇷", country: "France" },
  { code: "de", label: "DE", name: "Deutsch", flag: "🇩🇪", country: "Deutschland" },
  { code: "it", label: "IT", name: "Italiano", flag: "🇮🇹", country: "Italia" },
  { code: "ja", label: "JA", name: "日本語", flag: "🇯🇵", country: "日本" },
  { code: "zh", label: "ZH", name: "中文", flag: "🇨🇳", country: "中国" },
];

export const LOCALE_STORAGE_KEY = "school_portal_locale";

export const getStoredLocale = (): SupportedLocale => {
  if (typeof window === "undefined") return "pt";
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved as SupportedLocale;
    }
  } catch {
    // ignore
  }
  return "pt";
};

export const setStoredLocale = (locale: SupportedLocale): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
};

// Common UI and Portal translations
export const portalTranslations: Record<
  string,
  Record<SupportedLocale, string>
> = {
  // Theme options
  themeDay: {
    pt: "Dia",
    en: "Day",
    es: "Día",
    fr: "Jour",
    de: "Tag",
    it: "Giorno",
    ja: "昼",
    zh: "白天",
  },
  themeNight: {
    pt: "Noite",
    en: "Night",
    es: "Noche",
    fr: "Nuit",
    de: "Nacht",
    it: "Notte",
    ja: "夜",
    zh: "夜间",
  },
  themeSystem: {
    pt: "Auto",
    en: "Auto",
    es: "Auto",
    fr: "Auto",
    de: "Auto",
    it: "Auto",
    ja: "自動",
    zh: "自动",
  },
  themeSystemSchedule: {
    pt: "Auto: 6h às 18h claro, 18h às 24h escuro",
    en: "Auto: 6 AM to 6 PM light, 6 PM to 12 AM dark",
    es: "Auto: 6h a 18h claro, 18h a 6h oscuro",
    fr: "Auto: 6h à 18h clair, 18h à 6h sombre",
    de: "Auto: 6 bis 18 Uhr hell, 18 bis 6 Uhr dunkel",
    it: "Auto: 6-18 chiaro, 18-6 scuro",
    ja: "自動: 6:00〜18:00 明、18:00〜6:00 暗",
    zh: "自动: 6点至18点亮，18点至6点暗",
  },
  themeCurrentlyLight: {
    pt: "Atualmente Claro",
    en: "Currently Light",
    es: "Actualmente Claro",
    fr: "Actuellement Clair",
    de: "Aktuell Hell",
    it: "Attualmente Chiaro",
    ja: "現在: 明",
    zh: "当前为浅色",
  },
  themeCurrentlyDark: {
    pt: "Atualmente Escuro",
    en: "Currently Dark",
    es: "Actualmente Oscuro",
    fr: "Actuellement Sombre",
    de: "Aktuell Dunkel",
    it: "Attualmente Scuro",
    ja: "現在: 暗",
    zh: "当前为深色",
  },
  themeTitle: {
    pt: "Tema da Interface",
    en: "Interface Theme",
    es: "Tema de la Interfaz",
    fr: "Thème d'Interface",
    de: "Design-Modus",
    it: "Tema Interfaccia",
    ja: "テーマ設定",
    zh: "界面主题",
  },

  // Language selector
  selectLanguage: {
    pt: "Selecionar Idioma",
    en: "Select Language",
    es: "Seleccionar Idioma",
    fr: "Choisir la Langue",
    de: "Sprache Wählen",
    it: "Seleziona Lingua",
    ja: "言語を選択",
    zh: "选择语言",
  },
  currentLanguage: {
    pt: "Idioma do Sistema",
    en: "System Language",
    es: "Idioma del Sistema",
    fr: "Langue du Système",
    de: "Systemsprache",
    it: "Lingua del Sistema",
    ja: "システム言語",
    zh: "系统语言",
  },

  // Navigation & Portals
  familyPortal: {
    pt: "Portal da Família",
    en: "Family Portal",
    es: "Portal de la Familia",
    fr: "Portail Famille",
    de: "Familienportal",
    it: "Portale Famiglia",
    ja: "保護者ポータル",
    zh: "家长门户",
  },
  schoolPortal: {
    pt: "Gestão Escolar",
    en: "School Management",
    es: "Gestión Escolar",
    fr: "Gestion Scolaire",
    de: "Schulleitung",
    it: "Gestione Scolastica",
    ja: "学校管理",
    zh: "学校管理",
  },
  dashboard: {
    pt: "Início",
    en: "Dashboard",
    es: "Inicio",
    fr: "Tableau de Bord",
    de: "Übersicht",
    it: "Dashboard",
    ja: "ホーム",
    zh: "仪表板",
  },
  announcements: {
    pt: "Mural",
    en: "Bulletins",
    es: "Avisos",
    fr: "Panneau",
    de: "Aushang",
    it: "Bacheca",
    ja: "掲示板",
    zh: "公告栏",
  },
  dailyLog: {
    pt: "Diário",
    en: "Daily Log",
    es: "Diario",
    fr: "Journal",
    de: "Tagebuch",
    it: "Diario",
    ja: "日誌",
    zh: "每日日志",
  },
  academic: {
    pt: "Boletim",
    en: "Grades",
    es: "Boletín",
    fr: "Bulletins",
    de: "Noten",
    it: "Pagella",
    ja: "成績",
    zh: "成绩单",
  },
  billing: {
    pt: "Financeiro",
    en: "Billing",
    es: "Financiero",
    fr: "Paiements",
    de: "Finanzen",
    it: "Finanze",
    ja: "支払い",
    zh: "财务与学费",
  },
  pickupGate: {
    pt: "Portaria",
    en: "Gate Pickup",
    es: "Puerta",
    fr: "Portail",
    de: "Pforte",
    it: "Uscita",
    ja: "下校管理",
    zh: "接送门禁",
  },
  myProfile: {
    pt: "Meu Perfil",
    en: "My Profile",
    es: "Mi Perfil",
    fr: "Mon Profil",
    de: "Mein Profil",
    it: "Il Mio Profilo",
    ja: "マイプロフィール",
    zh: "个人中心",
  },
  logout: {
    pt: "Sair do Painel",
    en: "Log Out",
    es: "Cerrar Sesión",
    fr: "Déconnexion",
    de: "Abmelden",
    it: "Disconnetti",
    ja: "ログアウト",
    zh: "退出登录",
  },
  versionLabel: {
    pt: "Portal Escolar Integrado v1.4",
    en: "Integrated School Portal v1.4",
    es: "Portal Escolar Integrado v1.4",
    fr: "Portail Scolaire Intégré v1.4",
    de: "Integriertes Schulportal v1.4",
    it: "Portale Scolastico Integrato v1.4",
    ja: "統合学校ポータル v1.4",
    zh: "集成学校门户 v1.4",
  },
  monthlyPdfReport: {
    pt: "Relatório PDF",
    en: "PDF Report",
    es: "Informe PDF",
    fr: "Rapport PDF",
    de: "PDF-Bericht",
    it: "Report PDF",
    ja: "PDFレポート",
    zh: "PDF报表",
  },
};

// Complete Landing Page Translations Dictionary
export const landingTranslations: Record<
  string,
  Record<SupportedLocale, string>
> = {
  navPillars: {
    pt: "Pilares",
    en: "Pillars",
    es: "Pilares",
    fr: "Piliers",
    de: "Säulen",
    it: "Pilastri",
    ja: "特長",
    zh: "核心支柱",
  },
  navWhiteLabel: {
    pt: "White-Label",
    en: "White-Label",
    es: "White-Label",
    fr: "White-Label",
    de: "White-Label",
    it: "White-Label",
    ja: "ホワイトラベル",
    zh: "白标定制",
  },
  navDemo: {
    pt: "Demonstração",
    en: "Demo",
    es: "Demostración",
    fr: "Démo",
    de: "Demo",
    it: "Demo",
    ja: "デモ体験",
    zh: "在线演示",
  },
  navPlans: {
    pt: "Planos",
    en: "Pricing",
    es: "Planes",
    fr: "Tarifs",
    de: "Preise",
    it: "Piani",
    ja: "料金プラン",
    zh: "订阅方案",
  },
  navContact: {
    pt: "Contato",
    en: "Contact",
    es: "Contacto",
    fr: "Contact",
    de: "Kontakt",
    it: "Contatti",
    ja: "お問い合わせ",
    zh: "联系咨询",
  },
  navLogin: {
    pt: "Entrar",
    en: "Sign In",
    es: "Entrar",
    fr: "Connexion",
    de: "Anmelden",
    it: "Accedi",
    ja: "ログイン",
    zh: "登录",
  },
  navDeploy: {
    pt: "Implantar",
    en: "Deploy",
    es: "Implantar",
    fr: "Déployer",
    de: "Einführen",
    it: "Implementa",
    ja: "導入する",
    zh: "部署系统",
  },
  heroBadge: {
    pt: "Portal Escolar",
    en: "School Portal",
    es: "Portal Escolar",
    fr: "Portail Scolaire",
    de: "Schulportal",
    it: "Portale Scolastico",
    ja: "学校ポータル",
    zh: "智慧校园门户",
  },
  heroTitle: {
    pt: "Gestão escolar simples e integrada",
    en: "Simple, integrated school management",
    es: "Gestión escolar simple e integrada",
    fr: "Gestion scolaire simple et intégrée",
    de: "Einfache, integrierte Schulverwaltung",
    it: "Gestione scolastica semplice e integrata",
    ja: "シンプルで統合された学校運営",
    zh: "简洁一体化智能校园管理",
  },
  heroSubtitle: {
    pt: "Portaria ágil, rotina diária e comunicação direta com as famílias.",
    en: "Smart gate pickup, daily logs, and direct family communication.",
    es: "Portería ágil, rutina diaria y comunicación directa con familias.",
    fr: "Sorties fluides, carnet quotidien et communication directe.",
    de: "Schneller Einlass, Tagesablauf und direkte Elternkommunikation.",
    it: "Uscite rapide, diario giornaliero e comunicazioni dirette.",
    ja: "迅速な下校管理、連絡帳、保護者との直接連携。",
    zh: "智能接送、每日日志与家校实时互联。",
  },
  heroDeployBtn: {
    pt: "Começar Agora",
    en: "Get Started",
    es: "Comenzar",
    fr: "Commencer",
    de: "Starten",
    it: "Inizia",
    ja: "はじめる",
    zh: "立即开始",
  },
  heroDemoBtn: {
    pt: "Demonstração",
    en: "Demo",
    es: "Demostración",
    fr: "Démo",
    de: "Demo",
    it: "Demo",
    ja: "デモ体験",
    zh: "演示体验",
  },
  heroTrust1: {
    pt: "60 dias grátis",
    en: "60 days free",
    es: "60 días gratis",
    fr: "60 jours gratuits",
    de: "60 Tage kostenlos",
    it: "60 giorni gratis",
    ja: "60日間無料",
    zh: "60天免费",
  },
  heroTrust2: {
    pt: "Marca própria",
    en: "Custom branding",
    es: "Marca propia",
    fr: "Marque propre",
    de: "Eigene Marke",
    it: "Marchio proprio",
    ja: "独自ブランド",
    zh: "专属品牌",
  },
  archTitle: {
    pt: "Recursos",
    en: "Features",
    es: "Funciones",
    fr: "Fonctions",
    de: "Funktionen",
    it: "Funzionalità",
    ja: "主な機能",
    zh: "核心功能",
  },
  pillarsTitle: {
    pt: "Pilares da rotina escolar",
    en: "Core pillars of school routine",
    es: "Pilares de la rutina escolar",
    fr: "Piliers de la vie scolaire",
    de: "Säulen des Schulalltags",
    it: "Pilastri della routine scolastica",
    ja: "学校運営の柱",
    zh: "日常校园核心支柱",
  },
  feature1Title: {
    pt: "Portaria Inteligente",
    en: "Smart Gate Pickup",
    es: "Portería Inteligente",
    fr: "Porte Intelligente",
    de: "Intelligente Pforte",
    it: "Portineria Smart",
    ja: "スマート下校ゲート",
    zh: "智能接送门禁",
  },
  feature1Desc: {
    pt: "Chamada sincronizada pelo app para saídas sem fila.",
    en: "App-synchronized calls for fast, queue-free dismissals.",
    es: "Llamada sincronizada por la app para salidas sin filas.",
    fr: "Appels synchronisés sur l'app pour des sorties sans attente.",
    de: "App-gesteuerter Schüleraufruf ohne Warteschlangen.",
    it: "Chiamate sincronizzate da app per uscite senza code.",
    ja: "アプリ連動の呼び出しで待機列を解消。",
    zh: "App实时呼叫，免排队有序放行。",
  },
  feature1Metric: {
    pt: "✓ Espera 65% menor",
    en: "✓ 65% faster pickup",
    es: "✓ Espera 65% menor",
    fr: "✓ Attente réduite de 65%",
    de: "✓ 65% kürzere Wartezeit",
    it: "✓ Attesa ridotta del 65%",
    ja: "✓ 待機時間を65%短縮",
    zh: "✓ 接送提速65%",
  },
  feature2Title: {
    pt: "Diário & Saúde",
    en: "Daily Log & Care",
    es: "Diario y Salud",
    fr: "Journal & Santé",
    de: "Tagebuch & Gesundheit",
    it: "Diario & Salute",
    ja: "日誌と健康管理",
    zh: "每日日志与健康",
  },
  feature2Desc: {
    pt: "Refeições, rotina e avisos em tempo real.",
    en: "Meals, routines, and updates in real time.",
    es: "Comidas, rutina y avisos en tiempo real.",
    fr: "Repas, rythme et nouvelles en direct.",
    de: "Mahlzeiten, Ablauf und Meldungen in Echtzeit.",
    it: "Pasti, routine e avvisi in tempo reale.",
    ja: "食事・体調・連絡事項をリアルタイム共有。",
    zh: "餐饮、出勤及消息实时同步。",
  },
  feature2Metric: {
    pt: "✓ 100% digital",
    en: "✓ 100% paperless",
    es: "✓ 100% digital",
    fr: "✓ 100% numérique",
    de: "✓ 100% digital",
    it: "✓ 100% digitale",
    ja: "✓ 完全ペーパーレス",
    zh: "✓ 全数字化零纸化",
  },
  feature3Title: {
    pt: "Boletim & Notas",
    en: "Grades & Reports",
    es: "Boletín y Notas",
    fr: "Bulletins & Notes",
    de: "Zeugnisse & Noten",
    it: "Pagella & Voti",
    ja: "通知表と成績",
    zh: "成绩单与评价",
  },
  feature3Desc: {
    pt: "Notas bimestrais, pareceres e histórico escolar.",
    en: "Term grades, teacher remarks, and academic records.",
    es: "Notas por bimestre, comentarios e historial académico.",
    fr: "Notes trimestrielles, appréciations et historique.",
    de: "Halbjahresnoten, Kommentare und Schulverlauf.",
    it: "Voti periodici, giudizi e storico scolastico.",
    ja: "学期成績、所見、学籍履歴を一元管理。",
    zh: "学期成绩、教师评语及学籍档案。",
  },
  feature3Metric: {
    pt: "✓ Exportação rápida",
    en: "✓ Fast export",
    es: "✓ Exportación rápida",
    fr: "✓ Exportation rapide",
    de: "✓ Schneller Export",
    it: "✓ Esportazione rapida",
    ja: "✓ 簡単エクスポート",
    zh: "✓ 一键快捷导出",
  },
  whiteLabelBadge: {
    pt: "Personalização",
    en: "White-Label",
    es: "Personalización",
    fr: "Personnalisation",
    de: "Individuell",
    it: "Personalizzazione",
    ja: "ブランドカスタマイズ",
    zh: "白标定制",
  },
  whiteLabelTitle: {
    pt: "Marca própria para sua escola",
    en: "Your school's own brand",
    es: "Marca propia para su colegio",
    fr: "Votre propre marque scolaire",
    de: "Die eigene Marke für Ihre Schule",
    it: "Il marchio della tua scuola",
    ja: "貴校専用のブランド展開",
    zh: "为您学校打造专属品牌",
  },
  whiteLabelDesc: {
    pt: "Cores, logotipo e identidade visual da sua instituição no app dos pais.",
    en: "Your school's colors, logo, and visual identity in parents' app.",
    es: "Colores, logo e identidad visual de su colegio en la app de las familias.",
    fr: "Couleurs, logo et identité de votre établissement sur l'application.",
    de: "Schulfarben, Logo und Design in der Eltern-App.",
    it: "Colori, logo e identità del vostro istituto nell'app dei genitori.",
    ja: "保護者アプリに貴校の校章とテーマカラーを適用。",
    zh: "家长端全面展示贵校校徽与专属主题色。",
  },
  whiteLabelBtn: {
    pt: "Personalizar Cores",
    en: "Customize Colors",
    es: "Personalizar Colores",
    fr: "Personnaliser",
    de: "Farben anpassen",
    it: "Personalizza Colori",
    ja: "カラー変更",
    zh: "定制主题色",
  },
  whiteLabelActivePreset: {
    pt: "Ativo",
    en: "Active",
    es: "Activo",
    fr: "Actif",
    de: "Aktiv",
    it: "Attivo",
    ja: "適用中",
    zh: "当前生效",
  },
  demoBadge: {
    pt: "Demonstração",
    en: "Live Demo",
    es: "Demostración",
    fr: "Démo en direct",
    de: "Live-Demo",
    it: "Demo Live",
    ja: "デモ",
    zh: "即刻体验",
  },
  demoTitle: {
    pt: "Experimente os portais",
    en: "Explore the portals",
    es: "Explore los portales",
    fr: "Découvrez les portaux",
    de: "Portale testen",
    it: "Prova i portali",
    ja: "ポータルを試す",
    zh: "体验多端门户",
  },
  demoDesc: {
    pt: "Acesse os ambientes em tempo real sem cadastro prévio.",
    en: "Test real-time environments without prior sign-up.",
    es: "Pruebe los entornos en tiempo real sin registro.",
    fr: "Testez les espaces en direct sans inscription.",
    de: "Testen Sie alle Bereiche ohne vorherige Registrierung.",
    it: "Prova gli ambienti in tempo reale senza registrazione.",
    ja: "登録不要で実際の操作感を体験できます。",
    zh: "无需注册，即可体验真实多端联动。",
  },
  demoParentTitle: {
    pt: "Portal da Família",
    en: "Family Portal",
    es: "Portal de la Familia",
    fr: "Portail Famille",
    de: "Familienportal",
    it: "Portale Famiglia",
    ja: "保護者ポータル",
    zh: "家长门户",
  },
  demoParentDesc: {
    pt: "Diário, QR de portaria, cardápio e financeiro.",
    en: "Diary, gate QR, lunch menu, and billing.",
    es: "Diario, QR de portería, menú y finanzas.",
    fr: "Carnet, QR code, cantine et finances.",
    de: "Tagebuch, QR-Code, Menü und Finanzen.",
    it: "Diario, QR Code, menu e pagamenti.",
    ja: "連絡帳・下校QR・献立・学費管理。",
    zh: "成长日记、接送码、食谱与缴费。",
  },
  demoParentBtn: {
    pt: "Abrir Família →",
    en: "Open Family →",
    es: "Abrir Familia →",
    fr: "Ouvrir Famille →",
    de: "Familie öffnen →",
    it: "Apri Famiglia →",
    ja: "保護者画面 →",
    zh: "进入家长端 →",
  },
  demoSchoolTitle: {
    pt: "Portal da Escola",
    en: "School Portal",
    es: "Portal del Colegio",
    fr: "Portail École",
    de: "Schulportal",
    it: "Portale Scuola",
    ja: "学校管理ポータル",
    zh: "校务管理端",
  },
  demoSchoolDesc: {
    pt: "Fila da portaria, turmas e relatórios.",
    en: "Gate queue, classrooms, and reports.",
    es: "Fila de portería, clases y reportes.",
    fr: "File de sortie, classes et rapports.",
    de: "Einlass-Warteschlange, Klassen und Berichte.",
    it: "Coda portineria, classi e report.",
    ja: "下校管理、クラス日誌、各種帳票。",
    zh: "门禁队列、班级管理与报表。",
  },
  demoSchoolBtn: {
    pt: "Abrir Escola →",
    en: "Open School →",
    es: "Abrir Colegio →",
    fr: "Ouvrir École →",
    de: "Schule öffnen →",
    it: "Apri Scuola →",
    ja: "管理画面 →",
    zh: "进入管理端 →",
  },
  demoStudentProfile: {
    pt: "Aluno de Teste",
    en: "Test Student",
    es: "Alumno de Prueba",
    fr: "Élève Test",
    de: "Test-Schüler",
    it: "Studente Test",
    ja: "テスト生徒",
    zh: "测试学生",
  },
  demoStudentHint: {
    pt: "Alterne o aluno para ver a sincronização imediata.",
    en: "Switch student to see live synchronization.",
    es: "Cambie de alumno para ver la sincronización inmediata.",
    fr: "Changez d'élève pour voir la synchronisation directe.",
    de: "Schüler wechseln für direkte Synchronisation.",
    it: "Cambia studente per la sincronizzazione immediata.",
    ja: "生徒を切り替えて連動を確認できます。",
    zh: "切换学生查看实时联动效果。",
  },
  pricingBadge: {
    pt: "Preços",
    en: "Pricing",
    es: "Precios",
    fr: "Tarifs",
    de: "Preise",
    it: "Prezzi",
    ja: "料金",
    zh: "价格方案",
  },
  pricingTitle: {
    pt: "Assinatura Transparente",
    en: "Clear Pricing",
    es: "Suscripción Transparente",
    fr: "Abonnement Clair",
    de: "Klares Abo",
    it: "Abbonamento Chiaro",
    ja: "シンプルな月額料金",
    zh: "清晰透明订阅",
  },
  pricingDesc: {
    pt: "Sem taxa de adesão e com 60 dias gratuitos de teste.",
    en: "No setup fee, with 60 free trial days.",
    es: "Sin cuota de alta y con 60 días gratis de prueba.",
    fr: "Sans frais d'entrée et 60 jours d'essai offerts.",
    de: "Keine Einrichtungsgebühr, 60 Tage kostenlos.",
    it: "Nessun costo iniziale e 60 giorni gratuiti.",
    ja: "初期費用ゼロ、60日間無料トライアル。",
    zh: "零安装费，享60天免费试用。",
  },
  planTitle: {
    pt: "Plano Escolar Completo",
    en: "Complete School Plan",
    es: "Plan Escolar Completo",
    fr: "Formule Établissement",
    de: "Komplett-Schulpaket",
    it: "Piano Completo",
    ja: "学校総合プラン",
    zh: "学校全功能方案",
  },
  planDesc: {
    pt: "Alunos e usuários ilimitados",
    en: "Unlimited students and users",
    es: "Alumnos y usuarios ilimitados",
    fr: "Élèves et utilisateurs illimités",
    de: "Unbegrenzte Schüler und Nutzer",
    it: "Studenti e utenti illimitati",
    ja: "生徒数・利用者数 無制限",
    zh: "学生与用户账号无上限",
  },
  planPrice: {
    pt: "R$ 299",
    en: "$59",
    es: "59 €",
    fr: "59 €",
    de: "59 €",
    it: "59 €",
    ja: "¥8,800",
    zh: "¥399",
  },
  planPeriod: {
    pt: "/mês",
    en: "/month",
    es: "/mes",
    fr: "/mois",
    de: "/Monat",
    it: "/mese",
    ja: "/月",
    zh: "/月",
  },
  planFeat1: {
    pt: "Portaria com QR Code",
    en: "QR Code gate pickup",
    es: "Portería con QR",
    fr: "Sorties par QR Code",
    de: "QR-Code Einlass",
    it: "Portineria QR Code",
    ja: "QR下校管理",
    zh: "扫码智能门禁",
  },
  planFeat2: {
    pt: "App com marca própria",
    en: "Custom branded app",
    es: "App con marca propia",
    fr: "App personnalisée",
    de: "Eigene App-Marke",
    it: "App personalizzata",
    ja: "独自ブランドアプリ",
    zh: "专属品牌App",
  },
  planFeat3: {
    pt: "Diário e rotina",
    en: "Daily log and routines",
    es: "Diario y rutina",
    fr: "Journal quotidien",
    de: "Tagesberichte",
    it: "Diario giornaliero",
    ja: "日常連絡帳",
    zh: "成长与作息日志",
  },
  planFeat4: {
    pt: "Boletins e notas",
    en: "Grades and report cards",
    es: "Boletines y notas",
    fr: "Bulletins et notes",
    de: "Zeugnisse und Noten",
    it: "Pagelle e voti",
    ja: "通知表と成績",
    zh: "成绩单与评语",
  },
  planFeat5: {
    pt: "Conformidade LGPD",
    en: "LGPD/GDPR compliance",
    es: "Conformidad LGPD",
    fr: "Conformité RGPD",
    de: "DSGVO-konform",
    it: "Conformità GDPR",
    ja: "法令準拠セキュリティ",
    zh: "合规隐私保护",
  },
  planFeat6: {
    pt: "Suporte prioritário",
    en: "Priority support",
    es: "Soporte prioritario",
    fr: "Assistance prioritaire",
    de: "Prioritäts-Support",
    it: "Supporto prioritario",
    ja: "優先サポート",
    zh: "专属优先支持",
  },
  planBtn: {
    pt: "Testar 60 Dias Grátis",
    en: "Start 60 Days Free",
    es: "Probar 60 Días Gratis",
    fr: "Tester 60 Jours Gratuits",
    de: "60 Tage kostenlos testen",
    it: "Prova 60 Giorni Gratis",
    ja: "60日間無料で試す",
    zh: "免费试用60天",
  },
  contactBadge: {
    pt: "Contato",
    en: "Contact",
    es: "Contacto",
    fr: "Contact",
    de: "Kontakt",
    it: "Contatto",
    ja: "お問い合わせ",
    zh: "咨询合作",
  },
  contactTitle: {
    pt: "Fale com nossa equipe",
    en: "Get in touch with us",
    es: "Hable con nosotros",
    fr: "Contactez notre équipe",
    de: "Sprechen Sie mit uns",
    it: "Parla con il nostro team",
    ja: "お気軽にご相談ください",
    zh: "联系我们",
  },
  contactSubtitle: {
    pt: "Tire dúvidas ou agende uma apresentação rápida.",
    en: "Ask questions or schedule a quick walkthrough.",
    es: "Resuelva dudas o agende una presentación rápida.",
    fr: "Posez vos questions ou planifiez une démo rapide.",
    de: "Stellen Sie Fragen oder vereinbaren Sie eine kurze Demo.",
    it: "Fai una domanda o prenota una demo rapida.",
    ja: "導入のご相談やデモのご予約を受け付けています。",
    zh: "随时咨询疑问或预约快速演示。",
  },
  contactSuccessTitle: {
    pt: "Mensagem Recebida com Sucesso",
    en: "Message Received Successfully",
    es: "Mensaje Recibido con Éxito",
    fr: "Message Reçu avec Succès",
    de: "Nachricht erfolgreich erhalten",
    it: "Messaggio Ricevuto con Successo",
    ja: "お問い合わせを受け付けました",
    zh: "信息已成功提交",
  },
  contactSuccessDesc: {
    pt: "Nossa equipe entrará em contato em até 2 horas comerciais.",
    en: "Our team will contact you within 2 business hours.",
    es: "Nuestro equipo se pondrá en contacto en un plazo máximo de 2 horas hábiles.",
    fr: "Notre équipe vous recontactera sous 2 heures ouvrées.",
    de: "Unser Team wird sich innerhalb von 2 Geschäftsstunden bei Ihnen melden.",
    it: "Il nostro team ti contatterà entro 2 ore lavorative.",
    ja: "担当スタッフより2営業時間以内にご連絡申し上げます。",
    zh: "我们的顾问将在2个工作小时内与您致电沟通。",
  },
  contactFormName: {
    pt: "Seu Nome Completo",
    en: "Your Full Name",
    es: "Su Nombre Completo",
    fr: "Nom et Prénom",
    de: "Ihr vollständiger Name",
    it: "Nome e Cognome",
    ja: "ご担当者様 氏名",
    zh: "您的姓名",
  },
  contactFormEmail: {
    pt: "E-mail Corporativo / Institucional",
    en: "Institutional Email",
    es: "Correo Institucional",
    fr: "E-mail Professionnel",
    de: "Dienstliche E-Mail-Adresse",
    it: "E-mail Istituzionale",
    ja: "学校・所属メールアドレス",
    zh: "学校办公邮箱",
  },
  contactFormPhone: {
    pt: "Telefone / WhatsApp",
    en: "Phone / WhatsApp",
    es: "Teléfono / WhatsApp",
    fr: "Téléphone / WhatsApp",
    de: "Telefonnummer / WhatsApp",
    it: "Telefono / WhatsApp",
    ja: "お電話番号 / WhatsApp",
    zh: "联系电话 / 手机号码",
  },
  contactFormSchool: {
    pt: "Nome do Colégio / Instituição",
    en: "School / Institution Name",
    es: "Nombre del Colegio / Institución",
    fr: "Nom de l'Établissement",
    de: "Name der Schule / Einrichtung",
    it: "Nome dell'Istituto Scolastico",
    ja: "学校名・法人名",
    zh: "学校 / 教育机构全称",
  },
  contactFormBtn: {
    pt: "Enviar Solicitação de Demonstração",
    en: "Submit Demo Request",
    es: "Enviar Solicitud de Demostración",
    fr: "Envoyer la Demande de Démo",
    de: "Demo-Anfrage absenden",
    it: "Invia Richiesta di Demo",
    ja: "デモ体験を申し込む",
    zh: "提交演示申请",
  },
  footerPlatformSubtitle: {
    pt: "Plataforma de Gestão Escolar & Portaria",
    en: "Integrated School & Gate Management Platform",
    es: "Plataforma de Gestión Escolar y Portería",
    fr: "Plateforme Intégrée de Gestion Scolaire",
    de: "Integrierte Schulverwaltungs- und Pfortenplattform",
    it: "Piattaforma di Gestione Scolastica & Portineria",
    ja: "総合学校運営・下校管理プラットフォーム",
    zh: "综合数字化校园与门禁管理系统",
  },
  lgpdCookieNotice: {
    pt: "Utilizamos cookies essenciais e respeitamos a LGPD (Lei nº 13.709/2018) para proteger dados de alunos e famílias.",
    en: "We use essential cookies and respect privacy regulations (LGPD/GDPR) to protect student and family data.",
    es: "Utilizamos cookies esenciales y respetamos la privacidad (LGPD/RGPD) para proteger los datos de estudiantes y familias.",
    fr: "Nous utilisons des cookies essentiels et respectons le RGPD pour protéger les données scolaires et familiales.",
    de: "Wir verwenden essenzielle Cookies und halten den Datenschutz (DSGVO) zum Schutz der Schüler- und Familiendaten ein.",
    it: "Utilizziamo cookie essenziali e rispettiamo il GDPR per proteggere i dati di studenti e famiglie.",
    ja: "生徒と保護者のプライバシーを保護するため、必要最小限のCookieのみを使用しています。",
    zh: "我们仅使用基础功能Cookies，严格遵守个人信息保护法律法规，保障学校与家庭数据安全。",
  },
  lgpdAcceptBtn: {
    pt: "Concordar",
    en: "Accept",
    es: "Aceptar",
    fr: "Accepter",
    de: "Zustimmen",
    it: "Accetta",
    ja: "同意する",
    zh: "同意",
  },
  lgpdCloseBtn: {
    pt: "Fechar",
    en: "Close",
    es: "Cerrar",
    fr: "Fermer",
    de: "Schließen",
    it: "Chiudi",
    ja: "閉じる",
    zh: "关闭",
  },
};

export const getPortalText = (key: string, locale: string = "pt"): string => {
  const item = portalTranslations[key];
  if (!item) return key;
  return (item as any)[locale] || item.pt || key;
};

export const getLandingText = (key: string, locale: string = "pt"): string => {
  const item = landingTranslations[key];
  if (!item) return key;
  return (item as any)[locale] || item.pt || key;
};

export const getTabLabel = (
  userRole: "pais" | "escola" | "aluno" | "landing",
  tabId: string,
  locale: string = "pt"
): string => {
  if (userRole === "pais") {
    switch (tabId) {
      case "dashboard":
        return locale === "en" ? "Dashboard" : locale === "es" ? "Inicio" : locale === "fr" ? "Tableau de Bord" : locale === "de" ? "Übersicht" : locale === "ja" ? "ホーム" : locale === "zh" ? "首页仪表板" : "Dashboard";
      case "diaadia":
        return locale === "en" ? "Daily Log & Agenda" : locale === "es" ? "Agenda y Diario" : locale === "fr" ? "Journal & Agenda" : locale === "de" ? "Tagebuch & Agenda" : locale === "ja" ? "連絡帳と日誌" : locale === "zh" ? "每日日志与日程" : "Agenda & Diário";
      case "academico":
        return locale === "en" ? "Report Card & Grades" : locale === "es" ? "Boletín Pedagógico" : locale === "fr" ? "Bulletin Scolaire" : locale === "de" ? "Zeugnis & Noten" : locale === "ja" ? "成績・通知表" : locale === "zh" ? "学业与成绩单" : "Boletim Pedagógico";
      case "comunicados":
        return locale === "en" ? "Announcements" : locale === "es" ? "Mural de Avisos" : locale === "fr" ? "Annonces & Circulaires" : locale === "de" ? "Mitteilungen" : locale === "ja" ? "お知らせ掲示板" : locale === "zh" ? "通知与公告栏" : "Mural de Avisos";
      case "cobrancas":
        return locale === "en" ? "Billing & Pix" : locale === "es" ? "Financiero y Pix" : locale === "fr" ? "Facturation & Pix" : locale === "de" ? "Finanzen & Pix" : locale === "ja" ? "学費・支払い" : locale === "zh" ? "学费与账单" : "Financeiro & Pix";
      case "acesso":
        return locale === "en" ? "Gate Pickup & QR" : locale === "es" ? "Portería y QR" : locale === "fr" ? "Portail & QR" : locale === "de" ? "Abholung & QR" : locale === "ja" ? "下校QRコード" : locale === "zh" ? "门禁接送与QR" : "Portaria & QR";
      case "premium_hub":
        return locale === "en" ? "Achievements & Hub" : locale === "es" ? "Hub de Logros" : locale === "fr" ? "Espace Réussites" : locale === "de" ? "Erfolgs-Hub" : locale === "ja" ? "成長記録ハブ" : locale === "zh" ? "成长与成就中心" : "Hub de Conquistas";
      case "perfil":
        return locale === "en" ? "My Profile" : locale === "es" ? "Mi Perfil" : locale === "fr" ? "Mon Profil" : locale === "de" ? "Mein Profil" : locale === "ja" ? "プロフィール" : locale === "zh" ? "个人中心" : "Meu Perfil";
      default:
        return tabId;
    }
  }

  if (userRole === "escola") {
    switch (tabId) {
      case "dashboard":
        return locale === "en" ? "Overview" : locale === "es" ? "Panel General" : locale === "fr" ? "Vue d'Ensemble" : locale === "de" ? "Schul-Dashboard" : locale === "ja" ? "学校概要" : locale === "zh" ? "校务全景总览" : "Painel Geral";
      case "agenda":
        return locale === "en" ? "Class Logs" : locale === "es" ? "Diario de Clases" : locale === "fr" ? "Cahier de Textes" : locale === "de" ? "Klassenbuch" : locale === "ja" ? "学級日誌" : locale === "zh" ? "班级日志记录" : "Diário de Turmas";
      case "retiradas":
        return locale === "en" ? "Gate & Pickup Queue" : locale === "es" ? "Portería y Fila" : locale === "fr" ? "File des Sorties" : locale === "de" ? "Abholpforte" : locale === "ja" ? "下校管理モニター" : locale === "zh" ? "门禁放行队列" : "Portaria & Fila";
      case "comunicados":
        return locale === "en" ? "Send Announcements" : locale === "es" ? "Envío de Comunicados" : locale === "fr" ? "Envoi de Circulaires" : locale === "de" ? "Mitteilungs-Versand" : locale === "ja" ? "一斉お知らせ配信" : locale === "zh" ? "全校公告群发" : "Envio de Comunicados";
      case "erp":
        return locale === "en" ? "ERP Integration" : locale === "es" ? "Integración ERP" : locale === "fr" ? "Intégration ERP" : locale === "de" ? "ERP-Anbindung" : locale === "ja" ? "ERP連携管理" : locale === "zh" ? "ERP系统集成" : "Integração ERP";
      case "alunos":
        return locale === "en" ? "Students & CRM" : locale === "es" ? "Alumnos y CRM" : locale === "fr" ? "Élèves & CRM" : locale === "de" ? "Schüler & CRM" : locale === "ja" ? "生徒管理 & CRM" : locale === "zh" ? "生源与学生CRM" : "Alunos & CRM";
      case "metricas":
        return locale === "en" ? "Metrics & Retention" : locale === "es" ? "Métricas y Evasión" : locale === "fr" ? "Métriques & Rétention" : locale === "de" ? "Metriken & Bindung" : locale === "ja" ? "指標と定着分析" : locale === "zh" ? "运营指标与留存" : "Métricas & Evasão";
      case "perfil":
        return locale === "en" ? "My Profile" : locale === "es" ? "Mi Perfil" : locale === "fr" ? "Mon Profil" : locale === "de" ? "Mein Profil" : locale === "ja" ? "プロフィール" : locale === "zh" ? "个人中心" : "Meu Perfil";
      case "moderacao":
        return locale === "en" ? "Moderation Hub" : locale === "es" ? "Centro de Moderación" : locale === "fr" ? "Modération" : locale === "de" ? "Moderation" : locale === "ja" ? "モデレーション" : locale === "zh" ? "内容安全审核" : "Moderação";
      default:
        return tabId;
    }
  }

  if (userRole === "aluno") {
    switch (tabId) {
      case "simplificada":
      case "tarefas":
        return locale === "en" ? "Daily Tasks & Goals" : locale === "es" ? "Tareas y Metas del Día" : "Lições & Metas do Dia";
      case "horarios":
        return locale === "en" ? "Class Schedule" : locale === "es" ? "Horario de Clases" : "Horários de Aula";
      case "conquistas":
        return locale === "en" ? "Achievements & Badges" : locale === "es" ? "Logros y Medallas" : "Conquistas & Medalhas";
      case "aventura":
        return locale === "en" ? "RPG Text Adventure" : locale === "es" ? "Aventura RPG" : "Aventura RPG";
      case "completa":
        return locale === "en" ? "Full Overview" : locale === "es" ? "Visión Completa" : "Visão Completa";
      default:
        return tabId;
    }
  }

  return tabId;
};

export const getTabDescription = (
  userRole: "pais" | "escola" | "aluno" | "landing",
  tabId: string,
  locale: string = "pt"
): string => {
  if (userRole === "pais") {
    switch (tabId) {
      case "dashboard":
        return locale === "en"
          ? "Unified view of student routine and daily school updates"
          : locale === "es"
          ? "Visión unificada de las actividades y rutina del estudiante"
          : locale === "fr"
          ? "Vue unifiée des activités et de la journée scolaire"
          : locale === "de"
          ? "Zentrale Übersicht über Schultag und Aktivitäten"
          : locale === "ja"
          ? "生徒の学校生活と最新のお知らせの統合画面"
          : locale === "zh"
          ? "学生在校生活与每日动态一览"
          : "Visão unificada das atividades e rotina do estudante";
      case "diaadia":
        return locale === "en"
          ? "Daily logs, nutrition, rest, hydration, and classroom photos"
          : locale === "es"
          ? "Seguimiento de la rutina diaria, alimentación, sueño y fotos"
          : locale === "fr"
          ? "Suivi du journal quotidien, alimentation, sieste et photos"
          : locale === "de"
          ? "Dokumentation von Tagesablauf, Essen, Schlaf und Fotos"
          : locale === "ja"
          ? "日々の生活、給食、睡眠、活動写真の記録"
          : locale === "zh"
          ? "每日作息、营养进食、睡眠与活动照片记录"
          : "Acompanhamento da rotina diária, alimentação, sono e fotos pedagógicas";
      case "academico":
        return locale === "en"
          ? "Term grades, teacher remarks, and competencies mastery"
          : locale === "es"
          ? "Calificaciones por bimestre, historial pedagógico y competencias"
          : locale === "fr"
          ? "Notes des trimestres, appréciations et compétences acquises"
          : locale === "de"
          ? "Noten, pädagogische Beurteilungen und Kompetenzen"
          : locale === "ja"
          ? "学期別成績、担任所見、習熟度マスター状況"
          : locale === "zh"
          ? "各学期成绩、教师综合评语与核心素养发展"
          : "Notas por bimestre, histórico pedagógico e mastery de competências";
      case "comunicados":
        return locale === "en"
          ? "Official newsletters, meetings and real-time school notices"
          : locale === "es"
          ? "Circulares, reuniones pedagógicas y avisos escolares en tiempo real"
          : locale === "fr"
          ? "Circulaires officielles et informations en temps réel"
          : locale === "de"
          ? "Offizielle Elternbriefe, Termine und Schulnachrichten"
          : locale === "ja"
          ? "学校便り、保護者会通知、緊急連絡の即時受信"
          : locale === "zh"
          ? "官方通知公函、家长会通知与即时重要资讯"
          : "Circulares, reuniões pedagógicas e informativos da escola em tempo real";
      case "cobrancas":
        return locale === "en"
          ? "Invoices, receipts, Pix instant copy-paste, and transparent agreements"
          : locale === "es"
          ? "Boletas, comprobantes, Pix y acuerdos con total transparencia"
          : locale === "fr"
          ? "Factures, reçus, paiement instantané Pix et contrats"
          : locale === "de"
          ? "Rechnungen, Belege, Pix-Direktzahlung und Vereinbarungen"
          : locale === "ja"
          ? "学費請求書、領収書、即時決済、明瞭な契約管理"
          : locale === "zh"
          ? "学费账单、电子收据、即时转账与透明缴费记录"
          : "Boletos, comprovantes, Pix copia e cola e acordos com transparência";
      case "acesso":
        return locale === "en"
          ? "Live gate release badge and authorized guardians list"
          : locale === "es"
          ? "Credencial dinámica de salida y registro de tutores autorizados"
          : locale === "fr"
          ? "Badge dynamique de sortie et liste des personnes autorisées"
          : locale === "de"
          ? "Dynamischer Abhol-Ausweis und autorisierte Abholberechtigte"
          : locale === "ja"
          ? "動的QR下校許可証と保護者引き渡し登録者リスト"
          : locale === "zh"
          ? "动态接送放行凭证与受托代接人授权列表"
          : "Crachá dinâmico de liberação e cadastro de responsáveis autorizados";
      case "premium_hub":
        return locale === "en"
          ? "Student milestones, daily emotional mood, and formative quests"
          : locale === "es"
          ? "Metas formativas, estado de ánimo diario y logros del estudiante"
          : locale === "fr"
          ? "Objectifs pédagogiques, humeur du jour et réussites"
          : locale === "de"
          ? "Entwicklungsziele, tägliche Stimmung und Meilensteine"
          : locale === "ja"
          ? "学習マイルストーン、毎日の気分、成長クエスト"
          : locale === "zh"
          ? "学生阶段目标、每日心情与成长成就档案"
          : "Metas formativas, humor diário e conquistas do estudante";
      case "perfil":
        return locale === "en"
          ? "Account settings, emergency contacts, language and theme preferences"
          : locale === "es"
          ? "Configuración de cuenta, datos de contacto, idioma y preferencias"
          : locale === "fr"
          ? "Paramètres du compte, contacts d'urgence et préférences"
          : locale === "de"
          ? "Kontoeinstellungen, Notfallkontakte, Sprache und Design"
          : locale === "ja"
          ? "アカウント設定、緊急連絡先、言語とテーマの変更"
          : locale === "zh"
          ? "账户信息、紧急联系人、界面语言与主题偏好设置"
          : "Configurações de conta, dados de contato e preferências";
      default:
        return "";
    }
  }

  if (userRole === "escola") {
    switch (tabId) {
      case "dashboard":
        return locale === "en"
          ? "Executive overview and core institutional operational indicators"
          : locale === "es"
          ? "Visión ejecutiva e indicadores operativos de la institución"
          : "Visão executiva e indicadores operacionais da instituição";
      case "agenda":
        return locale === "en"
          ? "Daily class management, attendance records, and incident logging"
          : locale === "es"
          ? "Gestión diaria de cursos, asistencia e incidencias"
          : "Gestão diária de turmas, registros de frequência e ocorrências";
      case "retiradas":
        return locale === "en"
          ? "Gate student flow control and high-speed QR Code scanner"
          : locale === "es"
          ? "Control de flujo de salida en portería y escáner QR"
          : "Controle de fluxo de alunos na portaria e leitor QR Code";
      case "comunicados":
        return locale === "en"
          ? "Mass announcement broadcasts, segmentation, and read confirmations"
          : locale === "es"
          ? "Envío de comunicados masivos, segmentación y lecturas"
          : "Envio de comunicados em massa, segmentação e engajamento";
      case "erp":
        return locale === "en"
          ? "Real-time bidirectional synchronization with school ERP systems"
          : locale === "es"
          ? "Sincronización bidireccional en tiempo real con el ERP escolar"
          : "Sincronização bidirecional em tempo real com o ERP escolar";
      case "alunos":
        return locale === "en"
          ? "Student roster, enrollment pipeline, and WhatsApp communication logs"
          : locale === "es"
          ? "Padrón de estudiantes, embudo de matrícula y WhatsApp"
          : "Gestão de alunos, rematrículas, alertas de evasão e CRM escolar";
      case "metricas":
        return locale === "en"
          ? "Retention analytics, behavioral metrics, and strategic school KPIs"
          : locale === "es"
          ? "Métricas de retención y análisis de indicadores estratégicos"
          : "Métricas estratégicas de retenção, evasão e engajamento da comunidade";
      case "moderacao":
        return locale === "en"
          ? "Content moderation, community safety, and compliance supervision"
          : locale === "es"
          ? "Centro de moderación, seguridad comunitaria y cumplimiento"
          : "Central de moderação de conteúdo, segurança e supervisão de alertas";
      default:
        return "";
    }
  }

  if (userRole === "aluno") {
    switch (tabId) {
      case "simplificada":
      case "tarefas":
        return locale === "en"
          ? "Daily homework tasks, study timer, and learning goals"
          : locale === "es"
          ? "Tareas escolares, temporizador de estudio y metas diarias"
          : "Lições de casa diárias, temporizador de foco e metas de aprendizado";
      case "horarios":
        return locale === "en"
          ? "Weekly schedule, classes, and classroom timetable"
          : locale === "es"
          ? "Horario semanal de clases y materias"
          : "Horários de aula semanais e cronograma escolar";
      case "conquistas":
        return locale === "en"
          ? "Unlocked badges, study streaks, and school honors"
          : locale === "es"
          ? "Medallas desbloqueadas y logros escolares"
          : "Medalhas desbloqueadas, ofensiva de estudos e conquistas";
      case "aventura":
        return locale === "en"
          ? "Interactive RPG game with health system and curriculum quests"
          : locale === "es"
          ? "Juego RPG interactivo con sistema de vida y desafíos pedagógicos"
          : "Aventura textual RPG com sistema de vida, perigos e desafios do currículo";
      case "completa":
        return locale === "en"
          ? "Comprehensive student dashboard with grades and badges"
          : locale === "es"
          ? "Panel completo del estudiante con calificaciones y horarios"
          : "Visão abrangente com horários, notas e medalhas";
      default:
        return "";
    }
  }

  return "";
};
