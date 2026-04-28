/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  Info, 
  Globe,
  MessageSquare,
  Plus,
  ChevronRight,
  Sparkles,
  Search,
  MapPin,
  School,
  Calculator,
  FileText,
  Calendar,
  X,
  Brain,
  ClipboardCheck,
  Percent,
  ShoppingBag,
  Users,
  Eye,
  Wallet,
  CreditCard,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

// Types
interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

const SYSTEM_INSTRUCTION = `
You are UniHelper Kazakhstan, a specialized AI assistant for students and applicants in Kazakhstan.
Your goal is to provide accurate, helpful, and up-to-date information about:
1. Universities in Kazakhstan (NU, KBTU, AITU, KazNU, ENU, Satbayev University, etc.).
2. Educational grants and scholarships (Bolashak, government grants, internal university grants).
3. UNT (Unified National Testing) - preparation, subjects, passing scores, and deadlines.
4. Career guidance and choosing a specialty.
5. Student life and opportunities in Kazakhstan.
6. University level assistance:
   - Help with SRS (Independent Work of Students/СӨЖ) - structure, topics, and research tips.
   - RK (Boundary Control/МБ) - preparation strategies and key concepts.
   - Session/Exam preparation - study plans and stress management.
   - Platonus Grade Calculation - explaining how the 60/40 system works (Admission Rating * 0.6 + Exam * 0.4).

Guidelines:
- Be polite, supportive, and professional.
- Use Kazakh, Russian, or English depending on the user's preference.
- Format your responses using Markdown. Use bold text for emphasis and lists for steps.
- If mentioning dates or scores, remind the user to verify with official sources.
`;

export default function App() {
  const [userType, setUserType] = useState<"pupil" | "student" | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"kz" | "ru">("kz");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showGrantCalc, setShowGrantCalc] = useState(false);
  const [showCareerPath, setShowCareerPath] = useState(false);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showVRTours, setShowVRTours] = useState(false);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showFinLit, setShowFinLit] = useState(false);
  const [calcData, setCalcData] = useState({ rk1: "", rk2: "", exam: "" });
  const [grantData, setGrantData] = useState({ unt: "", specialty: "" });
  const [careerAnswers, setCareerAnswers] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

const getSystemInstruction = () => {
    const base = `
You are UniHelper Kazakhstan, a specialized AI assistant for ${userType === 'student' ? 'university students' : 'school pupils and applicants'} in Kazakhstan.
Your goal is to provide accurate, helpful, and up-to-date information about:
${userType === 'pupil' ? `
1. UNT (Unified National Testing) - preparation, subjects, passing scores, and deadlines.
2. Educational grants and scholarships (government grants, internal university grants).
3. Universities in Kazakhstan (NU, KBTU, AITU, KazNU, ENU, Satbayev University, etc.).
4. Career guidance and choosing a specialty (AI Career Path) - analyze user interests and suggest modern careers like Game Design, Data Science, etc.
5. Grant Probability - estimate chances based on UNT scores and past statistics.
6. Auto-Apply Concept - explain how to prepare documents for university admission (eGov integration concept).
` : `
1. University level assistance:
   - Help with SRS (Independent Work of Students/СӨЖ) - structure, topics, and research tips.
   - RK (Boundary Control/МБ) - preparation strategies and key concepts.
   - Session/Exam preparation - study plans and stress management.
   - Platonus Grade Calculation - explaining how the 60/40 system works (Admission Rating * 0.6 + Exam * 0.4).
2. Career guidance and Master's degree opportunities.
3. Student life and opportunities in Kazakhstan.
`}

7. Marketplace & Mentors - help find tutors, courses, and connect with university ambassadors.
8. VR/AR University Tours - provide information about virtual tours of Kazakhstan's campuses.
9. Financial Literacy - information on student loans, installments, and internal university grants (rector's grants).

Guidelines:
- Be polite, supportive, and professional.
- Use Kazakh, Russian, or English depending on the user's preference.
- Format your responses using Markdown. Use bold text for emphasis and lists for steps.
- If mentioning dates or scores, remind the user to verify with official sources.
`;
    return base;
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const model = "gemini-3-flash-preview";
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model,
        contents: [
          ...history,
          { role: "user", parts: [{ text: messageText }] }
        ],
        config: {
          systemInstruction: getSystemInstruction(),
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        },
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text || "Кешіріңіз, қате орын алды.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "Қате орын алды. Интернет байланысын тексеріңіз.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const bentoActions = [
    { 
      kz: "ҰБТ-ға дайындық", 
      ru: "Подготовка к ЕНТ", 
      desc_kz: "Пәндер мен кеңестер", 
      desc_ru: "Предметы и советы",
      icon: BookOpen, 
      color: "bg-blue-50 text-blue-600",
      size: "col-span-2",
      type: "pupil"
    },
    { 
      kz: "Гранттар", 
      ru: "Гранты", 
      desc_kz: "2024 тізімі", 
      desc_ru: "Список 2024",
      icon: GraduationCap, 
      color: "bg-emerald-50 text-emerald-600",
      size: "col-span-1",
      type: "pupil"
    },
    { 
      kz: "Университеттер", 
      ru: "ВУЗы", 
      desc_kz: "ТОП-10", 
      desc_ru: "ТОП-10",
      icon: School, 
      color: "bg-purple-50 text-purple-600",
      size: "col-span-1",
      type: "both"
    },
    { 
      kz: "Мамандық таңдау", 
      ru: "Выбор профессии", 
      desc_kz: "Тест тапсыру", 
      desc_ru: "Пройти тест",
      icon: Search, 
      color: "bg-orange-50 text-orange-600",
      size: "col-span-2",
      type: "both"
    },
    { 
      kz: "СӨЖ/РК көмек", 
      ru: "Помощь с СРС/РК", 
      desc_kz: "Университет тапсырмалары", 
      desc_ru: "Университетские задания",
      icon: FileText, 
      color: "bg-pink-50 text-pink-600",
      size: "col-span-1",
      type: "student"
    },
    { 
      kz: "Сессияға дайындық", 
      ru: "Подготовка к сессии", 
      desc_kz: "Емтихан кеңестері", 
      desc_ru: "Советы к экзаменам",
      icon: Calendar, 
      color: "bg-amber-50 text-amber-600",
      size: "col-span-1",
      type: "student"
    },
    { 
      kz: "Платонус калькуляторы", 
      ru: "Калькулятор Платонус", 
      desc_kz: "Баллды есептеу", 
      desc_ru: "Рассчитать балл",
      icon: Calculator, 
      color: "bg-cyan-50 text-cyan-600",
      size: "col-span-2",
      isCalc: true,
      type: "student"
    },
    { 
      kz: "AI Career Path", 
      ru: "AI Career Path", 
      desc_kz: "Тұлғалық диагностика", 
      desc_ru: "Личностная диагностика",
      icon: Brain, 
      color: "bg-rose-50 text-rose-600",
      size: "col-span-1",
      isCareerPath: true,
      type: "pupil"
    },
    { 
      kz: "Auto-Apply", 
      ru: "Auto-Apply", 
      desc_kz: "Құжаттарды тапсыру", 
      desc_ru: "Подача документов",
      icon: ClipboardCheck, 
      color: "bg-indigo-50 text-indigo-600",
      size: "col-span-1",
      isAutoApply: true,
      type: "pupil"
    },
    { 
      kz: "Грант мүмкіндігі", 
      ru: "Шанс на грант", 
      desc_kz: "Ықтималдықты есептеу", 
      desc_ru: "Расчет вероятности",
      icon: Percent, 
      color: "bg-emerald-50 text-emerald-600",
      size: "col-span-2",
      isGrantCalc: true,
      type: "pupil"
    },
    { 
      kz: "Marketplace", 
      ru: "Marketplace", 
      desc_kz: "Курстар мен Менторлар", 
      desc_ru: "Курсы и Менторы",
      icon: ShoppingBag, 
      color: "bg-blue-50 text-blue-600",
      size: "col-span-1",
      isMarketplace: true,
      type: "both"
    },
    { 
      kz: "VR Университет Тур", 
      ru: "VR Тур по ВУЗам", 
      desc_kz: "360° кампус аралау", 
      desc_ru: "360° прогулка по кампусу",
      icon: Eye, 
      color: "bg-purple-50 text-purple-600",
      size: "col-span-1",
      isVRTours: true,
      type: "both"
    },
    { 
      kz: "Қаржылық сауаттылық", 
      ru: "Фин. грамотность", 
      desc_kz: "Кредит және гранттар", 
      desc_ru: "Кредиты и гранты",
      icon: Wallet, 
      color: "bg-orange-50 text-orange-600",
      size: "col-span-2",
      isFinLit: true,
      type: "both"
    },
  ];

  const filteredActions = bentoActions.filter(a => a.type === "both" || a.type === userType);

  const calculateGrantProbability = () => {
    const untScore = parseInt(grantData.unt) || 0;
    if (untScore < 50) return 0;
    if (untScore >= 130) return 95;
    if (untScore >= 110) return 75;
    if (untScore >= 90) return 50;
    return 20;
  };

  const grantProbability = calculateGrantProbability();

  const calculatePlatonus = () => {
    const r1 = parseFloat(calcData.rk1) || 0;
    const r2 = parseFloat(calcData.rk2) || 0;
    const ex = parseFloat(calcData.exam) || 0;
    const admissionRating = (r1 + r2) / 2;
    const finalGrade = admissionRating * 0.6 + ex * 0.4;
    return { admissionRating, finalGrade };
  };

  const handleActionClick = (action: any) => {
    if (action.isCalc) setShowCalculator(true);
    else if (action.isGrantCalc) setShowGrantCalc(true);
    else if (action.isCareerPath) setShowCareerPath(true);
    else if (action.isAutoApply) setShowAutoApply(true);
    else if (action.isMarketplace) setShowMarketplace(true);
    else if (action.isVRTours) setShowVRTours(true);
    else if (action.isFinLit) setShowFinLit(true);
    else handleSend(language === 'kz' ? action.kz : action.ru);
  };

  const { admissionRating, finalGrade } = calculatePlatonus();

  if (!userType) {
    return (
      <div className="flex h-screen bg-[#FDFDFD] items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-inner"
            >
              <GraduationCap size={64} strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-5xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">
              UniHelper Kazakhstan
            </h1>
            <p className="text-slate-500 text-xl max-w-lg mx-auto leading-relaxed">
              {language === 'kz' 
                ? 'Сіз кімсіз? Біз сізге сәйкес көмекшіні дайындаймыз.' 
                : 'Кто вы? Мы подготовим для вас подходящего помощника.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.button
              whileHover={{ y: -10 }}
              onClick={() => setUserType('pupil')}
              className="group p-10 bg-white border border-slate-100 rounded-[3rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all text-left"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
                {language === 'kz' ? 'Оқушы / Талапкер' : 'Ученик / Абитуриент'}
              </h2>
              <p className="text-slate-500 leading-relaxed">
                {language === 'kz' 
                  ? 'ҰБТ-ға дайындық, гранттар тізімі және мамандық таңдау бойынша көмек.' 
                  : 'Подготовка к ЕНТ, список грантов и помощь в выборе профессии.'}
              </p>
              <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold">
                <span>{language === 'kz' ? 'Таңдау' : 'Выбрать'}</span>
                <ChevronRight size={20} />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -10 }}
              onClick={() => setUserType('student')}
              className="group p-10 bg-white border border-slate-100 rounded-[3rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all text-left"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
                {language === 'kz' ? 'Студент' : 'Студент'}
              </h2>
              <p className="text-slate-500 leading-relaxed">
                {language === 'kz' 
                  ? 'СӨЖ/РК көмек, сессияға дайындық және Платонус калькуляторы.' 
                  : 'Помощь с СРС/РК, подготовка к сессии и калькулятор Платонус.'}
              </p>
              <div className="mt-8 flex items-center gap-2 text-emerald-600 font-bold">
                <span>{language === 'kz' ? 'Таңдау' : 'Выбрать'}</span>
                <ChevronRight size={20} />
              </div>
            </motion.button>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setLanguage('kz')}
                className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${language === 'kz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ҚАЗАҚША
              </button>
              <button 
                onClick={() => setLanguage('ru')}
                className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${language === 'ru' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                РУССКИЙ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-10">
          <button 
            onClick={() => setUserType(null)}
            className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
          >
            <GraduationCap size={28} />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-xl tracking-tight">UniHelper</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {userType === 'student' ? (language === 'kz' ? 'Студенттерге' : 'Студентам') : (language === 'kz' ? 'Оқушыларға' : 'Ученикам')}
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setMessages([])}
          className="group flex items-center justify-between w-full p-4 mb-8 bg-slate-900 hover:bg-indigo-600 rounded-2xl transition-all shadow-lg shadow-slate-200 text-white"
        >
          <div className="flex items-center gap-3">
            <Plus size={20} />
            <span className="font-semibold text-sm">{language === 'kz' ? 'Жаңа чат' : 'Новый чат'}</span>
          </div>
          <Sparkles size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              {language === 'kz' ? 'Танымал' : 'Популярное'}
            </p>
            <div className="space-y-2">
              {filteredActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action)}
                  className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl transition-all text-left group border border-transparent hover:border-slate-100"
                >
                  <div className={`p-2 rounded-lg ${action.color} transition-transform group-hover:scale-110`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                    {language === 'kz' ? action.kz : action.ru}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setLanguage('kz')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${language === 'kz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ҚАЗАҚША
            </button>
            <button 
              onClick={() => setLanguage('ru')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${language === 'ru' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              РУССКИЙ
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[#FDFDFD]">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setUserType(null)}
              className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"
            >
              <GraduationCap size={20} />
            </button>
            <div>
              <h2 className="font-display font-bold text-lg">
                {language === 'kz' ? 'ЖИ Көмекші' : 'ИИ Помощник'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {userType === 'student' ? (language === 'kz' ? 'Студент' : 'Студент') : (language === 'kz' ? 'Оқушы' : 'Ученик')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <Globe size={14} className="text-indigo-500" />
              <span className="text-xs font-semibold text-slate-600">Kazakhstan Education</span>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-12"
              >
                <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-inner">
                  <Bot size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-4xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">
                  {language === 'kz' ? 'Қалай көмектесе аламын?' : 'Чем я могу помочь?'}
                </h2>
                <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                  {userType === 'student' 
                    ? (language === 'kz' ? 'СӨЖ, РК және сессия бойынша барлық сұрақтарға жауап беремін.' : 'Отвечу на все вопросы по СРС, РК и сессии.')
                    : (language === 'kz' ? 'ҰБТ, гранттар және университеттер туралы бәрін білемін.' : 'Я знаю всё о ЕНТ, грантах и университетах.')}
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {filteredActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleActionClick(action)}
                    className={`${action.size} group relative overflow-hidden p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all text-left`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <action.icon size={24} />
                    </div>
                    <h3 className="font-display font-bold text-slate-900 mb-1">
                      {language === 'kz' ? action.kz : action.ru}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {language === 'kz' ? action.desc_kz : action.desc_ru}
                    </p>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} className="text-indigo-500" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`flex gap-6 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm border ${
                    message.role === "user" 
                      ? "bg-slate-900 border-slate-800 text-white" 
                      : "bg-white border-slate-100 text-indigo-600"
                  }`}>
                    {message.role === "user" ? <User size={24} /> : <Bot size={24} />}
                  </div>
                  <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${
                    message.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                  }`}>
                    <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold prose-headings:text-inherit prose-strong:text-inherit prose-ul:my-4">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                    <div className={`text-[10px] mt-4 font-bold uppercase tracking-widest opacity-40 ${message.role === "user" ? "text-right" : "text-left"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm animate-pulse">
                    <Bot size={24} />
                  </div>
                  <div className="bg-white border border-slate-100 p-6 rounded-[2rem] rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                    </div>
                    <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                      {language === 'kz' ? 'Ойлануда...' : 'Думаю...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-12 pb-8 pt-4 bg-gradient-to-t from-[#FDFDFD] via-[#FDFDFD] to-transparent">
          <div className="max-w-4xl mx-auto mb-4 flex flex-wrap gap-2">
            {(userType === 'pupil' ? [
              { kz: "ҰБТ кеңестері", ru: "Советы ЕНТ" },
              { kz: "Гранттар тізімі", ru: "Список грантов" },
              { kz: "Шығармашылық емтихан", ru: "Творческий экзамен" }
            ] : [
              { kz: "СӨЖ жазу үлгісі", ru: "Образец СРС" },
              { kz: "РК-ға дайындық", ru: "Подготовка к РК" },
              { kz: "Стипендия түрлері", ru: "Виды стипендий" }
            ]).map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(language === 'kz' ? chip.kz : chip.ru)}
                className="px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
              >
                {language === 'kz' ? chip.kz : chip.ru}
              </button>
            ))}
          </div>
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition-opacity" />
            <div className="relative bg-white border border-slate-200 rounded-[2.2rem] shadow-2xl shadow-slate-200/50 flex items-end p-2 pr-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={language === 'kz' ? "Сұрағыңызды жазыңыз..." : "Введите ваш вопрос..."}
                className="flex-1 bg-transparent border-none py-4 px-6 focus:ring-0 text-slate-700 placeholder:text-slate-300 resize-none min-h-[64px] max-h-40 font-medium"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="mb-1.5 p-4 bg-indigo-600 text-white rounded-3xl hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                <Send size={22} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
              <MapPin size={10} />
              <span>Kazakhstan</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
              UniHelper v2.0 Crafted with AI
            </p>
          </div>
        </div>
      </main>

      {/* Grant Probability Modal */}
      <AnimatePresence>
        {showGrantCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGrantCalc(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Percent size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl">
                      {language === 'kz' ? 'Грант мүмкіндігі' : 'Шанс на грант'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowGrantCalc(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      {language === 'kz' ? 'ҰБТ Балы' : 'Балл ЕНТ'}
                    </label>
                    <input 
                      type="number" 
                      value={grantData.unt}
                      onChange={(e) => setGrantData({...grantData, unt: e.target.value})}
                      placeholder="0-140"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      {language === 'kz' ? 'Мамандық' : 'Специальность'}
                    </label>
                    <input 
                      type="text" 
                      value={grantData.specialty}
                      onChange={(e) => setGrantData({...grantData, specialty: e.target.value})}
                      placeholder={language === 'kz' ? "Мысалы: IT" : "Например: IT"}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-slate-700"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-700 font-bold">
                          {language === 'kz' ? 'Мүмкіндік:' : 'Вероятность:'}
                        </span>
                        <span className="text-3xl font-display font-black text-emerald-600">
                          {grantProbability}%
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${grantProbability}%` }}
                          className="bg-emerald-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <Info size={14} className="text-slate-400" />
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">
                        {language === 'kz' 
                          ? 'Бұл өткен жылғы статистикаға негізделген болжам. Ресми мәліметтерді тексеріңіз.' 
                          : 'Это прогноз на основе статистики прошлых лет. Проверяйте официальные данные.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalculator(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                      <Calculator size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl">
                      {language === 'kz' ? 'Платонус калькуляторы' : 'Калькулятор Платонус'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowCalculator(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        {language === 'kz' ? 'РК 1' : 'РК 1'}
                      </label>
                      <input 
                        type="number" 
                        value={calcData.rk1}
                        onChange={(e) => setCalcData({...calcData, rk1: e.target.value})}
                        placeholder="0-100"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        {language === 'kz' ? 'РК 2' : 'РК 2'}
                      </label>
                      <input 
                        type="number" 
                        value={calcData.rk2}
                        onChange={(e) => setCalcData({...calcData, rk2: e.target.value})}
                        placeholder="0-100"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      {language === 'kz' ? 'Емтихан' : 'Экзамен'}
                    </label>
                    <input 
                      type="number" 
                      value={calcData.exam}
                      onChange={(e) => setCalcData({...calcData, exam: e.target.value})}
                      placeholder="0-100"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none font-bold text-slate-700"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-slate-500">
                        {language === 'kz' ? 'Рейтинг (60%):' : 'Рейтинг (60%):'}
                      </span>
                      <span className="font-display font-bold text-slate-900">
                        {admissionRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-6 bg-cyan-50 rounded-3xl border border-cyan-100">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-700 font-bold">
                          {language === 'kz' ? 'Қорытынды балл:' : 'Итоговый балл:'}
                        </span>
                        <span className="text-3xl font-display font-black text-cyan-600">
                          {finalGrade.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <Info size={14} className="text-slate-400" />
                      <p className="text-[10px] text-slate-400 font-medium">
                        {language === 'kz' 
                          ? 'Өту балы әдетте 50-ден жоғары болуы керек.' 
                          : 'Для прохождения обычно нужно более 50 баллов.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* AI Career Path Modal */}
      <AnimatePresence>
        {showCareerPath && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCareerPath(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                      <Brain size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl">
                      {language === 'kz' ? 'AI Career Path' : 'AI Career Path'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowCareerPath(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                    <h4 className="font-bold text-rose-900 mb-2">
                      {language === 'kz' ? 'Тұлғалық диагностика' : 'Личностная диагностика'}
                    </h4>
                    <p className="text-sm text-rose-700 leading-relaxed">
                      {language === 'kz' 
                        ? 'Біздің AI сіздің қызығушылықтарыңызды талдап, ең қолайлы мамандықты ұсынады.' 
                        : 'Наш ИИ проанализирует ваши интересы и предложит наиболее подходящую профессию.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { q_kz: "Математика мен логикалық есептерді шешкен ұнай ма?", q_ru: "Нравится ли вам решать математические и логические задачи?" },
                      { q_kz: "Шығармашылықпен айналысқанды ұнатасыз ба (сурет салу, дизайн)?", q_ru: "Любите ли вы заниматься творчеством (рисование, дизайн)?" },
                      { q_kz: "Адамдармен жұмыс істегенді ұнатасыз ба?", q_ru: "Нравится ли вам работать с людьми?" }
                    ].map((q, i) => (
                      <div key={i} className="space-y-3">
                        <p className="font-semibold text-slate-700">{language === 'kz' ? q.q_kz : q.q_ru}</p>
                        <div className="flex gap-4">
                          {['Иә', 'Жоқ'].map((ans, j) => {
                            const val = ans === 'Иә' ? 'yes' : 'no';
                            const isSelected = careerAnswers[i] === val;
                            return (
                              <button 
                                key={j} 
                                onClick={() => setCareerAnswers(prev => ({ ...prev, [i]: val }))}
                                className={`flex-1 py-3 px-6 border rounded-2xl transition-all font-bold ${
                                  isSelected 
                                    ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100" 
                                    : "bg-slate-50 border-slate-100 text-slate-600 hover:border-rose-500 hover:bg-rose-50"
                                }`}
                              >
                                {language === 'kz' ? ans : (ans === 'Иә' ? 'Да' : 'Нет')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      const answersStr = Object.entries(careerAnswers)
                        .map(([i, val]) => `Q${Number(i)+1}: ${val}`)
                        .join(", ");
                      setShowCareerPath(false);
                      handleSend(language === 'kz' 
                        ? `Менің тест нәтижелерім: ${answersStr}. Маған мамандық ұсын.` 
                        : `Мои результаты теста: ${answersStr}. Предложи мне профессию.`);
                    }}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all disabled:opacity-50"
                    disabled={Object.keys(careerAnswers).length < 3}
                  >
                    {language === 'kz' ? 'AI Талдауын алу' : 'Получить AI Анализ'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-Apply Modal */}
      <AnimatePresence>
        {showAutoApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutoApply(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <ClipboardCheck size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl">
                      {language === 'kz' ? 'Жеке кабинет (Auto-Apply)' : 'Личный кабинет (Auto-Apply)'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowAutoApply(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name_kz: "Жеке куәлік", name_ru: "Удостоверение личности", status: "Uploaded" },
                      { name_kz: "Аттестат", name_ru: "Аттестат", status: "Pending" },
                      { name_kz: "Медициналық анықтама (075у)", name_ru: "Мед. справка (075у)", status: "Missing" },
                      { name_kz: "ҰБТ Сертификаты", name_ru: "Сертификат ЕНТ", status: "Uploaded" }
                    ].map((doc, i) => (
                      <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{language === 'kz' ? doc.name_kz : doc.name_ru}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${
                            doc.status === 'Uploaded' ? 'text-emerald-500' : doc.status === 'Pending' ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {doc.status}
                          </p>
                        </div>
                        <Plus size={16} className="text-slate-400 cursor-pointer hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                      <Globe size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-900">eGov Integration</p>
                      <p className="text-xs text-indigo-700">
                        {language === 'kz' ? 'Құжаттарды eGov арқылы автоматты түрде тарту' : 'Автоматическая подгрузка документов через eGov'}
                      </p>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    {language === 'kz' ? 'Университетке тапсыру' : 'Подать в университет'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Marketplace Modal */}
      <AnimatePresence>
        {showMarketplace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMarketplace(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl">
                      {language === 'kz' ? 'Marketplace' : 'Marketplace'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowMarketplace(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-4">
                      {language === 'kz' ? 'Курстар' : 'Курсы'}
                    </h4>
                    <div className="space-y-4">
                      {[
                        { title: "UNT Intensive 2024", provider: "Daryn Online", price: "15,000 ₸" },
                        { title: "IELTS Preparation", provider: "InterPress", price: "45,000 ₸" },
                        { title: "Python for Beginners", provider: "AITU Academy", price: "Free" }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-500 transition-all cursor-pointer">
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500">{item.provider}</span>
                            <span className="text-sm font-black text-blue-600">{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-4">
                      {language === 'kz' ? 'Менторлар (Амбассадорлар)' : 'Менторы (Амбассадоры)'}
                    </h4>
                    <div className="space-y-4">
                      {[
                        { name: "Alisher K.", uni: "KBTU", role: "Computer Science" },
                        { name: "Dana M.", uni: "NU", role: "Biological Sciences" },
                        { name: "Serik T.", uni: "AITU", role: "Cyber Security" }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${item.name}/100/100`} alt={item.name} referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.uni} • {item.role}</p>
                          </div>
                          <MessageSquare size={16} className="ml-auto text-blue-500" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VR Tours Modal */}
      <AnimatePresence>
        {showVRTours && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowVRTours(false);
                setSelectedTour(null);
              }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-full md:h-[85vh] bg-white md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <AnimatePresence mode="wait">
                {!selectedTour ? (
                  <motion.div 
                    key="selector"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-8 h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                          <Eye size={24} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-2xl">
                            {language === 'kz' ? 'VR Университет Тур' : 'VR Тур по ВУЗам'}
                          </h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select Campus Destination</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowVRTours(false)}
                        className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-2 pb-4">
                      {[
                        { 
                          name: "Nazarbayev University", 
                          city: "Shymkent", 
                          img: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1000", 
                          desc_kz: "Технологиялық хаб пен заманауи кампус", 
                          desc_ru: "Технологический хаб и современный кампус",
                          scenes: [
                            { name_kz: "Кіреберіс", name_ru: "Вход", img: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1000" },
                            { name_kz: "Кітапхана", name_ru: "Библиотека", img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000" },
                            { name_kz: "Зертхана", name_ru: "Лаборатория", img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1000" }
                          ]
                        },
                        { 
                          name: "KBTU", 
                          city: "Almaty", 
                          img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000", 
                          desc_kz: "Тарихи ғимарат пен қаржы орталығы", 
                          desc_ru: "Историческое здание и финансовый центр",
                          scenes: [
                            { name_kz: "Кампус", name_ru: "Кампус", img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000" },
                            { name_kz: "Аудитория", name_ru: "Аудитория", img: "https://images.unsplash.com/photo-1576491880732-58e104037568?auto=format&fit=crop&q=80&w=1000" }
                          ]
                        },
                        { 
                          name: "Auezov University (SKU)", 
                          city: "Shymkent", 
                          img: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&q=80&w=1000", 
                          desc_kz: "Шымкенттегі ең ірі мемлекеттік университет", 
                          desc_ru: "Крупнейший государственный университет в Шымкенте",
                          scenes: [
                            { name_kz: "Бас ғимарат", name_ru: "Главный корпус", img: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&q=80&w=1000" },
                            { name_kz: "Мәжіліс залы", name_ru: "Актовый зал", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000" }
                          ]
                        }
                      ].map((uni, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -8 }}
                          onClick={() => setSelectedTour(uni)}
                          className="group relative rounded-[2.5rem] overflow-hidden aspect-[3/4] cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                        >
                          <img 
                            src={uni.img} 
                            alt={uni.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent p-8 flex flex-col justify-end">
                            <span className="bg-purple-500/20 backdrop-blur-md text-purple-200 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full w-fit mb-3">
                              {uni.city}
                            </span>
                            <h4 className="text-white font-display font-bold text-2xl mb-2 group-hover:text-purple-300 transition-colors">{uni.name}</h4>
                            <p className="text-slate-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                              {language === 'kz' ? uni.desc_kz : uni.desc_ru}
                            </p>
                            <div className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl transition-all border border-white/10">
                              <Sparkles size={16} className="text-purple-400" />
                              <span>{language === 'kz' ? 'Турды бастау' : 'Начать тур'}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="viewer"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative flex-1 bg-black overflow-hidden"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMousePos({
                        x: ((e.clientX - rect.left) / rect.width) - 0.5,
                        y: ((e.clientY - rect.top) / rect.height) - 0.5
                      });
                    }}
                  >
                    {/* Simulated 360 Panorama Viewer */}
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div 
                        animate={{ 
                          x: mousePos.x * -100,
                          y: mousePos.y * -50,
                        }}
                        transition={{ type: "spring", stiffness: 20, damping: 10 }}
                        className="absolute inset-[-20%]"
                      >
                        <img 
                          src={selectedTour.scenes[currentScene].img} 
                          className="w-full h-full object-cover blur-[1px] opacity-30 scale-110"
                          alt="bg"
                        />
                      </motion.div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-full max-w-5xl max-h-[70vh] rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl">
                        <motion.img 
                          animate={{ 
                            x: mousePos.x * -150,
                            y: mousePos.y * -80,
                            scale: 1.2
                          }}
                          transition={{ type: "spring", stiffness: 25, damping: 15 }}
                          src={selectedTour.scenes[currentScene].img} 
                          className="w-full h-full object-cover"
                          alt="tour"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                        
                        {/* 360 Hotspots Simulation */}
                        <div className="absolute inset-0">
                          {selectedTour.scenes.map((scene: any, idx: number) => {
                            if (idx === currentScene) return null;
                            const positions = [
                              { top: '40%', left: '30%' },
                              { top: '60%', left: '70%' },
                              { top: '30%', left: '60%' }
                            ];
                            const pos = positions[idx % positions.length];
                            
                            return (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ 
                                  opacity: 1,
                                  x: mousePos.x * -150,
                                  y: mousePos.y * -80,
                                }}
                                style={{ top: pos.top, left: pos.left }}
                                className="absolute pointer-events-auto"
                              >
                                <button 
                                  onClick={() => setCurrentScene(idx)}
                                  className="group relative flex flex-col items-center"
                                >
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/50 shadow-xl flex items-center justify-center group-hover:scale-125 group-active:scale-95 transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                                  </div>
                                  <div className="absolute top-12 bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {language === 'kz' ? scene.name_kz : scene.name_ru}
                                  </div>
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* HUD Controls */}
                    <div className="absolute top-8 left-8 right-8 flex items-start justify-between pointer-events-none">
                      <div className="pointer-events-auto flex flex-col gap-1">
                        <h4 className="text-white font-display font-black text-4xl shadow-sm tracking-tight">{selectedTour.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-emerald-200" />
                          <span className="text-white/80 text-xs font-black uppercase tracking-[0.4em] drop-shadow-md">
                            {language === 'kz' ? selectedTour.scenes[currentScene].name_kz : selectedTour.scenes[currentScene].name_ru}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pointer-events-auto">
                        <button 
                          onClick={() => {
                            setSelectedTour(null);
                            setCurrentScene(0);
                          }}
                          className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl"
                        >
                          {language === 'kz' ? 'Тізімге қайту' : 'К списку'}
                        </button>
                        <button 
                          onClick={() => {
                            setShowVRTours(false);
                            setSelectedTour(null);
                            setCurrentScene(0);
                          }}
                          className="p-4 bg-white/10 hover:bg-rose-500/50 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] text-white transition-all shadow-xl"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-12 py-8 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                      <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 cursor-pointer transition-opacity group">
                        <button className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white/20 transition-all"><MapPin size={24} /></button>
                        <span className="text-[10px] text-white/60 font-black tracking-widest group-hover:text-white">MAP</span>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div className="flex flex-col items-center gap-2">
                        <button className="w-14 h-14 bg-white text-slate-900 rounded-3xl flex items-center justify-center shadow-2xl scale-110"><Eye size={28} /></button>
                        <span className="text-[10px] text-white font-black tracking-[0.2em] mt-1">IMMERSIVE</span>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 cursor-pointer transition-opacity group">
                        <button className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white/20 transition-all"><Users size={24} /></button>
                        <span className="text-[10px] text-white/60 font-black tracking-widest group-hover:text-white">GUIDE</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Financial Literacy Modal */}
      <AnimatePresence>
        {showFinLit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinLit(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <Wallet size={20} />
                    </div>
                    <h3 className="font-display font-bold text-xl">
                      {language === 'kz' ? 'Қаржылық сауаттылық' : 'Фин. грамотность'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowFinLit(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {[
                    { 
                      title_kz: "Студенттік несиелер", 
                      title_ru: "Студенческие кредиты", 
                      desc_kz: "Мемлекеттік кепілдікпен берілетін төмен пайызды несиелер.",
                      desc_ru: "Кредиты с низкой ставкой под государственную гарантию.",
                      icon: CreditCard
                    },
                    { 
                      title_kz: "Бөліп төлеу (Installments)", 
                      title_ru: "Рассрочка", 
                      desc_kz: "Университет оқу ақысын семестрге бөліп төлеу мүмкіндігі.",
                      desc_ru: "Возможность оплаты обучения частями по семестрам.",
                      icon: Calendar
                    },
                    { 
                      title_kz: "Ішкі гранттар (Ректор гранты)", 
                      title_ru: "Внутренние гранты (Грант ректора)", 
                      desc_kz: "Оқудағы жетістіктері үшін университет тарапынан берілетін жеңілдіктер.",
                      desc_ru: "Скидки и гранты от университета за академические успехи.",
                      icon: GraduationCap
                    }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex gap-6 hover:border-orange-500 transition-all">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm flex-shrink-0">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{language === 'kz' ? item.title_kz : item.title_ru}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{language === 'kz' ? item.desc_kz : item.desc_ru}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
