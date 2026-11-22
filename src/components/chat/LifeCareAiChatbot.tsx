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
  User
} from 'lucide-react';
import {
  queryLifeCareKnowledgeBase,
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

export const LifeCareAiChatbot: React.FC = () => {
  const { theme } = useEmergency();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [preferredLang, setPreferredLang] = useState<'en' | 'hi'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello! I am the **LifeCare Gen AI Copilot** with complete **A to Z knowledge** of our Zero-Wait Emergency Healthcare Network.\n\nYou can ask me anything about our **<10ms atomic bed mesh**, **Sarvam AI bilingual voice triage**, **0-second reception bypass (ABDM/ABHA)**, **108 driver telemetry**, or **doctor degrees & rostering**!`,
      timestamp: 'Just now',
      suggestedFollowUps: SUGGESTED_QUICK_QUESTIONS.slice(0, 3)
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
      const aiReplyText = await queryLifeCareKnowledgeBase(text, preferredLang);
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
        text: 'I encountered a temporary connection issue. LifeCare operates on <10ms atomic locking, ABDM v3 zero-wait admission, and Sarvam AI voice triage. Please ask again!',
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

    // Strip markdown formatting for cleaner speech synthesis
    const cleanSpeech = text
      .replace(/[#*`_~[\]()]/g, '')
      .replace(/###/g, '')
      .replace(/- /g, '')
      .slice(0, 450);

    setIsSpeakingId(msgId);
    try {
      await speakTextWithSarvam(cleanSpeech, {
        langCode: preferredLang === 'hi' ? 'hi-IN' : 'en-IN',
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
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border group macos-glass ${
            isDark
              ? 'macos-glass-dark border-red-500/50 hover:border-red-400 text-white shadow-red-950/40'
              : 'macos-glass-light border-red-400 hover:border-red-500 text-slate-900 shadow-slate-400/30'
          }`}
          title="Open LifeCare Gen AI Knowledge Copilot"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white shadow-md">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white animate-ping"></span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>LifeCare Gen AI</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-red-600 text-white uppercase">
                A-Z Copilot
              </span>
            </span>
            <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Sarvam AI Powered • Ask Anything
            </span>
          </div>
        </button>
      )}

      {/* Main Glass Copilot Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-5 right-3 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border macos-glass animate-fadeIn transition-colors duration-300">
          <div className={`flex flex-col h-full ${isDark ? 'macos-glass-dark text-zinc-100' : 'macos-glass-light text-slate-900'}`}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-zinc-800/80 bg-zinc-950/60' : 'border-slate-200/80 bg-white/70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      LifeCare Gen AI Copilot
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <p className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Sarvam AI & Full Project Knowledge
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
                      ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Toggle Language: English / हिन्दी"
                >
                  {preferredLang === 'en' ? 'EN' : 'हिन्दी'}
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
                  title="Close AI Copilot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className={`px-3 py-2 border-b overflow-x-auto flex items-center gap-1.5 scrollbar-none text-[11px] font-mono shrink-0 ${
              isDark ? 'border-zinc-800/80 bg-black/40' : 'border-slate-200/80 bg-slate-50/50'
            }`}>
              <span className={`text-[10px] uppercase font-bold shrink-0 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Ask:
              </span>
              {SUGGESTED_QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(q)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700/80 hover:border-red-500'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-red-400 shadow-2xs'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-none shadow-md shadow-red-600/20'
                        : isDark
                        ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-md'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      {/* Formatted Message Content */}
                      <div className="whitespace-pre-line font-sans">
                        {msg.text.split('\n').map((line, lIdx) => {
                          if (line.startsWith('### ') || line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <div key={lIdx} className="font-black text-sm my-1 text-red-500">
                                {line.replace(/###/g, '').replace(/\*\*/g, '')}
                              </div>
                            );
                          }
                          if (line.startsWith('- ') || line.startsWith('• ')) {
                            return (
                              <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
                                <span className="text-red-500 font-bold shrink-0">•</span>
                                <span>{line.replace(/^[-•]\s*/, '')}</span>
                              </div>
                            );
                          }
                          return <p key={lIdx} className="my-0.5">{line}</p>;
                        })}
                      </div>

                      {/* AI Response Tools: Spoken audio and copy */}
                      {!isUser && (
                        <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                          isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-100 text-slate-400'
                        }`}>
                          <span>{msg.timestamp}</span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleSpeak(msg.id, msg.text)}
                              className={`p-1 rounded-md transition flex items-center gap-1 cursor-pointer ${
                                isSpeakingId === msg.id
                                  ? 'bg-red-600 text-white font-bold'
                                  : isDark
                                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                              }`}
                              title={isSpeakingId === msg.id ? 'Stop Speaking' : 'Listen with Sarvam AI Voice'}
                            >
                              {isSpeakingId === msg.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 animate-pulse text-white" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Listen (Sarvam TTS)</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className={`p-1 rounded-md transition cursor-pointer ${
                                copiedId === msg.id
                                  ? 'text-emerald-500 font-bold'
                                  : isDark
                                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                              }`}
                              title="Copy Answer"
                            >
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-zinc-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                  <span>Sarvam Indic Gen AI is analyzing LifeCare knowledge...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className={`p-3 border-t shrink-0 ${isDark ? 'border-zinc-800/80 bg-zinc-950/70' : 'border-slate-200/80 bg-white/80'}`}>
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
                  title={isListeningMic ? 'Stop Recording' : 'Speak Question (Hindi / English)'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    preferredLang === 'hi'
                      ? 'LifeCare के बारे में कुछ भी पूछें...'
                      : 'Ask about atomic lock, ABDM, doctors, 108...'
                  }
                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition ${
                    isDark
                      ? 'bg-black/60 text-white border-zinc-800 focus:border-red-500'
                      : 'bg-white text-slate-900 border-slate-300 focus:border-red-500'
                  }`}
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-md shadow-red-600/20 cursor-pointer shrink-0"
                  title="Send Question"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
