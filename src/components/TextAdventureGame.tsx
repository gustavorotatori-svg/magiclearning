import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Sparkles, 
  RotateCcw, 
  Compass, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Trophy, 
  History, 
  Info,
  Award,
  Scroll,
  Key,
  Shield,
  Layers,
  CheckCircle2,
  X,
  Save,
  BookmarkCheck,
  Trash2,
  Play,
  Check
} from "lucide-react";

export type GameDifficulty = "aprendiz" | "explorador" | "sobrevivente";

export const SAVE_STORAGE_KEY = "text_adventure_saved_game";

export interface SavedGameState {
  version: number;
  savedAt: string;
  formattedDate: string;
  playerName: string;
  difficulty: GameDifficulty;
  currentHealth: number;
  maxHealth: number;
  currentSceneId: string;
  sceneTitle: string;
  storyPathName: string;
  gameState: "playing" | "game_over" | "victory";
  score: number;
  turnCount: number;
  lastTurnScoreGained: number;
  lastScoreCategory: "decisao" | "item" | "marco" | "perigo" | null;
  lastScoreReason: string | null;
  scoreHistory: ScoreLogEntry[];
  inventory: string[];
  healthLogs: HealthLogEntry[];
}

export interface ScoreLogEntry {
  id: string;
  turn: number;
  points: number;
  total: number;
  reason: string;
  category: "decisao" | "item" | "marco" | "perigo";
  sceneTitle: string;
  timestamp: string;
}

export interface HealthLogEntry {
  id: string;
  timestamp: string;
  type: "damage" | "heal" | "start" | "reset";
  amount: number;
  currentHp: number;
  maxHp: number;
  reason: string;
  sceneTitle: string;
}

export interface AdventureChoice {
  id: string;
  label: string;
  description: string;
  icon?: string;
  targetScene: string;
  damageAmount?: number;
  healAmount?: number;
  hazardName?: string;
  hazardDetails?: string;
  rewardItem?: string;
  isWiseChoice?: boolean;
  scorePoints: number; // Mandatory: player starts at 0 and earns points on choices
  scoreCategory?: "decisao" | "item" | "marco" | "perigo";
  scoreReason?: string;
}

export interface AdventureScene {
  id: string;
  title: string;
  locationKicker: string;
  storyPathName: string;
  narrativeText: string;
  atmosphereText?: string;
  milestonePoints?: number;
  milestoneName?: string;
  choices: AdventureChoice[];
}

const DIFFICULTY_CONFIG: Record<GameDifficulty, { label: string; maxHp: number; description: string }> = {
  aprendiz: {
    label: "Modo Aprendiz",
    maxHp: 120,
    description: "Maior tolerância e resistência. Ideal para primeiras jornadas (120 HP inicial)."
  },
  explorador: {
    label: "Modo Explorador (Padrão)",
    maxHp: 100,
    description: "Equilíbrio clássico de aventura com risco balanceado de perigos (100 HP inicial)."
  },
  sobrevivente: {
    label: "Modo Sobrevivente",
    maxHp: 60,
    description: "Alta tensão. Qualquer armadilha pode ser letal (60 HP inicial)."
  }
};

/* =========================================================================
   ROTEIRO COM 3 CAMINHOS DISTINTOS:
   - Caminho 1: Alquimia & Mistérios Arcanos (O Caminho do Sábio)
   - Caminho 2: Engenharia & Mecânica dos Mestres (O Caminho do Engenheiro)
   - Caminho 3: Catacumbas das Sombras & Relíquias Ocultas (O Caminho do Furtivo)
========================================================================= */

const SCENES_PT: Record<string, AdventureScene> = {
  entrance: {
    id: "entrance",
    title: "O Portal de Calcário & Os Três Caminhos Antigos",
    locationKicker: "Catacumbas da Academia • Ponto de Partida",
    storyPathName: "Encruzilhada Inicial",
    narrativeText:
      "Você acende sua tocha diante do portal secular esculpido em calcário sob as fundações do colégio. Diante de você, três passagens distintas se abrem na rocha fria: à esquerda, o arco aromático do Laboratório Alquímico emana vapores azulados; no centro, o rangido de engrenagens celestes anuncia o Observatório dos Engenheiros; à direita, uma fenda escura ladeada por sarcófagos conduz às Catacumbas das Sombras.",
    atmosphereText: "O silêncio é quebrado apenas pelo eco das correntes e pelas gotas de água caindo na pedra.",
    choices: [
      {
        id: "c-start-path1",
        label: "Caminho 1: Adentrar o Arco dos Alquimistas Arcanos",
        description: "Investigar as bancadas de cerâmica, poções e enigmas químicos do laboratório ancestral.",
        targetScene: "alch_lab",
        isWiseChoice: true,
        scorePoints: 100,
        scoreCategory: "marco",
        scoreReason: "Iniciou a rota dos Alquimistas Arcanos"
      },
      {
        id: "c-start-path2",
        label: "Caminho 2: Seguir o som de engrenagens até o Observatório Mecânico",
        description: "Avançar rumo às máquinas celestes, relógios de latão e pontes levadiças de bronze.",
        targetScene: "eng_observatory",
        isWiseChoice: true,
        scorePoints: 100,
        scoreCategory: "marco",
        scoreReason: "Iniciou a rota da Engenharia dos Mestres"
      },
      {
        id: "c-start-path3",
        label: "Caminho 3: Descer furtivamente pelas Catacumbas das Sombras",
        description: "Explorar as fendas secretas, corredores de espelhos e tesouros esquecidos dos fundadores.",
        targetScene: "shadow_crypt",
        isWiseChoice: true,
        scorePoints: 100,
        scoreCategory: "marco",
        scoreReason: "Iniciou a rota das Catacumbas das Sombras"
      }
    ]
  },

  // -------------------------------------------------------------
  // CAMINHO 1: ALQUIMIA & MISTÉRIOS ARCANOS
  // -------------------------------------------------------------
  alch_lab: {
    id: "alch_lab",
    title: "O Laboratório dos Alquimistas Ancestrais",
    locationKicker: "Nível I • Câmara de Destilação",
    storyPathName: "Trilha dos Alquimistas",
    narrativeText:
      "Bancadas de granito cobertas de retortas, alambiques e pergaminhos seculares. No centro, sobre uma tábua de faiança, repousam dois frascos: um âmbar lacrado com cera dourada e outro verde fosforescente borbulhando ácido. Ao lado, uma gaveta falsa sob o móvel revela o brilho de um instrumento de precisão.",
    atmosphereText: "O aroma de sândalo e resinas medicinais disputa espaço com o cheiro penetrante de enxofre.",
    milestonePoints: 100,
    milestoneName: "Chegada ao Laboratório Alquímico",
    choices: [
      {
        id: "c-alch-decipher",
        label: "Decifrar a fórmula aromática no pergaminho antes de tocar nos frascos",
        description: "Analisar as anotações do mestre botânico para identificar a poção curativa segura.",
        targetScene: "alch_library",
        isWiseChoice: true,
        healAmount: 30,
        rewardItem: "Bálsamo de Arnica e Sândalo",
        scorePoints: 160,
        scoreCategory: "decisao",
        scoreReason: "Decisão crítica: decifrou a fórmula curativa (+30 HP)"
      },
      {
        id: "c-alch-search-drawer",
        label: "Vasculhar o compartimento secreto sob a bancada de granito",
        description: "Tatear cuidadosamente os encaixes ocultos da madeira secular em busca de relíquias.",
        targetScene: "alch_library",
        isWiseChoice: true,
        rewardItem: "Lente de Cristal Alquímico",
        scorePoints: 180,
        scoreCategory: "item",
        scoreReason: "Item oculto descoberto: Lente de Cristal Alquímico"
      },
      {
        id: "c-alch-drink-green",
        label: "Beber o líquido verde fosforescente achando que é tônico",
        description: "Ingerir às pressas o conteúdo ácido esperando obter energia mágica imediata.",
        targetScene: "alch_library",
        damageAmount: 30,
        hazardName: "Queimadura Corrosiva por Ácido",
        hazardDetails: "O líquido arde severamente na garganta e esôfago! O ácido tóxico provoca queimaduras químicas dolorosas.",
        scorePoints: 30,
        scoreCategory: "perigo",
        scoreReason: "Sobreviveu à queimadura de ácido alcalino"
      }
    ]
  },

  alch_library: {
    id: "alch_library",
    title: "A Biblioteca dos Manuscritos Selados",
    locationKicker: "Nível II • Arquivo de Alexandria Subterrâneo",
    storyPathName: "Trilha dos Alquimistas",
    narrativeText:
      "Prateleiras colossais de carvalho abrigam milhares de códices preservados pelo vácuo de cristais. No centro, uma porta rúnica com quatro compartimentos exige o encaixe ordenado das quatro essências elementais: Terra, Fogo, Água e Ar. Em um púlpito lateral, repousa uma adaga cerimonial de prata.",
    atmosphereText: "Partículas de pó dourado dançam nos feixes de luz que descem de pequenas claraboias ocultas.",
    milestonePoints: 150,
    milestoneName: "Decifração da Biblioteca Proibida",
    choices: [
      {
        id: "c-alch-riddle-correct",
        label: "Resolver o enigma das 4 essências pela ordem cosmológica clássica",
        description: "Encaixar os selos elementais guiando-se pela densidade natural da matéria.",
        targetScene: "alch_sanctuary",
        isWiseChoice: true,
        scorePoints: 200,
        scoreCategory: "decisao",
        scoreReason: "Decisão crítica: alinhou com perfeição as 4 essências cósmicas"
      },
      {
        id: "c-alch-examine-pulpit",
        label: "Inspecionar o púlpito com o mapa estelar encadernado em couro",
        description: "Examinar os mapas celestes desenhados à mão pelos primeiros astrônomos do colégio.",
        targetScene: "alch_sanctuary",
        isWiseChoice: true,
        rewardItem: "Papiro de Decifração das Runas",
        scorePoints: 170,
        scoreCategory: "item",
        scoreReason: "Item oculto descoberto: Papiro de Decifração das Runas"
      },
      {
        id: "c-alch-force-door",
        label: "Forçar a porta de carvalho com um pontapé no encaixe de bronze",
        description: "Tentar quebrar a tranca rúnica por impacto físico sem resolver o enigma.",
        targetScene: "alch_sanctuary",
        damageAmount: 35,
        hazardName: "Descarga de Eletricidade Arcana",
        hazardDetails: "O sistema de segurança dispara uma rajada estática violenta arremessando você contra os arquivos!",
        scorePoints: 40,
        scoreCategory: "perigo",
        scoreReason: "Resistiu ao choque do campo de defesa arcana"
      }
    ]
  },

  alch_sanctuary: {
    id: "alch_sanctuary",
    title: "O Santuário da Pedra Filosofal & O Códice da Sabedoria",
    locationKicker: "Nível Final • Câmara dos Mestres Alquimistas",
    storyPathName: "Trilha dos Alquimistas",
    narrativeText:
      "Você atinge o clímax da trilha alquímica! Diante de você, sob uma redoma de cristal iluminada por fogo perpétuo, repousa o Códice Dourado da Sabedoria Alquímica. Um guardião espectral ergue a mão em saudação e exige sua demonstração final de humildade e conhecimento para conceder a relíquia.",
    atmosphereText: "O ambiente vibra em tom harmônico e uma névoa suave restaura a fadiga do seu corpo.",
    milestonePoints: 300,
    milestoneName: "Consagração do Mestre Alquimista",
    choices: [
      {
        id: "c-alch-final-wise",
        label: "Recitar o juramento da preservação do saber ético com reverência",
        description: "Demonstrar maturidade e prometer utilizar o conhecimento exclusivamente para o bem comum.",
        targetScene: "victory",
        isWiseChoice: true,
        healAmount: 40,
        scorePoints: 250,
        scoreCategory: "marco",
        scoreReason: "Conquista Máxima: Consagrado Sábio Alquimista com Honra (+40 HP)"
      },
      {
        id: "c-alch-final-rush",
        label: "Avançar rapidamente e pegar o livro dourado da redoma",
        description: "Agir sem ouvir as palavras do espectro querendo levar o artefato logo para a superfície.",
        targetScene: "victory",
        damageAmount: 25,
        hazardName: "Barreira de Calor Radiante",
        hazardDetails: "A redoma queima suas mãos ao ser tocada abruptamente, mas o códice permanece intacto.",
        scorePoints: 120,
        scoreCategory: "perigo",
        scoreReason: "Resgatou o códice suportando a barreira de calor"
      }
    ]
  },

  // -------------------------------------------------------------
  // CAMINHO 2: ENGENHARIA & MECÂNICA DOS MESTRES
  // -------------------------------------------------------------
  eng_observatory: {
    id: "eng_observatory",
    title: "O Observatório das Engrenagens Subterrâneas",
    locationKicker: "Nível I • Sala das Turbinas & Astrolábios",
    storyPathName: "Rota da Engenharia",
    narrativeText:
      "Um vasto salão circular onde eixos de ferro maciço giram acionados por correntes de água subterrâneas. Um imenso planetário de latão com 12 discos zodiacais ocupa o centro. À esquerda, uma caixa de ferramentas esquecida pelos mestres maquinistas; à direita, uma alavanca de vapor sob pressão crítica com o manômetro na faixa vermelha.",
    atmosphereText: "O som metálico e cadenciado dos dentes de engrenagem ecoa como o coração pulsante da academia.",
    milestonePoints: 100,
    milestoneName: "Ativação do Observatório de Engrenagens",
    choices: [
      {
        id: "c-eng-align-gears",
        label: "Alinhar o astrolábio zodiacal pela proporção matemática dos 360 graus",
        description: "Girar as coroas de latão na velocidade exata sincronizando os ciclos solares e lunares.",
        targetScene: "eng_bridge",
        isWiseChoice: true,
        rewardItem: "Astrolábio Dourado dos Mestres",
        scorePoints: 170,
        scoreCategory: "decisao",
        scoreReason: "Decisão crítica: calibrou o planetário mecânico com precisão"
      },
      {
        id: "c-eng-toolbox",
        label: "Examinar a caixa de ferramentas de ferro fundido no canto",
        description: "Abrir o estojo de ferramentas e recuperar instrumentos de precisão dos construtores.",
        targetScene: "eng_bridge",
        isWiseChoice: true,
        rewardItem: "Chave Inglesa de Bronze e Calibrador",
        scorePoints: 160,
        scoreCategory: "item",
        scoreReason: "Item oculto descoberto: Chave Inglesa e Calibrador"
      },
      {
        id: "c-eng-force-steam",
        label: "Puxar a alavanca de vapor pressurizado com toda força",
        description: "Forçar a válvula travada para tentar acelerar o mecanismo sem aliviar a pressão.",
        targetScene: "eng_bridge",
        damageAmount: 30,
        hazardName: "Jato de Vapor Superaquecido",
        hazardDetails: "Uma junta de vedação se rompe! Vapor a 160°C atinge seu antebraço e tronco causando queimaduras!",
        scorePoints: 35,
        scoreCategory: "perigo",
        scoreReason: "Sobreviveu à explosão da válvula de alta pressão"
      }
    ]
  },

  eng_bridge: {
    id: "eng_bridge",
    title: "A Ponte Levadiça das Polias de Bronze",
    locationKicker: "Nível II • Garganta do Abismo Mecânico",
    storyPathName: "Rota da Engenharia",
    narrativeText:
      "Uma garganta profunda de rocha separa você do santuário central. A única travessia é uma ponte levadiça suspensa por cabos de aço e polias gigantescas. O sistema de contrapeso está emperrado por uma pedra calcificada na catraca mestra. No corrimão de ferro, você nota uma engrenagem entalhada com pedras preciosas.",
    atmosphereText: "O vento subterrâneo uiva no fundo do abismo, fazendo os cabos de tração vibrarem como cordas de violoncelo.",
    milestonePoints: 150,
    milestoneName: "Cruzamento da Ponte do Abismo",
    choices: [
      {
        id: "c-eng-solve-pulley",
        label: "Calcular o momento de força e remover a pedra com a alavanca correta",
        description: "Aplicar princípios de física mecânica para liberar o contrapeso sem desmoronar a ponte.",
        targetScene: "eng_vault",
        isWiseChoice: true,
        scorePoints: 210,
        scoreCategory: "decisao",
        scoreReason: "Decisão crítica: cálculo perfeito de torque mecânico para baixar a ponte"
      },
      {
        id: "c-eng-take-gear",
        label: "Resgatar com cuidado a Engrenagem de Safira incrustada no corrimão",
        description: "Utilizar ferramentas finas para desprender o componente precioso sem danificar a peça.",
        targetScene: "eng_vault",
        isWiseChoice: true,
        rewardItem: "Engrenagem Mestra de Safira",
        scorePoints: 180,
        scoreCategory: "item",
        scoreReason: "Item oculto descoberto: Engrenagem Mestra de Safira"
      },
      {
        id: "c-eng-jump-gears",
        label: "Tentar saltar por cima das polias e cabos em movimento",
        description: "Arriscar um salto perigoso sobre o abismo tentando se agarrar nas correntes giratórias.",
        targetScene: "eng_vault",
        damageAmount: 40,
        hazardName: "Impacto contra Eixo Rotativo de Bronze",
        hazardDetails: "Seus pés escorregam no óleo da engrenagem! Uma barra de bronze o atinge no peito antes de você se firmar!",
        scorePoints: 45,
        scoreCategory: "perigo",
        scoreReason: "Sobreviveu ao impacto violento dos eixos mecânicos"
      }
    ]
  },

  eng_vault: {
    id: "eng_vault",
    title: "O Cofre do Colosso Mecânico & O Códice da Inovação",
    locationKicker: "Nível Final • Câmara dos Autômatos Perpétuos",
    storyPathName: "Rota da Engenharia",
    narrativeText:
      "Você adentra uma câmara octogonal de mármore e latão polido. No centro, sobre um pedestal móvel acionado por pistões hidráulicos silenciosos, resplandece o Códice da Engenharia e Inovação. Diante dele repousa um Autômato de Bronze com uma fechadura geométrica no peitoral que aguarda a peça correta.",
    atmosphereText: "O mecanismo perpétuo emite um zumbido harmônico e relaxante que dissipa as dores da jornada.",
    milestonePoints: 300,
    milestoneName: "Conclusão da Obra-Prima dos Engenheiros",
    choices: [
      {
        id: "c-eng-insert-master-gear",
        label: "Acoplar as peças calibradas na fechadura geométrica do autômato",
        description: "Encaixar os dentes das engrenagens com precisão milimétrica ativando o mecanismo de entrega.",
        targetScene: "victory",
        isWiseChoice: true,
        healAmount: 40,
        scorePoints: 260,
        scoreCategory: "marco",
        scoreReason: "Conquista Máxima: Consagrado Mestre Engenheiro com Precisão Absoluta (+40 HP)"
      },
      {
        id: "c-eng-bypass-lock",
        label: "Tentar gazuar a fechadura com um pedaço de arame entortado",
        description: "Burlar a mecânica de precisão arriscando disparar as travas de segurança interna.",
        targetScene: "victory",
        damageAmount: 25,
        hazardName: "Disparo da Mola de Alta Tensão",
        hazardDetails: "Uma mola helicoidal salta do mecanismo e atinge seu rosto, mas o códice é liberado.",
        scorePoints: 110,
        scoreCategory: "perigo",
        scoreReason: "Liberou o códice resistindo ao recuo da mola"
      }
    ]
  },

  // -------------------------------------------------------------
  // CAMINHO 3: CATACUMBAS DAS SOMBRAS & RELÍQUIAS OCULTAS
  // -------------------------------------------------------------
  shadow_crypt: {
    id: "shadow_crypt",
    title: "A Cripta dos Reis Esquecidos",
    locationKicker: "Nível I • Mausoléu Subterrâneo",
    storyPathName: "Trilha das Sombras",
    narrativeText:
      "Tumbas de mármore negro perfilam-se sob um teto pontilhado de inscrições rúnicas quase apagadas pelo tempo. O piso é formado por ladrilhos com símbolos de Sol e Lua. Uma brisa fria apaga quase por completo a chama da sua tocha. No pedestal de uma estátua sem cabeça, repousa um amuleto reluzente.",
    atmosphereText: "Um silêncio sepulcral domina a cripta, quebrado apenas pela sua própria respiração controlada.",
    milestonePoints: 100,
    milestoneName: "Entrada na Cripta dos Fundadores",
    choices: [
      {
        id: "c-shadow-moon-steps",
        label: "Avançar pisando exclusivamente nos ladrilhos marcados com a Lua Crescente",
        description: "Interpretar o aviso fúnebre 'A luz da lua guia os passos de quem respeita o repouso ancestral'.",
        targetScene: "shadow_mirrors",
        isWiseChoice: true,
        healAmount: 25,
        scorePoints: 160,
        scoreCategory: "decisao",
        scoreReason: "Decisão crítica: leitura correta das trilhas seguras da cripta (+25 HP)"
      },
      {
        id: "c-shadow-amulet",
        label: "Recolher o Amuleto da Visão Noturna repousado no pedestal da estátua",
        description: "Examinar com reverência a efígie de pedra e retirar a joia encantada com cuidado.",
        targetScene: "shadow_mirrors",
        isWiseChoice: true,
        rewardItem: "Amuleto da Visão Noturna",
        scorePoints: 180,
        scoreCategory: "item",
        scoreReason: "Item oculto descoberto: Amuleto da Visão Noturna"
      },
      {
        id: "c-shadow-kick-sarcophagus",
        label: "Empurrar com pressa a tampa pesada do sarcófago de mármore",
        description: "Forçar a abertura da tumba na esperança de saquear tesouros sem analisar os fios de alarme.",
        targetScene: "shadow_mirrors",
        damageAmount: 35,
        hazardName: "Gás Sonífero e Dardos de Bronze",
        hazardDetails: "A tampa rompe um lacre cerâmico! Uma névoa tóxica e dardos ocultos disparam contra seu ombro!",
        scorePoints: 30,
        scoreCategory: "perigo",
        scoreReason: "Sobreviveu à armadilha de gás das tumbas"
      }
    ]
  },

  shadow_mirrors: {
    id: "shadow_mirrors",
    title: "O Labirinto dos Espelhos Ilusórios",
    locationKicker: "Nível II • Galeria das Refrações",
    storyPathName: "Trilha das Sombras",
    narrativeText:
      "Uma galeria monumental revestida de espelhos de prata polida cria reflexos infinitos da sua silhueta em todas as direções. Portas ilusórias multiplicam-se a cada passo, ameaçando desorientar qualquer viajante. No centro, uma chave de prata reluz suspensa no ar por um campo magnético tênue.",
    atmosphereText: "O crepitar da sua tocha rebate em centenas de reflexos dourados criando uma ilusão quase hipnótica.",
    milestonePoints: 150,
    milestoneName: "Superação do Labirinto de Espelhos",
    choices: [
      {
        id: "c-shadow-solve-reflection",
        label: "Projetar a sombra da tocha para identificar qual reflexo não tem distorção",
        description: "Usar princípios de óptica geométrica para encontrar a única passagem de pedra verdadeira.",
        targetScene: "shadow_throne",
        isWiseChoice: true,
        scorePoints: 200,
        scoreCategory: "decisao",
        scoreReason: "Decisão crítica: quebrou o labirinto óptico através da geometria da luz"
      },
      {
        id: "c-shadow-take-key",
        label: "Alcançar a Chave de Prata Magnética utilizando um tecido isolante",
        description: "Neutralizar o campo eletromagnético com luvas grossas para coletar a chave intacta.",
        targetScene: "shadow_throne",
        isWiseChoice: true,
        rewardItem: "Chave de Prata da Cripta Real",
        scorePoints: 190,
        scoreCategory: "item",
        scoreReason: "Item oculto descoberto: Chave de Prata da Cripta Real"
      },
      {
        id: "c-shadow-smash-mirror",
        label: "Dar golpes com a tocha no espelho da frente para ver se é parede",
        description: "Bater cegamente nos painéis de vidro e prata para tentar quebrar a ilusão na marreta.",
        targetScene: "shadow_throne",
        damageAmount: 35,
        hazardName: "Estilhaços Cortantes de Vidro e Prata",
        hazardDetails: "O espelho temperado explode sob o golpe! Centenas de lascas pontiagudas cortam suas mãos e rosto!",
        scorePoints: 35,
        scoreCategory: "perigo",
        scoreReason: "Resistiu à explosão de estilhaços reflexivos"
      }
    ]
  },

  shadow_throne: {
    id: "shadow_throne",
    title: "O Trono da Sabedoria Oculta & O Códice da Verdade",
    locationKicker: "Nível Final • Santuário Secreto dos Reis",
    storyPathName: "Trilha das Sombras",
    narrativeText:
      "No ápice das catacumbas, ergue-se o Trono de Obsidiana dos sábios fundadores. Sobre o assento almofadado de veludo azul-marinho, descansa o Códice da Sabedoria Oculta, emitindo uma suave luminescência prateada. Duas tochas mágicas azuis acendem-se automaticamente reconhecendo seu triunfo nas provações da furtividade e perspicácia.",
    atmosphereText: "O ar pesado das criptas dá lugar a uma brisa pura e fresca que recarrega seu vigor.",
    milestonePoints: 300,
    milestoneName: "Conquista do Trono das Sombras",
    choices: [
      {
        id: "c-shadow-final-reverence",
        label: "Aproximar-se do trono em silêncio solene e receber o códice com respeito",
        description: "Demonstrar a postura de um verdadeiro guardião da história que valoriza o legado esquecido.",
        targetScene: "victory",
        isWiseChoice: true,
        healAmount: 40,
        scorePoints: 260,
        scoreCategory: "marco",
        scoreReason: "Conquista Máxima: Consagrado Mestre das Sombras e Guardião Real (+40 HP)"
      },
      {
        id: "c-shadow-final-grab",
        label: "Pular no trono e arrancar o livro antes que qualquer estátua se mexa",
        description: "Agir com pressa temendo uma última armadilha escondida sob o veludo.",
        targetScene: "victory",
        damageAmount: 20,
        hazardName: "Espinhos Ocultos do Assento",
        hazardDetails: "Farpas na madeira entalhada ferem seus dedos, mas você segura o códice firmemente.",
        scorePoints: 120,
        scoreCategory: "perigo",
        scoreReason: "Conseguiu o códice superando as farpas do trono"
      }
    ]
  }
};

interface TextAdventureGameProps {
  onClose?: () => void;
  onToast?: (msg: string, type: "success" | "info" | "warning" | "error") => void;
  playerName?: string;
  locale?: string;
}

export const TextAdventureGame: React.FC<TextAdventureGameProps> = ({
  onClose,
  onToast,
  playerName = "Jovem Explorador(a)",
  locale = "pt",
}) => {
  const isEn = locale === "en";

  // Difficulty & Health States
  const [difficulty, setDifficulty] = useState<GameDifficulty>("explorador");
  const maxHealth = DIFFICULTY_CONFIG[difficulty].maxHp;
  const [currentHealth, setCurrentHealth] = useState<number>(maxHealth);
  
  // Game progression states
  const [currentSceneId, setCurrentSceneId] = useState<string>("entrance");
  const [gameState, setGameState] = useState<"playing" | "game_over" | "victory">("playing");
  
  // Scoring System States (starts at 0 points as requested!)
  const [score, setScore] = useState<number>(0);
  const [turnCount, setTurnCount] = useState<number>(1);
  const [lastTurnScoreGained, setLastTurnScoreGained] = useState<number>(0);
  const [lastScoreCategory, setLastScoreCategory] = useState<"decisao" | "item" | "marco" | "perigo" | null>(null);
  const [lastScoreReason, setLastScoreReason] = useState<string | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreLogEntry[]>([]);

  // Inventory & logs
  const [inventory, setInventory] = useState<string[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLogEntry[]>([]);
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Save Game states
  const [savedGame, setSavedGame] = useState<SavedGameState | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);

  // Read saved game from localStorage on component mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedGameState;
        if (parsed && parsed.currentSceneId && SCENES_PT[parsed.currentSceneId]) {
          setSavedGame(parsed);
        }
      }
    } catch {
      // LocalStorage access or parse error fallback
    }
  }, []);

  // Visual effects
  const [recentDamage, setRecentDamage] = useState<number | null>(null);
  const [recentHeal, setRecentHeal] = useState<number | null>(null);
  const [isHealthShaking, setIsHealthShaking] = useState(false);
  const [screenFlashColor, setScreenFlashColor] = useState<"red" | "green" | "gold" | null>(null);
  const [lastHazardInfo, setLastHazardInfo] = useState<{ name: string; details: string; amount: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Synthesizer via Web Audio API
  const playSfx = (type: "damage" | "heal" | "game_over" | "victory" | "click" | "score") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "damage") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === "heal") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (type === "score") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.29);
      } else if (type === "game_over") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.7);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.72);
      } else if (type === "victory") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85);
        osc.start();
        osc.stop(ctx.currentTime + 0.86);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch {
      // Audio fallback
    }
  };

  // Change Difficulty and reset Health & Score
  const handleSelectDifficulty = (newDiff: GameDifficulty) => {
    playSfx("click");
    setDifficulty(newDiff);
    const newMax = DIFFICULTY_CONFIG[newDiff].maxHp;
    setCurrentHealth(newMax);
    resetAdventure(newMax);
    onToast?.(`Dificuldade: ${DIFFICULTY_CONFIG[newDiff].label} (HP: ${newMax})!`, "info");
  };

  // Reset adventure to beginning with 0 score
  const resetAdventure = (initialHp = maxHealth) => {
    playSfx("click");
    setCurrentHealth(initialHp);
    setCurrentSceneId("entrance");
    setGameState("playing");
    setScore(0);
    setTurnCount(1);
    setLastTurnScoreGained(0);
    setLastScoreCategory(null);
    setLastScoreReason(null);
    setScoreHistory([]);
    setInventory([]);
    setLastHazardInfo(null);
    setRecentDamage(null);
    setRecentHeal(null);
    setHealthLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        type: "start",
        amount: initialHp,
        currentHp: initialHp,
        maxHp: initialHp,
        reason: "Início da expedição textual (0 pontos)",
        sceneTitle: "O Portal de Calcário"
      }
    ]);
  };

  // Save current progress to localStorage
  const handleSaveGame = () => {
    try {
      const activeScene = SCENES_PT[currentSceneId] || SCENES_PT.entrance;
      const now = new Date();
      const stateToSave: SavedGameState = {
        version: 1,
        savedAt: now.toISOString(),
        formattedDate: now.toLocaleDateString("pt-BR", { 
          day: "2-digit", 
          month: "2-digit", 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        playerName,
        difficulty,
        currentHealth,
        maxHealth,
        currentSceneId,
        sceneTitle: activeScene.title,
        storyPathName: activeScene.storyPathName,
        gameState,
        score,
        turnCount,
        lastTurnScoreGained,
        lastScoreCategory,
        lastScoreReason,
        scoreHistory,
        inventory,
        healthLogs
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(stateToSave));
      setSavedGame(stateToSave);
      playSfx("score");
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 2200);
      onToast?.(`Jogo salvo com sucesso! (${score} pts • Rodada #${turnCount})`, "success");
    } catch {
      onToast?.("Não foi possível salvar o jogo no navegador.", "error");
    }
  };

  // Resume / Load game from localStorage
  const handleLoadSavedGame = () => {
    if (!savedGame) return;
    try {
      const savedDiff = savedGame.difficulty || "explorador";
      setDifficulty(savedDiff);
      setCurrentHealth(savedGame.currentHealth ?? DIFFICULTY_CONFIG[savedDiff].maxHp);
      const targetScene = savedGame.currentSceneId && SCENES_PT[savedGame.currentSceneId] 
        ? savedGame.currentSceneId 
        : "entrance";
      setCurrentSceneId(targetScene);
      setGameState(savedGame.gameState || "playing");
      setScore(savedGame.score ?? 0);
      setTurnCount(savedGame.turnCount ?? 1);
      setLastTurnScoreGained(savedGame.lastTurnScoreGained ?? 0);
      setLastScoreCategory(savedGame.lastScoreCategory ?? null);
      setLastScoreReason(savedGame.lastScoreReason ?? null);
      setScoreHistory(savedGame.scoreHistory || []);
      setInventory(savedGame.inventory || []);
      setHealthLogs(savedGame.healthLogs || []);
      playSfx("heal");
      onToast?.(`Progresso restaurado! Cenário: ${savedGame.sceneTitle} (${savedGame.score} pts)`, "success");
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      onToast?.("Falha ao recuperar os dados do jogo salvo.", "error");
    }
  };

  // Delete saved game from localStorage
  const handleDeleteSavedGame = () => {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
      setSavedGame(null);
      playSfx("click");
      onToast?.("Progresso salvo excluído do navegador.", "info");
    } catch {
      // Ignore
    }
  };

  // Handle player choice execution
  const handleMakeChoice = (choice: AdventureChoice) => {
    playSfx("click");

    let nextHealth = currentHealth;
    let earnedThisTurn = 0;
    const nowTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // 1. Process Score from choice
    if (choice.scorePoints && choice.scorePoints > 0) {
      earnedThisTurn += choice.scorePoints;
    }

    // Check if target scene has milestone points
    const targetSceneObj = SCENES_PT[choice.targetScene];
    if (targetSceneObj?.milestonePoints) {
      earnedThisTurn += targetSceneObj.milestonePoints;
    }

    const newScore = score + earnedThisTurn;
    setScore(newScore);
    setLastTurnScoreGained(earnedThisTurn);
    setLastScoreCategory(choice.scoreCategory || "decisao");
    setLastScoreReason(choice.scoreReason || `Avançou para ${targetSceneObj?.title || 'Próximo Cenário'}`);

    // Register in score history
    if (earnedThisTurn > 0) {
      playSfx("score");
      setScoreHistory(prev => [
        {
          id: `score-${Date.now()}`,
          turn: turnCount,
          points: earnedThisTurn,
          total: newScore,
          reason: choice.scoreReason || `Decisão tomada na rodada ${turnCount}`,
          category: choice.scoreCategory || "decisao",
          sceneTitle: targetSceneObj?.title || "Nova Área",
          timestamp: nowTime
        },
        ...prev
      ]);
    }

    // 2. Process Damage Hazard
    if (choice.damageAmount && choice.damageAmount > 0) {
      const dmg = choice.damageAmount;
      nextHealth = Math.max(0, currentHealth - dmg);
      setCurrentHealth(nextHealth);
      
      playSfx("damage");
      setRecentDamage(dmg);
      setRecentHeal(null);
      setIsHealthShaking(true);
      setScreenFlashColor("red");
      
      if (choice.hazardName) {
        setLastHazardInfo({
          name: choice.hazardName,
          details: choice.hazardDetails || "Dano por perigo ou decisão imprudente.",
          amount: dmg
        });
      }

      setHealthLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: nowTime,
          type: "damage",
          amount: dmg,
          currentHp: nextHealth,
          maxHp: maxHealth,
          reason: choice.hazardName ? `${choice.hazardName}: ${choice.hazardDetails || choice.label}` : choice.label,
          sceneTitle: SCENES_PT[currentSceneId]?.title || "Exploração"
        },
        ...prev
      ]);

      setTimeout(() => setIsHealthShaking(false), 500);
      setTimeout(() => setScreenFlashColor(null), 600);
      setTimeout(() => setRecentDamage(null), 2500);

      onToast?.(`⚠️ Perigo! -${dmg} HP em "${choice.hazardName || 'Armadilha'}"! (+${earnedThisTurn} pts)`, "warning");
    } 
    // 3. Process Healing
    else if (choice.healAmount && choice.healAmount > 0) {
      const heal = choice.healAmount;
      const actualHealed = Math.min(heal, maxHealth - currentHealth);
      nextHealth = Math.min(maxHealth, currentHealth + heal);
      setCurrentHealth(nextHealth);

      playSfx("heal");
      setRecentHeal(actualHealed > 0 ? actualHealed : heal);
      setRecentDamage(null);
      setScreenFlashColor("green");

      setHealthLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: nowTime,
          type: "heal",
          amount: heal,
          currentHp: nextHealth,
          maxHp: maxHealth,
          reason: `Recuperação: ${choice.label}`,
          sceneTitle: SCENES_PT[currentSceneId]?.title || "Exploração"
        },
        ...prev
      ]);

      setTimeout(() => setScreenFlashColor(null), 600);
      setTimeout(() => setRecentHeal(null), 2500);

      onToast?.(`💚 +${heal} HP restaurados! (+${earnedThisTurn} pts acumulados)`, "success");
    } else {
      if (earnedThisTurn > 0) {
        onToast?.(`⭐ +${earnedThisTurn} pontos conquistados! Total: ${newScore} pts`, "info");
      }
    }

    // 4. Process Inventory Rewards
    if (choice.rewardItem && !inventory.includes(choice.rewardItem)) {
      setInventory(prev => [...prev, choice.rewardItem!]);
      onToast?.(`🎒 Novo item: ${choice.rewardItem}!`, "info");
    }

    // Increment turn count
    setTurnCount(prev => prev + 1);

    // 5. Check Game Over
    if (nextHealth <= 0) {
      playSfx("game_over");
      setGameState("game_over");
      onToast?.(`💀 Fim de jogo! Pontuação final obtida: ${newScore} pontos.`, "error");
      return;
    }

    // 6. Check Victory
    if (choice.targetScene === "victory") {
      playSfx("victory");
      setGameState("victory");
      onToast?.(`🏆 Vitória esplêndida! Pontuação final: ${newScore} pontos!`, "success");
      return;
    }

    // 7. Transition to next scene
    if (SCENES_PT[choice.targetScene]) {
      setCurrentSceneId(choice.targetScene);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Health calculations
  const healthPercent = Math.max(0, Math.min(100, Math.round((currentHealth / maxHealth) * 100)));
  const totalHearts = 5;
  const filledHearts = Math.ceil((currentHealth / maxHealth) * totalHearts);

  const currentScene = SCENES_PT[currentSceneId] || SCENES_PT.entrance;
  const diffLabel = DIFFICULTY_CONFIG[difficulty].label;

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      
      {/* Visual Screen Flash on Damage or Heal */}
      <AnimatePresence>
        {screenFlashColor === "red" && (
          <motion.div
            key="damage-flash"
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 z-50 ring-8 ring-inset ring-rose-600/60 bg-rose-950/20"
          />
        )}
        {screenFlashColor === "green" && (
          <motion.div
            key="heal-flash"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 z-50 ring-8 ring-inset ring-emerald-500/50 bg-emerald-950/20"
          />
        )}
      </AnimatePresence>

      {/* =========================================================================
          TOP NAVIGATION BAR (Title, Score Badge, Difficulty, Sound, Close)
          ========================================================================= */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                {isEn ? "Text Adventure RPG" : "Aventura Textual Gamificada"}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {diffLabel}
              </span>
            </div>
            <h2 className="text-base font-serif font-black text-slate-100 tracking-tight leading-tight">
              A Cripta do Conhecimento Perdido
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Prominent Current Score Badge in Navbar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold tracking-tight">
              {score} PTS
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSfx("click");
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? "Desativar som" : "Ativar som"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Log / Score History Drawer */}
          <button
            type="button"
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ver pontuação e histórico"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Histórico</span>
          </button>

          {/* Save Game Button */}
          <button
            type="button"
            onClick={handleSaveGame}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              saveFeedback 
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/60" 
                : "bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:text-slate-100"
            }`}
            title="Salvar progresso atual no navegador (localStorage)"
          >
            {saveFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Salvo!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Salvar</span>
              </>
            )}
          </button>

          {/* Load / Resume Saved Game Button in Navbar (if available) */}
          {savedGame && (
            <button
              type="button"
              onClick={handleLoadSavedGame}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={`Retomar jogo salvo em ${savedGame.formattedDate} (${savedGame.score} pts • Rodada #${savedGame.turnCount})`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Carregar ({savedGame.score} pts)</span>
            </button>
          )}

          {/* Restart Button */}
          <button
            type="button"
            onClick={() => resetAdventure()}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800 transition-colors cursor-pointer"
            title="Reiniciar aventura (0 pts)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SCORE & HEALTH STATUS CONSOLE (Rodada Atual, Pontos e Vida)
          ========================================================================= */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Health Section (col-span-7) */}
          <div className="md:col-span-7 flex items-center gap-3.5">
            <motion.div
              animate={isHealthShaking ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                healthPercent <= 25 
                  ? "bg-rose-950/80 border-rose-500/60 text-rose-400" 
                  : healthPercent <= 55 
                  ? "bg-amber-950/70 border-amber-500/50 text-amber-400" 
                  : "bg-emerald-950/70 border-emerald-500/50 text-emerald-400"
              }`}
            >
              <Heart className={`w-6 h-6 fill-current ${healthPercent <= 25 ? "animate-pulse" : ""}`} />
            </motion.div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 uppercase font-semibold">
                  Pontos de Vida:
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {currentHealth} / {maxHealth} HP ({healthPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    healthPercent <= 25 ? "bg-rose-500" : healthPercent <= 55 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${healthPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalHearts }).map((_, i) => (
                    <span key={i} className={`text-xs ${i < filledHearts ? "text-rose-500" : "text-slate-700"}`}>
                      ❤
                    </span>
                  ))}
                </div>
                <span>Explorador: <strong className="text-slate-200 font-sans">{playerName}</strong></span>
              </div>
            </div>
          </div>

          {/* Scoring Console (col-span-5) */}
          <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Pontuação Total
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-black text-amber-400">
                  {score}
                </span>
                <span className="text-xs text-slate-400 font-mono">pontos</span>
              </div>
            </div>

            <div className="text-right space-y-0.5 border-l border-slate-800 pl-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Rodada Atual
              </span>
              <span className="text-lg font-mono font-bold text-slate-200 block">
                #{turnCount}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          NARRATIVE SCENE & CHOICES CONTAINER WITH MOTION FRAME TRANSITIONS
          ========================================================================= */}
      <div ref={scrollRef} className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* GAME OVER STATE WITH CINEMATIC MOTION FRAME */}
          {gameState === "game_over" ? (
            <motion.div
              key="scene-frame-game-over"
              initial={{ opacity: 0, scale: 0.93, y: 22, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.93, y: -18, filter: "blur(4px)" }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 text-center space-y-5 rounded-2xl bg-rose-950/30 border border-rose-900/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 mx-auto flex items-center justify-center text-rose-400">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                  Jornada Interrompida
                </span>
                <h3 className="text-2xl font-serif font-black text-white">
                  Seus Pontos de Vida Chegaram a Zero
                </h3>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  As armadilhas e perigos das catacumbas sobrepujaram suas forças nesta expedição.
                </p>
              </div>

              {/* Final Scorecard */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 max-w-md mx-auto space-y-2 text-left">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Pontuação Conquistada:</span>
                  <strong className="text-amber-400 text-sm font-bold">{score} Pontos</strong>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Rodadas Sobrevividas:</span>
                  <strong className="text-slate-200">{turnCount}</strong>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Itens Descobertos:</span>
                  <strong className="text-slate-200">{inventory.length}</strong>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => resetAdventure()}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tentar Novamente (Reiniciar com 0 Pts)</span>
              </motion.button>
            </motion.div>
          ) : gameState === "victory" ? (
            /* VICTORY STATE WITH TRIUMPHANT MOTION FRAME */
            <motion.div
              key="scene-frame-victory"
              initial={{ opacity: 0, scale: 0.93, y: 22, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.93, y: -18, filter: "blur(4px)" }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 text-center space-y-5 rounded-2xl bg-emerald-950/30 border border-emerald-900/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-700 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Conquista Épica
                </span>
                <h3 className="text-3xl font-serif font-black text-white">
                  O Códice da Sabedoria foi Resgatado!
                </h3>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Parabéns, <strong>{playerName}</strong>! Você superou todas as provas e enigmas das catacumbas e conquistou a glória dos sábios da academia!
                </p>
              </div>

              {/* Detailed Final Scoreboard */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto space-y-3 text-left">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-2">
                  Boletim Final da Expedição
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Pontuação Total:</span>
                  <strong className="text-xl font-serif font-black text-amber-400">{score} Pontos</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Classificação Obtida:</span>
                  <strong className="text-emerald-400">
                    {score >= 800 ? "Lenda da Academia" : score >= 500 ? "Mestre Estrategista" : "Explorador Notável"}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Vida Restante:</span>
                  <strong className="text-slate-200">{currentHealth} / {maxHealth} HP</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Relíquias no Inventário:</span>
                  <strong className="text-slate-200">{inventory.length} itens</strong>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => resetAdventure()}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jogar Novamente por Outro Caminho</span>
              </motion.button>
            </motion.div>
          ) : (
            /* ACTIVE PLAYING SCENARIO WITH SMOOTH FRAME TRANSITIONS & STAGGERED CHOICES */
            <motion.div
              key={`scenario-frame-${currentSceneId}`}
              initial={{ opacity: 0, y: 18, scale: 0.985, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, scale: 0.985, filter: "blur(3px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 relative"
            >
              {/* Subtle Ambient Shimmer on Scenario Entry */}
              <div className="absolute -top-2 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/35 to-transparent pointer-events-none" />

              {/* Scenario Header Frame */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.05 }}
                className="space-y-2 border-b border-slate-800/80 pb-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    {currentScene.locationKicker}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentScene.storyPathName} · Rodada #{turnCount}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-100 tracking-tight">
                  {currentScene.title}
                </h3>
              </motion.div>

              {/* Narrative Scenario Text Frame */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.1 }}
                className="space-y-3 text-slate-300 text-sm sm:text-base leading-relaxed"
              >
                <p>{currentScene.narrativeText}</p>
                {currentScene.atmosphereText && (
                  <p className="text-xs sm:text-sm text-slate-400 italic bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                    "{currentScene.atmosphereText}"
                  </p>
                )}
              </motion.div>

              {/* SAVED GAME RESUME PROMPT (when saved game exists in localStorage) */}
              {savedGame && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <BookmarkCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                          Jogo Salvo Encontrado no Navegador
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100">
                          {savedGame.sceneTitle}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Salvo em: {savedGame.formattedDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">PONTUAÇÃO</span>
                      <strong className="text-amber-400 font-serif font-black text-sm">{savedGame.score} pts</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">RODADA</span>
                      <strong className="text-slate-200 font-mono text-sm">#{savedGame.turnCount}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">PONTOS DE VIDA</span>
                      <strong className="text-slate-200 font-mono text-sm">{savedGame.currentHealth} / {savedGame.maxHealth} HP</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">MOCHILA</span>
                      <strong className="text-slate-200 font-mono text-sm">{savedGame.inventory?.length || 0} itens</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleLoadSavedGame}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-98"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Continuar de Onde Parou ({savedGame.score} pts)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteSavedGame}
                      className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer hover:bg-rose-950/20"
                      title="Excluir o jogo salvo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Descartar Save</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Multiple Choices Section with Staggered Frame Animations */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Escolha sua próxima ação:
                </span>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.07, delayChildren: 0.12 }
                    }
                  }}
                  className="grid grid-cols-1 gap-3"
                >
                  {currentScene.choices.map((choice, idx) => (
                    <motion.button
                      key={choice.id}
                      variants={{
                        hidden: { opacity: 0, y: 10, scale: 0.99 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: "easeOut" } }
                      }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => handleMakeChoice(choice)}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors text-left flex items-start justify-between gap-4 group cursor-pointer"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono text-amber-400 font-bold flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                            {idx + 1}
                          </span>
                          <strong className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                            {choice.label}
                          </strong>
                        </div>
                        <p className="text-xs text-slate-400 pl-7">
                          {choice.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 pt-0.5">
                        {choice.scorePoints > 0 && (
                          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                            +{choice.scorePoints} pts
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* =========================================================================
                  TURN SCORE SUMMARY (Displays score to player at the end of each turn!)
                  ========================================================================= */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                      Pontuação nesta Rodada #{turnCount - 1 > 0 ? turnCount - 1 : 1}:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {lastTurnScoreGained > 0 ? (
                        <>+{lastTurnScoreGained} pontos conquistados ({lastScoreReason || "Avanço da história"})</>
                      ) : (
                        "Início da expedição com 0 pontos acumulados."
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Geral:</span>
                  <strong className="text-base font-serif font-black text-amber-400 font-mono">
                    {score} PTS
                  </strong>
                </div>
              </motion.div>

              {/* Inventory Badge Strip */}
              {inventory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2 border-t border-slate-850 flex items-center gap-2 flex-wrap"
                >
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Mochila ({inventory.length}):
                  </span>
                  {inventory.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium"
                    >
                      <Scroll className="w-3 h-3 text-amber-400" />
                      <span>{item}</span>
                    </span>
                  ))}
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* =========================================================================
          DRAWER: SCORE & HEALTH LOG DRAWER
          ========================================================================= */}
      <AnimatePresence>
        {showLogDrawer && (
          <div className="border-t border-slate-800 bg-slate-900/95 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
                  Histórico de Pontuação & Decisões da Expedição
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLogDrawer(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
              {scoreHistory.length === 0 ? (
                <p className="text-slate-500 italic text-center py-2">
                  Nenhum ponto registrado ainda. Faça sua primeira escolha para pontuar!
                </p>
              ) : (
                scoreHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500">
                        Rodada #{item.turn} · {item.timestamp} · {item.sceneTitle}
                      </span>
                      <p className="font-medium text-slate-200 text-xs">
                        {item.reason}
                      </p>
                    </div>
                    <span className="font-mono text-amber-400 font-bold shrink-0 ml-3">
                      +{item.points} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          FOOTER WITH DIFFICULTY SELECTOR
          ========================================================================= */}
      <div className="px-6 py-3.5 bg-slate-900/60 border-t border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase">Dificuldade:</span>
          {(["aprendiz", "explorador", "sobrevivente"] as GameDifficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleSelectDifficulty(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                difficulty === d
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {d === "aprendiz" ? "Aprendiz" : d === "explorador" ? "Explorador" : "Sobrevivente"}
            </button>
          ))}
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          3 Caminhos Disponíveis: Alquimia · Engenharia · Sombras
        </div>
      </div>

    </div>
  );
};

export default TextAdventureGame;
