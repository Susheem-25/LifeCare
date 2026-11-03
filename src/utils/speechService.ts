// Web Speech API Service: Real-time Speech-to-Text (Voice SOS) and Text-to-Speech (TTS)

export const LANG_CODE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  pa: 'pa-IN',
};

// Check if browser supports Web Speech API SpeechRecognition
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
};

// Check if browser supports Web Speech API SpeechSynthesis
export const isSpeechSynthesisSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
};

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

let activeRecognition: SpeechRecognitionInstance | null = null;

export interface VoiceSosOptions {
  langCode?: string;
  onTranscript: (text: string, isFinal: boolean) => void;
  onListeningChange: (listening: boolean) => void;
  onError?: (errorMessage: string) => void;
}

export const startVoiceSos = (options: VoiceSosOptions): boolean => {
  if (typeof window === 'undefined') return false;

  const SpeechRec =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

  if (!SpeechRec) {
    if (options.onError) {
      options.onError('Browser Speech Recognition not supported. Falling back to simulated voice.');
    }
    return false;
  }

  // Stop any active recognition
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }

  try {
    const recognition = new SpeechRec();
    const mappedLang = (options.langCode && LANG_CODE_MAP[options.langCode]) || 'hi-IN';
    recognition.lang = mappedLang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      options.onListeningChange(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      const transcript = final || interim;
      if (transcript.trim()) {
        options.onTranscript(transcript.trim(), !!final);
      }
    };

    recognition.onerror = (event: { error: string; message?: string }) => {
      console.warn('SpeechRecognition error:', event.error);
      options.onListeningChange(false);
      if (options.onError) {
        let msg = `Microphone notice: ${event.error}`;
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission blocked. Please enable mic access in your browser settings.';
        } else if (event.error === 'no-speech') {
          msg = 'No voice detected. Please speak louder into your microphone.';
        }
        options.onError(msg);
      }
    };

    recognition.onend = () => {
      options.onListeningChange(false);
      activeRecognition = null;
    };

    activeRecognition = recognition;
    recognition.start();
    return true;
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    options.onListeningChange(false);
    if (options.onError) {
      options.onError('Could not start microphone. Fallback available.');
    }
    return false;
  }
};

export const stopVoiceSos = () => {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
};

/* ========================================================
   TEXT-TO-SPEECH (TTS) ENGINE
   ======================================================== */

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export interface SpeakOptions {
  langCode?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export const speakText = (text: string, options: SpeakOptions = {}): boolean => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Text-to-Speech not supported in this browser.');
    return false;
  }

  // Cancel any active speech first
  stopSpeaking();

  const cleanText = text
    .replace(/[#*`_~]/g, '') // remove markdown symbols
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return false;

  try {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = (options.langCode && LANG_CODE_MAP[options.langCode]) || options.langCode || 'hi-IN';
    utterance.lang = targetLang;
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Pick best matching voice
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const prefix = targetLang.split('-')[0].toLowerCase();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLang.toLowerCase() ||
          v.lang.toLowerCase().startsWith(prefix)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    if (options.onStart) {
      utterance.onstart = options.onStart;
    }
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options.onError) {
      utterance.onerror = options.onError;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('SpeechSynthesis error:', err);
    if (options.onError) options.onError(err);
    return false;
  }
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

