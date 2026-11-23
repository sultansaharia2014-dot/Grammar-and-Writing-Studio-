import { useState, useMemo } from 'react';
import { Plus, Bookmark, BookmarkCheck, ArrowRight, Sparkles } from 'lucide-react';
import { LanguageMode, MorphemeAnalysis } from '../../types/studio';
import { MODULE_META, UI_COPY } from '../../i18n/labels';
import { solveMorphemes } from '../../engine/morpheme';
import { InputWell } from '../InputWell';

interface SuffixPrefixModuleProps {
  input: string;
  onInputChange: (val: string) => void;
  lang: LanguageMode;
  autoSolve: boolean;
  onToggleAutoSolve: () => void;
  onSaveHistory: (input: string, output: string, meta: string) => void;
}

export function SuffixPrefixModule({
  input,
  onInputChange,
  lang,
  autoSolve,
  onToggleAutoSolve,
  onSaveHistory,
}: SuffixPrefixModuleProps) {
  const [selectedWord, setSelectedWord] = useState<string | undefined>(undefined);
  const [manualInput, setManualInput] = useState(input);
  const [aiAnalysis, setAiAnalysis] = useState<MorphemeAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [savedFlag, setSavedFlag] = useState(false);

  const effectiveInput = autoSolve ? input : manualInput;

  const result = useMemo(() => {
    if (!effectiveInput.trim()) return null;
    return solveMorphemes(effectiveInput, selectedWord);
  }, [effectiveInput, selectedWord]);

  const analysis =
    aiAnalysis && aiAnalysis.cleanWord === result?.selectedAnalysis?.cleanWord
      ? aiAnalysis
      : result?.selectedAnalysis ?? null;

  function handleInputChange(next: string) {
    setSavedFlag(false);
    setSelectedWord(undefined);
    setAiAnalysis(null);
    setAiNotice(null);
    onInputChange(next);
    if (autoSolve) setManualInput(next);
  }

  function handleRubberClear() {
    setSavedFlag(false);
    setSelectedWord(undefined);
    setAiAnalysis(null);
    setAiNotice(null);
    onInputChange('');
    setManualInput('');
  }

  async function handleAiRefine() {
    const targetWord = analysis?.cleanWord || input.trim().split(/\s+/)[0];
    if (!targetWord) return;
    setAiLoading(true);
    setAiNotice(null);
    try {
      const resp = await fetch('/api/ai/morpheme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: targetWord,
          bilingual: lang === 'bn',
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.data?.root) {
        setAiNotice(json?.message || 'Showing instant local affix suggestions.');
        return;
      }
      const d = json.data;
      const baseAnalysis = analysis;
      setAiAnalysis({
        word: targetWord,
        cleanWord: targetWord,
        isRootInput: baseAnalysis?.isRootInput ?? true,
        prefix: baseAnalysis?.prefix ?? null,
        root: {
          text: d.root,
          pos: d.rootPos || 'Root',
          meaning: {
            en: d.rootMeaningEn || baseAnalysis?.root.meaning.en || 'Root word',
            bn: d.rootMeaningBn || baseAnalysis?.root.meaning.bn || 'মূল শব্দ',
          },
        },
        suffix: baseAnalysis?.suffix ?? null,
        classShift: baseAnalysis?.classShift ?? {
          en: 'AI Verified Prefixes & Suffixes',
          bn: 'AI যাচাইকৃত Prefix ও Suffix',
        },
        recommendedPrefixes: (d.prefixes || []).map(
          (p: {
            affix: string;
            resultWord: string;
            pos?: string;
            meaningEn?: string;
            meaningBn?: string;
          }) => ({
            affix: p.affix,
            resultWord: p.resultWord,
            pos: p.pos || 'Derived',
            meaning: {
              en: p.meaningEn || '',
              bn: p.meaningBn || p.meaningEn || '',
            },
          }),
        ),
        recommendedSuffixes: (d.suffixes || []).map(
          (s: {
            affix: string;
            resultWord: string;
            pos?: string;
            meaningEn?: string;
            meaningBn?: string;
          }) => ({
            affix: s.affix,
            resultWord: s.resultWord,
            pos: s.pos || 'Derived',
            meaning: {
              en: s.meaningEn || '',
              bn: s.meaningBn || s.meaningEn || '',
            },
          }),
        ),
        combinedForms: baseAnalysis?.combinedForms ?? [],
        derivatives: baseAnalysis?.derivatives ?? [],
      });
    } catch {
      setAiNotice('AI service unreachable; showing instant local affix suggestions.');
    } finally {
      setAiLoading(false);
    }
  }

  const meta = MODULE_META.morpheme;

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
          onAiRefine={handleAiRefine}
          aiLoading={aiLoading}
          rows={2}
          label="Word or sentence for Suffix & Prefix finder"
        />

        {aiNotice && <p className="text-xs font-semibold text-[#B86228] px-1">{aiNotice}</p>}
      </div>

      {result && analysis ? (
        <div className="space-y-4 lg:space-y-5 min-w-0">
          {/* Sentence Mode: Clickable Word Chips */}
          {result.isSentence && (
            <div className="glass-panel p-3.5 sm:p-4 lg:p-5 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#7A6252]">
                  {lang === 'bn'
                    ? 'Click any word to see its right prefixes & suffixes · যেকোনো শব্দে ক্লিক করুন'
                    : 'Click any word chip to view its valid prefixes, suffixes, and morpheme split'}
                </span>
                <span className="rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-[11px] font-bold text-[#2E6F40] tabular-nums shrink-0">
                  {result.elapsedMs} ms
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {result.tokens.map((tok, idx) => {
                  const isSelected = analysis.cleanWord === tok.clean;
                  return (
                    <button
                      key={`${tok.clean}-${idx}`}
                      type="button"
                      disabled={!tok.analysis}
                      onClick={() => {
                        setAiAnalysis(null);
                        setSelectedWord(tok.clean);
                      }}
                      className={`bubbly-btn rounded-full px-2.5 lg:px-3.5 py-1 lg:py-1.5 text-xs lg:text-sm font-bold border cursor-pointer disabled:opacity-60 disabled:cursor-default ${
                        isSelected
                          ? 'caramel-gloss text-white border-transparent'
                          : tok.hasAffix
                            ? 'bg-[#FFF3E0] text-[#B86228] border-white hover:bg-[#FFE4BD]'
                            : 'bg-white/75 text-[#362419] border-white'
                      }`}
                    >
                      {tok.raw}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Panel: Root & Morpheme Puzzle + Right Prefixes & Suffixes */}
          <div className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-4 lg:space-y-5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 min-w-0 max-w-full">
                <span className="rounded-full bg-[#FFF3E0] px-2.5 lg:px-3 py-1 text-[11px] lg:text-xs font-bold text-[#B86228] max-w-full break-words">
                  {lang === 'bn'
                    ? `${analysis.classShift.en} · ${analysis.classShift.bn}`
                    : analysis.classShift.en}
                </span>
                <span className="rounded-full bg-[#E8F5E9] px-2 lg:px-2.5 py-1 text-[10px] lg:text-[11px] font-bold text-[#2E6F40] tabular-nums shrink-0">
                  {aiAnalysis ? 'AI Verified' : `${result.elapsedMs} ms`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const preList = analysis.recommendedPrefixes
                    .map((p) => `${p.affix} (${p.resultWord})`)
                    .join(', ');
                  const sufList = analysis.recommendedSuffixes
                    .map((s) => `${s.affix} (${s.resultWord})`)
                    .join(', ');
                  onSaveHistory(
                    analysis.cleanWord,
                    `Root: ${analysis.root.text} | Prefixes: ${preList || 'none'} | Suffixes: ${sufList || 'none'}`,
                    'Suffix & Prefix',
                  );
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

            {/* Morpheme Puzzle Bubbles */}
            <div className="flex flex-wrap items-stretch justify-center gap-2.5 lg:gap-3 py-1">
              {analysis.prefix && (
                <>
                  <div className="bubbly-card flex-1 min-w-0 w-full sm:w-auto sm:min-w-[150px] sm:max-w-[250px] rounded-[20px] lg:rounded-[24px] bg-[#FFF3E0]/90 border-2 border-white p-3 lg:p-4 text-center shadow-sm">
                    <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#B86228]">
                      Detected Prefix · উপসর্গ
                    </span>
                    <span className="block text-xl lg:text-2xl font-extrabold text-[#362419] my-1 break-words">
                      {analysis.prefix.text}
                    </span>
                    <span className="block text-xs font-semibold text-[#7A6252] break-words">
                      {analysis.prefix.meaning.en}
                      {lang === 'bn' && ` (${analysis.prefix.meaning.bn})`}
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-[#E07A44]">
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                </>
              )}

              <div className="bubbly-card flex-1 min-w-0 w-full sm:w-auto sm:min-w-[180px] sm:max-w-[300px] rounded-[20px] lg:rounded-[24px] bg-white/90 border-2 border-[#F4A261]/55 p-3 lg:p-4 text-center shadow-sm">
                <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#E07A44]">
                  Root Word · মূল শব্দ ({analysis.root.pos})
                </span>
                <span
                  data-testid="morpheme-root"
                  className="block text-xl lg:text-2xl font-extrabold text-[#362419] my-1 break-words"
                >
                  {analysis.root.text}
                </span>
                <span className="block text-xs font-semibold text-[#7A6252] break-words">
                  {analysis.root.meaning.en}
                  {lang === 'bn' && (
                    <span className="block mt-0.5 text-[#362419]/85">{analysis.root.meaning.bn}</span>
                  )}
                </span>
              </div>

              {analysis.suffix && (
                <>
                  <div className="flex items-center justify-center text-[#2E6F40]">
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="bubbly-card flex-1 min-w-0 w-full sm:w-auto sm:min-w-[150px] sm:max-w-[250px] rounded-[20px] lg:rounded-[24px] bg-[#E8F5E9]/90 border-2 border-white p-3 lg:p-4 text-center shadow-sm">
                    <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#2E6F40]">
                      Detected Suffix · প্রত্যয়
                    </span>
                    <span className="block text-xl lg:text-2xl font-extrabold text-[#362419] my-1 break-words">
                      {analysis.suffix.text}
                    </span>
                    <span className="block text-xs font-semibold text-[#7A6252] break-words">
                      {analysis.suffix.meaning.en}
                      {lang === 'bn' && ` (${analysis.suffix.meaning.bn})`}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right Prefixes & Suffixes Finder Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-[#362419]/10">
              {/* Right Prefixes */}
              <div data-testid="recommended-prefixes" className="space-y-2.5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#362419] break-words">
                    {lang === 'bn'
                      ? `Right Prefixes for "${analysis.root.text}" · সঠিক উপসর্গ`
                      : `Right Prefixes for "${analysis.root.text}"`}
                  </h3>
                  <span className="text-[11px] font-bold text-[#B86228] tabular-nums shrink-0">
                    {analysis.recommendedPrefixes.length} found
                  </span>
                </div>

                {analysis.recommendedPrefixes.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.recommendedPrefixes.map((pre, idx) => (
                      <button
                        key={`${pre.affix}-${idx}`}
                        type="button"
                        onClick={() => handleInputChange(pre.resultWord)}
                        className="bubbly-btn cream-well w-full p-3 lg:p-3.5 text-left hover:bg-white/90 cursor-pointer space-y-1.5 min-w-0"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5 lg:gap-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs lg:text-sm font-extrabold min-w-0">
                            <span className="rounded-full bg-[#FFF3E0] px-2 lg:px-2.5 py-0.5 text-[#B86228] border border-white">
                              {pre.affix}
                            </span>
                            <span className="text-[#7A6252]">+ {analysis.root.text}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-[#E07A44] shrink-0" />
                            <span className="text-[#362419] text-sm lg:text-base break-words">
                              {pre.resultWord}
                            </span>
                          </div>
                          <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-bold text-[#7A6252] shrink-0">
                            {pre.pos}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A6252] break-words">
                          {pre.meaning.en}
                          {lang === 'bn' && pre.meaning.bn && ` · ${pre.meaning.bn}`}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="cream-well p-3.5 lg:p-4 text-xs font-medium text-[#7A6252]">
                    {lang === 'bn'
                      ? `"${analysis.root.text}" সাধারণত শুধু Suffix নেয় (Prefix নয়)।`
                      : `"${analysis.root.text}" primarily forms new words with suffixes rather than prefixes.`}
                  </div>
                )}
              </div>

              {/* Right Suffixes */}
              <div data-testid="recommended-suffixes" className="space-y-2.5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#362419] break-words">
                    {lang === 'bn'
                      ? `Right Suffixes for "${analysis.root.text}" · সঠিক প্রত্যয়`
                      : `Right Suffixes for "${analysis.root.text}"`}
                  </h3>
                  <span className="text-[11px] font-bold text-[#2E6F40] tabular-nums shrink-0">
                    {analysis.recommendedSuffixes.length} found
                  </span>
                </div>

                {analysis.recommendedSuffixes.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.recommendedSuffixes.map((suf, idx) => (
                      <button
                        key={`${suf.affix}-${idx}`}
                        type="button"
                        onClick={() => handleInputChange(suf.resultWord)}
                        className="bubbly-btn cream-well w-full p-3 lg:p-3.5 text-left hover:bg-white/90 cursor-pointer space-y-1.5 min-w-0"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5 lg:gap-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs lg:text-sm font-extrabold min-w-0">
                            <span className="text-[#7A6252]">{analysis.root.text} +</span>
                            <span className="rounded-full bg-[#E8F5E9] px-2 lg:px-2.5 py-0.5 text-[#2E6F40] border border-white">
                              {suf.affix}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-[#2E6F40] shrink-0" />
                            <span className="text-[#362419] text-sm lg:text-base break-words">
                              {suf.resultWord}
                            </span>
                          </div>
                          <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-bold text-[#2E6F40] shrink-0">
                            {suf.pos}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A6252] break-words">
                          {suf.meaning.en}
                          {lang === 'bn' && suf.meaning.bn && ` · ${suf.meaning.bn}`}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="cream-well p-3.5 lg:p-4 text-xs font-medium text-[#7A6252]">
                    No common suffixes found; try clicking Refine with AI for rare words.
                  </div>
                )}
              </div>
            </div>

            {/* Combined Prefix + Root + Suffix Forms */}
            {analysis.combinedForms.length > 0 && (
              <div className="pt-3 border-t border-[#362419]/10 space-y-2.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#362419] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#E07A44] shrink-0" />
                  <span>
                    {lang === 'bn'
                      ? 'Combined Prefix + Suffix Words · একত্রে গঠিত শব্দ'
                      : 'Combined Prefix + Suffix Formations'}
                  </span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                  {analysis.combinedForms.map((c, idx) => (
                    <button
                      key={`${c.resultWord}-${idx}`}
                      type="button"
                      onClick={() => handleInputChange(c.resultWord)}
                      className="bubbly-btn cream-well p-3 text-left hover:bg-white/90 cursor-pointer space-y-1 min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-sm font-extrabold text-[#362419] break-words">
                          {c.resultWord}
                        </span>
                        <span className="rounded-full bg-[#FFF3E0] px-2 py-0.5 text-[10px] font-bold text-[#B86228] shrink-0">
                          {c.pos}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-[#E07A44] break-words">{c.formula}</p>
                      <p className="text-[11px] text-[#7A6252] break-words">
                        {c.meaning.en}
                        {lang === 'bn' && c.meaning.bn && ` · ${c.meaning.bn}`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
