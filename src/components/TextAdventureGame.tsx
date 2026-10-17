import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  Compass, 
  Flame, 
  Scroll, 
  CheckCircle2, 
  Skull, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Activity,
  History,
  Info
} from "lucide-react";

export type GameDifficulty = "aprendiz" | "explorador" | "sobrevivente";

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
}

export interface AdventureScene {
  id: string;
  title: string;
  locationKicker: string;
  narrativeText: string;
  atmosphereText?: string;
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

const SCENES: Record<string, AdventureScene> = {
  entrance: {
    id: "entrance",
    title: "O Portal de Calcário & As Três Passagens",
    locationKicker: "Catacumbas Subterrâneas • Nível I",
    narrativeText:
      "Você acende sua tocha diante do portal de calcário escuro esculpido há séculos sob a academia. Um vento gélido assobia pelas frestas. À esquerda, repousa uma alavanca enferrujada presa a correntes de bronze. À direita, uma fresta estreita e escura escorre água lodosa. No chão de pedra, você nota marcas tênues de ranhuras ocultas.",
    atmosphereText: "O silêncio é cortado apenas pelas gotas de água que caem ritmadamente na pedra fria.",
    choices: [
      {
        id: "c-entrance-wise",
        label: "Examinar minuciosamente o lintel e as ranhuras do piso",
        description: "Analisar as paredes em busca de mecanismos de segurança ocultos antes de interagir.",
        targetScene: "corridor",
        isWiseChoice: true,
        rewardItem: "Papiro de Decifração das Runas"
      },
      {
        id: "c-entrance-hazard-lever",
        label: "Puxar a alavanca enferrujada com força imediata",
        description: "Forçar o mecanismo mecânico de ferro para abrir a passagem principal às pressas.",
        targetScene: "corridor",
        damageAmount: 25,
        hazardName: "Armadilha de Dardos Ocultos",
        hazardDetails: "A tração violenta rompe um fio de aço! Uma saraivada de dardos pontiagudos dispara da parede oposta atingindo seu ombro!",
        isWiseChoice: false
      },
      {
        id: "c-entrance-hazard-crawl",
        label: "Rastejar às cegas pela fresta estreita e lodosa",
        description: "Ignorar o portal e tentar rastejar pela passagem subterrânea não iluminada.",
        targetScene: "corridor",
        damageAmount: 35,
        hazardName: "Fosso Oculto de Estacas",
        hazardDetails: "O piso sob a fresta cede instantaneamente! Você desaba em um fosso repleto de espinhos de madeira antes de conseguir se apoiar!",
        isWiseChoice: false
      }
    ]
  },
  corridor: {
    id: "corridor",
    title: "O Salão dos Ecos & As Vinhas Caústicas",
    locationKicker: "Galeria de Estalactites • Nível II",
    narrativeText:
      "Você alcança uma ampla galeria abobadada com estalactites cristalinas que vibram a qualquer vibração sonora. No centro, sobre um pedestal de mármore translúcido, repousa um cálice de prata com água cristalina fresca de nascente. À frente, duas portas: uma com enigma rúnico e outra bloqueada por espessas vinhas arcanas.",
    atmosphereText: "O ar é úmido e o aroma de minerais antigos preenche o ambiente subterrâneo.",
    choices: [
      {
        id: "c-corridor-heal",
        label: "Beber da água cristalina do cálice sagrado",
        description: "Aproximar-se do pedestal e beber a água límpida para recuperar o vigor.",
        targetScene: "corridor_split",
        healAmount: 30,
        isWiseChoice: true
      },
      {
        id: "c-corridor-shout",
        label: "Gritar bem alto para testar os ecos das paredes",
        description: "Tentar eco-localizar passagens secretas emitindo sons em alto volume.",
        targetScene: "corridor_split",
        damageAmount: 25,
        hazardName: "Queda de Estalactites Pontiagudas",
        hazardDetails: "A reverberação sonora desestabiliza a abóbada! Fragmentos afiados de rocha caem pesadamente sobre suas costas e ombros!",
        isWiseChoice: false
      },
      {
        id: "c-corridor-vines",
        label: "Rasgar as vinhas espinhosas com as mãos nuas",
        description: "Tentar puxar e quebrar a vegetação que bloqueia a passagem lateral sem proteção.",
        targetScene: "corridor_split",
        damageAmount: 30,
        hazardName: "Espinhos Venenosos Caústicos",
        hazardDetails: "A seiva das vinhas é altamente tóxica! Espinhos urticantes perfuram suas palmas causando queimaduras químicas intensas!",
        isWiseChoice: false
      }
    ]
  },
  corridor_split: {
    id: "corridor_split",
    title: "A Bifurcação das Catacumbas",
    locationKicker: "Entroncamento dos Mestres • Nível II",
    narrativeText:
      "Diante de você, o caminho se divide. À esquerda, uma porta de bronze com um enigma matemático gravado: 'Multiplique os lados de um triângulo (3) pelo número de estações do ano (4)'. À direita, uma escadaria de corda desce até um laboratório de alquimia repleto de vidrarias.",
    atmosphereText: "O tique-taque de engrenagens ancestrais soa por trás das paredes de pedra.",
    choices: [
      {
        id: "c-split-math-correct",
        label: "Inserir o código correto (12) no teclado de bronze",
        description: "Calcular 3 x 4 = 12 e pressionar as runas correspondentes com precisão.",
        targetScene: "mosaics",
        isWiseChoice: true
      },
      {
        id: "c-split-math-wrong",
        label: "Digitar um código aleatório qualquer (ex: 99)",
        description: "Apostar na sorte e tentar forçar a fechadura sem calcular.",
        targetScene: "mosaics",
        damageAmount: 30,
        hazardName: "Descarga de Alta Tensão Arcana",
        hazardDetails: "O mecanismo de segurança antifalhas dispara um raio azul através dos botões de bronze, eletrocutando seus braços!",
        isWiseChoice: false
      },
      {
        id: "c-split-to-lab",
        label: "Descer a escadaria de corda até o Laboratório Alquímico",
        description: "Investigar as bancadas de cerâmica e poções dos alquimistas antigos.",
        targetScene: "alchemy_lab",
        isWiseChoice: true
      }
    ]
  },
  alchemy_lab: {
    id: "alchemy_lab",
    title: "O Laboratório Alquímico Abandonado",
    locationKicker: "Oficina dos Mistérios • Nível III",
    narrativeText:
      "Bancadas de granito cobertas de frascos seculares, alambiques e pergaminhos esfarelados. Uma tubulação de vapor superaquecido vaza gás inflamável na extremidade. Sobre a mesa principal, repousam dois frascos selados com cera: um verde fosforescente com bolhas ácidas e um âmbar translúcido perfumado com flores medicinais.",
    atmosphereText: "O cheiro de enxofre e essências antigas preenche as sombras da oficina.",
    choices: [
      {
        id: "c-lab-heal-amber",
        label: "Abrir o frasco âmbar de bálsamo medicinal",
        description: "Aplicar o ungüento aromático sobre os machucados e escoriações acumuladas.",
        targetScene: "mosaics",
        healAmount: 40,
        rewardItem: "Bálsamo Regenerador de Arnica",
        isWiseChoice: true
      },
      {
        id: "c-lab-drink-green",
        label: "Beber o líquido verde borbulhante achando que é tônico",
        description: "Engolir o líquido fosforescente na esperança de ganhar super-força.",
        targetScene: "mosaics",
        damageAmount: 40,
        hazardName: "Queimadura por Ácido Alcalino",
        hazardDetails: "O líquido é ácido concentrado! Sua garganta e esôfago sofrem uma queimação corrosiva excruciante!",
        isWiseChoice: false
      },
      {
        id: "c-lab-touch-steam",
        label: "Tentar tampar o vazamento de vapor com a mão",
        description: "Aproximar-se da tubulação rachada para tentar silenciar o chiado ensurdecedor.",
        targetScene: "mosaics",
        damageAmount: 25,
        hazardName: "Jato de Vapor Superaquecido",
        hazardDetails: "Uma labareda de vapor a 180°C escapa da junta de cobre atingindo seu antebraço em cheio!",
        isWiseChoice: false
      }
    ]
  },
  mosaics: {
    id: "mosaics",
    title: "A Ponte das Placas de Pressão",
    locationKicker: "Ponte do Abismo • Nível III",
    narrativeText:
      "Você chega a uma ponte estreita suspensa sobre um abismo insondável. O piso é formado por mosaicos geométricos de quatro cores. Na parede de entrada, há uma inscrição de um sábio que instrui: 'Apenas os passos dourados sustentam a verdade'. Frestas nas paredes laterais revelam pontas de lanças mecânicas prontas para disparar.",
    atmosphereText: "Um vento ascendente sobe do fundo escuro do abismo fazendo a ponte oscilar.",
    choices: [
      {
        id: "c-mosaics-gold",
        label: "Pisar exclusivamente nos ladrilhos dourados centrais",
        description: "Seguir à risca as instruções do sábio preservando estabilidade e calma.",
        targetScene: "guardian_room",
        isWiseChoice: true
      },
      {
        id: "c-mosaics-run-blindly",
        label: "Correr em disparada no meio dos ladrilhos vermelhos e azuis",
        description: "Tentar cruzar a ponte o mais rápido possível sem prestar atenção nas cores.",
        targetScene: "guardian_room",
        damageAmount: 45,
        hazardName: "Acionamento Múltiplo de Lanças de Bronze",
        hazardDetails: "Seus passos desordenados ativam três placas de pressão simultâneas! Lanças afiadas perfuram dos lados atingindo suas pernas!",
        isWiseChoice: false
      },
      {
        id: "c-mosaics-rest",
        label: "Parar antes da ponte, respirar fundo e aplicar ataduras",
        description: "Fazer uma breve pausa estratégica para recompor a respiração e curar machucados.",
        targetScene: "guardian_room",
        healAmount: 20,
        isWiseChoice: true
      }
    ]
  },
  guardian_room: {
    id: "guardian_room",
    title: "O Santuário & O Autômato Guardião",
    locationKicker: "Câmara das Relíquias • Nível IV",
    narrativeText:
      "Você finalmente alcança o santuário final! No centro da sala circular, sob uma cúpula de cristais celestes, flutua o Códice Dourado da Sabedoria. No entanto, diante dele ergue-se um colossal Autômato de Bronze de três metros. Suas engrenagens giram com vigor e seus olhos emitem um brilho carmesim desafiador enquanto ele ergue sua maça colossal.",
    atmosphereText: "As chamas azuis nas tochas rúnicas crepitam anunciando o momento decisivo da missão.",
    choices: [
      {
        id: "c-guardian-riddle",
        label: "Decifrar o enigma gravado no peitoral do autômato",
        description: "'O que é seu, mas todos os seus amigos usam muito mais do que você? (Seu Nome)'.",
        targetScene: "victory",
        isWiseChoice: true
      },
      {
        id: "c-guardian-brute-attack",
        label: "Investir de frente com uma barra de ferro contra o guardião",
        description: "Tentar derrotar o colossal guerreiro de bronze com força bruta desmedida.",
        targetScene: "victory",
        damageAmount: 50,
        hazardName: "Impacto Esmagador da Maça de Bronze",
        hazardDetails: "Sua barra de ferro resvala inofensiva no metal reforçado! O guardião gira sua maça pesada arremessando você contra os pilares de pedra!",
        isWiseChoice: false
      },
      {
        id: "c-guardian-roll-dodge",
        label: "Rolar pelo chão entre as pernas do colosso em direção ao códice",
        description: "Usar agilidade acrobática para tentar escapar da mira da maça.",
        targetScene: "victory",
        damageAmount: 20,
        hazardName: "Onda de Choque de Detritos de Pedra",
        hazardDetails: "Você consegue esquivar do golpe direto, mas a maça estilhaça o piso de pedra gerando estilhaços que cortam seus braços!",
        isWiseChoice: false
      }
    ]
  }
};

const SCENES_EN: Record<string, AdventureScene> = {
  entrance: {
    id: "entrance",
    title: "The Limestone Portal & The Three Paths",
    locationKicker: "Subterranean Crypt • Level I",
    narrativeText:
      "You light your torch before the dark limestone portal carved centuries ago beneath the academy. A chilling wind whispers through the crevices. To the left rests a rusted lever attached to bronze chains. To the right, a narrow, dark crevice drips muddy water. On the stone floor, you notice faint hidden grooves.",
    atmosphereText: "The silence is broken only by rhythmic drops of cold water striking the limestone floor.",
    choices: [
      {
        id: "c-entrance-wise",
        label: "Carefully examine the lintel and floor grooves for hidden mechanisms",
        description: "Analyze the stone masonry for pressure triggers before touching anything.",
        targetScene: "corridor",
        isWiseChoice: true,
        rewardItem: "Ancient Rune Decryption Papyrus"
      },
      {
        id: "c-entrance-hazard-lever",
        label: "Pull the rusted lever with immediate force",
        description: "Force the rusted iron mechanism to quickly open the primary gate.",
        targetScene: "corridor",
        damageAmount: 25,
        hazardName: "Hidden Dart Wall Trap",
        hazardDetails: "The violent tension snaps a wire! A volley of poisoned darts shoots from the opposing wall striking your shoulder!",
        isWiseChoice: false
      },
      {
        id: "c-entrance-hazard-crawl",
        label: "Crawl blindly through the narrow muddy crevice",
        description: "Bypass the main portal and attempt crawling through the unlit underground gap.",
        targetScene: "corridor",
        damageAmount: 35,
        hazardName: "Hidden Wooden Spike Pit",
        hazardDetails: "The stone under the crevice gives way! You crash into a concealed pit of wooden spikes before catching yourself!",
        isWiseChoice: false
      }
    ]
  },
  corridor: {
    id: "corridor",
    title: "The Hall of Echoes & Caustic Vines",
    locationKicker: "Stalactite Gallery • Level II",
    narrativeText:
      "You reach a vast vaulted gallery with crystal stalactites vibrating with every sound wave. In the center, on a translucent marble pedestal, rests a silver chalice filled with fresh, crystal-clear spring water. Ahead, two archways: one inscribed with a math riddle and another blocked by thick caustic vines.",
    atmosphereText: "The air is humid and the scent of ancient minerals fills the subterranean chamber.",
    choices: [
      {
        id: "c-corridor-heal",
        label: "Drink the crystal-clear water from the sacred chalice",
        description: "Approach the pedestal and drink the pure spring water to restore your vitality.",
        targetScene: "corridor_split",
        healAmount: 30,
        isWiseChoice: true
      },
      {
        id: "c-corridor-shout",
        label: "Shout loudly to test the wall echoes",
        description: "Try to echo-locate hidden doorways by projecting your voice at high volume.",
        targetScene: "corridor_split",
        damageAmount: 25,
        hazardName: "Sharp Stalactite Cave-in",
        hazardDetails: "The sound vibration dislodges the ceiling! Sharp crystal rock fragments crash down heavily across your back!",
        isWiseChoice: false
      },
      {
        id: "c-corridor-vines",
        label: "Tear through the thorny vines with bare hands",
        description: "Pull and rip the vegetation blocking the side corridor without gloves or protection.",
        targetScene: "corridor_split",
        damageAmount: 30,
        hazardName: "Caustic Poisonous Thorns",
        hazardDetails: "The sap of the vines is toxic! Stinging thorns puncture your palms causing intense chemical burns!",
        isWiseChoice: false
      }
    ]
  },
  corridor_split: {
    id: "corridor_split",
    title: "The Junction of the Masters",
    locationKicker: "Scholars' Fork • Level II",
    narrativeText:
      "The path divides ahead. To the left is a bronze door engraved with a mathematical riddle: 'Multiply the sides of a triangle (3) by the number of seasons in a year (4)'. To the right, a rope ladder descends into an alchemical workshop filled with glassware.",
    atmosphereText: "The ticking of ancient clockwork gears echoes from behind the masonry walls.",
    choices: [
      {
        id: "c-split-math-correct",
        label: "Enter the correct calculation (12) on the bronze keypad",
        description: "Calculate 3 x 4 = 12 and press the matching runes with care.",
        targetScene: "mosaics",
        isWiseChoice: true
      },
      {
        id: "c-split-math-wrong",
        label: "Type a random guess (e.g., 99) without calculating",
        description: "Rely on luck and attempt to force the lock without doing the math.",
        targetScene: "mosaics",
        damageAmount: 30,
        hazardName: "Arcane High-Voltage Discharge",
        hazardDetails: "The anti-tamper security trigger releases a jolt of blue electricity through the bronze buttons into your arms!",
        isWiseChoice: false
      },
      {
        id: "c-split-to-lab",
        label: "Descend the rope ladder into the Alchemical Laboratory",
        description: "Explore the ancient potion workbenches and distillation equipment.",
        targetScene: "alchemy_lab",
        isWiseChoice: true
      }
    ]
  },
  alchemy_lab: {
    id: "alchemy_lab",
    title: "The Abandoned Alchemical Laboratory",
    locationKicker: "Workshop of Mysteries • Level III",
    narrativeText:
      "Granite workbenches covered in centuries-old vials, alembics, and aged scrolls. A superheated steam pipe leaks flammable gas at the far wall. On the main bench rest two sealed glass phials: one glowing green with acidic bubbles, and another amber and scented with medicinal herbal balm.",
    atmosphereText: "The smell of sulfur and ancient herbal extracts lingers in the workshop shadows.",
    choices: [
      {
        id: "c-lab-heal-amber",
        label: "Open the amber vial of medicinal healing balm",
        description: "Apply the soothing ointment over accumulated wounds and abrasions.",
        targetScene: "mosaics",
        healAmount: 40,
        rewardItem: "Regenerative Arnica Salve",
        isWiseChoice: true
      },
      {
        id: "c-lab-drink-green",
        label: "Drink the bubbling green liquid thinking it's an energy tonic",
        description: "Swallow the glowing liquid hoping for a superpower boost.",
        targetScene: "mosaics",
        damageAmount: 40,
        hazardName: "Alkaline Acid Chemical Burn",
        hazardDetails: "The liquid is corrosive acid! Your throat and esophagus suffer intense burning pain!",
        isWiseChoice: false
      },
      {
        id: "c-lab-touch-steam",
        label: "Try to block the steam pipe leak with your bare hand",
        description: "Approach the cracked brass pipe to stifle the deafening hiss.",
        targetScene: "mosaics",
        damageAmount: 25,
        hazardName: "Superheated Steam Jet",
        hazardDetails: "A jet of 180°C steam bursts from the copper joint severely scorching your forearm!",
        isWiseChoice: false
      }
    ]
  },
  mosaics: {
    id: "mosaics",
    title: "The Bridge of Pressure Plates",
    locationKicker: "Abyss Bridge • Level III",
    narrativeText:
      "You reach a narrow stone walkway suspended over an unfathomable abyss. The floor consists of four-colored geometric tiles. An engraved plaque advises: 'Only golden steps uphold the truth'. Slits in the side walls conceal bronze spears primed to fire.",
    atmosphereText: "An updraft from the black chasm causes the suspended walkway to gently sway.",
    choices: [
      {
        id: "c-mosaics-gold",
        label: "Step exclusively on the central golden tiles",
        description: "Follow the scholar's instructions with calm precision and balance.",
        targetScene: "guardian_room",
        isWiseChoice: true
      },
      {
        id: "c-mosaics-run-blindly",
        label: "Sprint recklessly across the red and blue tiles",
        description: "Try to cross as fast as possible without looking at the tile colors.",
        targetScene: "guardian_room",
        damageAmount: 45,
        hazardName: "Multiple Bronze Wall Spears",
        hazardDetails: "Your hurried steps trigger three pressure plates at once! Sharp bronze spears stab out from the wall!",
        isWiseChoice: false
      },
      {
        id: "c-mosaics-rest",
        label: "Rest before the bridge, breathe deeply and apply bandages",
        description: "Take a strategic pause to steady your nerves and treat scrapes.",
        targetScene: "guardian_room",
        healAmount: 20,
        isWiseChoice: true
      }
    ]
  },
  guardian_room: {
    id: "guardian_room",
    title: "The Sanctum & The Automaton Guardian",
    locationKicker: "Chamber of Relics • Level IV",
    narrativeText:
      "You reach the ultimate sanctum! Under a celestial crystal dome floats the Golden Codex of Wisdom. Before it stands a ten-foot Bronze Automaton. Its brass gears whir with power and its crimson eyes glow as it raises a massive battle mace.",
    atmosphereText: "Blue flames crackle in the runic braziers announcing the final challenge of the quest.",
    choices: [
      {
        id: "c-guardian-riddle",
        label: "Solve the riddle carved into the automaton's chest plate",
        description: "'What belongs to you, but everyone else uses it more than you? (Your Name)'.",
        targetScene: "victory",
        isWiseChoice: true
      },
      {
        id: "c-guardian-brute-attack",
        label: "Charge head-on with an iron crowbar against the guardian",
        description: "Attempt to overpower the colossal bronze warrior with brute force.",
        targetScene: "victory",
        damageAmount: 50,
        hazardName: "Crushing Blow of the Bronze Mace",
        hazardDetails: "Your iron bar glances harmlessly off the reinforced armor! The guardian swings its massive mace tossing you into the stone pillars!",
        isWiseChoice: false
      },
      {
        id: "c-guardian-roll-dodge",
        label: "Dodge-roll between the colossus's legs toward the codex",
        description: "Use acrobatic agility to escape the mace's strike zone.",
        targetScene: "victory",
        damageAmount: 20,
        hazardName: "Stone Shrapnel Shockwave",
        hazardDetails: "You evade the direct blow, but the mace shatters the floor hurling sharp rock shards across your arms!",
        isWiseChoice: false
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
  
  // Inventory & stats
  const [inventory, setInventory] = useState<string[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLogEntry[]>([]);
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Animations & Visual Feedback states
  const [recentDamage, setRecentDamage] = useState<number | null>(null);
  const [recentHeal, setRecentHeal] = useState<number | null>(null);
  const [isHealthShaking, setIsHealthShaking] = useState(false);
  const [screenFlashColor, setScreenFlashColor] = useState<"red" | "green" | null>(null);
  const [lastHazardInfo, setLastHazardInfo] = useState<{ name: string; details: string; amount: number } | null>(null);

  // Scene history for back-tracking or logging
  const [visitedScenes, setVisitedScenes] = useState<string[]>(["entrance"]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Synthesizer via Web Audio API
  const playSfx = (type: "damage" | "heal" | "game_over" | "victory" | "click") => {
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
        // Deep low frequency punch/crunch for damage
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === "heal") {
        // High harmonic rising arpeggio for recovery
        osc.type = "sine";
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (type === "game_over") {
        // Mournful descending sequence
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.7);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.72);
      } else if (type === "victory") {
        // Triumphant chime
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
        osc.start();
        osc.stop(ctx.currentTime + 0.66);
      } else {
        // Subtle interface tap
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch {
      // Audio fallback silent
    }
  };

  // Change Difficulty and reset Health accordingly
  const handleSelectDifficulty = (newDiff: GameDifficulty) => {
    playSfx("click");
    setDifficulty(newDiff);
    const newMax = DIFFICULTY_CONFIG[newDiff].maxHp;
    setCurrentHealth(newMax);
    resetAdventure(newMax);
    onToast?.(`Dificuldade alterada para ${DIFFICULTY_CONFIG[newDiff].label} (Vida Máx: ${newMax} HP)!`, "info");
  };

  // Reset adventure to beginning
  const resetAdventure = (initialHp = maxHealth) => {
    playSfx("click");
    setCurrentHealth(initialHp);
    setCurrentSceneId("entrance");
    setGameState("playing");
    setInventory([]);
    setLastHazardInfo(null);
    setVisitedScenes(["entrance"]);
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
        reason: "Início da expedição com saúde plena",
        sceneTitle: "O Portal de Calcário"
      }
    ]);
  };

  // Handle player making a decision
  const handleMakeChoice = (choice: AdventureChoice) => {
    playSfx("click");

    let nextHealth = currentHealth;
    const nowTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // 1. Process Hazard / Poor Decision Damage
    if (choice.damageAmount && choice.damageAmount > 0) {
      const dmg = choice.damageAmount;
      nextHealth = Math.max(0, currentHealth - dmg);
      setCurrentHealth(nextHealth);
      
      // Trigger animations & audio
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

      // Add to log
      setHealthLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: nowTime,
          type: "damage",
          amount: dmg,
          currentHp: nextHealth,
          maxHp: maxHealth,
          reason: choice.hazardName ? `${choice.hazardName}: ${choice.hazardDetails || choice.label}` : choice.label,
          sceneTitle: SCENES[currentSceneId]?.title || "Exploração"
        },
        ...prev
      ]);

      setTimeout(() => setIsHealthShaking(false), 500);
      setTimeout(() => setScreenFlashColor(null), 600);
      setTimeout(() => setRecentDamage(null), 2500);

      onToast?.(`⚠️ Perigo! Você perdeu -${dmg} HP em "${choice.hazardName || 'Decisão Imprudente'}"!`, "warning");
    } 
    // 2. Process Restorative / Healing Decision
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
          sceneTitle: SCENES[currentSceneId]?.title || "Exploração"
        },
        ...prev
      ]);

      setTimeout(() => setScreenFlashColor(null), 600);
      setTimeout(() => setRecentHeal(null), 2500);

      onToast?.(`💚 Recuperação! +${heal} HP restaurados com sucesso!`, "success");
    }

    // 3. Process Inventory Item Rewards
    if (choice.rewardItem && !inventory.includes(choice.rewardItem)) {
      setInventory(prev => [...prev, choice.rewardItem!]);
      onToast?.(`🎒 Novo item obtido: ${choice.rewardItem}!`, "info");
    }

    // 4. Check for Game Over (Health Depletion)
    if (nextHealth <= 0) {
      playSfx("game_over");
      setGameState("game_over");
      onToast?.("💀 Sua saúde chegou a 0 HP! Você sucumbiu aos perigos da cripta.", "error");
      return;
    }

    // 5. Check for Victory Scene
    if (choice.targetScene === "victory") {
      playSfx("victory");
      setGameState("victory");
      onToast?.("🏆 Parabéns! Você superou os perigos e resgatou o Códice da Sabedoria!", "success");
      return;
    }

    // 6. Transition to next narrative scene
    if (SCENES[choice.targetScene]) {
      setCurrentSceneId(choice.targetScene);
      setVisitedScenes(prev => [...prev, choice.targetScene]);
      // Scroll to top of narration container
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Health statistics & color calculations
  const healthPercent = Math.max(0, Math.min(100, Math.round((currentHealth / maxHealth) * 100)));
  
  let healthToneColor = "emerald";
  let healthStatusLabel = isEn ? "Excellent Health" : "Excelente Saúde";
  if (currentHealth <= 0) {
    healthToneColor = "slate";
    healthStatusLabel = isEn ? "Unconscious (0 HP)" : "Inconsciente (0 HP)";
  } else if (healthPercent <= 25) {
    healthToneColor = "rose";
    healthStatusLabel = isEn ? "CRITICAL CONDITION!" : "ESTADO CRÍTICO!";
  } else if (healthPercent <= 55) {
    healthToneColor = "amber";
    healthStatusLabel = isEn ? "Injured / Caution" : "Ferido / Atenção";
  } else if (healthPercent < 85) {
    healthToneColor = "emerald";
    healthStatusLabel = isEn ? "Stable / Light Wounds" : "Estável / Ferimento Leve";
  }

  // Heart representation (5 hearts)
  const totalHearts = 5;
  const filledHearts = Math.ceil((currentHealth / maxHealth) * totalHearts);

  const activeSceneDict = isEn ? SCENES_EN : SCENES;
  const currentScene = activeSceneDict[currentSceneId] || activeSceneDict.entrance;

  const diffLabel = isEn
    ? (difficulty === "aprendiz" ? "Apprentice Mode" : difficulty === "explorador" ? "Explorer Mode (Default)" : "Survivor Mode")
    : DIFFICULTY_CONFIG[difficulty].label;

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      
      {/* 🔴 RED DAMAGE SCREEN FLASH & 🟢 GREEN HEAL GLOW VIGNETTE */}
      <AnimatePresence>
        {screenFlashColor === "red" && (
          <motion.div
            key="damage-flash-vignette"
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-50 ring-8 ring-inset ring-rose-600/60 bg-rose-950/20 backdrop-blur-3xs"
          />
        )}
        {screenFlashColor === "green" && (
          <motion.div
            key="heal-flash-vignette"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-50 ring-8 ring-inset ring-emerald-500/50 bg-emerald-950/20 backdrop-blur-3xs"
          />
        )}
      </AnimatePresence>

      {/* =========================================================================
          TOP NAVIGATION BAR (Title, Sound Toggle, Rules, Close)
          ========================================================================= */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                {isEn ? "Interactive Text Adventure" : "Aventura Textual Interativa"}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {diffLabel}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-tight leading-tight">
              {isEn ? "The Crypt of Lost Knowledge" : "A Cripta do Conhecimento Perdido"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Rules / Help Button */}
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title={isEn ? "View health system and hazard rules" : "Ver regras do Sistema de Vida e Perigos"}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSfx("click");
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? (isEn ? "Mute sound effects" : "Desativar efeitos sonoros") : (isEn ? "Enable sound effects" : "Ativar efeitos sonoros")}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Health Log Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isEn ? "Health and damage log" : "Histórico de dano e decisões"}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isEn ? "Health Log" : "Histórico HP"}</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-400">
              {healthLogs.length}
            </span>
          </button>

          {/* Restart Adventure Button */}
          <button
            type="button"
            onClick={() => resetAdventure()}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800 transition-colors cursor-pointer"
            title={isEn ? "Restart adventure from beginning" : "Reiniciar aventura do início"}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Modal Close Button if provided */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              {isEn ? "Close" : "Fechar"}
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          ❤️ PROMINENT HEALTH DISPLAY SYSTEM (Bar, Numerics, Hearts & Damage Float)
          ========================================================================= */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main Health Counter & Hearts */}
          <div className="flex items-center gap-3.5">
            {/* Animated Heart Icon Box with shake on damage */}
            <motion.div
              animate={
                isHealthShaking 
                  ? { x: [0, -8, 8, -6, 6, -3, 3, 0], scale: [1, 1.15, 0.95, 1] } 
                  : healthPercent <= 25 
                    ? { scale: [1, 1.12, 1] } 
                    : {}
              }
              transition={
                isHealthShaking 
                  ? { duration: 0.4 } 
                  : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              }
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-colors duration-300 ${
                healthPercent <= 25
                  ? "bg-rose-950/80 border-rose-500/60 text-rose-400 shadow-rose-950/50"
                  : healthPercent <= 55
                    ? "bg-amber-950/70 border-amber-500/50 text-amber-400 shadow-amber-950/40"
                    : "bg-emerald-950/70 border-emerald-500/50 text-emerald-400 shadow-emerald-950/40"
              }`}
            >
              <Heart className={`w-6 h-6 fill-current ${healthPercent <= 25 ? "animate-pulse" : ""}`} />
            </motion.div>

            {/* Readout Numbers & Status Label */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? "Health Points (HP):" : "Pontos de Vida (HP):"}
                </span>
                
                {/* Status Condition Badge */}
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  healthPercent <= 25
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse"
                    : healthPercent <= 55
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                }`}>
                  {healthStatusLabel}
                </span>
              </div>

              {/* Numerical HP Display with Tabular Numerals */}
              <div className="flex items-center gap-2 mt-0.5 relative">
                <span className="text-2xl font-black font-mono tracking-tight tabular-nums text-white">
                  {currentHealth}
                </span>
                <span className="text-sm font-mono text-slate-500 font-bold">
                  / {maxHealth} HP
                </span>

                {/* Floating Damage Indicator */}
                <AnimatePresence>
                  {recentDamage !== null && (
                    <motion.span
                      key={`damage-${recentDamage}`}
                      initial={{ opacity: 0, y: 0, scale: 0.8 }}
                      animate={{ opacity: 1, y: -16, scale: 1.15 }}
                      exit={{ opacity: 0, y: -24 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="absolute -top-3 left-28 px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-black text-xs shadow-md border border-rose-400/60 pointer-events-none"
                    >
                      -{recentDamage} HP 🩸
                    </motion.span>
                  )}
                  {recentHeal !== null && (
                    <motion.span
                      key={`heal-${recentHeal}`}
                      initial={{ opacity: 0, y: 0, scale: 0.8 }}
                      animate={{ opacity: 1, y: -16, scale: 1.15 }}
                      exit={{ opacity: 0, y: -24 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="absolute -top-3 left-28 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-black text-xs shadow-md border border-emerald-400/60 pointer-events-none"
                    >
                      +{recentHeal} HP 💚
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* 5-Heart Icon Segments */}
              <div className="flex items-center gap-1 mt-1 text-xs">
                {Array.from({ length: totalHearts }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 transition-colors duration-300 ${
                      i < filledHearts
                        ? healthPercent <= 25
                          ? "text-rose-500 fill-rose-500"
                          : healthPercent <= 55
                            ? "text-amber-500 fill-amber-500"
                            : "text-emerald-500 fill-emerald-500"
                        : "text-slate-700 fill-slate-800"
                    }`}
                  />
                ))}
                <span className="text-[10px] font-mono text-slate-400 ml-1.5 tabular-nums">
                  ({healthPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Health Bar Progress & Difficulty Selector */}
          <div className="flex-1 max-w-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{isEn ? "Vital Integrity" : "Integridade Vital"}</span>
              <span className="tabular-nums font-bold text-slate-300">
                {currentHealth} {isEn ? "of" : "de"} {maxHealth} HP
              </span>
            </div>

            {/* The Dynamic Health Bar with Smooth Width Transition */}
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-750 shadow-inner">
              <motion.div
                initial={{ width: `${healthPercent}%` }}
                animate={{ width: `${healthPercent}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full transition-colors duration-500 shadow-sm ${
                  healthPercent <= 25
                    ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-rose-500/50"
                    : healthPercent <= 55
                      ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-amber-500/50"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-emerald-500/50"
                }`}
              />
            </div>

            {/* Quick Difficulty Selector Pills */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-500 font-mono">
                {isEn ? "Difficulty:" : "Dificuldade:"}
              </span>
              {(["aprendiz", "explorador", "sobrevivente"] as GameDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleSelectDifficulty(diff)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                    difficulty === diff
                      ? "bg-slate-700 text-white font-bold border border-slate-600"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                  }`}
                >
                  {isEn
                    ? (diff === "aprendiz" ? "Apprentice" : diff === "explorador" ? "Explorer" : "Survivor")
                    : (diff.charAt(0).toUpperCase() + diff.slice(1))} ({DIFFICULTY_CONFIG[diff].maxHp} HP)
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Hazard Alert Card (if player just incurred damage) */}
        <AnimatePresence>
          {lastHazardInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5 text-rose-200 text-xs shadow-md"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 font-mono text-[11px] uppercase tracking-wider">
                    ⚠️ {lastHazardInfo.name} (-{lastHazardInfo.amount} HP)
                  </span>
                  <button
                    type="button"
                    onClick={() => setLastHazardInfo(null)}
                    className="text-[10px] text-rose-400 hover:text-white underline cursor-pointer"
                  >
                    {isEn ? "Dismiss" : "Dispensar"}
                  </button>
                </div>
                <p className="text-[11px] text-rose-200/90 mt-0.5 leading-snug">
                  {lastHazardInfo.details}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          MAIN GAME PLAY AREA (Narrative, Choices, Victory, Game Over)
          ========================================================================= */}
      <div 
        ref={scrollRef} 
        className="p-6 md:p-8 space-y-6 max-h-[58vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        
        {/* =====================================================================
            STATE 1: GAME OVER (HP DEPLETED)
            ===================================================================== */}
        {gameState === "game_over" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 px-4 space-y-5"
          >
            <div className="w-20 h-20 rounded-3xl bg-rose-950/80 border-2 border-rose-500/60 text-rose-400 mx-auto flex items-center justify-center shadow-2xl">
              <Skull className="w-10 h-10 animate-bounce" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {isEn ? "Vital Health Depleted • 0 HP" : "Esgotamento de Saúde Vital • 0 HP"}
              </span>
              <h3 className="text-2xl font-black text-white font-serif tracking-tight">
                {isEn ? "You Succumbed to the Crypt Hazards" : "Você Sucumbiu aos Perigos da Cripta"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isEn
                  ? "Your health points dropped to zero due to hazardous choices and triggered dungeon traps. Darkness swallows your steps temporarily."
                  : "Seus pontos de vida chegaram a zero devido a decisões imprudentes e armadilhas ativadas no labirinto subterrâneo. A escuridão das ruínas engole seus passos temporariamente."}
              </p>
              {lastHazardInfo && (
                <div className="bg-slate-900 border border-rose-900/60 p-3 rounded-xl text-left text-xs text-slate-300 mt-3">
                  <span className="text-[10px] font-mono text-rose-400 font-bold block uppercase">
                    {isEn ? "Fatal Cause:" : "Causa Fatal:"}
                  </span>
                  <strong className="text-white">{lastHazardInfo.name}</strong>: {lastHazardInfo.details}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => resetAdventure()}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {isEn
                    ? `Revive with ${maxHealth} HP & Try Again`
                    : `Reviver com ${maxHealth} HP & Tentar Novamente`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDifficulty("aprendiz")}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Switch to Apprentice Mode (120 HP)" : "Mudar para Modo Aprendiz (120 HP)"}
              </button>
            </div>
          </motion.div>
        )}

        {/* =====================================================================
            STATE 2: VICTORY (SANCTUM REACHED WITH HEALTH REMAINING)
            ===================================================================== */}
        {gameState === "victory" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 px-4 space-y-5"
          >
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400/60 text-amber-300 mx-auto flex items-center justify-center shadow-2xl">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {isEn ? "Mission Accomplished with Success!" : "Missão Cumprida com Sucesso!"}
              </span>
              <h3 className="text-2xl font-black text-white font-serif tracking-tight">
                {isEn ? "The Golden Codex of Wisdom is Yours!" : "O Códice Dourado da Sabedoria é Seu!"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isEn
                  ? `Congratulations, ${playerName}! With wisdom, prudence, and quick thinking in the face of ancient perils, you completed the journey while keeping your vitality!`
                  : `Parabéns, ${playerName}! Com perspicácia, prudência e discernimento diante dos perigos ancestrais, você completou a jornada mantendo sua integridade física!`}
              </p>
            </div>

            {/* Victory Scorecard */}
            <div className="max-w-sm mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  {isEn ? "Remaining Health:" : "Saúde Restante:"}
                </span>
                <span className="text-lg font-black font-mono text-emerald-400 tabular-nums">
                  {currentHealth} / {maxHealth} HP
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  {isEn ? "Difficulty:" : "Dificuldade:"}
                </span>
                <span className="text-sm font-bold text-white uppercase font-mono">
                  {isEn ? (difficulty === "aprendiz" ? "Apprentice" : difficulty === "explorador" ? "Explorer" : "Survivor") : difficulty}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  {isEn ? "Recovered Items:" : "Itens Resgatados:"}
                </span>
                <span className="text-xs text-slate-200">
                  {inventory.length > 0 ? inventory.join(", ") : (isEn ? "No items collected" : "Nenhum item recolhido")}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => resetAdventure()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? "Play Again / Explore Another Path" : "Jogar Novamente / Explorar Outro Caminho"}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* =====================================================================
            STATE 3: ACTIVE PLAYING NARRATIVE & DECISION CHOICES
            ===================================================================== */}
        {gameState === "playing" && (
          <div className="space-y-6">
            
            {/* Scene Header & Location Kicker */}
            <div className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>{currentScene.locationKicker}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
                {currentScene.title}
              </h3>
            </div>

            {/* Narrative Story Prose */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-3">
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-serif font-normal">
                {currentScene.narrativeText}
              </p>
              {currentScene.atmosphereText && (
                <p className="text-xs text-slate-400 italic font-sans border-l-2 border-amber-500/40 pl-3">
                  {currentScene.atmosphereText}
                </p>
              )}
            </div>

            {/* Decision Choices Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? "What Do You Choose To Do?" : "O Que Você Decide Fazer?"}</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentScene.choices.length} {isEn ? "available choices" : "caminhos possíveis"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {currentScene.choices.map((choice, index) => {
                  const hasDamage = choice.damageAmount && choice.damageAmount > 0;
                  const hasHeal = choice.healAmount && choice.healAmount > 0;

                  return (
                    <motion.button
                      key={choice.id}
                      onClick={() => handleMakeChoice(choice)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                        hasDamage
                          ? "bg-slate-900/80 border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/20"
                          : hasHeal
                            ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20"
                            : "bg-slate-900/80 border-slate-800 hover:border-amber-400/50 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                          {index + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors font-sans">
                              {choice.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                          </div>

                          <p className="text-xs text-slate-400 mt-1 leading-normal font-sans">
                            {choice.description}
                          </p>

                          {/* Subtle Decision Context Clue */}
                          <div className="flex items-center gap-2 mt-2">
                            {hasDamage && (
                              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                {isEn ? `⚠️ Hazard Risk (${choice.hazardName || 'Imminent Danger'})` : `⚠️ Risco de Dano (${choice.hazardName || 'Perigo Iminente'})`}
                              </span>
                            )}
                            {hasHeal && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {isEn ? `💚 Health Recovery Chance (+${choice.healAmount} HP)` : `💚 Chance de Recuperação de Saúde (+${choice.healAmount} HP)`}
                              </span>
                            )}
                            {choice.isWiseChoice && !hasHeal && (
                              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                {isEn ? "🔍 Cautious & Analytical Approach" : "🔍 Abordagem Cautelosa & Investigativa"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Inventory Bag Strip */}
            {inventory.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    {isEn ? "Expedition Backpack:" : "Mochila de Expedição:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {inventory.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md text-slate-200"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* =========================================================================
          HEALTH HISTORY LOG DRAWER (Expandable)
          ========================================================================= */}
      <AnimatePresence>
        {showLogDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 bg-slate-900/95 p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  {isEn ? "Health, Hazards & Decision Log" : "Registro de Saúde, Perigos e Decisões"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLogDrawer(false)}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                {isEn ? "Close Log" : "Fechar Painel"}
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
              {healthLogs.length === 0 ? (
                <p className="text-slate-500 text-xs italic">
                  {isEn ? "No health changes recorded yet." : "Nenhuma alteração de saúde registrada ainda."}
                </p>
              ) : (
                healthLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px]"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-slate-500 text-[10px] tabular-nums shrink-0">{log.timestamp}</span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0 ${
                          log.type === "damage"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : log.type === "heal"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        }`}
                      >
                        {log.type === "damage" ? `-${log.amount} HP` : log.type === "heal" ? `+${log.amount} HP` : "RESET"}
                      </span>
                      <span className="text-slate-300 truncate">{log.reason}</span>
                    </div>
                    <span className="text-slate-400 font-bold tabular-nums ml-2 shrink-0">
                      {log.currentHp}/{log.maxHp} HP
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INFO MODAL: RULES OF THE HEALTH SYSTEM
          ========================================================================= */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-bold text-white font-sans">
                    {isEn ? "How the Health (HP) System Works" : "Como Funciona o Sistema de Vida (HP)"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 font-mono uppercase block text-[10px]">
                    {isEn ? "1. Starting Health Pool:" : "1. Quantidade Inicial de Vida:"}
                  </span>
                  <p>
                    {isEn
                      ? "You begin your journey with a fixed health amount based on the selected difficulty (e.g., 100 HP in Explorer Mode)."
                      : "Você inicia a aventura com uma quantidade fixa de saúde definida pela dificuldade selecionada (ex: 100 HP no Modo Explorador)."}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-rose-400 font-mono uppercase block text-[10px]">
                    {isEn ? "2. Health Loss from Hazards & Traps:" : "2. Perda de Vida por Perigos & Decisões Ruins:"}
                  </span>
                  <p>
                    {isEn
                      ? "Impulsive choices (such as forcing rusty levers, touching acid, or rushing blindly) trigger hazards dealing variable damage (-20 to -50 HP) with health bar tremors and screen flashes."
                      : "Ao tomar decisões imprudentes (como tocar em substâncias desconhecidas, forçar alavancas ou correr às cegas), armadilhas e perigos causam dano variável (-20 HP a -50 HP), acompanhados de tremor na barra de vida e flash de alerta."}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 font-mono uppercase block text-[10px]">
                    {isEn ? "3. Restorative Actions & Healing:" : "3. Decisões Restauradoras & Cura:"}
                  </span>
                  <p>
                    {isEn
                      ? "Careful inspection, drinking from sacred springs, or using discovered salves restores vitality (+20 to +40 HP), up to your maximum HP limit."
                      : "Investigar com calma, beber de fontes sagradas ou encontrar bálsamos medicinais recupera sua saúde (+20 HP a +40 HP), até o limite máximo de vida."}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-purple-400 font-mono uppercase block text-[10px]">
                    {isEn ? "4. Defeat at 0 HP:" : "4. Derrota aos 0 HP:"}
                  </span>
                  <p>
                    {isEn
                      ? "If your health drops to zero, you succumb to the crypt hazards and can restart or revive to choose different paths!"
                      : "Se seus pontos de vida chegarem a zero, você é derrotado e deve reiniciar ou reviver para tentar novos caminhos!"}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isEn ? "Understood, Return to Adventure" : "Entendi, Voltar à Aventura"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TextAdventureGame;
