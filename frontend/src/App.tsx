import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  options?: string[];
}

interface TestCategory {
  id: string;
  name: string;
  description: string;
}

interface Weather {
  temp: number;
  description: string;
  icon: string;
}

const CATEGORY_INTROS: {[key: string]: {[key: string]: string}} = {
  fr: {
    alimentation: "Parlons de ce qui nourrit ton corps et ton âme! 🍽️",
    orientation: "Découvrons ensemble la direction qui t'appelle! 🎯",
    culturel: "Plongeons dans l'univers de tes passions créatives! 🎭",
    leadership: "Explorons ton potentiel de meneur! 👑",
    creativite: "Libérons ta créativité sans limites! 🎨",
    stress: "Apprends à cultiver ta sérénité! 🧘",
    mode: "Exprime ton style unique! ✨",
    cinema: "Plongeons dans le monde du septième art! 🎬",
    objets: "Découvre ce qui t'attire vraiment! 💎",
    couleurs: "Voyons le monde à travers tes yeux! 🌈",
    animaux: "Rencontre ton animal intérieur! 🦁",
    mbti: "Décode les secrets de ta personnalité! 🔍",
    lieux_batiments: "Où te sens-tu vraiment chez toi? 🏛️",
    sport: "Découvre ton esprit d'athlète! ⚽",
  },
  en: {
    alimentation: "Let's talk about what nourishes you! 🍽️",
    orientation: "Discover the path that calls you! 🎯",
    culturel: "Dive into your creative universe! 🎭",
    leadership: "Explore your leadership potential! 👑",
    creativite: "Unleash your unlimited creativity! 🎨",
    stress: "Learn to cultivate your serenity! 🧘",
    mode: "Express your unique style! ✨",
    cinema: "Dive into the world of cinema! 🎬",
    objets: "Discover what truly attracts you! 💎",
    couleurs: "See the world through your eyes! 🌈",
    animaux: "Meet your inner animal! 🦁",
    mbti: "Decode the secrets of your personality! 🔍",
    lieux_batiments: "Where do you truly feel at home? 🏛️",
    sport: "Discover your athlete spirit! ⚽",
  },
};

const TEST_CATEGORIES_GOUTS: TestCategory[] = [
  { id: "mode", name: "Mode", description: "Ton style de mode et préférences vestimentaires" },
  { id: "animaux", name: "Animaux", description: "Tes animaux préférés et affinités animalières" },
  { id: "alimentation", name: "Alimentation", description: "Tes habitudes et préférences alimentaires" },
  { id: "couleurs", name: "Couleurs", description: "Tes préférences de couleurs favorites" },
  { id: "objets", name: "Objets", description: "Tes goûts pour les objets et accessoires" },
  { id: "lieux_batiments", name: "Lieux et bâtiments", description: "Tes préférences pour les lieux et les styles architecturaux" },
  { id: "sport", name: "Sport", description: "Tes préférences sportives et d'activités physiques" },
  { id: "culturel", name: "Culturel", description: "Tes goûts et préférences culturels" },
];

const TEST_CATEGORIES_ORIENTATION: TestCategory[] = [
  { id: "mbti", name: "MBTI", description: "Découvre ton type de personnalité parmi les 16" },
  { id: "orientation", name: "Orientation", description: "Ton orientation professionnelle et scolaire" },
];

const CATEGORIES_TRANSLATIONS: {[key: string]: {[key: string]: {name: string, description: string}}} = {
  fr: {
    alimentation: { name: "Alimentation", description: "Tes habitudes et préférences alimentaires" },
    orientation: { name: "Orientation", description: "Ton orientation professionnelle et scolaire" },
    culturel: { name: "Culturel", description: "Tes goûts et préférences culturels" },
    leadership: { name: "Leadership", description: "Ton style de leader et influence" },
    creativite: { name: "Créativité", description: "Ton niveau de créativité et innovation" },
    stress: { name: "Gestion du stress", description: "Comment tu gères le stress et l'anxiété" },
    mode: { name: "Mode", description: "Ton style de mode et préférences vestimentaires" },
    cinema: { name: "Cinéma", description: "Ton genre de film et style cinématographique préféré" },
    objets: { name: "Objets", description: "Tes goûts pour les objets et accessoires" },
    couleurs: { name: "Couleurs", description: "Tes préférences de couleurs favorites" },
    animaux: { name: "Animaux", description: "Tes animaux préférés et affinités animalières" },
    mbti: { name: "MBTI", description: "Découvre ton type de personnalité parmi les 16" },
    lieux_batiments: { name: "Lieux et bâtiments", description: "Tes préférences pour les lieux et les styles architecturaux" },
    sport: { name: "Sport", description: "Tes préférences sportives et d'activités physiques" },
  },
  es: {
    alimentation: { name: "Alimentación", description: "Tus hábitos y preferencias alimentarias" },
    orientation: { name: "Orientación", description: "Tu orientación profesional y académica" },
    culturel: { name: "Cultural", description: "Tus gustos y preferencias culturales" },
    leadership: { name: "Liderazgo", description: "Tu estilo de liderazgo e influencia" },
    creativite: { name: "Creatividad", description: "Tu nivel de creatividad e innovación" },
    stress: { name: "Gestión del estrés", description: "Cómo manejas el estrés y la ansiedad" },
    mode: { name: "Moda", description: "Tu estilo de moda y preferencias de vestuario" },
    cinema: { name: "Cine", description: "Tu género de película y estilo cinematográfico preferido" },
    objets: { name: "Objetos", description: "Tus gustos por objetos y accesorios" },
    couleurs: { name: "Colores", description: "Tus preferencias de colores favoritos" },
    animaux: { name: "Animales", description: "Tus animales preferidos y afinidades animales" },
    mbti: { name: "MBTI", description: "Descubre tu tipo de personalidad entre los 16" },
    lieux_batiments: { name: "Lugares y edificios", description: "Tus preferencias por lugares y estilos arquitectónicos" },
    sport: { name: "Deporte", description: "Tus preferencias deportivas y de actividades físicas" },
  },
  it: {
    alimentation: { name: "Alimentazione", description: "Le tue abitudini e preferenze alimentari" },
    orientation: { name: "Orientamento", description: "Il tuo orientamento professionale e scolastico" },
    culturel: { name: "Culturale", description: "I tuoi gusti e preferenze culturali" },
    leadership: { name: "Leadership", description: "Il tuo stile di leader e influenza" },
    creativite: { name: "Creatività", description: "Il tuo livello di creatività e innovazione" },
    stress: { name: "Gestione dello stress", description: "Come gestisci lo stress e l'ansia" },
    mode: { name: "Moda", description: "Il tuo stile di moda e preferenze di abbigliamento" },
    cinema: { name: "Cinema", description: "Il tuo genere di film e stile cinematografico preferito" },
    objets: { name: "Oggetti", description: "I tuoi gusti per oggetti e accessori" },
    couleurs: { name: "Colori", description: "Le tue preferenze di colori preferiti" },
    animaux: { name: "Animali", description: "I tuoi animali preferiti e affinità animali" },
    mbti: { name: "MBTI", description: "Scopri il tuo tipo di personalità tra i 16" },
    lieux_batiments: { name: "Luoghi ed edifici", description: "Le tue preferenze per luoghi e stili architettonici" },
    sport: { name: "Sport", description: "Le tue preferenze sportive e di attività fisiche" },
  },
  zh: {
    alimentation: { name: "饮食", description: "你的饮食习惯和偏好" },
    orientation: { name: "职业方向", description: "你的职业和学业方向" },
    culturel: { name: "文化", description: "你的文化品味和偏好" },
    leadership: { name: "领导力", description: "你的领导风格和影响力" },
    creativite: { name: "创意", description: "你的创意和创新水平" },
    stress: { name: "压力管理", description: "你如何管理压力和焦虑" },
    mode: { name: "时尚", description: "你的时尚风格和服装偏好" },
    cinema: { name: "电影", description: "你最喜欢的电影类型和电影风格" },
    objets: { name: "物品", description: "你对物品和配饰的品味" },
    couleurs: { name: "颜色", description: "你最喜欢的颜色偏好" },
    animaux: { name: "动物", description: "你最喜欢的动物和动物亲和力" },
    mbti: { name: "MBTI", description: "发现你在16种性格类型中的类型" },
    lieux_batiments: { name: "地点和建筑", description: "你对地点和建筑风格的偏好" },
    sport: { name: "运动", description: "你的体育和身体活动偏好" },
  },
  ru: {
    alimentation: { name: "Питание", description: "Ваши пищевые привычки и предпочтения" },
    orientation: { name: "Ориентация", description: "Ваша профессиональная и школьная ориентация" },
    culturel: { name: "Культура", description: "Ваши культурные вкусы и предпочтения" },
    leadership: { name: "Лидерство", description: "Ваш стиль лидера и влияние" },
    creativite: { name: "Креативность", description: "Ваш уровень креативности и инноваций" },
    stress: { name: "Управление стрессом", description: "Как вы справляетесь со стрессом и беспокойством" },
    mode: { name: "Мода", description: "Ваш стиль моды и предпочтения в одежде" },
    cinema: { name: "Кинематография", description: "Ваш предпочитаемый жанр фильмов и кинематографический стиль" },
    objets: { name: "Предметы", description: "Ваши вкусы к предметам и аксессуарам" },
    couleurs: { name: "Цвета", description: "Ваши предпочитаемые цветовые предпочтения" },
    animaux: { name: "Животные", description: "Ваши любимые животные и сходство с животными" },
    mbti: { name: "MBTI", description: "Откройте свой тип личности из 16" },
    lieux_batiments: { name: "Места и здания", description: "Ваши предпочтения для мест и архитектурных стилей" },
    sport: { name: "Спорт", description: "Ваши спортивные предпочтения и предпочтения физической активности" },
  },
  pt: {
    alimentation: { name: "Alimentação", description: "Seus hábitos e preferências alimentares" },
    orientation: { name: "Orientação", description: "Sua orientação profissional e acadêmica" },
    culturel: { name: "Cultural", description: "Seus gostos e preferências culturais" },
    leadership: { name: "Liderança", description: "Seu estilo de liderança e influência" },
    creativite: { name: "Criatividade", description: "Seu nível de criatividade e inovação" },
    stress: { name: "Gerenciamento de estresse", description: "Como você lida com o estresse e a ansiedade" },
    mode: { name: "Moda", description: "Seu estilo de moda e preferências de vestuário" },
    cinema: { name: "Cinema", description: "Seu gênero de filme e estilo cinematográfico preferido" },
    objets: { name: "Objetos", description: "Seus gostos por objetos e acessórios" },
    couleurs: { name: "Cores", description: "Suas preferências de cores favoritas" },
    animaux: { name: "Animais", description: "Seus animais preferidos e afinidades animais" },
    mbti: { name: "MBTI", description: "Descubra seu tipo de personalidade entre os 16" },
    lieux_batiments: { name: "Lugares e edifícios", description: "Suas preferências por locais e estilos arquitetônicos" },
    sport: { name: "Esporte", description: "Suas preferências esportivas e de atividades físicas" },
  },
  he: {
    alimentation: { name: "תזונה", description: "ההרגלים ההעדפות התזונתיות שלך" },
    orientation: { name: "הכוונה", description: "ההנחיה המקצועית והחינוכית שלך" },
    culturel: { name: "תרבותי", description: "הטעמים וההעדפות התרבותיים שלך" },
    leadership: { name: "הנהגה", description: "סגנון המנהיגות וההשפעה שלך" },
    creativite: { name: "יצירתיות", description: "רמת היצירתיות וההחדשנות שלך" },
    stress: { name: "ניהול לחץ", description: "כיצד אתה מתמודד עם לחץ וחרדה" },
    mode: { name: "אופנה", description: "סגנון האופנה והעדפות הלבוש שלך" },
    cinema: { name: "קולנוע", description: "סוג הסרטים וסגנון הקולנוע המועדף שלך" },
    objets: { name: "חפצים", description: "הטעמים שלך לעצמים ואביזרים" },
    couleurs: { name: "צבעים", description: "העדפות הצבעים המועדפים שלך" },
    animaux: { name: "חיות", description: "החיות המועדפות שלך וקשר החיות" },
    mbti: { name: "MBTI", description: "גלה את סוג האישיות שלך מתוך 16" },
    lieux_batiments: { name: "מקומות ובניינים", description: "ההעדפות שלך למקומות וסגנונות אדריכליים" },
    sport: { name: "ספורט", description: "ההעדפות הספורטיביות והפעילויות הגופניות שלך" },
  },
  el: {
    alimentation: { name: "Διατροφή", description: "Οι διατροφικές σας συνήθειες και προτιμήσεις" },
    orientation: { name: "Προσανατολισμός", description: "Ο επαγγελματικός και σχολικός σας προσανατολισμός" },
    culturel: { name: "Πολιτιστικό", description: "Ο πολιτιστικός σας γούστο και προτιμήσεις" },
    leadership: { name: "Ηγεσία", description: "Ο στυλ ηγεσίας και επιρροής σας" },
    creativite: { name: "Δημιουργικότητα", description: "Το επίπεδο δημιουργικότητας και καινοτομίας σας" },
    stress: { name: "Διαχείριση άγχους", description: "Πώς χειρίζεστε το άγχος και το άγχος" },
    mode: { name: "Μόδα", description: "Ο στυλ μόδας σας και προτιμήσεις ρούχων" },
    cinema: { name: "Κινηματογραφία", description: "Το αγαπημένο σας είδος ταινιών και κινηματογραφικό στυλ" },
    objets: { name: "Αντικείμενα", description: "Τα γούστα σας για αντικείμενα και αξεσουάρ" },
    couleurs: { name: "Χρώματα", description: "Οι προτιμήσεις χρώματος που σας αρέσουν" },
    animaux: { name: "Ζώα", description: "Τα αγαπημένα ζώα σας και συγγένεια ζώων" },
    mbti: { name: "MBTI", description: "Ανακαλύψτε τον τύπο προσωπικότητάς σας από τα 16" },
    lieux_batiments: { name: "Τοποθεσίες και κτίρια", description: "Οι προτιμήσεις σας για τοποθεσίες και αρχιτεκτονικά στυλ" },
    sport: { name: "Άθλημα", description: "Οι αθλητικές σας προτιμήσεις και φυσική δραστηριότητα" },
  },
  en: {
    alimentation: { name: "Food", description: "Your eating habits and food preferences" },
    orientation: { name: "Career", description: "Your career and educational orientation" },
    culturel: { name: "Culture", description: "Your cultural tastes and preferences" },
    leadership: { name: "Leadership", description: "Your leadership style and influence" },
    creativite: { name: "Creativity", description: "Your creativity and innovation level" },
    stress: { name: "Stress", description: "How you handle stress and anxiety" },
    mode: { name: "Fashion", description: "Your fashion style and clothing preferences" },
    cinema: { name: "Cinema", description: "Your favorite movie genre and cinematographic style" },
    objets: { name: "Objects", description: "Your taste for objects and accessories" },
    couleurs: { name: "Colors", description: "Your favorite color preferences" },
    animaux: { name: "Animals", description: "Your favorite animals and animal affinities" },
    mbti: { name: "MBTI", description: "Discover your personality type among the 16" },
    lieux_batiments: { name: "Places & Buildings", description: "Your preferences for places and architectural styles" },
    sport: { name: "Sports", description: "Your sports and physical activity preferences" },
  },
  de: {
    alimentation: { name: "Essen", description: "Deine Essgewohnheiten und Vorlieben" },
    orientation: { name: "Karriere", description: "Deine berufliche und schulische Orientierung" },
    culturel: { name: "Kultur", description: "Deine Kulturgeschmack und Vorlieben" },
    leadership: { name: "Führung", description: "Dein Führungsstil und Einfluss" },
    creativite: { name: "Kreativität", description: "Dein Kreativitäts- und Innovationsniveau" },
    stress: { name: "Stress", description: "Wie du mit Stress und Angst umgehen" },
    mode: { name: "Mode", description: "Dein Modestil und Kleidungspräferenzen" },
    cinema: { name: "Kino", description: "Dein Lieblingsfilmgenre und Filmstil" },
    objets: { name: "Objekte", description: "Dein Geschmack für Objekte und Accessoires" },
    couleurs: { name: "Farben", description: "Deine Lieblingsfarben-Vorlieben" },
    animaux: { name: "Tiere", description: "Deine Lieblingstiere und Tieraffinitäten" },
    mbti: { name: "MBTI", description: "Entdecke deinen Persönlichkeitstyp unter den 16" },
    lieux_batiments: { name: "Orte & Gebäude", description: "Deine Vorlieben für Orte und Architekturstile" },
    sport: { name: "Sport", description: "Deine Sport- und Bewegungsaktivitätspräferenzen" },
  },
};

const LeafIllustration = () => {
  const leafVariants = [
    // Feuille d'érable détaillée
    <svg viewBox="0 0 100 100" key="1" style={{width: '40px', height: '40px'}}>
      <defs>
        <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      <path d="M50 5 L60 20 L72 18 L65 32 L80 38 L62 42 L72 58 L55 48 L60 70 L50 55 L40 70 L45 48 L28 58 L38 42 L20 38 L35 32 L28 18 L40 20 Z" fill="url(#leafGrad1)" stroke="#3a2a0a" strokeWidth="0.8" strokeLinejoin="round"/>
      <path d="M50 30 L50 55 M40 35 L55 45 M60 35 L45 45" stroke="#3a2a0a" strokeWidth="0.5" opacity="0.5"/>
    </svg>,
    // Feuille de chêne réaliste
    <svg viewBox="0 0 100 100" key="2" style={{width: '35px', height: '45px'}}>
      <defs>
        <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.65"/>
        </linearGradient>
      </defs>
      <path d="M50 10 Q65 20 68 35 Q70 45 65 55 Q60 70 50 80 Q40 70 35 55 Q30 45 32 35 Q35 20 50 10" fill="url(#leafGrad2)" stroke="#2a1a0a" strokeWidth="0.8"/>
      <path d="M50 15 Q62 22 64 32 M50 15 Q38 22 36 32 M50 25 L50 75 M45 30 Q42 45 45 60 M55 30 Q58 45 55 60 M42 40 L58 40 M42 50 L58 50 M42 60 L58 60" stroke="#2a1a0a" strokeWidth="0.4" opacity="0.4"/>
    </svg>,
    // Feuille pointue avec nervures
    <svg viewBox="0 0 100 100" key="3" style={{width: '30px', height: '50px'}}>
      <defs>
        <linearGradient id="leafGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6"/>
        </linearGradient>
      </defs>
      <path d="M50 8 Q62 25 62 50 Q62 72 50 88 Q38 72 38 50 Q38 25 50 8" fill="url(#leafGrad3)" stroke="#1a0a00" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M50 12 L50 85 M48 20 Q46 35 48 55 Q50 68 50 85 M52 20 Q54 35 52 55 Q50 68 50 85 M45 30 L55 30 M44 45 L56 45 M45 60 L55 60" stroke="#1a0a00" strokeWidth="0.35" opacity="0.5"/>
    </svg>,
    // Feuille de peuplier avec dégradé
    <svg viewBox="0 0 100 100" key="4" style={{width: '32px', height: '48px'}}>
      <defs>
        <linearGradient id="leafGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.98"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.65"/>
        </linearGradient>
      </defs>
      <path d="M50 8 Q65 20 67 45 Q68 65 50 88 Q32 65 33 45 Q35 20 50 8" fill="url(#leafGrad4)" stroke="#2a1a0a" strokeWidth="0.8" strokeLinejoin="round"/>
      <path d="M50 12 L50 82 M46 18 Q44 35 46 55 Q48 70 50 82 M54 18 Q56 35 54 55 Q52 70 50 82 M47 28 L53 28 M46 42 L54 42 M46 58 L54 58 M47 70 L53 70" stroke="#2a1a0a" strokeWidth="0.4" opacity="0.45"/>
    </svg>,
    // Feuille ronde avec contours
    <svg viewBox="0 0 100 100" key="5" style={{width: '38px', height: '42px'}}>
      <defs>
        <linearGradient id="leafGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.92"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.68"/>
        </linearGradient>
      </defs>
      <path d="M50 10 Q70 20 72 40 Q72 62 50 85 Q28 62 28 40 Q30 20 50 10" fill="url(#leafGrad5)" stroke="#3a2a1a" strokeWidth="0.9" strokeLinejoin="round"/>
      <path d="M50 15 L50 80 M40 25 Q35 45 40 65 M60 25 Q65 45 60 65 M38 35 L62 35 M37 50 L63 50 M38 65 L62 65" stroke="#3a2a1a" strokeWidth="0.4" opacity="0.5"/>
    </svg>,
  ];
  return leafVariants[Math.floor(Math.random() * leafVariants.length)];
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"menu" | "test" | "result" | "free_chat" | "customize_test">("menu");
  const [testName, setTestName] = useState<string | null>(null);
  const [_testCategory, setTestCategory] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [_questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [history, setHistory] = useState<Array<{id: number, name: string, date: string, categoryId: string, questionIndex: number, answers: string[], questions: any[], profileNumber: number}>>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [_hkoData, setHkoData] = useState<{temp: number, humidity: number} | null>(null);
  const [_location, setLocation] = useState<string | null>(null);
  const [aiPersonality, setAiPersonality] = useState<"sympa" | "professionnel">("sympa");
  const [selectedGroup, setSelectedGroup] = useState<"gouts" | "orientation" | null>(null);
  const [profileNumber, setProfileNumber] = useState(1);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [deletedProfiles, setDeletedProfiles] = useState<Set<number>>(new Set());
  const [testType, setTestType] = useState<"qcm" | "libres" | "les_deux" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations: {[key: string]: {[key: string]: string}} = {
    fr: {
      welcome: "Testicrousti",
      subtitle: "Découvre-toi mieux",
      start: "Commencer",
      chooseLang: "Choisis ta langue",
      selectLang: "Choisir une langue",
      hello: "Bonjour! Je suis Testicrousti. Quel test veux-tu faire?",
      menu: "Menu",
      history: "Historique",
      emptyHistory: "Aucun test encore",
      clearHistory: "Vider l'historique",
      chooseLanguage: "Choisis ta langue",
    },
    es: {
      welcome: "Testicrousti",
      subtitle: "Descúbrete mejor",
      start: "Comenzar",
      chooseLang: "Elige tu idioma",
      selectLang: "Seleccionar idioma",
      hello: "¡Hola! Soy Testicrousti. ¿Qué prueba quieres hacer?",
      menu: "Menú",
      history: "Historial",
      emptyHistory: "Sin pruebas aún",
      clearHistory: "Vaciar papelera",
      chooseLanguage: "Elige tu idioma",
    },
    it: {
      welcome: "Testicrousti",
      subtitle: "Scopri te stesso",
      start: "Iniziare",
      chooseLang: "Scegli la tua lingua",
      selectLang: "Seleziona lingua",
      hello: "Ciao! Sono Testicrousti. Quale test vuoi fare?",
      menu: "Menu",
      history: "Cronologia",
      emptyHistory: "Nessun test ancora",
      clearHistory: "Svuota il cestino",
      chooseLanguage: "Scegli la tua lingua",
    },
    zh: {
      welcome: "Testicrousti",
      subtitle: "更好地了解自己",
      start: "开始",
      chooseLang: "选择您的语言",
      selectLang: "选择语言",
      hello: "你好！我是 Testicrousti。你想做什么测试？",
      menu: "菜单",
      history: "历史",
      emptyHistory: "还没有测试",
      clearHistory: "清空垃圾箱",
      chooseLanguage: "选择您的语言",
    },
    ru: {
      welcome: "Testicrousti",
      subtitle: "Узнай себя лучше",
      start: "Начать",
      chooseLang: "Выберите язык",
      selectLang: "Выбрать язык",
      hello: "Привет! Я Testicrousti. Какой тест ты хочешь пройти?",
      menu: "Меню",
      history: "История",
      emptyHistory: "Тестов еще нет",
      clearHistory: "Очистить корзину",
      chooseLanguage: "Выберите язык",
    },
    pt: {
      welcome: "Testicrousti",
      subtitle: "Descubra-se melhor",
      start: "Começar",
      chooseLang: "Escolha seu idioma",
      selectLang: "Selecionar idioma",
      hello: "Olá! Sou Testicrousti. Qual teste você quer fazer?",
      menu: "Menu",
      history: "Histórico",
      emptyHistory: "Nenhum teste ainda",
      clearHistory: "Esvaziar lixo",
      chooseLanguage: "Escolha seu idioma",
    },
    he: {
      welcome: "Testicrousti",
      subtitle: "גלה את עצמך",
      start: "התחל",
      chooseLang: "בחר את השפה שלך",
      selectLang: "בחר שפה",
      hello: "שלום! אני Testicrousti. איזה בדיקה אתה רוצה לעשות?",
      menu: "תפריט",
      history: "היסטוריה",
      emptyHistory: "אין בדיקות עדיין",
      clearHistory: "רוקן את הסל",
      chooseLanguage: "בחר את השפה שלך",
    },
    el: {
      welcome: "Testicrousti",
      subtitle: "Ανακάλυψε τον εαυτό σου",
      start: "Ξεκινήστε",
      chooseLang: "Επιλέξτε τη γλώσσα σας",
      selectLang: "Επιλέξτε γλώσσα",
      hello: "Γεια σας! Είμαι ο Testicrousti. Ποιο τεστ θέλετε να κάνετε;",
      menu: "Μενού",
      history: "Ιστορικό",
      emptyHistory: "Κανένα τεστ ακόμα",
      clearHistory: "Άδειασμα κάδου",
      chooseLanguage: "Επιλέξτε τη γλώσσα σας",
    },
    en: {
      welcome: "Testicrousti",
      subtitle: "Discover yourself",
      start: "Start",
      chooseLang: "Choose your language",
      selectLang: "Select a language",
      hello: "Hello! I'm Testicrousti. What test would you like to take?",
      menu: "Menu",
      history: "History",
      emptyHistory: "No tests yet",
      clearHistory: "Empty trash",
      chooseLanguage: "Choose your language",
    },
    de: {
      welcome: "Testicrousti",
      subtitle: "Entdecke dich selbst",
      start: "Starten",
      chooseLang: "Wähle deine Sprache",
      selectLang: "Sprache wählen",
      hello: "Hallo! Ich bin Testicrousti. Welchen Test möchtest du machen?",
      menu: "Menü",
      history: "Verlauf",
      emptyHistory: "Noch keine Tests",
      clearHistory: "Papierkorb leeren",
      chooseLanguage: "Wähle deine Sprache",
    },
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchWeather();
    fetchHKOData();
    fetchLocation();
    const weatherInterval = setInterval(fetchWeather, 600000); // Rafraîchir toutes les 10 minutes
    const hkoInterval = setInterval(fetchHKOData, 600000);
    const locationInterval = setInterval(fetchLocation, 600000);
    return () => {
      clearInterval(weatherInterval);
      clearInterval(hkoInterval);
      clearInterval(locationInterval);
    };
  }, []);

  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const localeMap: {[key: string]: string} = {
        fr: 'fr-FR',
        en: 'en-US',
        de: 'de-DE',
        es: 'es-ES',
        it: 'it-IT',
        zh: 'zh-CN',
        ru: 'ru-RU',
        pt: 'pt-BR',
        he: 'he-IL',
        el: 'el-GR',
      };
      const locale = language && localeMap[language] ? localeMap[language] : 'fr-FR';
      setCurrentDate(date.toLocaleDateString(locale, options));
    };
    updateDate();
    const dateInterval = setInterval(updateDate, 60000);
    return () => clearInterval(dateInterval);
  }, [language]);

  const fetchWeather = async () => {
    try {
      const response = await fetch("https://wttr.in/?format=j1");
      const data = await response.json();
      const current = Array.isArray(data.current_condition) ? data.current_condition[0] : data.current_condition;
      const temp = Math.round(current.temp_C);
      const description = current.condition ? current.condition.text : "Météo";
      const weatherEmojis: {[key: string]: string} = {
        "Sunny": "☀️",
        "Clear": "🌙",
        "Partly cloudy": "⛅",
        "Cloudy": "☁️",
        "Overcast": "☁️",
        "Mist": "🌫️",
        "Patchy rain": "🌧️",
        "Light rain": "🌧️",
        "Moderate rain": "🌧️",
        "Heavy rain": "⛈️",
        "Patchy snow": "❄️",
        "Light snow": "❄️",
        "Moderate snow": "❄️",
        "Heavy snow": "❄️",
        "Thundery": "⚡",
      };

      let icon = "🌡️";
      for (const [key, emoji] of Object.entries(weatherEmojis)) {
        if (description.includes(key)) {
          icon = emoji;
          break;
        }
      }

      setWeather({ temp, description, icon });
    } catch (error) {
      console.error("Erreur météo:", error);
    }
  };

  const fetchHKOData = async () => {
    try {
      const response = await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=amdh&lang=en");
      const data = await response.json();
      if (data.temperature && data.humidity) {
        const temp = Math.round(parseFloat(data.temperature[0].value));
        const humidity = Math.round(parseFloat(data.humidity[0].value));
        setHkoData({ temp, humidity });
      }
    } catch (error) {
      console.error("Erreur HKO:", error);
    }
  };

  const fetchLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data.city) {
        setLocation(data.city);
      }
    } catch (error) {
      console.error("Erreur localisation:", error);
    }
  };

  const startChat = () => {
    setMode("menu");
    setInput("");
    setTestName(null);
    setTestCategory(null);
    setQuestionIndex(0);
    setAnswers([]);
    setQuestions([]);
    setSelectedGroup(null);
    setProfileNumber((prev) => prev + 1);
    setMessages([
      {
        id: 1,
        text: language ? translations[language].hello : "Bonjour!",
        isBot: true,
      },
    ]);
  };

  const handleFreeChat = async (userMessage: string) => {
    try {
      const conversationHistory = messages
        .filter((m) => m.isBot || !m.isBot)
        .map((m) => ({
          role: m.isBot ? "assistant" : "user",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          step: "chat",
          conversation_history: conversationHistory,
          language: language,
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: data.response,
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Désolé, j'ai eu un souci. Réessaie!",
          isBot: true,
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newUserMsg: Message = {
      id: messages.length + 1,
      text: userMessage,
      isBot: false,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      if (mode === "test") {
        await handleTestAnswer(userMessage);
      } else if (mode === "customize_test") {
        await handleTestCustomization(userMessage);
      } else if (mode === "menu" || mode === "free_chat") {
        await handleFreeChat(userMessage);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Oups, j'ai eu un souci. Réessaie!",
          isBot: true,
        },
      ]);
    }

    setLoading(false);
  };

  const handleCategoryClick = async (category: TestCategory) => {
    setTestCategory(category.id);
    setTestName(category.name);
    setLoading(true);

    const newUserMsg: Message = {
      id: messages.length + 1,
      text: category.name,
      isBot: false,
    };
    setMessages((prev) => [...prev, newUserMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: category.name,
          step: "ask_customization",
          language: language,
        }),
      });
      const data = await res.json();

      setMode("customize_test");
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: data.question,
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Oups, j'ai eu un souci. Réessaie!",
          isBot: true,
        },
      ]);
    }

    setLoading(false);
  };

  const handleTestCustomization = async (userPreference: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userPreference,
          test_name: testName,
          step: "generate_test",
          language: language,
        }),
      });
      const data = await res.json();

      setQuestions(data.questions);
      setAnswers([]);
      setQuestionIndex(0);
      setMode("test");

      const now = new Date();
      const dateStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      setHistory((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: testName || "Test",
          date: dateStr,
          categoryId: _testCategory || "",
          questionIndex: 0,
          answers: [],
          questions: data.questions,
          profileNumber: profileNumber,
        },
      ]);

      const intro = _testCategory && language ? (CATEGORY_INTROS[language]?.[_testCategory] || "Parfait! Commençons! ✨") : "Parfait! Commençons! ✨";

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `${intro}\n\nJe vais te poser 10 questions basées sur ta réponse. Voici la première:\n\n${data.questions[0].text}`,
          isBot: true,
          options: data.questions[0].options,
        },
      ]);
    } catch (error) {
      console.error("Erreur lors de la génération du test:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Désolé, je n'ai pas pu créer ce test. Peux-tu réessayer?",
          isBot: true,
        },
      ]);
    }
  };

  const handleTestAnswer = async (message: string) => {
    const answer = message.toUpperCase();
    const isValidAnswer = ["A", "B", "C", "D"].includes(answer) || (testType === "les_deux" && message.trim().length > 0);

    if (!isValidAnswer) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: testType === "les_deux" ? "Réponds par A, B, C, D ou écris une réponse libre!" : "Réponds par A, B, C ou D stp!",
          isBot: true,
        },
      ]);
      return;
    }

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    setHistory((prev) =>
      prev.map((item) =>
        item.id === history[history.length - 1]?.id
          ? { ...item, questionIndex: newAnswers.length, answers: newAnswers }
          : item
      )
    );

    if (newAnswers.length === 10) {
      // Test terminé, générer le profil
      setMode("result");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_name: testName,
            questions: questions,
            answers: newAnswers,
            step: "generate_profile",
            language: language,
          }),
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: data.profile,
            isBot: true,
          },
          {
            id: prev.length + 2,
            text: "Veux-tu faire un autre test?",
            isBot: true,
          },
        ]);
      } catch (error) {
        console.error("Erreur lors de la génération du profil:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Oups, j'ai eu un problème en générant ton profil. Réessaie!",
            isBot: true,
          },
        ]);
      }
      setLoading(false);
    } else {
      // Question suivante
      const nextQuestion = questions[newAnswers.length];
      setQuestionIndex(newAnswers.length);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `${nextQuestion.text}`,
          isBot: true,
          options: nextQuestion.options,
        },
      ]);
    }
  };

  const handleOptionClick = (option: string) => {
    setInput(option);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (showSplash) {
    const langs = [
      { code: 'fr', flag: '🇫🇷', name: 'Français' },
      { code: 'en', flag: '🇬🇧', name: 'English' },
      { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
      { code: 'es', flag: '🇪🇸', name: 'Español' },
      { code: 'it', flag: '🇮🇹', name: 'Italiano' },
      { code: 'zh', flag: '🇨🇳', name: '中文' },
      { code: 'ru', flag: '🇷🇺', name: 'Русский' },
      { code: 'pt', flag: '🇵🇹', name: 'Português' },
      { code: 'he', flag: '🇮🇱', name: 'עברית' },
      { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
    ];

    return (
      <div
        className="flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          backgroundImage: 'url(https://www.dessinoupeinture.fr/wp-content/uploads/2021/07/PAYSAGE-JOUR17.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');

          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          @keyframes fadeInSimple {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes subtleHover {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .splash-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(180deg, #87ceeb 0%, #90ee90 50%, #228b22 100%);
            z-index: 5;
            overflow: hidden;
          }
          .pixel-forest {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: url('/pixel-forest.jpg');
            background-size: 110%;
            background-position: 30px -60px;
            background-attachment: fixed;
          }
          @keyframes floatPixel {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
            25% { transform: translateY(-12px) translateX(8px); opacity: 0.8; }
            50% { transform: translateY(-20px) translateX(12px); opacity: 1; }
            75% { transform: translateY(-12px) translateX(6px); opacity: 0.8; }
          }
          .pixel-container {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 8;
            pointer-events: none;
          }
          .pixel {
            position: absolute;
            width: 4px;
            height: 4px;
            box-shadow: 0 0 3px rgba(100, 200, 100, 0.6);
          }
          .pixel:nth-child(4n+1) {
            background-color: rgba(46, 139, 87, 0.75);
            box-shadow: 0 0 3px rgba(46, 139, 87, 0.6);
          }
          .pixel:nth-child(4n+2) {
            background-color: rgba(144, 238, 144, 0.75);
            box-shadow: 0 0 3px rgba(144, 238, 144, 0.6);
          }
          .pixel:nth-child(4n+3) {
            background-color: rgba(173, 255, 47, 0.7);
            box-shadow: 0 0 3px rgba(173, 255, 47, 0.55);
          }
          .pixel:nth-child(4n) {
            background-color: rgba(102, 205, 170, 0.7);
            box-shadow: 0 0 3px rgba(102, 205, 170, 0.55);
          }
          .pixel:nth-child(1) { left: 3%; top: 35%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 0.15s infinite; }
          .pixel:nth-child(2) { left: 5%; top: 23%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 0.3s infinite; }
          .pixel:nth-child(3) { left: 7%; top: 19%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 0.45s infinite; }
          .pixel:nth-child(4) { left: 8%; top: 36%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 0.6s infinite; }
          .pixel:nth-child(5) { left: 10%; top: 32%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 0.75s infinite; }
          .pixel:nth-child(6) { left: 12%; top: 28%; width: 6px; height: 6px; animation: floatPixel 6s ease-in-out 0.9s infinite; }
          .pixel:nth-child(7) { left: 13%; top: 17%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 1.05s infinite; }
          .pixel:nth-child(8) { left: 15%; top: 31%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 1.2s infinite; }
          .pixel:nth-child(9) { left: 17%; top: 32%; width: 6px; height: 6px; animation: floatPixel 6s ease-in-out 1.35s infinite; }
          .pixel:nth-child(10) { left: 18%; top: 35%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 1.5s infinite; }
          .pixel:nth-child(11) { left: 20%; top: 28%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 1.65s infinite; }
          .pixel:nth-child(12) { left: 22%; top: 33%; width: 6px; height: 6px; animation: floatPixel 6s ease-in-out 1.8s infinite; }
          .pixel:nth-child(13) { left: 23%; top: 15%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 1.95s infinite; }
          .pixel:nth-child(14) { left: 25%; top: 20%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 2.1s infinite; }
          .pixel:nth-child(15) { left: 27%; top: 25%; width: 6px; height: 6px; animation: floatPixel 6s ease-in-out 2.25s infinite; }
          .pixel:nth-child(16) { left: 28%; top: 21%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 2.4s infinite; }
          .pixel:nth-child(17) { left: 30%; top: 25%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 0.05s infinite; }
          .pixel:nth-child(18) { left: 32%; top: 27%; width: 6px; height: 6px; animation: floatPixel 6s ease-in-out 0.2s infinite; }
          .pixel:nth-child(19) { left: 33%; top: 26%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 0.35s infinite; }
          .pixel:nth-child(20) { left: 35%; top: 16%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 0.5s infinite; }
          .pixel:nth-child(21) { left: 37%; top: 32%; width: 6px; height: 6px; animation: floatPixel 6s ease-in-out 0.65s infinite; }
          .pixel:nth-child(22) { left: 38%; top: 27%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 0.8s infinite; }
          .pixel:nth-child(23) { left: 40%; top: 24%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 0.95s infinite; }
          .pixel:nth-child(24) { left: 42%; top: 34%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 1.1s infinite; }
          .pixel:nth-child(25) { left: 43%; top: 26%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 1.25s infinite; }
          .pixel:nth-child(26) { left: 45%; top: 17%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 1.4s infinite; }
          .pixel:nth-child(27) { left: 47%; top: 22%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 1.55s infinite; }
          .pixel:nth-child(28) { left: 48%; top: 17%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 1.7s infinite; }
          .pixel:nth-child(29) { left: 50%; top: 18%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 1.85s infinite; }
          .pixel:nth-child(30) { left: 52%; top: 29%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 2s infinite; }
          .pixel:nth-child(31) { left: 53%; top: 26%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 2.15s infinite; }
          .pixel:nth-child(32) { left: 55%; top: 26%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 2.3s infinite; }
          .pixel:nth-child(33) { left: 57%; top: 23%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 2.45s infinite; }
          .pixel:nth-child(34) { left: 58%; top: 36%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 0.1s infinite; }
          .pixel:nth-child(35) { left: 60%; top: 34%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 0.25s infinite; }
          .pixel:nth-child(36) { left: 62%; top: 32%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 0.4s infinite; }
          .pixel:nth-child(37) { left: 63%; top: 20%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 0.55s infinite; }
          .pixel:nth-child(38) { left: 65%; top: 23%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 0.7s infinite; }
          .pixel:nth-child(39) { left: 67%; top: 35%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 0.85s infinite; }
          .pixel:nth-child(40) { left: 68%; top: 22%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 1s infinite; }
          .pixel:nth-child(41) { left: 70%; top: 16%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 1.15s infinite; }
          .pixel:nth-child(42) { left: 72%; top: 16%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 1.3s infinite; }
          .pixel:nth-child(43) { left: 73%; top: 27%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 1.45s infinite; }
          .pixel:nth-child(44) { left: 75%; top: 21%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 1.6s infinite; }
          .pixel:nth-child(45) { left: 77%; top: 33%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 1.75s infinite; }
          .pixel:nth-child(46) { left: 78%; top: 25%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 1.9s infinite; }
          .pixel:nth-child(47) { left: 80%; top: 30%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 2.05s infinite; }
          .pixel:nth-child(48) { left: 82%; top: 35%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 2.2s infinite; }
          .pixel:nth-child(49) { left: 83%; top: 23%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 2.35s infinite; }
          .pixel:nth-child(50) { left: 85%; top: 32%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 0s infinite; }
          .pixel:nth-child(51) { left: 87%; top: 33%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 0.15s infinite; }
          .pixel:nth-child(52) { left: 88%; top: 33%; width: 6px; height: 6px; animation: floatPixel 6.5s ease-in-out 0.3s infinite; }
          .pixel:nth-child(53) { left: 90%; top: 22%; width: 5px; height: 5px; animation: floatPixel 7s ease-in-out 0.45s infinite; }
          .pixel:nth-child(54) { left: 92%; top: 19%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 0.6s infinite; }
          .pixel:nth-child(55) { left: 93%; top: 17%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 0.75s infinite; }
          .pixel:nth-child(56) { left: 95%; top: 18%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 0.9s infinite; }
          .pixel:nth-child(57) { left: 2%; top: 20%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 1.05s infinite; }
          .pixel:nth-child(58) { left: 3%; top: 28%; width: 5px; height: 5px; animation: floatPixel 6.5s ease-in-out 1.2s infinite; }
          .pixel:nth-child(59) { left: 5%; top: 27%; width: 6px; height: 6px; animation: floatPixel 7s ease-in-out 1.35s infinite; }
          .pixel:nth-child(60) { left: 7%; top: 29%; width: 5px; height: 5px; animation: floatPixel 6s ease-in-out 1.5s infinite; }
          .splash-content {
            position: relative;
            z-index: 10;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
          }
          .splash-title {
            font-family: 'Poppins', sans-serif;
            font-size: 4.5rem;
            font-weight: 700;
            letter-spacing: 1px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
            animation: fadeInSimple 1s ease-out forwards, subtleHover 3s ease-in-out 1s infinite;
            opacity: 0;
          }
          .splash-subtitle {
            font-family: 'Poppins', sans-serif;
            font-size: 1.3rem;
            font-weight: 400;
            letter-spacing: 0.5px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
            animation: fadeInSimple 1s ease-out forwards, subtleHover 3s ease-in-out 1.2s infinite;
            opacity: 0;
          }
          .splash-languages {
            animation: fadeInSimple 1s ease-out forwards, subtleHover 3s ease-in-out 1.4s infinite;
            opacity: 0;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            justify-content: center;
          }
          .splash-languages button {
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
            transition: all 0.2s ease;
          }
          .splash-languages button:hover {
            transform: scale(1.08);
          }
          .splash-button-hover {
            animation: subtleHover 3s ease-in-out infinite;
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5));
          }
          .splash-button {
            animation: fadeInSimple 1s ease-out forwards, subtleHover 3s ease-in-out 1.6s infinite;
            opacity: 0;
            filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
            transition: all 0.2s ease;
          }
          .splash-button:hover:not(:disabled) {
            transform: scale(1.03);
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
          }
        `}</style>

        {/* Fond de forêt en pixel art */}
        <div className="splash-overlay">
          <div className="pixel-forest" />
          <div className="pixel-container">
            {Array.from({ length: 60 }, (_, i) => (
              <div key={i} className="pixel" />
            ))}
          </div>
        </div>

        <div className="splash-content">
          <h1 className="splash-title text-6xl font-bold text-white" style={{letterSpacing: '2px'}}>Testicrousti</h1>
          <p className="splash-subtitle text-2xl text-white mt-4 opacity-90" style={{fontStyle: 'italic', fontWeight: '300'}}>
            it's about you and only you
          </p>

          <div className="splash-languages mt-8 flex gap-2 flex-wrap justify-center">
            {langs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="px-4 py-2 rounded-lg transition-all text-lg font-semibold"
                style={{
                  backgroundColor: language === lang.code ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                  color: language === lang.code ? '#2d5016' : '#1a1a1a',
                  border: '2px solid white',
                  fontWeight: 'bold',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = language === lang.code ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = language === lang.code ? '#ffffff' : 'rgba(255, 255, 255, 0.35)')}
                title={lang.name}
              >
                {lang.flag}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => setTestType("qcm")}
              className="px-6 py-3 rounded-lg transition-all text-lg font-semibold splash-button-hover"
              style={{
                backgroundColor: testType === "qcm" ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                color: testType === "qcm" ? '#2d5016' : '#1a1a1a',
                border: '2px solid white',
                fontWeight: 'bold',
                animation: 'subtleHover 3s ease-in-out 0s infinite',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = testType === "qcm" ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = testType === "qcm" ? '#ffffff' : 'rgba(255, 255, 255, 0.35)')}
            >
              QCM
            </button>
            <button
              onClick={() => setTestType("les_deux")}
              className="px-6 py-3 rounded-lg transition-all text-lg font-semibold splash-button-hover"
              style={{
                backgroundColor: testType === "les_deux" ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                color: testType === "les_deux" ? '#2d5016' : '#1a1a1a',
                border: '2px solid white',
                fontWeight: 'bold',
                animation: 'subtleHover 3s ease-in-out 0.2s infinite',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = testType === "les_deux" ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = testType === "les_deux" ? '#ffffff' : 'rgba(255, 255, 255, 0.35)')}
            >
              Les deux
            </button>
            <button
              onClick={() => setTestType("libres")}
              className="px-6 py-3 rounded-lg transition-all text-lg font-semibold splash-button-hover"
              style={{
                backgroundColor: testType === "libres" ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                color: testType === "libres" ? '#2d5016' : '#1a1a1a',
                border: '2px solid white',
                fontWeight: 'bold',
                animation: 'subtleHover 3s ease-in-out 0.4s infinite',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = testType === "libres" ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = testType === "libres" ? '#ffffff' : 'rgba(255, 255, 255, 0.35)')}
            >
              Réponses libres
            </button>
          </div>

          <button
            onClick={() => {
              if (language && testType) {
                setShowSplash(false);
                startChat();
              }
            }}
            disabled={!language || !testType}
            className="splash-button mt-12 px-8 py-4 font-bold text-lg transition-all rounded-lg splash-button-hover"
            style={{
              backgroundColor: language && testType ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
              color: '#1a1a1a',
              border: '2px solid white',
              cursor: language && testType ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              animation: language && testType ? 'subtleHover 3s ease-in-out 0.6s infinite' : 'none',
              opacity: language && testType ? 1 : 0.6,
            }}
            onMouseEnter={(e) => language && testType && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = language && testType ? '#ffffff' : 'rgba(255, 255, 255, 0.35)')}
          >
            {language && testType ? translations[language].start : language ? "Choisir un type de test" : "Choisir une langue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-row relative overflow-hidden" style={{backgroundColor: '#e8ede5'}}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        @keyframes fall {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 0.6;
          }
          to {
            transform: translateY(100vh) rotateZ(180deg);
            opacity: 0;
          }
        }

        @keyframes sway {
          0% { transform: translateX(0); }
          25% { transform: translateX(20px); }
          75% { transform: translateX(-20px); }
          100% { transform: translateX(0); }
        }

        .falling-leaf {
          position: fixed;
          top: -50px;
          pointer-events: none;
          font-size: 2rem;
          opacity: 0.8;
          animation: fall 8s linear infinite;
          filter: drop-shadow(0 0 2px rgba(0,0,0,0.1));
        }
      `}</style>

      {/* Feuilles tombantes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => {
          const colors = ['#8b9e85', '#c85a3a', '#dbd5c4', '#a87a5a', '#9a8a6a'];
          const randomDelay = (i % 4) * 1.5;
          const randomDuration = 10 + (i % 3) * 3;
          const randomLeft = (i * 8) % 100;

          return (
            <div
              key={i}
              className="falling-leaf"
              style={{
                left: `${randomLeft}%`,
                animation: `fall ${randomDuration}s linear ${randomDelay}s infinite`,
                color: colors[i % colors.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LeafIllustration />
            </div>
          );
        })}
      </div>

      {/* Sidebar historique */}
      {!showSplash && (
      <div className="w-64 border-r-4 flex flex-col overflow-hidden" style={{backgroundColor: '#8b9e85', borderColor: '#7a8c78'}}>
        <div className="p-4 border-b-4" style={{borderColor: '#7a8c78'}}>
          <h2 className="font-bold text-lg text-white">{language && translations[language].history}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-white text-sm opacity-70">{language && translations[language].emptyHistory}</p>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.questionIndex < 10) {
                    setTestName(item.name);
                    setTestCategory(item.categoryId);
                    setQuestions(item.questions);
                    setAnswers(item.answers);
                    setQuestionIndex(item.questionIndex);
                    setMode("test");
                    setMessages([
                      {
                        id: 1,
                        text: `Reprenons le test "${item.name}" où tu t'es arrêté!\n\nVoici la question ${item.questionIndex + 1} sur 10:\n\n${item.questions[item.questionIndex].text}`,
                        isBot: true,
                      }
                    ]);
                  }
                }}
                className="w-full p-3 rounded-lg text-white text-sm transition-all text-left hover:brightness-110"
                style={{backgroundColor: 'rgba(255, 255, 255, 0.15)'}}
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs opacity-80 bg-white bg-opacity-20 px-2 py-1 rounded">Profil {item.profileNumber}</div>
                </div>
                <div className="text-xs opacity-70">{item.date}</div>
                <div className="text-xs opacity-80 mt-1">
                  {item.questionIndex < 10
                    ? `Progression: ${item.questionIndex}/10 réponses`
                    : 'Terminé ✓'
                  }
                </div>
              </button>
            ))
          )}
        </div>
        <button
          onClick={() => {
            const msg = language === 'fr' ? 'Supprimer tout l\'historique ?' :
                        language === 'en' ? 'Delete all history?' :
                        language === 'de' ? 'Gesamten Verlauf löschen?' :
                        language === 'es' ? '¿Eliminar todo el historial?' :
                        language === 'it' ? 'Eliminare tutto lo storico?' :
                        language === 'zh' ? '清除所有历史记录？' :
                        language === 'ru' ? 'Очистить всю историю?' :
                        language === 'pt' ? 'Limpar todo o histórico?' :
                        language === 'he' ? 'מחק את כל ההיסטוריה?' :
                        language === 'el' ? 'Διαγραφή όλου του ιστορικού;' :
                        'Clear history?';
            if (confirm(msg)) {
              setHistory([]);
            }
          }}
          className="m-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-white border-2 flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#a68a7a',
            borderColor: '#9a7a6a',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9a7a6a')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a68a7a')}
        >
          {language && translations[language].clearHistory}
        </button>
      </div>
      )}

      <div className={`${!showSplash ? 'flex-1' : 'w-full'} flex flex-col rounded-none shadow-none overflow-hidden`} style={{backgroundColor: '#f1f5f0'}}>

        {/* Barre de personnalité */}
        <div className="p-3 flex gap-4 pl-10" style={{backgroundColor: '#7a8c78'}}>
          <div className="flex gap-4">
            <button
              onClick={() => setAiPersonality("sympa")}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: aiPersonality === "sympa" ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                color: aiPersonality === "sympa" ? '#7a8c78' : '#ffffff',
                border: '2px solid white',
              }}
              onMouseEnter={(e) => aiPersonality !== "sympa" && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = aiPersonality === "sympa" ? '#ffffff' : 'rgba(255, 255, 255, 0.2)')}
            >
              Sympa
            </button>
            <button
              onClick={() => setAiPersonality("professionnel")}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: aiPersonality === "professionnel" ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                color: aiPersonality === "professionnel" ? '#7a8c78' : '#ffffff',
                border: '2px solid white',
              }}
              onMouseEnter={(e) => aiPersonality !== "professionnel" && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = aiPersonality === "professionnel" ? '#ffffff' : 'rgba(255, 255, 255, 0.2)')}
            >
              Professionnel
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startChat}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '2px solid white',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
            >
              + Nouveau profil
            </button>
            {profileNumber > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileSelector(!showProfileSelector)}
                  className="px-6 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: '2px solid white',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
                >
                  Profils
                </button>
                {showProfileSelector && (
                  <div
                    className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg z-50 min-w-56"
                    style={{backgroundColor: '#f1f5f0', border: '2px solid #8b9e85'}}
                  >
                    {Array.from({length: profileNumber - 1}, (_, i) => i + 1)
                      .filter(num => !deletedProfiles.has(num))
                      .map((num) => (
                      <div
                        key={num}
                        className="flex items-center justify-between px-4 py-2 border-b hover:bg-opacity-50 transition-all"
                        style={{
                          backgroundColor: profileNumber === num ? '#d8e4d3' : '#eef2ec',
                          borderColor: '#8b9e85',
                          color: '#3d4a38',
                        }}
                      >
                        <button
                          onClick={() => {
                            setProfileNumber(num);
                            setShowProfileSelector(false);
                            setMode("menu");
                            const testsOfProfile = history.filter(h => h.profileNumber === num);
                            setMessages([
                              {
                                id: 1,
                                text: `Bienvenue sur Profil ${num}! 🎯\n\nTu as ${testsOfProfile.length} test${testsOfProfile.length !== 1 ? 's' : ''} enregistré${testsOfProfile.length !== 1 ? 's' : ''} sur ce profil.\n\nQuel test veux-tu faire?`,
                                isBot: true,
                              },
                            ]);
                          }}
                          className="flex-1 text-left"
                          style={{color: '#3d4a38'}}
                        >
                          Profil {num}
                          {profileNumber === num && ' ✓'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Supprimer ce profil ?')) {
                              const newDeleted = new Set(deletedProfiles);
                              newDeleted.add(num);
                              setDeletedProfiles(newDeleted);
                              if (profileNumber === num) {
                                const activeProfiles = Array.from({length: profileNumber - 1}, (_, i) => i + 1)
                                  .filter(n => !newDeleted.has(n));
                                if (activeProfiles.length > 0) {
                                  setProfileNumber(activeProfiles[activeProfiles.length - 1]);
                                }
                              }
                            }
                          }}
                          className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all text-white border-2"
                          style={{
                            backgroundColor: '#a68a7a',
                            borderColor: '#9a7a6a',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9a7a6a')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a68a7a')}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* En-tête */}
        <div className="p-5 border-b-4" style={{backgroundColor: '#8b9e85', background: 'linear-gradient(135deg, #8b9e85 0%, #7a8c78 100%)', borderColor: '#7a8c78'}}>
          <div className="flex items-center gap-4">
            <svg className="w-16 h-16" viewBox="0 0 100 100" aria-label="Feuille d'automne">
              <defs>
                <radialGradient id="leafGradient" cx="50%" cy="40%">
                  <stop offset="0%" stopColor="#9fb593" />
                  <stop offset="100%" stopColor="#7a8c78" />
                </radialGradient>
              </defs>
              {/* Forme de feuille d'érable */}
              <path
                d="M 50 15 L 60 30 L 75 25 L 70 40 L 85 45 L 68 50 L 72 65 L 58 58 L 55 75 L 50 60 L 45 75 L 42 58 L 28 65 L 32 50 L 15 45 L 30 40 L 25 25 L 40 30 Z"
                fill="url(#leafGradient)"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
              {/* Nervures principales */}
              <path
                d="M 50 15 Q 50 35 50 60"
                stroke="#a8b89f"
                strokeWidth="1"
                fill="none"
                opacity="0.7"
              />
              <path
                d="M 50 35 Q 65 30 75 25"
                stroke="#a8b89f"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 50 35 Q 35 30 25 25"
                stroke="#a8b89f"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 50 50 Q 70 45 85 45"
                stroke="#a8b89f"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 50 50 Q 30 45 15 45"
                stroke="#a8b89f"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 50 60 Q 65 65 75 65"
                stroke="#a8b89f"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 50 60 Q 35 65 25 65"
                stroke="#a8b89f"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{letterSpacing: '0.5px'}}>Testicrousti</h1>
              <p className="text-sm" style={{color: '#dde5db'}}>Découvre-toi mieux</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 border-b-4" style={{backgroundColor: '#eef2ec', borderColor: '#8b9e85'}}>
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg text-sm leading-relaxed"
                  style={{
                    backgroundColor: msg.isBot ? '#d8e4d3' : '#a8b89f',
                    color: msg.isBot ? '#3d4a38' : '#f5f5f2',
                    borderLeft: msg.isBot ? '4px solid #8b9e85' : 'none',
                    borderRight: !msg.isBot ? '4px solid #8b9e85' : 'none',
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>

              {/* Options A/B/C/D et E (réponse libre) pour "Les deux" */}
              {msg.isBot && msg.options && mode === "test" && (
                <div className="flex justify-start mt-3 gap-2 flex-wrap items-end">
                  {msg.options.map((option, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(letters[idx])}
                        disabled={loading}
                        className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: '#a8b89f',
                          color: '#f5f5f2',
                          border: '2px solid #8b9e85',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#96a98f')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a8b89f')}
                      >
                        {letters[idx]}: {option}
                      </button>
                    );
                  })}
                  {testType === "les_deux" && (
                    <input
                      type="text"
                      placeholder="E: réponse libre..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
                      style={{
                        backgroundColor: '#f1f5f0',
                        border: '2px solid #8b9e85',
                        color: '#3d4a38',
                        maxWidth: '250px',
                      }}
                    />
                  )}
                  {testType === "libres" && (
                    <input
                      type="text"
                      placeholder="Réponse libre (pas de limite)..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
                      style={{
                        backgroundColor: '#f1f5f0',
                        border: '2px solid #8b9e85',
                        color: '#3d4a38',
                        maxWidth: '300px',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          {mode === "menu" && messages.length === 1 && !selectedGroup && (
            <div className="grid grid-cols-1 gap-3 mt-4">
              <button
                onClick={() => setSelectedGroup("gouts")}
                disabled={loading}
                className="px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: '#d8e4d3',
                  color: '#3d4a38',
                  border: '2px solid #8b9e85',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8dcc5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d8e4d3')}
              >
                <div className="font-bold">
                  {language === 'fr' ? 'Tes goûts' : language === 'en' ? 'Your tastes' : language === 'de' ? 'Deine Vorlieben' : language === 'es' ? 'Tus gustos' : language === 'it' ? 'I tuoi gusti' : language === 'zh' ? '你的品味' : language === 'ru' ? 'Твои вкусы' : language === 'pt' ? 'Seus gostos' : language === 'he' ? 'הטעמים שלך' : language === 'el' ? 'Τα γούστα σου' : 'Tes goûts'}
                </div>
                <div className="text-xs" style={{color: '#5a6a55'}}>Mode, Animaux, Alimentation, Couleurs, Objets...</div>
              </button>

              <button
                onClick={() => setSelectedGroup("orientation")}
                disabled={loading}
                className="px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: '#d8e4d3',
                  color: '#3d4a38',
                  border: '2px solid #8b9e85',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8dcc5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d8e4d3')}
              >
                <div className="font-bold">
                  {language === 'fr' ? 'Ton orientation' : language === 'en' ? 'Your orientation' : language === 'de' ? 'Deine Orientierung' : language === 'es' ? 'Tu orientación' : language === 'it' ? 'Il tuo orientamento' : language === 'zh' ? '你的方向' : language === 'ru' ? 'Твоя ориентация' : language === 'pt' ? 'Sua orientação' : language === 'he' ? 'הכיוון שלך' : language === 'el' ? 'Ο προσανατολισμός σας' : 'Ton orientation'}
                </div>
                <div className="text-xs" style={{color: '#5a6a55'}}>MBTI, Orientation</div>
              </button>
            </div>
          )}

          {mode === "menu" && messages.length === 1 && selectedGroup === "gouts" && (
            <div className="space-y-3 mt-4">
              <button
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: '#a8b89f',
                  color: '#f5f5f2',
                  border: '2px solid #8b9e85',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#96a98f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a8b89f')}
              >
                ← {language === 'fr' ? 'Retour' : language === 'en' ? 'Back' : language === 'de' ? 'Zurück' : language === 'es' ? 'Atrás' : 'Retour'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                {TEST_CATEGORIES_GOUTS.map((category) => {
                  const translated = language && CATEGORIES_TRANSLATIONS[language] ? CATEGORIES_TRANSLATIONS[language][category.id] : category;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick({...category, name: translated.name, description: translated.description})}
                      disabled={loading}
                      className="px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: '#d8e4d3',
                        color: '#3d4a38',
                        border: '2px solid #8b9e85',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8dcc5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d8e4d3')}
                    >
                      <div className="font-bold">{translated.name}</div>
                      <div className="text-xs" style={{color: '#5a6a55'}}>{translated.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "menu" && messages.length === 1 && selectedGroup === "orientation" && (
            <div className="space-y-3 mt-4">
              <button
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: '#a8b89f',
                  color: '#f5f5f2',
                  border: '2px solid #8b9e85',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#96a98f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a8b89f')}
              >
                ← {language === 'fr' ? 'Retour' : language === 'en' ? 'Back' : language === 'de' ? 'Zurück' : language === 'es' ? 'Atrás' : 'Retour'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                {TEST_CATEGORIES_ORIENTATION.map((category) => {
                  const translated = language && CATEGORIES_TRANSLATIONS[language] ? CATEGORIES_TRANSLATIONS[language][category.id] : category;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick({...category, name: translated.name, description: translated.description})}
                      disabled={loading}
                      className="px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: '#d8e4d3',
                        color: '#3d4a38',
                        border: '2px solid #8b9e85',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8dcc5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d8e4d3')}
                    >
                      <div className="font-bold">{translated.name}</div>
                      <div className="text-xs" style={{color: '#5a6a55'}}>{translated.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg text-sm" style={{backgroundColor: '#d8e4d3', color: '#3d4a38'}}>
                <p>Testicrousti réfléchit...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Barre de chat */}
        <div className="p-4 flex gap-2 border-t-4" style={{backgroundColor: '#f1f5f0', borderColor: '#8b9e85'}}>
          {mode === "test" ? (
            <>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none transition-all text-center font-semibold"
                style={{
                  backgroundColor: '#f1f5f0',
                  border: '2px solid #8b9e85',
                  color: '#3d4a38',
                }}
                maxLength={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={(testType === "les_deux" ? !input.trim() : !['A', 'B', 'C', 'D'].includes(input)) || loading}
                className="px-5 py-3 font-semibold rounded-lg transition-all text-white"
                style={{
                  backgroundColor: '#8b9e85',
                  opacity: ((testType === "les_deux" ? !input.trim() : !['A', 'B', 'C', 'D'].includes(input)) || loading) ? 0.6 : 1,
                  cursor: ((testType === "les_deux" ? !input.trim() : !['A', 'B', 'C', 'D'].includes(input)) || loading) ? 'not-allowed' : 'pointer',
                }}
              >
                Envoyer
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: '#f1f5f0',
                  border: '2px solid #8b9e85',
                  color: '#3d4a38',
                }}
              />
            </>
          )}
        </div>

      </div>

      {/* Météo, date et menu en haut */}
      <div className="fixed top-2 right-6 px-4 py-3 rounded-lg text-white shadow-lg z-40 flex items-center gap-8" style={{backgroundColor: 'rgba(139, 158, 133, 0.9)'}}>
        {weather && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{weather.icon}</span>
            <div className="flex flex-col">
              <span className="font-bold text-lg">{weather.temp}°C</span>
              <span className="text-xs opacity-80">{weather.description}</span>
            </div>
          </div>
        )}
        {currentDate && (
          <div className="text-right">
            <span className="text-lg font-semibold opacity-90">{currentDate}</span>
          </div>
        )}
        <button
          onClick={startChat}
          className="px-8 py-4 font-semibold text-xl rounded-lg transition-all text-white hover:brightness-90"
          style={{
            backgroundColor: '#7a8c78',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6a7a68')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7a8c78')}
          title={language ? translations[language].menu : ''}
        >
          ☰ {language && translations[language].menu}
        </button>
      </div>
    </div>
  );
}

export default App;
