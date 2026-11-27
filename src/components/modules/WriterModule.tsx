import { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  Volume2,
  Square,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  FileDown,
  Loader2,
} from 'lucide-react';
import { LanguageMode, WriterLength, WriterResult, WriterTone } from '../../types/studio';
import { MODULE_META, UI_COPY } from '../../i18n/labels';
import {
  countTextStats,
  generateLocalWriting,
  isFormalDialogueTopic,
  parseCustomCountInput,
  resolveDialogueSpeakers,
} from '../../engine/writerFallback';
import { downloadWriterPdf } from '../../utils/pdfExport';
import { useStudioSpeaker } from '../../utils/studioSpeech';
import { InputWell } from '../InputWell';
import { StylusPenLoader } from '../StylusPenLoader';

function PenWritingLoadingCard({
  kind,
  isFormal,
  lang,
}: {
  kind: 'paragraph' | 'dialogue' | 'composition' | 'story';
  isFormal: boolean;
  lang: LanguageMode;
}) {
  const headline =
    kind === 'dialogue'
      ? isFormal
        ? lang === 'bn'
          ? 'Writing Formal Dialogue · আনুষ্ঠানিক সংলাপ লেখা হচ্ছে...'
          : 'Writing Formal Dialogue...'
        : lang === 'bn'
          ? 'Writing Dialogue · সংলাপ লেখা হচ্ছে...'
          : 'Writing Dialogue...'
      : kind === 'story'
        ? lang === 'bn'
          ? 'Writing Story · গল্প লেখা হচ্ছে...'
          : 'Writing Story...'
        : lang === 'bn'
          ? `Writing ${kind[0].toUpperCase() + kind.slice(1)} · লেখা তৈরি হচ্ছে...`
          : `Writing ${kind[0].toUpperCase() + kind.slice(1)}...`;

  const subtext =
    kind === 'dialogue'
      ? isFormal
        ? lang === 'bn'
          ? 'যথাযথ সম্বোধন ও আনুষ্ঠানিক কাঠামো অনুযায়ী সংলাপ সাজানো হচ্ছে।'
          : 'Composing respectful openings, structured exchanges, and a formal closing.'
        : lang === 'bn'
          ? 'বক্তাদের স্বাভাবিক কথোপকথন ও সঠিক লাইন সংখ্যা তৈরি হচ্ছে।'
          : 'Crafting natural speaker turns with balanced pacing.'
      : kind === 'story'
        ? lang === 'bn'
          ? 'সুন্দর কাহিনী ও প্রাঞ্জল বর্ণনায় গল্পটি সাজানো হচ্ছে।'
          : 'Weaving a vivid narrative with natural pacing and a clear moral takeaway.'
        : lang === 'bn'
          ? 'আপনার বিষয় ও শব্দসংখ্যা অনুযায়ী সুন্দরভাবে লেখা সাজানো হচ্ছে।'
          : 'Structuring cohesive sentences tailored to your topic and length.';

  return <StylusPenLoader headline={headline} subtext={subtext} lang={lang} />;
}

const TONES: WriterTone[] = ['Exam Standard', 'Academic', 'Creative', 'Simple'];
const LENGTHS: WriterLength[] = ['Short', 'Medium', 'Detailed', 'Custom'];

interface WriterModuleProps {
  kind: 'paragraph' | 'dialogue' | 'composition' | 'story';
  topic: string;
  onTopicChange: (val: string) => void;
  lang: LanguageMode;
  speechRate: number;
  onSaveHistory: (
    input: string,
    output: string,
    meta: string,
    extra?: {
      tone?: WriterTone;
      length?: WriterLength;
      customCount?: number;
      speakers?: string;
    },
  ) => void;
}

export function WriterModule({
  kind,
  topic,
  onTopicChange,
  lang,
  speechRate,
  onSaveHistory,
}: WriterModuleProps) {
  const defaultCustom =
    kind === 'dialogue'
      ? '15'
      : kind === 'composition' || kind === 'story'
        ? '250'
        : '150';

  const [tone, setTone] = useState<WriterTone>('Exam Standard');
  const [length, setLength] = useState<WriterLength>('Medium');
  const [customInput, setCustomInput] = useState<string>(defaultCustom);
  const [speakers, setSpeakers] = useState('Rakib & Abdullah');
  const [speakersManuallyEdited, setSpeakersManuallyEdited] = useState(false);
  const [aiOverride, setAiOverride] = useState<WriterResult | null>(null);
  const [generatedDialogue, setGeneratedDialogue] = useState<WriterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { speaking, loadingAudio, toggleSpeak } = useStudioSpeaker(speechRate);
  const [savedFlag, setSavedFlag] = useState(false);
  const [pdfSaved, setPdfSaved] = useState(false);

  const meta = MODULE_META[kind];

  const effectiveSpeakers = useMemo(() => {
    if (kind !== 'dialogue') return speakers;
    if (speakersManuallyEdited) return speakers;
    return resolveDialogueSpeakers(topic, speakers).join(' & ');
  }, [kind, speakers, speakersManuallyEdited, topic]);

  const formalDialogue = useMemo(() => {
    if (kind !== 'dialogue') return false;
    return isFormalDialogueTopic(topic, effectiveSpeakers, tone);
  }, [kind, topic, effectiveSpeakers, tone]);

  const parsedCustomCount = useMemo(() => {
    const num = parseCustomCountInput(customInput);
    if (!num) return kind === 'dialogue' ? 15 : kind === 'composition' || kind === 'story' ? 250 : 150;
    return kind === 'dialogue'
      ? Math.max(2, Math.min(250, num))
      : Math.max(20, Math.min(2000, num));
  }, [customInput, kind]);

  const localResult = useMemo(() => {
    if (kind === 'dialogue' || !topic.trim()) return null;
    return generateLocalWriting({
      kind,
      topic,
      tone,
      length,
      customCount: length === 'Custom' ? parsedCustomCount : undefined,
      speakers: effectiveSpeakers,
    });
  }, [kind, topic, tone, length, parsedCustomCount, effectiveSpeakers]);

  useEffect(() => {
    setSavedFlag(false);
    setAiOverride(null);
    setGeneratedDialogue(null);
  }, [kind, topic, tone, length, parsedCustomCount, effectiveSpeakers]);

  const result = kind === 'dialogue' ? (aiOverride ?? generatedDialogue) : (aiOverride ?? localResult);

  async function handleGenerateWithAi() {
    if (!topic.trim()) return;
    setLoading(true);
    setSavedFlag(false);
    const startedAt = performance.now();

    const finishWithMinimumAnimation = async () => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const minWaitMs = prefersReducedMotion ? 0 : kind === 'dialogue' ? 2600 : 1700;
      const elapsed = performance.now() - startedAt;
      if (elapsed < minWaitMs) {
        await new Promise((resolve) => setTimeout(resolve, minWaitMs - elapsed));
      }
    };

    try {
      const resp = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          topic: topic.trim(),
          tone,
          length,
          customCount: length === 'Custom' ? parsedCustomCount : undefined,
          speakers: effectiveSpeakers,
          bilingual: lang === 'bn',
        }),
      });
      const json = await resp.json();
      await finishWithMinimumAnimation();

      if (resp.ok && json?.data?.body) {
        let bodyText: string = json.data.body;

        // Guarantee exact dialogue line count even from AI output
        if (kind === 'dialogue' && length === 'Custom') {
          const aiLines = bodyText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => /^[^:]{1,36}:\s*.+/.test(l));
          if (aiLines.length > parsedCustomCount) {
            bodyText = aiLines.slice(0, parsedCustomCount).join('\n');
          } else if (aiLines.length > 0 && aiLines.length < parsedCustomCount) {
            const padPool = generateLocalWriting({
              kind: 'dialogue',
              topic,
              tone,
              length: 'Custom',
              customCount: parsedCustomCount,
              speakers: effectiveSpeakers,
            }).body.split(/\r?\n/);
            const merged = [...aiLines, ...padPool.slice(aiLines.length, parsedCustomCount)];
            bodyText = merged.slice(0, parsedCustomCount).join('\n');
          }
        }

        const stats = countTextStats(bodyText);
        setAiOverride({
          kind,
          title: json.data.title || topic.trim(),
          body: bodyText,
          keyPhrases: json.data.keyPhrases || [],
          bengaliNote: json.data.bengaliNote,
          ...stats,
          source: 'ai',
        });
        setGeneratedDialogue(null);
      } else {
        setAiOverride(null);
        if (kind === 'dialogue') {
          setGeneratedDialogue(
            generateLocalWriting({
              kind: 'dialogue',
              topic,
              tone,
              length,
              customCount: length === 'Custom' ? parsedCustomCount : undefined,
              speakers: effectiveSpeakers,
            }),
          );
        }
      }
    } catch {
      await finishWithMinimumAnimation();
      setAiOverride(null);
      if (kind === 'dialogue') {
        setGeneratedDialogue(
          generateLocalWriting({
            kind: 'dialogue',
            topic,
            tone,
            length,
            customCount: length === 'Custom' ? parsedCustomCount : undefined,
            speakers: effectiveSpeakers,
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleRubberClear() {
    setSavedFlag(false);
    setAiOverride(null);
    setGeneratedDialogue(null);
    setSpeakersManuallyEdited(false);
    setSpeakers('Rakib & Abdullah');
    onTopicChange('');
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${result.title}\n\n${result.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore
    }
  }

  function handleSpeak() {
    if (!result) return;
    void toggleSpeak(`${result.title}. ${result.body}`);
  }

  function handleDownloadPdf() {
    if (!result) return;
    downloadWriterPdf(result, {
      tone,
      length,
      customCount: length === 'Custom' ? parsedCustomCount : undefined,
    });
    setPdfSaved(true);
    setTimeout(() => setPdfSaved(false), 2200);
  }

  const quickCustomOptions =
    kind === 'dialogue'
      ? [15, 30, 50, 60, 100]
      : kind === 'composition' || kind === 'story'
        ? [150, 250, 350, 500]
        : [100, 150, 250, 350];

  const unitLabel = kind === 'dialogue' ? 'lines' : 'words';

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

        {/* Parameter Pills: Tone, Length + Custom Words/Lines, Speakers (for Dialogue) */}
        <div className="flex flex-wrap items-start gap-3 lg:gap-4 min-w-0">
          <div className="space-y-1.5 max-w-full min-w-0">
            <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]">
              Tone · ধরন
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  aria-pressed={tone === t}
                  className={`bubbly-btn rounded-full px-2.5 lg:px-3 py-1 lg:py-1.5 text-[11px] lg:text-xs font-bold border cursor-pointer ${
                    tone === t
                      ? 'caramel-gloss text-white border-transparent'
                      : 'bg-white/75 text-[#7A6252] hover:text-[#362419] border-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-w-full min-w-0">
            <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]">
              {kind === 'dialogue' ? 'Length (Lines) · দৈর্ঘ্য' : 'Length (Words) · শব্দ সংখ্যা'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLength(l)}
                  aria-pressed={length === l}
                  className={`bubbly-btn rounded-full px-2.5 lg:px-3 py-1 lg:py-1.5 text-[11px] lg:text-xs font-bold border cursor-pointer ${
                    length === l
                      ? 'caramel-gloss text-white border-transparent'
                      : 'bg-white/75 text-[#7A6252] hover:text-[#362419] border-white'
                  }`}
                >
                  {l}
                </button>
              ))}

              {/* Always-reachable custom target words/lines input */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 lg:px-3 py-1 border border-white shadow-xs">
                <label
                  htmlFor="custom-length-input"
                  className="text-[11px] font-extrabold text-[#B86228] whitespace-nowrap"
                >
                  {kind === 'dialogue' ? 'Lines:' : 'Words:'}
                </label>
                <input
                  id="custom-length-input"
                  data-testid="custom-length-input"
                  type="text"
                  inputMode="numeric"
                  value={customInput}
                  onFocus={() => setLength('Custom')}
                  onChange={(e) => {
                    setLength('Custom');
                    setCustomInput(e.target.value);
                  }}
                  placeholder={kind === 'dialogue' ? '15, 30, 60' : '150, 250'}
                  className="w-14 lg:w-16 bg-transparent text-xs font-extrabold text-[#362419] focus:outline-none tabular-nums"
                />
              </div>
            </div>

            {/* Quick Custom Presets when Custom is active */}
            {length === 'Custom' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#7A6252]">Quick set:</span>
                {quickCustomOptions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCustomInput(String(n))}
                    className={`bubbly-btn rounded-full px-2.5 py-0.5 text-[11px] font-bold border cursor-pointer tabular-nums ${
                      parsedCustomCount === n
                        ? 'bg-[#FFF3E0] text-[#B86228] border-[#F4A261]'
                        : 'bg-white/65 text-[#7A6252] hover:bg-white border-white'
                    }`}
                  >
                    {n} {unitLabel}
                  </button>
                ))}
              </div>
            )}
          </div>

          {kind === 'dialogue' && (
            <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 lg:min-w-[200px] min-w-0">
              <label
                htmlFor="dialogue-speakers-input"
                className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]"
              >
                Speakers · বক্তা
              </label>
              <input
                id="dialogue-speakers-input"
                type="text"
                value={effectiveSpeakers}
                onChange={(e) => {
                  setSpeakersManuallyEdited(true);
                  setSpeakers(e.target.value);
                }}
                placeholder="Customer & Bank Manager"
                className="cream-well w-full px-3 lg:px-3.5 py-1.5 text-xs lg:text-sm font-bold text-[#362419] focus:outline-none"
              />
            </div>
          )}
        </div>

        <InputWell
          value={topic}
          onChange={(val) => {
            setSavedFlag(false);
            onTopicChange(val);
          }}
          placeholder={lang === 'bn' ? meta.placeholder.bn : meta.placeholder.en}
          examples={meta.examples}
          lang={lang}
          autoSolve={true}
          showAutoSolveToggle={false}
          onRubberClear={handleRubberClear}
          rows={2}
          label={`${kind} topic input`}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerateWithAi}
            disabled={loading || !topic.trim()}
            className="bubbly-btn caramel-gloss inline-flex items-center justify-center gap-2 rounded-full px-4 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-bold text-white disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              {loading
                ? 'Composing...'
                : lang === 'bn'
                  ? `Generate ${kind[0].toUpperCase() + kind.slice(1)} · তৈরি করুন`
                  : `Generate ${kind[0].toUpperCase() + kind.slice(1)}`}
            </span>
          </button>
        </div>
      </div>

      {/* Loading Screen (Stylish Pen Animation) OR Formatted Reading Card */}
      {loading ? (
        <PenWritingLoadingCard kind={kind} isFormal={formalDialogue} lang={lang} />
      ) : result ? (
        <article className="glass-panel p-4 sm:p-5 lg:p-7 space-y-3.5 lg:space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#362419]/10">
            <div className="min-w-0">
              <h3
                data-testid="writer-result-title"
                className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#362419] break-words"
              >
                {result.title}
              </h3>
              <div
                data-testid="writer-result-stats"
                className="flex flex-wrap items-center gap-1.5 lg:gap-2 mt-1.5 text-[11px] lg:text-xs font-bold text-[#7A6252] tabular-nums"
              >
                <span className="rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-[#B86228]">
                  {tone} ·{' '}
                  {length === 'Custom' ? `Custom (${parsedCustomCount} ${unitLabel})` : length}
                </span>
                {kind === 'dialogue' ? (
                  <>
                    <span>{result.lineCount} lines</span>
                    <span aria-hidden="true">·</span>
                    <span>{result.wordCount} words</span>
                  </>
                ) : (
                  <>
                    <span>{result.wordCount} words</span>
                    <span aria-hidden="true">·</span>
                    <span>{result.sentenceCount} sentences</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="text-[#2E6F40]">
                  {result.source === 'ai'
                    ? 'Gemini AI'
                    : kind === 'dialogue'
                      ? formalDialogue
                        ? 'Formal Dialogue'
                        : 'Structured Dialogue'
                      : 'Instant Studio'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 max-w-full">
              <button
                type="button"
                onClick={handleSpeak}
                aria-label={speaking || loadingAudio ? 'Stop reading result aloud' : 'Listen to result'}
                data-testid="writer-listen-btn"
                className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold border border-white cursor-pointer ${
                  speaking || loadingAudio
                    ? 'caramel-gloss text-white'
                    : 'bg-white/80 hover:bg-white text-[#362419]'
                }`}
              >
                {loadingAudio ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : speaking ? (
                  <Square className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-[#B86228]" />
                )}
                <span>
                  {loadingAudio
                    ? lang === 'bn'
                      ? UI_COPY.loadingVoice.bn
                      : UI_COPY.loadingVoice.en
                    : speaking
                      ? lang === 'bn'
                        ? UI_COPY.stopListening.bn
                        : UI_COPY.stopListening.en
                      : lang === 'bn'
                        ? UI_COPY.listen.bn
                        : UI_COPY.listen.en}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold text-[#362419] border border-white cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#2E6F40]" /> : <Copy className="h-3.5 w-3.5 text-[#7A6252]" />}
                <span>{copied ? (lang === 'bn' ? UI_COPY.copied.bn : UI_COPY.copied.en) : (lang === 'bn' ? UI_COPY.copy.bn : UI_COPY.copy.en)}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                aria-label="Download as PDF"
                data-testid="download-pdf-btn"
                className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-3 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold border border-white cursor-pointer ${
                  pdfSaved
                    ? 'bg-[#E8F5E9] text-[#2E6F40]'
                    : 'caramel-gloss text-white'
                }`}
              >
                {pdfSaved ? <Check className="h-3.5 w-3.5" /> : <FileDown className="h-3.5 w-3.5" />}
                <span>
                  {pdfSaved
                    ? lang === 'bn'
                      ? UI_COPY.pdfSaved.bn
                      : UI_COPY.pdfSaved.en
                    : lang === 'bn'
                      ? UI_COPY.downloadPdf.bn
                      : UI_COPY.downloadPdf.en}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSaveHistory(
                    topic,
                    `${result.title}\n\n${result.body}`,
                    kind === 'dialogue'
                      ? `${tone} · ${result.lineCount} lines`
                      : `${tone} · ${result.wordCount} words`,
                    {
                      tone,
                      length,
                      customCount: length === 'Custom' ? parsedCustomCount : undefined,
                      speakers: effectiveSpeakers,
                    },
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
          </div>

          <div
            data-testid="writer-result-body"
            className="text-sm sm:text-[15px] lg:text-base leading-[1.75] lg:leading-[1.8] text-[#362419] whitespace-pre-line font-medium break-words"
          >
            {result.body}
          </div>

          {result.keyPhrases.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 pt-2 border-t border-[#362419]/10">
              <span className="text-xs font-bold text-[#7A6252]">
                {lang === 'bn' ? 'Key Expressions · মূল শব্দগুচ্ছ:' : 'Key Expressions:'}
              </span>
              {result.keyPhrases.map((phrase, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-[#FFF3E0]/90 px-2.5 lg:px-3 py-1 text-[11px] lg:text-xs font-semibold text-[#B86228] border border-white max-w-full break-words"
                >
                  {phrase}
                </span>
              ))}
            </div>
          )}

          {lang === 'bn' && result.bengaliNote && (
            <div className="cream-well p-3 lg:p-3.5 text-xs font-semibold text-[#7A6252] break-words">
              {result.bengaliNote}
            </div>
          )}
        </article>
      ) : (
        <div className="glass-panel-soft p-6 lg:p-8 text-center text-xs lg:text-sm font-medium text-[#7A6252]">
          {kind === 'dialogue'
            ? lang === 'bn'
              ? 'সংলাপের বিষয় ও বক্তা নির্বাচন করে "Generate Dialogue" বাটনে ক্লিক করুন।'
              : 'Enter a dialogue topic and click "Generate Dialogue" to compose your conversation.'
            : lang === 'bn'
              ? 'উপরে একটি বিষয় লিখুন বা উদাহরণ বেছে নিন।'
              : 'Enter a topic or click an example pill above to generate your writing.'}
        </div>
      )}
    </div>
  );
}
