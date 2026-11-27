import { useCallback, useEffect, useRef, useState } from 'react';

export const REFERENCE_VOICE_SAMPLE_URL =
  '/assets/aistudio/ElevenLabs_2026-09-26T09_32_56__s50_v3__1__104993fb.mp3';

export interface MinimalVoice {
  name: string;
  lang: string;
  default?: boolean;
}

const PREFERRED_MALE_VOICE_PATTERNS = [
  /andrew/i,
  /guy/i,
  /ryan/i,
  /christopher/i,
  /eric/i,
  /daniel/i,
  /alex/i,
  /matthew/i,
  /david/i,
  /mark/i,
  /james/i,
  /thomas/i,
  /google us english/i,
  /\bmale\b/i,
];

const FEMALE_VOICE_PATTERNS = [
  /samantha|victoria|karen|moira|tessa|fiona|veena|susan|zira|hazel|aria|jenny|michelle|claire|emma|ava|allison|kate|serena|female/i,
];

/**
 * Selects the closest calm, articulate English male narrator voice from browser voices
 * as a fallback when server-side Gemini TTS is offline or unavailable.
 */
export function pickStudioMaleVoice<T extends MinimalVoice>(voices: T[]): T | null {
  if (!voices.length) return null;

  const englishVoices = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  for (const pattern of PREFERRED_MALE_VOICE_PATTERNS) {
    const hit = pool.find(
      (v) => pattern.test(v.name) && !FEMALE_VOICE_PATTERNS.some((f) => f.test(v.name)),
    );
    if (hit) return hit;
  }

  const nonFemaleEnglish = pool.find(
    (v) => !FEMALE_VOICE_PATTERNS.some((f) => f.test(v.name)),
  );
  return nonFemaleEnglish ?? pool[0];
}

export function prepareTextForReading(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => (/[.!?:;]$/.test(line) ? line : `${line}.`))
    .join(' ');
}

// Shared cache & singleton playback controller so only one voice speaks at a time
const ttsBlobUrlCache = new Map<string, string>();
let activeStopHandler: (() => void) | null = null;

function base64ToWavObjectUrl(base64: string, mimeType: string): string {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType || 'audio/wav' });
  return URL.createObjectURL(blob);
}

export function stopAllStudioSpeech() {
  if (activeStopHandler) {
    activeStopHandler();
    activeStopHandler = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function useStudioSpeaker(speechRate: number) {
  const [speaking, setSpeaking] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isMountedRef.current) {
      setLoadingAudio(false);
      setSpeaking(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speechRate;
    }
  }, [speechRate]);

  const speakWithFallback = useCallback(
    (cleanText: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (isMountedRef.current) {
          setLoadingAudio(false);
          setSpeaking(false);
        }
        return;
      }

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'en-US';
      utter.pitch = 0.92;
      utter.rate = Math.max(0.65, Math.min(1.5, speechRate * 0.96));

      const voices = window.speechSynthesis.getVoices();
      const selected = pickStudioMaleVoice(voices);
      if (selected) {
        utter.voice = selected;
      }

      utter.onend = () => {
        if (activeStopHandler === stop) activeStopHandler = null;
        if (isMountedRef.current) setSpeaking(false);
      };
      utter.onerror = () => {
        if (activeStopHandler === stop) activeStopHandler = null;
        if (isMountedRef.current) setSpeaking(false);
      };

      activeStopHandler = stop;
      if (isMountedRef.current) {
        setLoadingAudio(false);
        setSpeaking(true);
      }
      window.speechSynthesis.speak(utter);
    },
    [speechRate, stop],
  );

  const playUrl = useCallback(
    (url: string) => {
      const audio = new Audio(url);
      audio.playbackRate = speechRate;
      audioRef.current = audio;
      activeStopHandler = stop;

      audio.onended = () => {
        if (activeStopHandler === stop) activeStopHandler = null;
        audioRef.current = null;
        if (isMountedRef.current) setSpeaking(false);
      };
      audio.onerror = () => {
        if (activeStopHandler === stop) activeStopHandler = null;
        audioRef.current = null;
        if (isMountedRef.current) setSpeaking(false);
      };

      if (isMountedRef.current) {
        setLoadingAudio(false);
        setSpeaking(true);
      }
      audio.play().catch(() => {
        if (isMountedRef.current) setSpeaking(false);
      });
    },
    [speechRate, stop],
  );

  const toggleSpeak = useCallback(
    async (rawText: string) => {
      if (speaking || loadingAudio) {
        stop();
        return;
      }

      const cleanText = prepareTextForReading(rawText);
      if (!cleanText) return;

      if (activeStopHandler && activeStopHandler !== stop) {
        activeStopHandler();
      }

      const cachedUrl = ttsBlobUrlCache.get(cleanText);
      if (cachedUrl) {
        playUrl(cachedUrl);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      activeStopHandler = stop;
      if (isMountedRef.current) {
        setLoadingAudio(true);
      }

      try {
        const resp = await fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (resp.ok) {
          const json = await resp.json();
          if (json?.audioBase64) {
            const url = base64ToWavObjectUrl(json.audioBase64, json.mimeType || 'audio/wav');
            ttsBlobUrlCache.set(cleanText, url);
            playUrl(url);
            return;
          }
        }

        speakWithFallback(cleanText);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        speakWithFallback(cleanText);
      }
    },
    [loadingAudio, playUrl, speakWithFallback, speaking, stop],
  );

  const toggleSampleVoice = useCallback(() => {
    if (speaking || loadingAudio) {
      stop();
      return;
    }
    if (activeStopHandler && activeStopHandler !== stop) {
      activeStopHandler();
    }
    playUrl(REFERENCE_VOICE_SAMPLE_URL);
  }, [loadingAudio, playUrl, speaking, stop]);

  return {
    speaking,
    loadingAudio,
    toggleSpeak,
    toggleSampleVoice,
    stopSpeaking: stop,
  };
}
