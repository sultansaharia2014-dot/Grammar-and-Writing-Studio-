import { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { LanguageMode, NarrationResult, TransformationStep } from '../../types/studio';
import { MODULE_META, UI_COPY } from '../../i18n/labels';
import { solveNarration } from '../../engine/narration';
import { InputWell } from '../InputWell';
import { ResultHeroBubble } from '../ResultHeroBubble';

interface NarrationModuleProps {
  input: string;
  onInputChange: (val: string) => void;
  lang: LanguageMode;
  autoSolve: boolean;
  onToggleAutoSolve: () => void;
  speechRate: number;
  onSaveHistory: (input: string, output: string, meta: string) => void;
}

export function NarrationModule({
  input,
  onInputChange,
  lang,
  autoSolve,
  onToggleAutoSolve,
  speechRate,
  onSaveHistory,
}: NarrationModuleProps) {
  const [mode, setMode] = useState<'auto' | 'direct-to-indirect' | 'indirect-to-direct'>('auto');
  const [manualInput, setManualInput] = useState(input);
  const [aiResult, setAiResult] = useState<NarrationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [savedFlag, setSavedFlag] = useState(false);

  const effectiveInput = autoSolve ? input : manualInput;

  const localResult = useMemo(() => {
    if (!effectiveInput.trim()) return null;
    return solveNarration(effectiveInput, mode);
  }, [effectiveInput, mode]);

  const activeResult = aiResult && aiResult.input === input.trim() ? aiResult : localResult;

  function handleInputChange(next: string) {
    setSavedFlag(false);
    setAiResult(null);
    setAiNotice(null);
    onInputChange(next);
    if (autoSolve) setManualInput(next);
  }

  function handleRubberClear() {
    setSavedFlag(false);
    setAiResult(null);
    setAiNotice(null);
    onInputChange('');
    setManualInput('');
  }

  async function handleAiRefine() {
    if (!input.trim()) return;
    setAiLoading(true);
    setAiNotice(null);
    try {
      const resp = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'narration',
          input: input.trim(),
          direction: mode,
          bilingual: lang === 'bn',
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.data?.converted) {
        setAiNotice(json?.message || 'Using instant local transformation.');
        return;
      }
      const steps: TransformationStep[] = (json.data.steps || []).map(
        (
          s: {
            label?: string;
            labelBn?: string;
            before?: string;
            after?: string;
            explanation?: string;
            explanationBn?: string;
          },
          idx: number,
        ) => ({
          id: `ai-step-${idx}`,
          label: { en: s.label || 'Rule', bn: s.labelBn || s.label || 'নিয়ম' },
          before: s.before || '—',
          after: s.after || '—',
          explanation: {
            en: s.explanation || '',
            bn: s.explanationBn || s.explanation || '',
          },
        }),
      );
      setAiResult({
        input: input.trim(),
        converted: json.data.converted,
        direction: mode === 'indirect-to-direct' ? 'indirect-to-direct' : 'direct-to-indirect',
        detectedType: {
          en: json.data.detectedLabel || 'AI Refined',
          bn: json.data.detectedLabelBn || json.data.detectedLabel || 'AI পরিমার্জিত',
        },
        steps: steps.length ? steps : localResult?.steps || [],
        elapsedMs: 1,
      });
    } catch {
      setAiNotice('AI service unreachable; displaying instant local result.');
    } finally {
      setAiLoading(false);
    }
  }

  const meta = MODULE_META.narration;

  return (
    <div className="space-y-4 lg:space-y-5 min-w-0">
      {/* Header + Mode Selector Pills */}
      <div className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-3.5 lg:space-y-4 min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#362419] tracking-tight">
              {lang === 'bn' ? meta.title.bn : meta.title.en}
            </h2>
            <p className="text-xs lg:text-sm text-[#7A6252] mt-0.5">
              {lang === 'bn' ? meta.subtitle.bn : meta.subtitle.en}
            </p>
          </div>

          <div
            role="group"
            aria-label="Narration conversion direction"
            className="flex flex-wrap lg:inline-flex items-center w-full lg:w-auto gap-1 rounded-[18px] lg:rounded-full bg-[#F6EEE2]/85 p-1 border border-white/80 max-w-full"
          >
            {(
              [
                ['auto', 'Auto Detect'],
                ['direct-to-indirect', 'Direct → Indirect'],
                ['indirect-to-direct', 'Indirect → Direct'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setMode(val);
                  setAiResult(null);
                }}
                aria-pressed={mode === val}
                className={`bubbly-btn flex-1 sm:flex-initial text-center justify-center rounded-full px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold whitespace-nowrap cursor-pointer ${
                  mode === val
                    ? 'caramel-gloss text-white'
                    : 'text-[#7A6252] hover:text-[#362419]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
          onAiRefine={handleAiRefine}
          aiLoading={aiLoading}
          label="Narration sentence input"
        />

        {aiNotice && (
          <p className="text-xs font-semibold text-[#B86228] px-1">{aiNotice}</p>
        )}
      </div>

      {/* Results Area */}
      {activeResult ? (
        <div className="space-y-4 lg:space-y-5 min-w-0">
          <ResultHeroBubble
            resultText={activeResult.converted}
            badgeText={
              lang === 'bn'
                ? `${activeResult.detectedType.en} · ${activeResult.detectedType.bn}`
                : activeResult.detectedType.en
            }
            elapsedMs={activeResult.elapsedMs}
            lang={lang}
            speechRate={speechRate}
            isAiEnhanced={Boolean(aiResult)}
            isSaved={savedFlag}
            onSaveToHistory={() => {
              onSaveHistory(
                activeResult.input,
                activeResult.converted,
                activeResult.detectedType.en,
              );
              setSavedFlag(true);
            }}
          />

          {/* Step-by-Step Bubbly Transformation Cards */}
          {activeResult.steps.length > 0 && (
            <div className="glass-panel p-3.5 sm:p-4 lg:p-6 min-w-0">
              <h3 className="text-sm lg:text-base font-extrabold text-[#362419] mb-3 lg:mb-4">
                {lang === 'bn'
                  ? 'Step-by-Step Transformation · ধাপে ধাপে পরিবর্তন'
                  : 'Step-by-Step Transformation'}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-3.5">
                {activeResult.steps.map((step) => (
                  <div
                    key={step.id}
                    className="bubbly-card cream-well p-3.5 lg:p-4 space-y-2.5 min-w-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-[#FFF3E0] px-2.5 lg:px-3 py-0.5 text-[11px] lg:text-xs font-bold text-[#B86228] max-w-full break-words">
                        {lang === 'bn'
                          ? `${step.label.en} · ${step.label.bn}`
                          : step.label.en}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 text-xs lg:text-sm font-bold min-w-0">
                      <span className="rounded-2xl lg:rounded-full bg-white/85 px-2.5 lg:px-3 py-1 text-[#7A6252] border border-white line-through decoration-[#E07A44]/50 max-w-full whitespace-normal break-words">
                        {step.before}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#E07A44] shrink-0" />
                      <span className="rounded-2xl lg:rounded-full bg-[#E8F5E9] px-2.5 lg:px-3 py-1 text-[#2E6F40] border border-white max-w-full whitespace-normal break-words">
                        {step.after}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-[#7A6252] break-words">
                      {step.explanation.en}
                      {lang === 'bn' && step.explanation.bn && (
                        <span className="block mt-1 text-[#362419]/85 font-medium">
                          {step.explanation.bn}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
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
