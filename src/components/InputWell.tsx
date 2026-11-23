import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Wand2 } from 'lucide-react';
import { LanguageMode } from '../types/studio';
import { UI_COPY } from '../i18n/labels';
import { useStudioPrefs } from '../context/StudioPrefsContext';

function RealRubberSvg() {
  return (
    <svg
      viewBox="0 0 74 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[56px] h-[41px] lg:w-[74px] lg:h-[54px] drop-shadow-[0_10px_14px_rgba(72,38,44,0.24)]"
      aria-hidden="true"
    >
      {/* Soft shadow on paper right beneath eraser contact edge */}
      <ellipse cx="32" cy="48" rx="22" ry="4.5" fill="#6E5048" fillOpacity="0.22" />
      {/* Top coral-pink vinyl body */}
      <path
        d="M18 14L48 4C53 2.5 59 5.5 62 11L66 20C68 25 65 30 60 32L30 43L18 14Z"
        fill="url(#rubberPinkGrad)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      {/* Cream paper protective sleeve */}
      <path
        d="M22 12.5L44 5.2L56 33.5L34 41.5L22 12.5Z"
        fill="#FFF7EE"
        stroke="#E5B9A0"
        strokeWidth="1.2"
      />
      {/* Sunset twin sleeve stripes */}
      <path d="M27 11L30.5 9.8L42.5 38.2L39 39.5L27 11Z" fill="#E56B55" fillOpacity="0.88" />
      <path d="M33 9L35 8.3L47 36.6L45 37.3L33 9Z" fill="#F59E6C" fillOpacity="0.85" />
      {/* Soft cream bevelled tip touching the text */}
      <path
        d="M8 21.5C6.5 18 9 14.5 13 13.2L22 10.5L34 39.5L21 44.2C16.5 45.8 12.5 43.5 11 39.5L8 21.5Z"
        fill="url(#rubberCreamGrad)"
        stroke="#FFFFFF"
        strokeWidth="1.4"
      />
      {/* Specular highlight */}
      <path
        d="M15 17L47 6.5"
        stroke="#FFFFFF"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="rubberPinkGrad" x1="20" y1="6" x2="62" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFA596" />
          <stop offset="1" stopColor="#E56B55" />
        </linearGradient>
        <linearGradient id="rubberCreamGrad" x1="8" y1="14" x2="31" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFDF9" />
          <stop offset="1" stopColor="#F5D5BC" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RealPencilSvg() {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[62px] h-[62px] lg:w-[84px] lg:h-[84px] drop-shadow-[0_10px_14px_rgba(54,33,27,0.24)]"
      aria-hidden="true"
    >
      {/* Grounded contact shadow on paper at nib */}
      <ellipse cx="9" cy="90.5" rx="6.5" ry="2.2" fill="#4E342E" fillOpacity="0.24" />
      <ellipse cx="38" cy="70" rx="22" ry="3.2" transform="rotate(-45 38 70)" fill="#4E342E" fillOpacity="0.08" />

      {/* 3D Cylindrical Pink Eraser Cap */}
      <path
        d="M72.5 11.5C75.8 8.2 81.2 8.2 84.5 11.5C87.8 14.8 87.8 20.2 84.5 23.5L80.2 27.8L68.2 15.8L72.5 11.5Z"
        fill="url(#stdEraser3d)"
      />
      {/* Eraser top specular highlight */}
      <path
        d="M73.5 12.8C75.6 10.7 78.6 10.4 80.5 11.8L76.5 15.8L71.8 14.5L73.5 12.8Z"
        fill="#FFD4D2"
        fillOpacity="0.65"
      />

      {/* 3D Metallic Ferrule (Chrome & Brass Ring) */}
      <path d="M64.2 19.8L68.2 15.8L80.2 27.8L76.2 31.8L64.2 19.8Z" fill="url(#stdFerrule3d)" />
      {/* Gold trim collar */}
      <path d="M62.8 21.2L64.4 19.6L76.4 31.6L74.8 33.2L62.8 21.2Z" fill="#D49B38" />
      {/* Embossed metallic crimp ridges */}
      <path d="M66.2 17.8L78.2 29.8" stroke="#6E7682" strokeOpacity="0.65" strokeWidth="1.1" />
      <path d="M66.9 17.1L78.9 29.1" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="0.9" />
      <path d="M68.6 15.4L80.6 27.4" stroke="#6E7682" strokeOpacity="0.55" strokeWidth="1" />

      {/* 3D Hexagonal Standard Yellow Pencil Barrel (3 beveled faces) */}
      {/* Top sunlit bevel */}
      <path
        d="M21.8 62.2L62.8 21.2L66.8 25.2L25.8 66.2L21.8 62.2Z"
        fill="url(#stdWoodTop)"
      />
      {/* Center vivid #2 pencil yellow face */}
      <path
        d="M25.8 66.2L66.8 25.2L71.2 29.6L30.2 70.6L25.8 66.2Z"
        fill="url(#stdWoodMid)"
      />
      {/* Bottom shaded amber bevel */}
      <path
        d="M30.2 70.6L71.2 29.6L74.8 33.2L33.8 74.2L30.2 70.6Z"
        fill="url(#stdWoodBot)"
      />
      {/* Specular & bevel crease lines for crisp 3D geometry */}
      <path d="M23 61L63 21" stroke="#FFF9D6" strokeOpacity="0.85" strokeWidth="1" />
      <path d="M25.8 66.2L66.8 25.2" stroke="#FFF4B8" strokeOpacity="0.6" strokeWidth="0.9" />
      <path d="M30.2 70.6L71.2 29.6" stroke="#9E5704" strokeOpacity="0.45" strokeWidth="0.9" />

      {/* Sharpened Conical Cedar Wood with 3-Scallop Paint Collar */}
      <path
        d="M11.2 81.2L21.8 62.2C23.5 62.8 24.4 64.8 25.8 66.2C27.6 66.8 28.8 69.2 30.2 70.6C32.2 71.2 33.2 72.8 33.8 74.2L14.8 84.8L11.2 81.2Z"
        fill="url(#stdCedarCone)"
      />
      {/* Subtle cedar wood shadow edge & grain */}
      <path d="M13.6 83.6L31.4 72.8" stroke="#A66D3B" strokeOpacity="0.45" strokeWidth="1" />
      <path d="M15.5 78.5L23.8 67.5" stroke="#C99260" strokeOpacity="0.4" strokeWidth="0.8" />

      {/* Sharp 3D Conical Graphite Lead Tip */}
      <path
        d="M4.2 89.8C3.9 90.1 4.2 90.4 4.5 90.1L15.1 84.6C14.2 82.8 12.9 81.6 11.2 81.0L4.2 89.8Z"
        fill="url(#stdGraphiteTip)"
      />
      {/* Crisp metallic glint on graphite cone */}
      <path d="M6.2 87.8L11.6 82.2" stroke="#9A9694" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />

      <defs>
        <linearGradient id="stdEraser3d" x1="70" y1="11" x2="83" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB3B0" />
          <stop offset="0.45" stopColor="#F27278" />
          <stop offset="1" stopColor="#C4454D" />
        </linearGradient>
        <linearGradient id="stdFerrule3d" x1="65" y1="17" x2="78" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B8C0CA" />
          <stop offset="0.32" stopColor="#FFFFFF" />
          <stop offset="0.68" stopColor="#CFD6DF" />
          <stop offset="1" stopColor="#7A828E" />
        </linearGradient>
        <linearGradient id="stdWoodTop" x1="22" y1="62" x2="66" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE169" />
          <stop offset="1" stopColor="#FFD038" />
        </linearGradient>
        <linearGradient id="stdWoodMid" x1="26" y1="66" x2="70" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5B418" />
          <stop offset="1" stopColor="#E69A09" />
        </linearGradient>
        <linearGradient id="stdWoodBot" x1="30" y1="70" x2="74" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CC7A06" />
          <stop offset="1" stopColor="#A65C03" />
        </linearGradient>
        <linearGradient id="stdCedarCone" x1="14" y1="66" x2="29" y2="81" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCE4C4" />
          <stop offset="0.52" stopColor="#E5B27C" />
          <stop offset="1" stopColor="#B57A45" />
        </linearGradient>
        <linearGradient id="stdGraphiteTip" x1="5" y1="84" x2="13" y2="89" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5A5552" />
          <stop offset="0.5" stopColor="#2B2624" />
          <stop offset="1" stopColor="#141110" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResult>;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface InputWellProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  examples: string[];
  lang: LanguageMode;
  autoSolve: boolean;
  onToggleAutoSolve?: () => void;
  onSolveNow?: () => void;
  onRubberClear: () => void;
  onAiRefine?: () => void;
  aiLoading?: boolean;
  showAutoSolveToggle?: boolean;
  rows?: number;
  label?: string;
}

export function InputWell({
  value,
  onChange,
  placeholder,
  examples,
  lang,
  autoSolve,
  onToggleAutoSolve,
  onSolveNow,
  onRubberClear,
  onAiRefine,
  aiLoading = false,
  showAutoSolveToggle = true,
  rows = 3,
  label = 'Input Text',
}: InputWellProps) {
  const { realRubberAnimation, pencilWriteAnimation } = useStudioPrefs();
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [rubberWiping, setRubberWiping] = useState(false);
  const [erasingSnapshot, setErasingSnapshot] = useState('');
  const [pencilWriting, setPencilWriting] = useState(false);
  const [pencilSnapshot, setPencilSnapshot] = useState('');
  const [pencilChars, setPencilChars] = useState(0);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const eraseTimerRef = useRef<number | null>(null);
  const pencilRafRef = useRef<number | null>(null);

  function stopRubber() {
    if (eraseTimerRef.current !== null) {
      window.clearTimeout(eraseTimerRef.current);
      eraseTimerRef.current = null;
    }
    setRubberWiping(false);
    setErasingSnapshot('');
  }

  function stopPencil() {
    if (pencilRafRef.current !== null) {
      window.cancelAnimationFrame(pencilRafRef.current);
      pencilRafRef.current = null;
    }
    setPencilWriting(false);
    setPencilSnapshot('');
    setPencilChars(0);
  }

  useEffect(() => {
    return () => {
      if (eraseTimerRef.current !== null) {
        window.clearTimeout(eraseTimerRef.current);
      }
      if (pencilRafRef.current !== null) {
        window.cancelAnimationFrame(pencilRafRef.current);
      }
    };
  }, []);

  function handleMicToggle() {
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Rec) {
      setMicNote('Voice dictation is not supported in this browser.');
      setTimeout(() => setMicNote(null), 3000);
      return;
    }

    const recognition = new Rec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onChange(value ? `${value.trim()} ${transcript}` : transcript);
      }
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function handleRubberClick() {
    if (!value.trim() || rubberWiping) return;
    stopPencil();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!realRubberAnimation || prefersReducedMotion) {
      onRubberClear();
      textareaRef.current?.focus();
      return;
    }

    setErasingSnapshot(value);
    setRubberWiping(true);
    if (eraseTimerRef.current !== null) {
      window.clearTimeout(eraseTimerRef.current);
    }
    eraseTimerRef.current = window.setTimeout(() => {
      setRubberWiping(false);
      setErasingSnapshot('');
      onRubberClear();
      textareaRef.current?.focus();
    }, 2200);
  }

  function handleExampleClick(exampleText: string) {
    stopRubber();
    stopPencil();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    onChange(exampleText);

    if (!pencilWriteAnimation || prefersReducedMotion || !exampleText.length) {
      return;
    }

    setPencilSnapshot(exampleText);
    setPencilChars(1);
    setPencilWriting(true);

    const totalMs = Math.min(3400, Math.max(1200, exampleText.length * 58));
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalMs);
      const nextCount = Math.max(1, Math.round(progress * exampleText.length));
      setPencilChars(nextCount);

      if (progress < 1) {
        pencilRafRef.current = window.requestAnimationFrame(step);
      } else {
        pencilRafRef.current = null;
        setPencilWriting(false);
        setPencilSnapshot('');
        setPencilChars(0);
      }
    };

    pencilRafRef.current = window.requestAnimationFrame(step);
  }

  function handleTextareaChange(next: string) {
    // Keyboard typing never triggers pencil animation and cancels active animations immediately
    if (rubberWiping) stopRubber();
    if (pencilWriting) stopPencil();
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Recessed warm cream input well */}
      <div className="cream-well relative p-3 lg:p-4 transition-all overflow-visible min-w-0">
        <label htmlFor="studio-main-input" className="sr-only">
          {label}
        </label>

        {/* Written part stage with tactile real rubber & example pencil overlays */}
        <div className="relative min-w-0">
          <textarea
            ref={textareaRef}
            id="studio-main-input"
            rows={rows}
            value={value}
            onChange={(e) => handleTextareaChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full resize-none bg-transparent text-sm lg:text-base font-medium leading-relaxed placeholder:text-[#7A6252]/70 focus:outline-none ${
              rubberWiping || pencilWriting ? 'opacity-0 select-none' : 'text-[#36211B]'
            }`}
          />

          {rubberWiping && (
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0"
            >
              <div className="relative inline-block min-w-[100px] lg:min-w-[120px] max-w-full align-top">
                {/* Progressive left-to-right ink wipe synced to rubber scrub */}
                <div className="overflow-hidden">
                  <div className="animate-rubber-mask-right w-full overflow-hidden">
                    <div className="animate-rubber-ink-counter text-sm lg:text-base font-medium leading-relaxed text-[#36211B] whitespace-pre-wrap break-words">
                      {erasingSnapshot}
                    </div>
                  </div>
                </div>

                {/* Real physical rubber scrubbing across the written part */}
                <div
                  data-testid="real-rubber-eraser"
                  className="animate-rubber-sweep-x absolute inset-x-0 top-1/2 -translate-y-1/2 z-20"
                >
                  <div className="animate-rubber-scrub-y relative inline-block">
                    <RealRubberSvg />
                    {/* Tiny rubber crumbs shedding off the eraser tip */}
                    <span className="animate-rubber-crumb-1 absolute left-2 bottom-2 h-1.5 w-1.5 rounded-full bg-[#F5D5BC] border border-[#E56B55]/40" />
                    <span className="animate-rubber-crumb-2 absolute left-4 bottom-3 h-1 w-2 rounded-full bg-[#FFA596]" />
                    <span className="animate-rubber-crumb-3 absolute left-1 bottom-4 h-1 w-1 rounded-full bg-[#E56B55]/80" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {pencilWriting && !rubberWiping && (
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 text-sm lg:text-base font-medium leading-relaxed text-[#36211B] whitespace-pre-wrap break-words"
            >
              <span>{pencilSnapshot.slice(0, pencilChars)}</span>
              <span className="relative inline-block w-0 h-[1em] align-baseline">
                <span
                  data-testid="real-pencil-writer"
                  className="animate-pencil-scribble pointer-events-none absolute -left-[3px] -bottom-[3px] lg:-bottom-[4px] z-20"
                  style={{ transformOrigin: '5% 94%' }}
                >
                  <RealPencilSvg />
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom action strip inside well */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 lg:gap-2 pt-2.5 border-t border-[#362419]/8">
          <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 min-w-0">
            {/* Mic Dictation Helper */}
            <button
              type="button"
              onClick={handleMicToggle}
              aria-label={listening ? 'Stop voice dictation' : 'Start voice dictation'}
              className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold cursor-pointer ${
                listening
                  ? 'bg-[#E07A44] text-white'
                  : 'bg-white/75 text-[#7A6252] hover:text-[#362419] border border-white'
              }`}
            >
              {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              <span>{listening ? 'Listening...' : 'Dictate'}</span>
            </button>

            {/* Live Auto-Solve Toggle */}
            {showAutoSolveToggle && onToggleAutoSolve && (
              <button
                type="button"
                role="switch"
                aria-checked={autoSolve}
                onClick={onToggleAutoSolve}
              className={`bubbly-btn inline-flex items-center gap-1.5 lg:gap-2 rounded-full px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold border cursor-pointer ${
                  autoSolve
                    ? 'bg-[#E8F5E9] text-[#2E6F40] border-white'
                    : 'bg-white/65 text-[#7A6252] border-white'
                }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    autoSolve ? 'bg-[#2E6F40]' : 'bg-[#7A6252]/40'
                  }`}
                />
                <span>{lang === 'bn' ? UI_COPY.autoSolve.bn : UI_COPY.autoSolve.en}</span>
              </button>
            )}

            {micNote && <span className="text-xs font-medium text-[#B86228]">{micNote}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 min-w-0">
            {/* Bouncy Rubber / Eraser Button */}
            <button
              type="button"
              onClick={handleRubberClick}
              disabled={!value.trim() || rubberWiping}
              aria-label="Rubber clear input and output"
              className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] hover:bg-[#FFE5BF] px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold text-[#B86228] border border-white shadow-sm disabled:opacity-45 disabled:cursor-default cursor-pointer ${
                rubberWiping ? 'animate-rubber' : ''
              }`}
            >
              <span>🧽 {lang === 'bn' ? UI_COPY.rubber.bn : UI_COPY.rubber.en}</span>
            </button>

            {onAiRefine && (
              <button
                type="button"
                onClick={onAiRefine}
                disabled={aiLoading || !value.trim()}
                className="bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-white/85 hover:bg-white px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold text-[#362419] border border-white shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#E07A44]" />
                <span>{aiLoading ? 'Refining...' : lang === 'bn' ? UI_COPY.enhanceAi.bn : UI_COPY.enhanceAi.en}</span>
              </button>
            )}

            {onSolveNow && (!autoSolve || !showAutoSolveToggle) && (
              <button
                type="button"
                onClick={onSolveNow}
                disabled={!value.trim()}
                className="bubbly-btn caramel-gloss inline-flex items-center gap-1.5 rounded-full px-3.5 lg:px-4 py-1.5 text-[11px] lg:text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? UI_COPY.solveNow.bn : UI_COPY.solveNow.en}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clickable Try an Example Pills */}
      <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 min-w-0">
        <span className="text-[11px] lg:text-xs font-bold text-[#7A6252] mr-0.5">
          {lang === 'bn' ? UI_COPY.tryExample.bn : UI_COPY.tryExample.en}:
        </span>
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleExampleClick(ex)}
            className="bubbly-btn rounded-full bg-white/75 hover:bg-white px-2.5 lg:px-3 py-1 lg:py-1.5 text-[11px] lg:text-xs font-semibold text-[#362419] border border-white shadow-xs max-w-full lg:max-w-[320px] truncate text-left cursor-pointer"
            title={ex}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
