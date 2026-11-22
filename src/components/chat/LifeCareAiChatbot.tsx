import React, { useState, useRef, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  Sparkles,
  X,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  Bot,
  User,
  Radio,
  Sun,
  Moon
} from 'lucide-react';
import {
  queryLifeCareKnowledgeBase,
  detectLanguage,
  SUGGESTED_QUICK_QUESTIONS,
  ChatMessage
} from '../../services/lifeCareKnowledgeService';
import { speakTextWithSarvam, stopSarvamSpeech } from '../../services/sarvamAiService';
import { startVoiceSos, stopVoiceSos } from '../../utils/speechService';

let msgCounter = 0;
const getUniqueId = (prefix: string): string => {
  msgCounter += 1;
  return `${prefix}-${msgCounter}-${Math.random().toString(36).substring(2, 7)}`;
};

const getNowTimeStr = (): string => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Parses inline bold (**text**) and inline backticks (`code`)
 * Explicitly respects the active theme to avoid white-on-white text
 */
const renderInlineSpans = (text: string, isDark: boolean): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold ${
            isDark
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

/**
 * Renders structured markdown (headings, numbered lists, bullet lists, bold text)
 * Strips noisy emoji symbols and guarantees high-contrast text
 */
const renderFormattedText = (rawText: string, isDark: boolean): React.ReactNode => {
  const cleanHeader = rawText
    .replace(/^###\s*(?:🌟|⚡|🛡️|🩺|🎙️|🚑)?\s*/gmu, '### ')
    .replace(/(?:🌟|⚡)/gu, '');

  const lines = cleanHeader.split('\n');
  return (
    <div className={`space-y-1.5 text-xs leading-relaxed break-words overflow-hidden ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3 or bold heading (### ...)
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s*/, '');
          return (
            <div key={idx} className={`font-extrabold text-[13px] pt-1.5 pb-0.5 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              <span className="w-1.5 h-3.5 bg-red-500 rounded-full inline-block shrink-0"></span>
              <span>{renderInlineSpans(headingText, isDark)}</span>
            </div>
          );
        }

        // Numbered list: "1. ", "2. "
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 my-1">
              <span className={`flex items-center justify-center w-4 h-4 rounded-full font-mono font-bold text-[10px] shrink-0 mt-0.5 border ${
                isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {numMatch[1]}
              </span>
              <div className="flex-1">{renderInlineSpans(numMatch[2], isDark)}</div>
            </div>
          );
        }

        // Bullet list: "- ", "• ", "* "
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.replace(/^[-•*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
              <div className="flex-1">{renderInlineSpans(bulletContent, isDark)}</div>
            </div>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="my-0.5">
            {renderInlineSpans(trimmed, isDark)}
          </p>
        );
      })}
    </div>
  );
};

export const LifeCareAiChatbot: React.FC = () => {
  const { theme, toggleTheme } = useEmergency();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [preferredLang, setPreferredLang] = useState<'en' | 'hi'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `### Welcome! I am Niro
I am **Niro**, your LifeCare Gen AI Clinical Copilot for our Zero-Wait Emergency Healthcare Network.

**How I can assist you:**
- **<10ms Atomic Resource Lock:** Deterministic reservation of ER bay, specialist doctor, and equipment simultaneously.
- **0-Second ER Reception Bypass:** Contactless ABDM v3, ABHA health records, and PM-JAY verification.
- **108 Paramedic GPS Corridor:** Turn-by-turn emergency routing and continuous live vitals streaming.
- **Specialist Doctor Rostering:** Verified medical qualifications (MBBS, MD, DM, FRCS) and bay allocation.
- **Super Admin Governance:** Zero-trust audit logging and centralized directory control.

Tap any question below or ask me anything in **English** or **हिन्दी**!`,
      timestamp: 'Just now',
      suggestedFollowUps: SUGGESTED_QUICK_QUESTIONS.slice(0, 4)
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Auto-detect language directly from text (Devanagari, Hindi, or English)
    const detected = detectLanguage(text);
    const activeLang: 'en' | 'hi' = detected || preferredLang;
    if (detected && detected !== preferredLang) {
      setPreferredLang(detected);
    }

    const userMessage: ChatMessage = {
      id: getUniqueId('user'),
      sender: 'user',
      text,
      timestamp: getNowTimeStr()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReplyText = await queryLifeCareKnowledgeBase(text, activeLang);
      const aiMessage: ChatMessage = {
        id: getUniqueId('ai'),
        sender: 'ai',
        text: aiReplyText,
        timestamp: getNowTimeStr()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: getUniqueId('ai-err'),
        sender: 'ai',
        text: activeLang === 'hi'
          ? 'अस्थायी कनेक्शन समस्या आई है। LifeCare <10ms एटॉमिक लॉकिंग, ABDM v3 ज़ीरो-वेट रिसेप्शन और Sarvam AI वॉइस ट्रायज पर काम करता है। कृपया पुनः पूछें।'
          : 'I encountered a temporary connection issue. LifeCare operates on <10ms atomic locking, ABDM v3 zero-wait admission, and Sarvam AI voice triage. Please ask again!',
        timestamp: getNowTimeStr()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = async (msgId: string, text: string) => {
    if (isSpeakingId === msgId) {
      stopSarvamSpeech();
      setIsSpeakingId(null);
      return;
    }

    // Auto-detect language of the specific text so it always plays in authentic native voice
    const msgLang = detectLanguage(text) || preferredLang;

    // Strip markdown formatting and noisy emoji glyphs for clean natural speech synthesis
    const cleanSpeech = text
      .replace(/[#*`_~[\]()]/g, '')
      .replace(/###/g, '')
      .replace(/[-•*]\s*/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim()
      .slice(0, 450);

    setIsSpeakingId(msgId);
    try {
      await speakTextWithSarvam(cleanSpeech, {
        langCode: msgLang === 'hi' ? 'hi-IN' : 'en-IN',
        speaker: 'priya',
        onStart: () => setIsSpeakingId(msgId),
        onEnd: () => setIsSpeakingId(null),
        onError: () => setIsSpeakingId(null)
      });
    } catch {
      setIsSpeakingId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleMicToggle = () => {
    if (isListeningMic) {
      stopVoiceSos();
      setIsListeningMic(false);
      return;
    }

    setIsListeningMic(true);
    startVoiceSos({
      langCode: preferredLang === 'hi' ? 'hi-IN' : 'en-IN',
      onTranscript: (spokenText: string) => {
        setInputText(spokenText);
        // Automatically switch language directly if Hindi speech is spoken or English is spoken
        const detected = detectLanguage(spokenText);
        if (detected && detected !== preferredLang) {
          setPreferredLang(detected);
        }
      },
      onListeningChange: (listening: boolean) => {
        setIsListeningMic(listening);
      },
      onError: () => {
        setIsListeningMic(false);
      }
    });
  };

  return (
    <>
      {/* Floating Trigger Button: Solid, High-Contrast Niro Widget */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border group ${
            isDark
              ? 'bg-[#0f1424] border-red-500/60 hover:border-red-400 text-white shadow-black/80 ring-1 ring-white/10'
              : 'bg-white border-red-300 hover:border-red-500 text-slate-900 shadow-slate-900/15 ring-1 ring-slate-900/5'
          }`}
          title="Open Niro • LifeCare Gen AI Copilot"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white shadow-md">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900 animate-ping"></span>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                Niro
              </span>
              <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full bg-red-600 text-white uppercase tracking-wider">
                AI Copilot
              </span>
            </div>
            <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Sarvam AI Powered • Ask Anything
            </span>
          </div>
        </button>
      )}

      {/* Main Copilot Modal: Solid, High-Opacity Opaque Card (Zero Background Bleed-Through) */}
      {isOpen && (
        <div className={`fixed bottom-4 sm:bottom-6 right-2 sm:right-6 z-50 w-[96vw] sm:w-[470px] h-[640px] max-h-[88vh] flex flex-col rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.65)] overflow-hidden border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-zinc-800 text-zinc-100 ring-1 ring-white/10'
            : 'bg-white border-slate-200 text-slate-900 ring-1 ring-slate-900/5'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-zinc-800 bg-[#0e1424]' : 'border-slate-200 bg-slate-50/90'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0e1424]"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Niro
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    Gen AI Copilot
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    ONLINE
                  </span>
                </div>
                <p className={`text-[11px] font-mono flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <span>Sarvam Indic AI</span>
                  <span>•</span>
                  <span>Clinical Intelligence</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setPreferredLang(preferredLang === 'en' ? 'hi' : 'en')}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white hover:border-red-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-red-400'
                }`}
                title="Toggle Language: English / हिन्दी"
              >
                {preferredLang === 'en' ? 'EN' : 'हिन्दी'}
              </button>

              {/* Theme Toggle Button inside Niro for Phone & Desktop */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                  isDark
                    ? 'bg-zinc-900 text-amber-400 border-zinc-700 hover:text-white'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSarvamSpeech();
                  setIsSpeakingId(null);
                  setIsOpen(false);
                }}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}
                title="Close Niro"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips Strip */}
          <div className={`px-3 py-2 border-b overflow-x-auto flex items-center gap-1.5 text-[11px] font-mono shrink-0 ${
            isDark ? 'border-zinc-800 bg-[#090d18]' : 'border-slate-200 bg-slate-100/70'
          }`}>
            <span className={`text-[10px] uppercase font-bold shrink-0 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              Ask Niro:
            </span>
            {SUGGESTED_QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full border transition cursor-pointer text-[10px] font-bold ${
                  isDark
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-red-500'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-red-400 shadow-2xs'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area: Completely Opaque Solid Canvas */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
            isDark ? 'bg-[#080c16]' : 'bg-slate-50'
          }`}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[88%] rounded-2xl p-4 space-y-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-none shadow-md shadow-red-600/20'
                      : isDark
                      ? 'bg-[#111728] border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    {/* Header Label inside bubble */}
                    {!isUser && (
                      <div className="flex items-center justify-between pb-1.5 border-b border-red-500/10">
                        <span className="text-[11px] font-bold font-mono text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-red-500" />
                          <span>Niro</span>
                        </span>
                        <span className="text-[10px] font-mono opacity-60">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}

                    {/* Rich Formatted Message Content */}
                    <div className="font-sans">
                      {isUser ? (
                        <p className="font-medium">{msg.text}</p>
                      ) : (
                        renderFormattedText(msg.text, isDark)
                      )}
                    </div>

                    {/* Action Bar for Niro Replies: Prominent READ ALOUD & Copy on EVERY reply */}
                    {!isUser && (
                      <div className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono ${
                        isDark ? 'border-zinc-800/80 text-zinc-400' : 'border-slate-100 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-2">
                          {/* Mandatory Read Aloud Button on EVERY reply */}
                          <button
                            type="button"
                            onClick={() => handleToggleSpeak(msg.id, msg.text)}
                            className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                              isSpeakingId === msg.id
                                ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-md shadow-red-600/30'
                                : isDark
                                ? 'bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-white border-zinc-700 hover:border-red-500'
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300'
                            }`}
                            title={isSpeakingId === msg.id ? 'Stop Speaking' : 'Read Aloud with Sarvam Indic TTS Voice'}
                          >
                            {isSpeakingId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-white animate-pulse" />
                                <span>Stop Audio</span>
                                <span className="flex items-center gap-0.5 ml-1">
                                  <span className="w-1 h-2 bg-white animate-pulse"></span>
                                  <span className="w-1 h-3.5 bg-white animate-pulse delay-75"></span>
                                  <span className="w-1 h-2 bg-white animate-pulse delay-150"></span>
                                </span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className={`px-2 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                              copiedId === msg.id
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold'
                                : isDark
                                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                            }`}
                            title="Copy Answer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Speaking Status indicator */}
                        {isSpeakingId === msg.id && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold font-mono animate-pulse">
                            <Radio className="w-3 h-3" />
                            <span>Speaking (Sarvam TTS)...</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-400 p-3 bg-red-500/5 rounded-2xl border border-red-500/10">
                <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                <span>Niro is analyzing LifeCare knowledge with Sarvam AI...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar: Solid Opaque Footer */}
          <div className={`p-3 border-t shrink-0 ${
            isDark ? 'border-zinc-800 bg-[#0e1424]' : 'border-slate-200 bg-white'
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
                  isListeningMic
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : isDark
                    ? 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                }`}
                title={isListeningMic ? 'Stop Recording' : 'Speak Question to Niro (Hindi / English)'}
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputText(val);
                  // Automatically switch language directly if Hindi Devanagari or English is typed/pasted
                  const detected = detectLanguage(val);
                  if (detected && detected !== preferredLang) {
                    setPreferredLang(detected);
                  }
                }}
                placeholder={
                  preferredLang === 'hi'
                    ? 'Niro से LifeCare के बारे में कुछ भी पूछें...'
                    : 'Ask Niro about atomic lock, ABDM, doctors, 108...'
                }
                className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition ${
                  isDark
                    ? 'bg-[#080c16] text-white border-zinc-800 focus:border-red-500'
                    : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-red-500'
                }`}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-md shadow-red-600/20 cursor-pointer shrink-0"
                title="Send Question to Niro"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
