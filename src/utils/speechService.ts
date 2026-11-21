// Web Speech API Service: Real-time Speech-to-Text (Voice SOS) and Text-to-Speech (TTS)
import { transcribeAudioWithSarvam } from '../services/sarvamAiService';

export const LANG_CODE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  gu: 'gu-IN',
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
let activeMediaStream: MediaStream | null = null;
let activeMediaRecorder: MediaRecorder | null = null;
let recordedAudioChunks: Blob[] = [];
let isUserListeningActive = false;
let currentActiveOptions: VoiceSosOptions | null = null;
let currentRecordedText = '';

export interface VoiceSosOptions {
  langCode?: string;
  onTranscript: (text: string, isFinal: boolean) => void;
  onListeningChange: (listening: boolean) => void;
  onError?: (errorMessage: string) => void;
}

export const startVoiceSos = async (options: VoiceSosOptions): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  currentActiveOptions = options;
  currentRecordedText = '';
  recordedAudioChunks = [];

  // Stop any previous active recording or recognition session
  await stopVoiceSos();

  // 1. Request microphone stream and KEEP it active during recording (prevents Windows Chromium audio pipeline closure)
  if (navigator?.mediaDevices?.getUserMedia) {
    try {
      activeMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (mediaErr: unknown) {
      const errObj = mediaErr as { name?: string; message?: string };
      console.warn('Microphone permission check warning:', errObj);
      if (errObj?.name === 'NotAllowedError' || errObj?.name === 'PermissionDeniedError') {
        if (options.onError) {
          options.onError('Microphone access blocked. Please click the camera/mic icon in the address bar to allow microphone access.');
        }
        options.onListeningChange(false);
        return false;
      }
    }
  }

  // 2. Start background MediaRecorder to capture audio for Sarvam AI Indic STT fallback
  if (typeof MediaRecorder !== 'undefined' && activeMediaStream) {
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';
      const recorder = mimeType
        ? new MediaRecorder(activeMediaStream, { mimeType })
        : new MediaRecorder(activeMediaStream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedAudioChunks.push(e.data);
        }
      };

      recorder.start(250);
      activeMediaRecorder = recorder;
    } catch (recErr) {
      console.warn('MediaRecorder buffer initialization warning:', recErr);
    }
  }

  isUserListeningActive = true;
  options.onListeningChange(true);

  // 3. Attempt native SpeechRecognition for zero-latency live streaming text
  const SpeechRec =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

  if (SpeechRec) {
    try {
      const recognition = new SpeechRec();
      const mappedLang = (options.langCode && LANG_CODE_MAP[options.langCode]) || options.langCode || 'hi-IN';
      recognition.lang = mappedLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        options.onListeningChange(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += (finalTranscript ? ' ' : '') + item[0].transcript.trim();
          } else {
            interimTranscript += (interimTranscript ? ' ' : '') + item[0].transcript.trim();
          }
        }

        const combined = (finalTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
        if (combined) {
          currentRecordedText = combined;
          options.onTranscript(combined, Boolean(finalTranscript && !interimTranscript));
        }
      };

      recognition.onerror = (event: { error: string; message?: string }) => {
        console.warn('SpeechRecognition notice:', event.error);
        // 'no-speech' is triggered when user pauses; do NOT kill user listening session
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        // When network error occurs (Google speech servers blocked by VPN/adblocker/localhost),
        // keep recording active via MediaRecorder so Sarvam AI STT processes the speech on stop!
        if (event.error === 'network') {
          console.info('Native Web Speech API encountered network error. Sarvam AI audio fallback is active.');
          return;
        }

        isUserListeningActive = false;
        options.onListeningChange(false);
        if (options.onError) {
          let msg = `Microphone notice: ${event.error}`;
          if (event.error === 'not-allowed') {
            msg = 'Microphone permission blocked. Please enable mic access in your browser address bar.';
          } else if (event.error === 'audio-capture') {
            msg = 'No microphone device found. Please plug in or enable a microphone.';
          }
          options.onError(msg);
        }
      };

      recognition.onend = () => {
        if (isUserListeningActive) {
          try {
            recognition.start();
            return;
          } catch {
            // Keep user session active with MediaRecorder
          }
        }
      };

      activeRecognition = recognition;
      recognition.start();
      return true;
    } catch (recogErr) {
      console.warn('SpeechRecognition start failed, falling back to MediaRecorder + Sarvam AI STT:', recogErr);
      // MediaRecorder is already active, so return true
      return true;
    }
  }

  // If SpeechRecognition not supported but media recorder active, still return true
  if (activeMediaRecorder) {
    return true;
  }

  isUserListeningActive = false;
  options.onListeningChange(false);
  if (options.onError) {
    options.onError('Microphone recording not supported in this browser. Please use a sample emergency or type.');
  }
  return false;
};

export const stopVoiceSos = async (): Promise<void> => {
  const wasActive = isUserListeningActive;
  isUserListeningActive = false;

  const currentOpts = currentActiveOptions;
  const recordedText = currentRecordedText;

  // Stop native speech recognition
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }

  // Stop background MediaRecorder
  if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
    try {
      activeMediaRecorder.stop();
    } catch {
      // ignore
    }
  }

  // Stop all active microphone tracks and release hardware
  if (activeMediaStream) {
    try {
      activeMediaStream.getTracks().forEach((track) => track.stop());
    } catch {
      // ignore
    }
    activeMediaStream = null;
  }

  if (currentOpts) {
    currentOpts.onListeningChange(false);
  }

  // If native SpeechRecognition didn't produce text (e.g. because of 'network' error)
  // but we recorded audio chunks, transcribe synchronously with Sarvam AI STT!
  if (wasActive && !recordedText.trim() && recordedAudioChunks.length > 0 && currentOpts) {
    try {
      const mimeType = recordedAudioChunks[0]?.type || 'audio/webm';
      const audioBlob = new Blob(recordedAudioChunks, { type: mimeType });
      if (audioBlob.size > 800) {
        const lang = (currentOpts.langCode && LANG_CODE_MAP[currentOpts.langCode]) || currentOpts.langCode || 'hi-IN';
        const transcript = await transcribeAudioWithSarvam(audioBlob, lang);
        if (transcript.trim()) {
          currentOpts.onTranscript(transcript.trim(), true);
          return;
        }
      }
    } catch (sarvamErr) {
      console.warn('Sarvam AI STT fallback notice:', sarvamErr);
    }
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

