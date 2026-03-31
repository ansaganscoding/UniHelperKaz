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
  X
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"kz" | "ru">("kz");
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcData, setCalcData] = useState({ rk1: "", rk2: "", exam: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
      const model = "gemini-3.1-pro-preview";
      
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
          systemInstruction: SYSTEM_INSTRUCTION,
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
      size: "col-span-2"
    },
    { 
      kz: "Гранттар", 
      ru: "Гранты", 
      desc_kz: "2024 тізімі", 
      desc_ru: "Список 2024",
      icon: GraduationCap, 
      color: "bg-emerald-50 text-emerald-600",
      size: "col-span-1"
    },
    { 
      kz: "Университеттер", 
      ru: "ВУЗы", 
      desc_kz: "ТОП-10", 
      desc_ru: "ТОП-10",
      icon: School, 
      color: "bg-purple-50 text-purple-600",
      size: "col-span-1"
    },
    { 
      kz: "Мамандық таңдау", 
      ru: "Выбор профессии", 
      desc_kz: "Тест тапсыру", 
      desc_ru: "Пройти тест",
      icon: Search, 
      color: "bg-orange-50 text-orange-600",
      size: "col-span-2"
    },
    { 
      kz: "СӨЖ/РК көмек", 
      ru: "Помощь с СРС/РК", 
      desc_kz: "Университет тапсырмалары", 
      desc_ru: "Университетские задания",
      icon: FileText, 
      color: "bg-pink-50 text-pink-600",
      size: "col-span-1"
    },
    { 
      kz: "Сессияға дайындық", 
      ru: "Подготовка к сессии", 
      desc_kz: "Емтихан кеңестері", 
      desc_ru: "Советы к экзаменам",
      icon: Calendar, 
      color: "bg-amber-50 text-amber-600",
      size: "col-span-1"
    },
    { 
      kz: "Платонус калькуляторы", 
      ru: "Калькулятор Платонус", 
      desc_kz: "Баллды есептеу", 
      desc_ru: "Рассчитать балл",
      icon: Calculator, 
      color: "bg-cyan-50 text-cyan-600",
      size: "col-span-2",
      isCalc: true
    },
  ];

  const calculatePlatonus = () => {
    const r1 = parseFloat(calcData.rk1) || 0;
    const r2 = parseFloat(calcData.rk2) || 0;
    const ex = parseFloat(calcData.exam) || 0;
    const admissionRating = (r1 + r2) / 2;
    const finalGrade = admissionRating * 0.6 + ex * 0.4;
    return { admissionRating, finalGrade };
  };

  const { admissionRating, finalGrade } = calculatePlatonus();

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl tracking-tight">UniHelper</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kazakhstan AI</p>
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
              {bentoActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if ('isCalc' in action && action.isCalc) {
                      setShowCalculator(true);
                    } else {
                      handleSend(language === 'kz' ? action.kz : action.ru);
                    }
                  }}
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
            <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">
                {language === 'kz' ? 'ЖИ Көмекші' : 'ИИ Помощник'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
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
                  {language === 'kz' 
                    ? 'Қазақстанның үздік университеттері мен гранттары туралы бәрін білемін.' 
                    : 'Я знаю всё о лучших университетах и грантах Казахстана.'}
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {bentoActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => {
                      if ('isCalc' in action && action.isCalc) {
                        setShowCalculator(true);
                      } else {
                        handleSend(language === 'kz' ? action.kz : action.ru);
                      }
                    }}
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
              <span>Shymkent, Kazakhstan</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
              UniHelper v2.0 Crafted with AI
            </p>
          </div>
        </div>
      </main>

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
    </div>
  );
}
