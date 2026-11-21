// Web Speech API Service: Real-time Speech-to-Text (Voice SOS) and Text-to-Speech (TTS)
import { transcribeAudioWithSarvam } from '../services/sarvamAiService';

export const LANG_CODE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  'hi-IN': 'hi-IN',
  en: 'en-IN',
  'en-IN': 'en-IN',
  bn: 'bn-IN',
  'bn-IN': 'bn-IN',
  mr: 'mr-IN',
  'mr-IN': 'mr-IN',
  ta: 'ta-IN',
  'ta-IN': 'ta-IN',
  te: 'te-IN',
  'te-IN': 'te-IN',
  gu: 'gu-IN',
  'gu-IN': 'gu-IN',
  pa: 'pa-IN',
  'pa-IN': 'pa-IN',
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
let activeAudioContext: AudioContext | null = null;
let activeScriptProcessor: ScriptProcessorNode | null = null;
let activeSourceNode: MediaStreamAudioSourceNode | null = null;
let recordedPcmChunks: Float32Array[] = [];
let recordedAudioChunks: Blob[] = [];
let isUserListeningActive = false;
let currentActiveOptions: VoiceSosOptions | null = null;
let currentRecordedText = '';

export interface VoiceSosOptions {
  langCode?: string;
  onTranscript: (text: string, isFinal: boolean) => void;
  onListeningChange: (listening: boolean) => void;
  onError?: (errorMessage: string) => void;
  onVolumeChange?: (volume: number) => void;
}

/**
 * Standard WAV (PCM 16-bit Mono) encoder
 */
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(v: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count (mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Downsample audio buffer to 16,000 Hz for optimal Sarvam AI Saaras recognition
 */
function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate = 16000
): Float32Array {
  if (outputSampleRate >= inputSampleRate) {
    return buffer;
  }
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

export const startVoiceSos = async (options: VoiceSosOptions): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  currentActiveOptions = options;
  currentRecordedText = '';
  recordedPcmChunks = [];
  recordedAudioChunks = [];

  // Stop any previous active recording or recognition session
  await stopVoiceSos();

  // 1. Request microphone stream
  if (navigator?.mediaDevices?.getUserMedia) {
    try {
      activeMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (mediaErr: unknown) {
      const errObj = mediaErr as { name?: string; message?: string };
      console.warn('Microphone permission check notice:', errObj);
      if (errObj?.name === 'NotAllowedError' || errObj?.name === 'PermissionDeniedError') {
        if (options.onError) {
          options.onError('Microphone access blocked. Please click the camera/mic icon in the address bar to allow microphone access.');
        }
        options.onListeningChange(false);
        return false;
      }
    }
  }

  if (!activeMediaStream) {
    options.onListeningChange(false);
    if (options.onError) {
      options.onError('Could not access microphone hardware. Please check your mic connection.');
    }
    return false;
  }

  // 2. Setup Web Audio API PCM capture for clean Sarvam AI Indic STT WAV input
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      activeAudioContext = ctx;
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaStreamSource(activeMediaStream);
      activeSourceNode = source;

      // 4096 buffer size gives ~10-12 callbacks/second
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      activeScriptProcessor = processor;

      processor.onaudioprocess = (e) => {
        if (!isUserListeningActive) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const copy = new Float32Array(inputData.length);
        copy.set(inputData);
        recordedPcmChunks.push(copy);

        // Compute volume level (RMS)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const volume = Math.min(100, Math.round(rms * 450));
        if (currentActiveOptions?.onVolumeChange) {
          currentActiveOptions.onVolumeChange(volume);
        }
      };

      // Mute gain node to prevent speaker feedback loop
      const muteGain = ctx.createGain();
      muteGain.gain.setValueAtTime(0, ctx.currentTime);

      source.connect(processor);
      processor.connect(muteGain);
      muteGain.connect(ctx.destination);
    }
  } catch (audioCtxErr) {
    console.warn('AudioContext PCM recorder setup notice:', audioCtxErr);
  }

  // 3. Start background MediaRecorder as backup
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

      recorder.start(200);
      activeMediaRecorder = recorder;
    } catch (recErr) {
      console.warn('MediaRecorder buffer initialization warning:', recErr);
    }
  }

  isUserListeningActive = true;
  options.onListeningChange(true);

  // 4. Attempt native SpeechRecognition for zero-latency live streaming text if available
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
        const errType = (event.error || '').toLowerCase();
        console.warn('SpeechRecognition notice:', errType);

        if (
          errType.includes('network') || 
          errType === 'no-speech' || 
          errType === 'aborted' || 
          errType.includes('service')
        ) {
          try {
            recognition.onend = null;
            recognition.onerror = null;
            recognition.abort();
          } catch {
            // ignore
          }
          activeRecognition = null;
          return;
        }

        if (errType.includes('not-allowed') || errType.includes('permission')) {
          isUserListeningActive = false;
          options.onListeningChange(false);
          if (options.onError) {
            options.onError('Microphone access blocked. Please allow mic access in your browser address bar.');
          }
          return;
        }
      };

      recognition.onend = () => {
        activeRecognition = null;
      };

      activeRecognition = recognition;
      recognition.start();
      return true;
    } catch (recogErr) {
      console.warn('Native speech recognition notice, continuing with PCM + Sarvam AI STT:', recogErr);
      return true;
    }
  }

  // If SpeechRecognition not available but audio recording active, return true
  if (activeAudioContext || activeMediaRecorder) {
    return true;
  }

  isUserListeningActive = false;
  options.onListeningChange(false);
  if (options.onError) {
    options.onError('Microphone recording not supported in this browser. Please use a sample emergency or type.');
  }
  return false;
};

export const stopVoiceSos = (): Promise<string> => {
  return new Promise((resolve) => {
    const wasActive = isUserListeningActive;
    isUserListeningActive = false;

    const currentOpts = currentActiveOptions;
    let finalSpokenText = (currentRecordedText || '').trim();

    // 1. Disconnect and stop native recognition
    if (activeRecognition) {
      try {
        activeRecognition.onend = null;
        activeRecognition.onerror = null;
        activeRecognition.onresult = null;
        activeRecognition.stop();
      } catch {
        // ignore
      }
      activeRecognition = null;
    }

    if (currentOpts) {
      currentOpts.onListeningChange(false);
      if (currentOpts.onVolumeChange) {
        currentOpts.onVolumeChange(0);
      }
    }

    // 2. Disconnect AudioContext and script processor nodes
    if (activeScriptProcessor) {
      try {
        activeScriptProcessor.disconnect();
      } catch {
        // ignore
      }
      activeScriptProcessor = null;
    }
    if (activeSourceNode) {
      try {
        activeSourceNode.disconnect();
      } catch {
        // ignore
      }
      activeSourceNode = null;
    }

    const recordedPcm = [...recordedPcmChunks];
    recordedPcmChunks = [];
    const audioCtx = activeAudioContext;
    activeAudioContext = null;

    // 3. Stop MediaRecorder
    if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
      try {
        activeMediaRecorder.stop();
      } catch {
        // ignore
      }
      activeMediaRecorder = null;
    }

    // 4. Release hardware mic tracks
    if (activeMediaStream) {
      try {
        activeMediaStream.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      activeMediaStream = null;
    }

    // Close AudioContext
    if (audioCtx) {
      try {
        audioCtx.close().catch(() => {});
      } catch {
        // ignore
      }
    }

    // 5. Transcribe recorded audio with Sarvam AI STT
    const processAndTranscribe = async () => {
      if (wasActive && recordedPcm.length > 0 && currentOpts) {
        try {
          // Combine PCM chunks
          let totalSamples = 0;
          for (const chunk of recordedPcm) {
            totalSamples += chunk.length;
          }

          if (totalSamples > 3000) {
            // At least ~0.2s of audio
            const combined = new Float32Array(totalSamples);
            let offset = 0;
            for (const chunk of recordedPcm) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }

            const inputSR = audioCtx?.sampleRate || 44100;
            const targetSR = 16000;
            const downsampled = downsampleBuffer(combined, inputSR, targetSR);
            const wavBlob = encodeWAV(downsampled, targetSR);

            if (wavBlob.size > 200) {
              const rawLang = currentOpts.langCode;
              const lang =
                (rawLang && LANG_CODE_MAP[rawLang]) ||
                rawLang ||
                'unknown';
              const sarvamTranscript = await transcribeAudioWithSarvam(wavBlob, lang);
              const cleanSarvam = (sarvamTranscript || '').trim();
              if (cleanSarvam) {
                finalSpokenText = cleanSarvam;
                currentRecordedText = cleanSarvam;
                currentOpts.onTranscript(cleanSarvam, true);
              }
            }
          }
        } catch (sarvamErr) {
          console.warn('Sarvam AI STT transcription notice:', sarvamErr);
        }
      }

      // If native recognition produced text and Sarvam was empty, or vice versa
      if (!finalSpokenText && currentRecordedText) {
        finalSpokenText = currentRecordedText.trim();
      }

      resolve(finalSpokenText);
    };

    processAndTranscribe();
  });
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

