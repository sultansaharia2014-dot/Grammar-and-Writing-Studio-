import { useState, useMemo } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { LanguageMode, PosCategory } from '../../types/studio';
import { MODULE_META, UI_COPY } from '../../i18n/labels';
import { solvePartsOfSpeech } from '../../engine/pos';
import { InputWell } from '../InputWell';

const POS_STYLE: Record<PosCategory, { bg: string; text: string; ring: string }> = {
  Noun: { bg: 'bg-[#FFF3E0]', text: 'text-[#B86228]', ring: 'ring-[#F4A261]' },
  Pronoun: { bg: 'bg-[#FCE8E6]', text: 'text-[#A53F2B]', ring: 'ring-[#E8998D]' },
  Verb: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E6F40]', ring: 'ring-[#7CC492]' },
  Adjective: { bg: 'bg-[#EDE7F6]', text: 'text-[#5B3E96]', ring: 'ring-[#B39DDB]' },
  Adverb: { bg: 'bg-[#E3F2FD]', text: 'text-[#1E6091]', ring: 'ring-[#90CAF9]' },
  Preposition: { bg: 'bg-[#FFF8E1]', text: 'text-[#9A6B16]', ring: 'ring-[#FFD54F]' },
  Conjunction: { bg: 'bg-[#E0F2F1]', text: 'text-[#1F6E65]', ring: 'ring-[#80CBC4]' },
  Interjection: { bg: 'bg-[#FCE4EC]', text: 'text-[#AD2E5E]', ring: 'ring-[#F48FB1]' },
  Determiner: { bg: 'bg-[#F3ECE1]', text: 'text-[#6D5647]', ring: 'ring-[#C9B3A1]' },
};

interface PartsOfSpeechModuleProps {
  input: string;
  onInputChange: (val: string) => void;
  lang: LanguageMode;
  autoSolve: boolean;
  onToggleAutoSolve: () => void;
  onSaveHistory: (input: string, output: string, meta: string) => void;
}

export function PartsOfSpeechModule({
  input,
  onInputChange,
  lang,
  autoSolve,
  onToggleAutoSolve,
  onSaveHistory,
}: PartsOfSpeechModuleProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState(input);
  const [savedFlag, setSavedFlag] = useState(false);

  const effectiveInput = autoSolve ? input : manualInput;
  const result = useMemo(() => {
    if (!effectiveInput.trim()) return null;
    return solvePartsOfSpeech(effectiveInput);
  }, [effectiveInput]);

  const activeToken = useMemo(() => {
    if (!result || result.tokens.length === 0) return null;
    return result.tokens.find((t) => t.id === selectedId) || result.tokens[0];
  }, [result, selectedId]);

  function handleInputChange(next: string) {
    setSavedFlag(false);
    setSelectedId(null);
    onInputChange(next);
    if (autoSolve) setManualInput(next);
  }

  function handleRubberClear() {
    setSavedFlag(false);
    setSelectedId(null);
    onInputChange('');
    setManualInput('');
  }

  const meta = MODULE_META.pos;

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
          label="Sentence for Parts of Speech identification"
        />
      </div>

      {result && result.tokens.length > 0 ? (
        <div className="space-y-4 lg:space-y-5 min-w-0">
          {/* Interactive Bubbly Word-Cloud Sentence Strip */}
          <div className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-3.5 lg:space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-[#7A6252]">
                {lang === 'bn'
                  ? 'Click any word pill to inspect its grammatical role · যেকোনো শব্দে ক্লিক করুন'
                  : 'Click any word pill to inspect its definition and grammatical role'}
              </span>

              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                <span className="rounded-full bg-[#E8F5E9] px-2 lg:px-2.5 py-1 text-[10px] lg:text-[11px] font-bold text-[#2E6F40] tabular-nums">
                  {result.elapsedMs} ms
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const summary = result.tokens.map((t) => `${t.word} (${t.pos})`).join(' · ');
                    onSaveHistory(result.input, summary, `${result.tokens.length} words tagged`);
                    setSavedFlag(true);
                  }}
                  className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] lg:text-xs font-bold border border-white cursor-pointer ${
                    savedFlag
                      ? 'bg-[#E8F5E9] text-[#2E6F40]'
                      : 'bg-[#FFF3E0] hover:bg-[#FFE6C2] text-[#B86228]'
                  }`}
                >
                  {savedFlag ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  <span>{savedFlag ? (lang === 'bn' ? UI_COPY.saved.bn : UI_COPY.saved.en) : (lang === 'bn' ? UI_COPY.saveHistory.bn : UI_COPY.saveHistory.en)}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:gap-2.5 py-1.5 lg:py-2">
              {result.tokens.map((tok) => {
                const st = POS_STYLE[tok.pos];
                const isActive = activeToken?.id === tok.id;
                return (
                  <button
                    key={tok.id}
                    type="button"
                    onClick={() => setSelectedId(tok.id)}
                    aria-pressed={isActive}
                    className={`bubbly-btn flex flex-col items-center rounded-[16px] lg:rounded-[20px] px-2.5 py-1.5 lg:px-3.5 lg:py-2 border-2 border-white shadow-xs cursor-pointer ${st.bg} ${
                      isActive ? `ring-3 ${st.ring} scale-[1.03]` : 'hover:brightness-98'
                    }`}
                  >
                    <span className="text-xs sm:text-sm lg:text-base font-extrabold text-[#362419] break-words">
                      {tok.word}
                    </span>
                    <span className={`text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wide ${st.text}`}>
                      {tok.pos}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Color-Coded Legend Bar with Word Counts */}
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 pt-3 border-t border-[#362419]/10">
              {(Object.keys(result.counts) as PosCategory[]).map((cat) => {
                const count = result.counts[cat];
                if (count === 0) return null;
                const st = POS_STYLE[cat];
                return (
                  <span
                    key={cat}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 lg:px-3 py-1 text-[11px] lg:text-xs font-bold border border-white ${st.bg} ${st.text}`}
                  >
                    <span>{cat}</span>
                    <span className="rounded-full bg-white/80 px-1.5 py-0.2 text-[10px] lg:text-[11px] tabular-nums">
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Word Inspector Card */}
          {activeToken && (
            <div
              data-testid="pos-inspector-card"
              className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-3 min-w-0"
            >
              <div className="flex flex-wrap items-center gap-2.5 lg:gap-3">
                <span className="text-xl lg:text-2xl font-extrabold text-[#362419] break-words">
                  {activeToken.word}
                </span>
                <span
                  className={`rounded-full px-2.5 lg:px-3 py-1 text-[11px] lg:text-xs font-extrabold border border-white ${POS_STYLE[activeToken.pos].bg} ${POS_STYLE[activeToken.pos].text}`}
                >
                  {lang === 'bn' ? activeToken.posBn : activeToken.pos}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-3.5 pt-1">
                <div className="cream-well p-3.5 lg:p-4 space-y-1 min-w-0">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#B86228]">
                    Definition · সংজ্ঞা
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#362419] break-words">
                    {activeToken.definition.en}
                  </p>
                  {lang === 'bn' && (
                    <p className="text-xs font-medium text-[#7A6252] break-words">
                      {activeToken.definition.bn}
                    </p>
                  )}
                </div>

                <div className="cream-well p-3.5 lg:p-4 space-y-1 min-w-0">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2E6F40]">
                    Role in Sentence · বাক্যে ভূমিকা
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#362419] break-words">
                    {activeToken.roleInSentence.en}
                  </p>
                  {lang === 'bn' && (
                    <p className="text-xs font-medium text-[#7A6252] break-words">
                      {activeToken.roleInSentence.bn}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel-soft p-6 lg:p-8 text-center text-xs lg:text-sm font-medium text-[#7A6252]">
          {lang === 'bn' ? UI_COPY.emptyPrompt.bn : UI_COPY.emptyPrompt.en}
        </div>
      )}
    </div>
  );
}
