import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  FileDown,
  RotateCcw,
  Clock,
  Bookmark,
  BookmarkCheck,
  Award,
  Check,
} from 'lucide-react';
import {
  ExamDifficulty,
  ExamQuestion,
  GrammarExamTopic,
  LanguageMode,
  MockExamGradeReport,
  MockExamPaper,
} from '../../types/studio';
import { MODULE_META, UI_COPY } from '../../i18n/labels';
import {
  ALL_GRAMMAR_TOPICS,
  GRAMMAR_TOPIC_META,
  generateLocalMockExam,
  gradeMockExam,
} from '../../engine/mockExam';
import { downloadMockExamPdf } from '../../utils/pdfExport';
import { StylusPenLoader } from '../StylusPenLoader';

const DIFFICULTIES: ExamDifficulty[] = ['Junior', 'SSC Standard', 'HSC Advanced'];
const QUESTION_COUNTS = [5, 10, 15, 20];
const TIMER_OPTIONS = [
  { label: 'Untimed', minutes: 0 },
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '20 min', minutes: 20 },
];

interface MockExamModuleProps {
  titleInput: string;
  onTitleChange: (val: string) => void;
  lang: LanguageMode;
  onSaveHistory: (input: string, output: string, meta: string) => void;
}

function renderFormattedPrompt(prompt: string) {
  const parts = prompt.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span
          key={idx}
          className="inline-block rounded-md bg-[#FFF3E0] px-1.5 py-0.5 font-extrabold text-[#B86228] underline decoration-[#F4A261] decoration-2 underline-offset-2"
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function formatTimerClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function MockExamModule({
  titleInput,
  onTitleChange,
  lang,
  onSaveHistory,
}: MockExamModuleProps) {
  const meta = MODULE_META.exam;

  const [selectedTopics, setSelectedTopics] = useState<GrammarExamTopic[]>([
    ...ALL_GRAMMAR_TOPICS,
  ]);
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('SSC Standard');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  const [paper, setPaper] = useState<MockExamPaper>(() =>
    generateLocalMockExam({
      title: titleInput || 'SSC Grammar Section Model Test',
      topics: [...ALL_GRAMMAR_TOPICS],
      difficulty: 'SSC Standard',
      count: 5,
      durationMinutes: 0,
      shuffle: false,
    }),
  );

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<MockExamGradeReport | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [savedFlag, setSavedFlag] = useState(false);
  const [pdfNotice, setPdfNotice] = useState<'paper' | 'key' | null>(null);

  useEffect(() => {
    if (!paper.durationMinutes || paper.durationMinutes <= 0 || report) {
      setSecondsLeft(0);
      return;
    }
    setSecondsLeft(paper.durationMinutes * 60);
  }, [paper.id, paper.durationMinutes, report]);

  useEffect(() => {
    if (secondsLeft <= 0 || report || !paper.durationMinutes) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, report, paper.durationMinutes]);

  const answeredCount = useMemo(
    () =>
      paper.questions.filter((q) => (userAnswers[q.id] || '').trim().length > 0)
        .length,
    [paper.questions, userAnswers],
  );

  function buildPaperWithConfig(overrides?: {
    topics?: GrammarExamTopic[];
    difficulty?: ExamDifficulty;
    count?: number;
    durationMinutes?: number;
    shuffle?: boolean;
  }) {
    const nextTopics = overrides?.topics ?? selectedTopics;
    const nextDifficulty = overrides?.difficulty ?? difficulty;
    const nextCount = overrides?.count ?? questionCount;
    const nextDuration = overrides?.durationMinutes ?? durationMinutes;

    const nextPaper = generateLocalMockExam({
      title: titleInput.trim() || `${nextDifficulty} Grammar Section Mock Exam`,
      topics: nextTopics,
      difficulty: nextDifficulty,
      count: nextCount,
      durationMinutes: nextDuration,
      shuffle: overrides?.shuffle ?? true,
    });
    setPaper(nextPaper);
    setUserAnswers({});
    setReport(null);
    setShowAnswerKey(false);
    setSavedFlag(false);
  }

  function toggleTopic(topic: GrammarExamTopic) {
    const nextTopics = selectedTopics.includes(topic)
      ? selectedTopics.length === 1
        ? selectedTopics
        : selectedTopics.filter((t) => t !== topic)
      : [...selectedTopics, topic];

    if (nextTopics === selectedTopics) return;
    setSelectedTopics(nextTopics);
    buildPaperWithConfig({ topics: nextTopics, shuffle: false });
  }

  function handleSelectDifficulty(lvl: ExamDifficulty) {
    setDifficulty(lvl);
    buildPaperWithConfig({ difficulty: lvl, shuffle: false });
  }

  function handleSelectQuestionCount(cnt: number) {
    setQuestionCount(cnt);
    buildPaperWithConfig({ count: cnt, shuffle: false });
  }

  function handleSelectTimer(minutes: number) {
    setDurationMinutes(minutes);
    setPaper((prev) => ({ ...prev, durationMinutes: minutes }));
  }

  function handleBuildLocalExam(shuffle = true) {
    buildPaperWithConfig({ shuffle });
  }

  async function handleGenerateAiExam() {
    setLoadingAi(true);
    setSavedFlag(false);
    const startedAt = performance.now();

    const finishWithMinimumAnimation = async () => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const minWaitMs = prefersReducedMotion ? 0 : 1800;
      const elapsed = performance.now() - startedAt;
      if (elapsed < minWaitMs) {
        await new Promise((r) => setTimeout(r, minWaitMs - elapsed));
      }
    };

    try {
      const resp = await fetch('/api/ai/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleInput.trim() || `${difficulty} Grammar Section Mock Exam`,
          topics: selectedTopics,
          difficulty,
          count: questionCount,
          bilingual: lang === 'bn',
        }),
      });
      const json = await resp.json();
      await finishWithMinimumAnimation();

      if (resp.ok && Array.isArray(json?.data?.questions) && json.data.questions.length > 0) {
        const mappedQuestions: ExamQuestion[] = json.data.questions
          .slice(0, questionCount)
          .map((item: Record<string, unknown>, idx: number) => {
            const rawTopic = String(item.topic || selectedTopics[idx % selectedTopics.length]);
            const topic: GrammarExamTopic = ALL_GRAMMAR_TOPICS.includes(
              rawTopic as GrammarExamTopic,
            )
              ? (rawTopic as GrammarExamTopic)
              : selectedTopics[idx % selectedTopics.length];
            const options = Array.isArray(item.options)
              ? item.options.map((o) => String(o)).filter(Boolean)
              : undefined;
            const qType: 'text' | 'mcq' =
              String(item.type) === 'mcq' && options && options.length >= 2 ? 'mcq' : 'text';

            return {
              id: `ai-q-${Date.now().toString(36)}-${idx}`,
              topic,
              difficulty,
              type: qType,
              instruction: String(item.instruction || 'Answer the grammar question:'),
              prompt: String(item.prompt || ''),
              options,
              answer: String(item.answer || ''),
              acceptableAnswers: Array.isArray(item.acceptableAnswers)
                ? item.acceptableAnswers.map((a) => String(a)).filter(Boolean)
                : undefined,
              marks: 1,
              explanation: {
                en: String(item.explanationEn || 'Review standard grammar transformation rules.'),
                bn: String(
                  item.explanationBn ||
                    item.explanationEn ||
                    'সঠিক ব্যাকরণগত নিয়ম অনুযায়ী উত্তরটি যাচাই করুন।',
                ),
              },
            };
          });

        // Guarantee exact requested questionCount even if Gemini returns fewer items
        if (mappedQuestions.length < questionCount) {
          const seenPrompts = new Set(
            mappedQuestions.map((q) => q.prompt.trim().toLowerCase()),
          );
          const supplemental = generateLocalMockExam({
            title: titleInput.trim() || `${difficulty} Grammar Section Mock Exam`,
            topics: selectedTopics,
            difficulty,
            count: questionCount + 5,
            durationMinutes,
            shuffle: true,
          }).questions;

          for (const q of supplemental) {
            if (mappedQuestions.length >= questionCount) break;
            const key = q.prompt.trim().toLowerCase();
            if (!seenPrompts.has(key)) {
              seenPrompts.add(key);
              mappedQuestions.push(q);
            }
          }
        }

        setPaper({
          id: `exam-ai-${Date.now().toString(36)}`,
          title:
            String(json.data.title || '').trim() ||
            titleInput.trim() ||
            `${difficulty} Grammar Section Mock Exam`,
          difficulty,
          topics: selectedTopics,
          totalMarks: mappedQuestions.reduce((sum, q) => sum + q.marks, 0),
          durationMinutes,
          questions: mappedQuestions,
          source: 'ai',
        });
        setUserAnswers({});
        setReport(null);
        setShowAnswerKey(false);
      } else {
        handleBuildLocalExam(true);
      }
    } catch {
      await finishWithMinimumAnimation();
      handleBuildLocalExam(true);
    } finally {
      setLoadingAi(false);
    }
  }

  function handleSubmitExam() {
    const graded = gradeMockExam(paper, userAnswers);
    setReport(graded);
    setShowAnswerKey(true);
  }

  function handleResetAttempt() {
    setUserAnswers({});
    setReport(null);
    setShowAnswerKey(false);
    setSavedFlag(false);
    if (paper.durationMinutes > 0) {
      setSecondsLeft(paper.durationMinutes * 60);
    }
  }

  function handleDownloadExam(includeAnswers: boolean) {
    downloadMockExamPdf(paper, includeAnswers);
    setPdfNotice(includeAnswers ? 'key' : 'paper');
    window.setTimeout(() => setPdfNotice(null), 2000);
  }

  return (
    <div className="space-y-4 lg:space-y-5 min-w-0">
      {/* Builder Configuration Panel */}
      <section className="glass-panel p-3.5 sm:p-4 lg:p-6 space-y-4 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#362419] tracking-tight">
              {lang === 'bn' ? meta.title.bn : meta.title.en}
            </h2>
            <p className="text-xs lg:text-sm text-[#7A6252] mt-0.5">
              {lang === 'bn' ? meta.subtitle.bn : meta.subtitle.en}
            </p>
          </div>
        </div>

        {/* Exam Title + Quick Templates */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]">
              {lang === 'bn' ? 'Presets · নমুনা শিরোনাম:' : 'Quick Titles:'}
            </span>
            {meta.examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => onTitleChange(ex)}
                className={`bubbly-btn rounded-full px-2.5 py-1 text-[11px] font-bold border cursor-pointer ${
                  titleInput === ex
                    ? 'bg-[#FFF3E0] text-[#B86228] border-[#F4A261]'
                    : 'bg-white/75 text-[#7A6252] hover:bg-white border-white'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          <input
            type="text"
            aria-label="Mock exam title"
            value={titleInput}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={lang === 'bn' ? meta.placeholder.bn : meta.placeholder.en}
            className="cream-well w-full px-3.5 py-2 text-xs sm:text-sm font-bold text-[#362419] focus:outline-none"
          />
        </div>

        {/* Grammar Sections & Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 min-w-0">
          {/* Grammar Topics Multi-Select */}
          <div className="lg:col-span-6 space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]">
                Grammar Sections · ব্যাকরণ বিষয় ({selectedTopics.length}/5)
              </span>
              <button
                type="button"
                onClick={() => {
                  const all = [...ALL_GRAMMAR_TOPICS];
                  setSelectedTopics(all);
                  buildPaperWithConfig({ topics: all, shuffle: false });
                }}
                className="text-[11px] font-bold text-[#B86228] hover:underline cursor-pointer"
              >
                Select All
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GRAMMAR_TOPICS.map((topic) => {
                const active = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTopic(topic)}
                    className={`bubbly-btn inline-flex items-center gap-1 rounded-full px-2.5 lg:px-3 py-1 lg:py-1.5 text-[11px] lg:text-xs font-bold border cursor-pointer ${
                      active
                        ? 'caramel-gloss text-white border-transparent'
                        : 'bg-white/75 text-[#7A6252] hover:text-[#362419] border-white'
                    }`}
                  >
                    {active && <Check className="h-3 w-3 shrink-0" />}
                    <span>
                      {lang === 'bn'
                        ? GRAMMAR_TOPIC_META[topic].bn
                        : GRAMMAR_TOPIC_META[topic].en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty, Question Count, Timer */}
          <div className="lg:col-span-6 flex flex-wrap items-start gap-3.5 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]">
                Level · মান
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTIES.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    aria-pressed={difficulty === lvl}
                    onClick={() => handleSelectDifficulty(lvl)}
                    className={`bubbly-btn rounded-full px-2.5 py-1 text-[11px] lg:text-xs font-bold border cursor-pointer ${
                      difficulty === lvl
                        ? 'caramel-gloss text-white border-transparent'
                        : 'bg-white/75 text-[#7A6252] hover:text-[#362419] border-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]">
                Questions · প্রশ্ন সংখ্যা
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUESTION_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    data-testid={`exam-count-${cnt}`}
                    aria-pressed={questionCount === cnt}
                    onClick={() => handleSelectQuestionCount(cnt)}
                    className={`bubbly-btn rounded-full px-2.5 py-1 text-[11px] lg:text-xs font-bold border cursor-pointer tabular-nums ${
                      questionCount === cnt
                        ? 'caramel-gloss text-white border-transparent'
                        : 'bg-white/75 text-[#7A6252] hover:text-[#362419] border-white'
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <span className="block text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider text-[#7A6252]">
                Timer · সময়
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    type="button"
                    aria-pressed={durationMinutes === opt.minutes}
                    onClick={() => handleSelectTimer(opt.minutes)}
                    className={`bubbly-btn rounded-full px-2.5 py-1 text-[11px] lg:text-xs font-bold border cursor-pointer tabular-nums ${
                      durationMinutes === opt.minutes
                        ? 'caramel-gloss text-white border-transparent'
                        : 'bg-white/75 text-[#7A6252] hover:text-[#362419] border-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Exam Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button
            type="button"
            data-testid="create-mock-exam-btn"
            onClick={() => handleBuildLocalExam(true)}
            disabled={loadingAi}
            className="bubbly-btn inline-flex items-center justify-center gap-1.5 rounded-full bg-white/85 hover:bg-white px-4 py-2 text-xs lg:text-sm font-bold text-[#362419] border border-white cursor-pointer w-full sm:w-auto"
          >
            <ClipboardCheck className="h-4 w-4 text-[#B86228] shrink-0" />
            <span>
              {lang === 'bn' ? 'Create Mock Exam · তৈরি করুন' : 'Create Mock Exam'}
            </span>
          </button>

          <button
            type="button"
            data-testid="generate-ai-exam-btn"
            onClick={handleGenerateAiExam}
            disabled={loadingAi}
            className="bubbly-btn caramel-gloss inline-flex items-center justify-center gap-1.5 rounded-full px-4 lg:px-5 py-2 text-xs lg:text-sm font-bold text-white disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              {loadingAi
                ? 'Creating Exam...'
                : lang === 'bn'
                  ? 'Generate Fresh AI Exam · নতুন প্রশ্ন'
                  : 'Generate Fresh AI Exam'}
            </span>
          </button>
        </div>
      </section>

      {/* Loading State or Exam Paper */}
      {loadingAi ? (
        <StylusPenLoader
          headline={
            lang === 'bn'
              ? 'Preparing Mock Exam · নমুনা প্রশ্নপত্র তৈরি হচ্ছে...'
              : 'Preparing Grammar Mock Exam...'
          }
          subtext={
            lang === 'bn'
              ? 'নির্বাচিত অধ্যায় ও মান অনুযায়ী নতুন প্রশ্ন ও উত্তরপত্র সাজানো হচ্ছে।'
              : 'Composing fresh grammar questions, options, and answer keys for your test.'
          }
          lang={lang}
        />
      ) : (
        <section className="glass-panel p-4 sm:p-5 lg:p-7 space-y-4 min-w-0">
          {/* Paper Masthead + Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#362419]/10">
            <div className="min-w-0">
              <h3
                data-testid="mock-exam-paper-title"
                className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#362419] break-words"
              >
                {paper.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mt-1.5 text-[11px] lg:text-xs font-bold text-[#7A6252] tabular-nums">
                <span className="rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-[#B86228]">
                  {paper.difficulty}
                </span>
                <span>{paper.questions.length} questions</span>
                <span aria-hidden="true">·</span>
                <span>Full Marks: {paper.totalMarks}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Answered: {answeredCount}/{paper.questions.length}
                </span>
                {paper.durationMinutes > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                        secondsLeft <= 60 && !report
                          ? 'bg-[#FFE5E5] text-[#C62828]'
                          : 'bg-white/80 text-[#362419]'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {report ? `${paper.durationMinutes} min` : formatTimerClock(secondsLeft)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 max-w-full">
              <button
                type="button"
                data-testid="toggle-answer-key-btn"
                onClick={() => setShowAnswerKey((prev) => !prev)}
                className="bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white px-3 py-1.5 text-[11px] lg:text-xs font-bold text-[#362419] border border-white cursor-pointer"
              >
                {showAnswerKey ? (
                  <EyeOff className="h-3.5 w-3.5 text-[#B86228]" />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-[#B86228]" />
                )}
                <span>{showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}</span>
              </button>

              <button
                type="button"
                data-testid="download-exam-pdf-btn"
                onClick={() => handleDownloadExam(false)}
                className="bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white px-3 py-1.5 text-[11px] lg:text-xs font-bold text-[#362419] border border-white cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5 text-[#B86228]" />
                <span>{pdfNotice === 'paper' ? 'Paper Saved!' : 'Exam PDF'}</span>
              </button>

              <button
                type="button"
                data-testid="download-key-pdf-btn"
                onClick={() => handleDownloadExam(true)}
                className="bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white px-3 py-1.5 text-[11px] lg:text-xs font-bold text-[#362419] border border-white cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5 text-[#2E6F40]" />
                <span>{pdfNotice === 'key' ? 'Key Saved!' : 'Answer Key PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetAttempt}
                className="bubbly-btn inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white px-3 py-1.5 text-[11px] lg:text-xs font-bold text-[#7A6252] border border-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Score Report Summary Card */}
          {report && (
            <div
              data-testid="exam-score-report"
              className="cream-well p-4 lg:p-5 space-y-3 border border-[#F4A261]/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl caramel-gloss text-white shadow-sm shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-[#362419] tabular-nums">
                      Score: {report.earnedMarks} / {report.totalMarks} ({report.percentage}%) · Grade{' '}
                      <span className="text-[#B86228]">{report.letterGrade}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#7A6252]">
                      {report.correctCount} correct out of {report.totalCount} grammar questions
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSaveHistory(
                      `${paper.title} (${paper.difficulty})`,
                      `Score: ${report.earnedMarks}/${report.totalMarks} (${report.percentage}% · Grade ${report.letterGrade})`,
                      `${paper.questions.length} Qs · Grammar Mock Exam`,
                    );
                    setSavedFlag(true);
                  }}
                  className={`bubbly-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border border-white cursor-pointer ${
                    savedFlag
                      ? 'bg-[#E8F5E9] text-[#2E6F40]'
                      : 'bg-[#FFF3E0] hover:bg-[#FFE6C2] text-[#B86228]'
                  }`}
                >
                  {savedFlag ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {savedFlag
                      ? lang === 'bn'
                        ? UI_COPY.saved.bn
                        : UI_COPY.saved.en
                      : lang === 'bn'
                        ? UI_COPY.saveHistory.bn
                        : UI_COPY.saveHistory.en}
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {report.topicBreakdown.map((tb) => (
                  <span
                    key={tb.topic}
                    className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#362419] border border-white tabular-nums"
                  >
                    {GRAMMAR_TOPIC_META[tb.topic].short}: {tb.correct}/{tb.total} ({tb.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-3.5">
            {paper.questions.map((q, idx) => {
              const gradedItem = report?.results.find((r) => r.questionId === q.id);
              const val = userAnswers[q.id] ?? '';

              return (
                <div
                  key={q.id}
                  data-testid={`exam-question-${idx}`}
                  className={`rounded-2xl p-3.5 sm:p-4 border transition-colors min-w-0 ${
                    gradedItem
                      ? gradedItem.isCorrect
                        ? 'bg-[#F1F8F2]/90 border-[#81C784]/60'
                        : 'bg-[#FFF5F5]/90 border-[#E57373]/60'
                      : 'bg-white/65 border-white/90'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#362419] px-2 text-[11px] font-extrabold text-white tabular-nums">
                        Q{idx + 1}
                      </span>
                      <span className="rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-[11px] font-bold text-[#B86228]">
                        {GRAMMAR_TOPIC_META[q.topic].short}
                      </span>
                      <span className="text-xs font-bold text-[#7A6252]">
                        {q.instruction}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {gradedItem &&
                        (gradedItem.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2E6F40]">
                            <CheckCircle2 className="h-4 w-4" />
                            Correct (+{gradedItem.earnedMarks})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#C62828]">
                            <XCircle className="h-4 w-4" />
                            Incorrect (0/{gradedItem.maxMarks})
                          </span>
                        ))}
                    </div>
                  </div>

                  <p className="text-sm sm:text-[15px] font-bold text-[#362419] mb-2.5 break-words">
                    {renderFormattedPrompt(q.prompt)}
                  </p>

                  {q.type === 'mcq' && q.options && q.options.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt, optIdx) => {
                        const selected = val === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            data-testid={`exam-option-${idx}-${optIdx}`}
                            disabled={Boolean(report)}
                            onClick={() =>
                              setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))
                            }
                            aria-pressed={selected}
                            className={`bubbly-btn rounded-full px-3 py-1.5 text-xs font-bold border cursor-pointer disabled:cursor-default ${
                              selected
                                ? 'caramel-gloss text-white border-transparent'
                                : 'bg-white/90 text-[#362419] hover:bg-white border-[#E8D8C8]'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      data-testid={`exam-answer-${idx}`}
                      disabled={Boolean(report)}
                      value={val}
                      onChange={(e) =>
                        setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Type your answer here..."
                      className="cream-well w-full px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#362419] focus:outline-none disabled:opacity-85"
                    />
                  )}

                  {(showAnswerKey || report) && (
                    <div className="mt-2.5 rounded-xl bg-white/80 px-3 py-2 text-xs space-y-1 border border-[#362419]/10">
                      <div className="font-extrabold text-[#2E6F40] break-words">
                        Answer Key: <span className="text-[#362419]">{q.answer}</span>
                      </div>
                      <p className="text-[#7A6252] font-medium break-words">
                        {lang === 'bn' && q.explanation.bn
                          ? `${q.explanation.en} · ${q.explanation.bn}`
                          : q.explanation.en}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#362419]/10">
            <span className="text-xs font-semibold text-[#7A6252] tabular-nums">
              {answeredCount} of {paper.questions.length} answered
            </span>

            {!report ? (
              <button
                type="button"
                data-testid="submit-exam-btn"
                onClick={handleSubmitExam}
                className="bubbly-btn caramel-gloss inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs lg:text-sm font-bold text-white cursor-pointer w-full sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  {lang === 'bn' ? 'Submit & Grade Exam · নম্বর দেখুন' : 'Submit & Grade Exam'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleBuildLocalExam(true)}
                className="bubbly-btn caramel-gloss inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs lg:text-sm font-bold text-white cursor-pointer w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Take Another Mock Exam</span>
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
