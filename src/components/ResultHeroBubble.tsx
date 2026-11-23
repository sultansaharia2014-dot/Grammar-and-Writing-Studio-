import { useState } from 'react';
import { Copy, Check, Volume2, Square, Bookmark, BookmarkCheck } from 'lucide-react';
import { LanguageMode } from '../types/studio';
import { UI_COPY } from '../i18n/labels';

interface ResultHeroBubbleProps {
  resultText: string;
  badgeText: string;
  elapsedMs?: number;
  lang: LanguageMode;
  speechRate: number;
  onSaveToHistory: () => void;
  isSaved?: boolean;
  isAiEnhanced?: boolean;
}

export function ResultHeroBubble({
  resultText,
  badgeText,
  elapsedMs,
  lang,
  speechRate,
  onSaveToHistory,
  isSaved = false,
  isAiEnhanced = false,
}: ResultHeroBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored
    }
  }

  function handleSpeak() {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(resultText);
    utter.lang = 'en-US';
    utter.rate = speechRate;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className="glass-panel p-3.5 sm:p-4 lg:p-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 min-w-0 max-w-full">
          <span className="inline-flex items-center rounded-full bg-[#FFF3E0] px-2.5 lg:px-3 py-1 text-[11px] lg:text-xs font-bold text-[#B86228] border border-white/80 max-w-full whitespace-normal break-words">
            {badgeText}
          </span>
          {typeof elapsedMs === 'number' && (
            <span className="inline-flex items-center rounded-full bg-[#E8F5E9] px-2 lg:px-2.5 py-1 text-[10px] lg:text-[11px] font-bold text-[#2E6F40] tabular-nums shrink-0">
              {isAiEnhanced ? 'AI Refined' : `${elapsedMs} ms`}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 max-w-full">
          <button
            type="button"
            onClick={handleSpeak}
            aria-label={speaking ? 'Stop reading result aloud' : 'Listen to result'}
            className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold border border-white cursor-pointer ${
              speaking
                ? 'caramel-gloss text-white'
                : 'bg-white/80 hover:bg-white text-[#362419]'
            }`}
          >
            {speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#B86228]" />}
            <span>{speaking ? (lang === 'bn' ? UI_COPY.stopListening.bn : UI_COPY.stopListening.en) : (lang === 'bn' ? UI_COPY.listen.bn : UI_COPY.listen.en)}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy converted result"
            className="bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold text-[#362419] border border-white cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#2E6F40]" /> : <Copy className="h-3.5 w-3.5 text-[#7A6252]" />}
            <span>{copied ? (lang === 'bn' ? UI_COPY.copied.bn : UI_COPY.copied.en) : (lang === 'bn' ? UI_COPY.copy.bn : UI_COPY.copy.en)}</span>
          </button>

          <button
            type="button"
            onClick={onSaveToHistory}
            aria-label="Save to history"
            className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold border border-white cursor-pointer ${
              isSaved
                ? 'bg-[#E8F5E9] text-[#2E6F40]'
                : 'bg-[#FFF3E0] hover:bg-[#FFE6C2] text-[#B86228]'
            }`}
          >
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{isSaved ? (lang === 'bn' ? UI_COPY.saved.bn : UI_COPY.saved.en) : (lang === 'bn' ? UI_COPY.saveHistory.bn : UI_COPY.saveHistory.en)}</span>
          </button>
        </div>
      </div>

      <p
        data-testid="hero-result-text"
        className="text-base sm:text-lg lg:text-xl font-bold leading-relaxed text-[#362419] break-words"
      >
        {resultText}
      </p>
    </div>
  );
}
