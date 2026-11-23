import { useState, useMemo } from 'react';
import { Copy, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { LanguageMode } from '../../types/studio';
import { MODULE_META, UI_COPY } from '../../i18n/labels';
import { solveVerbChanging } from '../../engine/verbs';
import { InputWell } from '../InputWell';

interface VerbChangingModuleProps {
  input: string;
  onInputChange: (val: string) => void;
  lang: LanguageMode;
  autoSolve: boolean;
  onToggleAutoSolve: () => void;
  onSaveHistory: (input: string, output: string, meta: string) => void;
}

export function VerbChangingModule({
  input,
  onInputChange,
  lang,
  autoSolve,
  onToggleAutoSolve,
  onSaveHistory,
}: VerbChangingModuleProps) {
  const [manualInput, setManualInput] = useState(input);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedFlag, setSavedFlag] = useState(false);

  const effectiveInput = autoSolve ? input : manualInput;
  const result = useMemo(() => {
    if (!effectiveInput.trim()) return null;
    return solveVerbChanging(effectiveInput);
  }, [effectiveInput]);

  function handleInputChange(next: string) {
    setSavedFlag(false);
    onInputChange(next);
    if (autoSolve) setManualInput(next);
  }

  function handleRubberClear() {
    setSavedFlag(false);
    onInputChange('');
    setManualInput('');
  }

  async function copyBubble(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Ignore
    }
  }

  const meta = MODULE_META.verbs;

  const bubbles = result
    ? [
        { key: 'v1', label: 'V1 Base', bn: 'মূল রূপ', value: result.forms.v1 },
        { key: 'v2', label: 'V2 Past', bn: 'অতীত রূপ', value: result.forms.v2 },
        { key: 'v3', label: 'V3 Past Participle', bn: 'পাস্ট পার্টিসিপল', value: result.forms.v3 },
        { key: 'ving', label: 'V-ing Present Participle', bn: 'চলমান রূপ', value: result.forms.ving },
        { key: 'vs', label: 'V-s/es 3rd Person', bn: '৩য় পুরুষ একবচন', value: result.forms.vs },
      ]
    : [];

  return (
    <div className="space-y-4 lg:space-y-5 min-w-0">
      <div className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-3.5 lg:space-y-4 min-w-0">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#362419] tracking-tight">
            {lang === 'bn' ? meta.title.bn : meta.title.en}
          </h2>
          <p className="text-xs lg:text-sm text-[#7A6252] mt-0.5">
            {lang === 'bn' ? meta.subtitle.bn : meta.subtitle.en}
          </p>
        </div>

        <InputWell
          value={input}
          onChange={handleInputChange}
          placeholder={lang === 'bn' ? meta.placeholder.bn : meta.placeholder.en}
          examples={meta.examples}
          lang={lang}
          autoSolve={autoSolve}
          onToggleAutoSolve={onToggleAutoSolve}
          onSolveNow={() => setManualInput(input)}
          onRubberClear={handleRubberClear}
          rows={2}
          label="Verb or sentence for conjugation"
        />
      </div>

      {result ? (
        <div className="space-y-4 lg:space-y-5 min-w-0">
          {/* 5-Bubble Conjugation Row */}
          <div className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-3.5 lg:space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 min-w-0 max-w-full">
                <span className="rounded-full bg-[#FFF3E0] px-2.5 lg:px-3 py-1 text-[11px] lg:text-xs font-bold text-[#B86228] max-w-full break-words">
                  Main Verb: {result.extractedVerb} ·{' '}
                  {result.forms.isIrregular ? 'Irregular Verb' : 'Regular Verb'}
                </span>
                <span className="rounded-full bg-[#E8F5E9] px-2 lg:px-2.5 py-1 text-[10px] lg:text-[11px] font-bold text-[#2E6F40] tabular-nums shrink-0">
                  {result.elapsedMs} ms
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const summary = bubbles.map((b) => `${b.label}: ${b.value}`).join(' | ');
                  onSaveHistory(result.input, summary, `Verb "${result.extractedVerb}"`);
                  setSavedFlag(true);
                }}
                className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold border border-white cursor-pointer ${
                  savedFlag
                    ? 'bg-[#E8F5E9] text-[#2E6F40]'
                    : 'bg-[#FFF3E0] hover:bg-[#FFE6C2] text-[#B86228]'
                }`}
              >
                {savedFlag ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                <span>{savedFlag ? (lang === 'bn' ? UI_COPY.saved.bn : UI_COPY.saved.en) : (lang === 'bn' ? UI_COPY.saveHistory.bn : UI_COPY.saveHistory.en)}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 lg:gap-3">
              {bubbles.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => copyBubble(b.key, b.value)}
                  aria-label={`Copy ${b.label}: ${b.value}`}
                  className="bubbly-btn cream-well p-3 lg:p-4 text-left hover:bg-white/90 group cursor-pointer min-w-0"
                >
                  <div className="flex items-center justify-between gap-1 mb-1 lg:mb-1.5 min-w-0">
                    <span className="text-[10px] lg:text-[11px] font-extrabold text-[#B86228] truncate">
                      {b.label}
                    </span>
                    {copiedKey === b.key ? (
                      <Check className="h-3.5 w-3.5 text-[#2E6F40] shrink-0" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[#7A6252]/60 group-hover:text-[#362419] shrink-0" />
                    )}
                  </div>
                  <span
                    data-testid={`verb-form-${b.key}`}
                    className="block text-base sm:text-lg lg:text-xl font-extrabold text-[#362419] break-words"
                  >
                    {b.value}
                  </span>
                  {lang === 'bn' && (
                    <span className="block text-[10px] lg:text-[11px] font-medium text-[#7A6252] mt-1 break-words">
                      {b.bn}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Glass Tense Matrix */}
          <div className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-3 min-w-0">
            <h3 className="text-sm lg:text-base font-extrabold text-[#362419]">
              {lang === 'bn'
                ? 'Tense Matrix · কালের ব্যবহারিক ছক'
                : 'Tense Matrix Across Present, Past & Future'}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-3">
              {result.matrix.map((row, idx) => (
                <div key={idx} className="cream-well p-3 lg:p-3.5 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                    <span className="text-xs font-extrabold text-[#B86228] break-words">
                      {lang === 'bn' ? `${row.tense.en} · ${row.tense.bn}` : row.tense.en}
                    </span>
                    <span className="text-[10px] lg:text-[11px] font-semibold text-[#7A6252] break-words">{row.formula}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#362419] break-words">{row.example}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel-soft p-6 lg:p-8 text-center text-xs lg:text-sm font-medium text-[#7A6252]">
          {lang === 'bn' ? UI_COPY.emptyPrompt.bn : UI_COPY.emptyPrompt.en}
        </div>
      )}
    </div>
  );
}
