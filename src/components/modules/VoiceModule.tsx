import { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { LanguageMode } from '../../types/studio';
import { MODULE_META, UI_COPY } from '../../i18n/labels';
import { solveVoice } from '../../engine/voice';
import { InputWell } from '../InputWell';
import { ResultHeroBubble } from '../ResultHeroBubble';

interface VoiceModuleProps {
  input: string;
  onInputChange: (val: string) => void;
  lang: LanguageMode;
  autoSolve: boolean;
  onToggleAutoSolve: () => void;
  speechRate: number;
  onSaveHistory: (input: string, output: string, meta: string) => void;
}

export function VoiceModule({
  input,
  onInputChange,
  lang,
  autoSolve,
  onToggleAutoSolve,
  speechRate,
  onSaveHistory,
}: VoiceModuleProps) {
  const [mode, setMode] = useState<'auto' | 'active-to-passive' | 'passive-to-active'>('auto');
  const [manualInput, setManualInput] = useState(input);
  const [savedFlag, setSavedFlag] = useState(false);

  const effectiveInput = autoSolve ? input : manualInput;
  const result = useMemo(() => {
    if (!effectiveInput.trim()) return null;
    return solveVoice(effectiveInput, mode);
  }, [effectiveInput, mode]);

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

  const meta = MODULE_META.voice;

  return (
    <div className="space-y-4 lg:space-y-5 min-w-0">
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
            aria-label="Voice conversion direction"
            className="flex flex-wrap lg:inline-flex items-center w-full lg:w-auto gap-1 rounded-[18px] lg:rounded-full bg-[#F6EEE2]/85 p-1 border border-white/80 max-w-full"
          >
            {(
              [
                ['auto', 'Auto Detect'],
                ['active-to-passive', 'Active → Passive'],
                ['passive-to-active', 'Passive → Active'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setMode(val)}
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
          label="Active or Passive voice sentence"
        />
      </div>

      {result ? (
        <div className="space-y-4 lg:space-y-5 min-w-0">
          <ResultHeroBubble
            resultText={result.converted}
            badgeText={`Detected: ${result.detectedVoice.en} • ${result.tenseLabel.en}${
              lang === 'bn' ? ` (${result.tenseLabel.bn})` : ''
            }`}
            elapsedMs={result.elapsedMs}
            lang={lang}
            speechRate={speechRate}
            isSaved={savedFlag}
            onSaveToHistory={() => {
              onSaveHistory(
                result.input,
                result.converted,
                `${result.detectedVoice.en} · ${result.tenseLabel.en}`,
              );
              setSavedFlag(true);
            }}
          />

          {/* Bubbly Subject <-> Verb <-> Object Swap Diagram */}
          <div className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-4 lg:space-y-5 min-w-0">
            <h3 className="text-sm lg:text-base font-extrabold text-[#362419]">
              {lang === 'bn'
                ? 'Subject ↔ Verb ↔ Object Swap Diagram · কর্তা-ক্রিয়া-কর্ম বিনিময়'
                : 'Subject ↔ Verb ↔ Object Swap Diagram'}
            </h3>

            <div className="space-y-4">
              {/* Row 1: Active Structure */}
              <div>
                <p className="text-xs font-bold text-[#7A6252] mb-2">
                  {result.direction === 'active-to-passive' ? 'Original Active Structure' : 'Original Passive Structure'}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 lg:gap-2.5">
                  {(result.direction === 'active-to-passive'
                    ? result.swapDiagram.activeNodes
                    : result.swapDiagram.passiveNodes
                  ).map((node, i) => (
                    <div key={`top-${i}`} className="contents">
                      <div className="cream-well p-3 lg:p-3.5 text-center min-w-0">
                        <span className="block text-[11px] font-bold text-[#B86228] mb-0.5 lg:mb-1">
                          {lang === 'bn' ? `${node.role.en} · ${node.role.bn}` : node.role.en}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#362419] break-words">{node.text}</span>
                      </div>
                      {i < 2 && (
                        <div className="hidden lg:flex justify-center text-[#E07A44]">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Transformed Structure */}
              <div>
                <p className="text-xs font-bold text-[#2E6F40] mb-2">
                  {result.direction === 'active-to-passive' ? 'Converted Passive Structure' : 'Converted Active Structure'}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 lg:gap-2.5">
                  {(result.direction === 'active-to-passive'
                    ? result.swapDiagram.passiveNodes
                    : result.swapDiagram.activeNodes
                  ).map((node, i) => (
                    <div key={`bot-${i}`} className="contents">
                      <div className="rounded-[16px] lg:rounded-[20px] bg-[#E8F5E9]/75 border-2 border-white p-3 lg:p-3.5 text-center shadow-xs min-w-0">
                        <span className="block text-[11px] font-bold text-[#2E6F40] mb-0.5 lg:mb-1">
                          {lang === 'bn' ? `${node.role.en} · ${node.role.bn}` : node.role.en}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#362419] break-words">{node.text}</span>
                      </div>
                      {i < 2 && (
                        <div className="hidden lg:flex justify-center text-[#2E6F40]">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rule Explanation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-3 pt-2">
              {result.rules.map((rule, idx) => (
                <div key={idx} className="cream-well p-3.5 lg:p-4 space-y-1.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#362419] break-words">
                    {lang === 'bn' ? `${rule.title.en} · ${rule.title.bn}` : rule.title.en}
                  </h4>
                  <p className="text-xs leading-relaxed text-[#7A6252] break-words">
                    {rule.detail.en}
                    {lang === 'bn' && (
                      <span className="block mt-1 font-medium text-[#362419]/85">
                        {rule.detail.bn}
                      </span>
                    )}
                  </p>
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
