export type ModuleId =
  | 'narration'
  | 'voice'
  | 'morpheme'
  | 'pos'
  | 'verbs'
  | 'paragraph'
  | 'dialogue'
  | 'composition'
  | 'story'
  | 'exam';

export type LanguageMode = 'en' | 'bn';

export interface BilingualText {
  en: string;
  bn: string;
}

export interface TransformationStep {
  id: string;
  label: BilingualText;
  before: string;
  after: string;
  explanation: BilingualText;
}

export interface NarrationResult {
  input: string;
  converted: string;
  direction: 'direct-to-indirect' | 'indirect-to-direct';
  detectedType: BilingualText;
  steps: TransformationStep[];
  elapsedMs: number;
}

export interface VoiceNode {
  role: BilingualText;
  text: string;
  note?: BilingualText;
}

export interface VoiceResult {
  input: string;
  converted: string;
  direction: 'active-to-passive' | 'passive-to-active';
  detectedVoice: BilingualText;
  tenseLabel: BilingualText;
  swapDiagram: {
    activeNodes: [VoiceNode, VoiceNode, VoiceNode];
    passiveNodes: [VoiceNode, VoiceNode, VoiceNode];
  };
  rules: Array<{
    title: BilingualText;
    detail: BilingualText;
  }>;
  elapsedMs: number;
}

export interface AffixSuggestion {
  affix: string;
  resultWord: string;
  pos: string;
  meaning: BilingualText;
}

export interface MorphemeAnalysis {
  word: string;
  cleanWord: string;
  isRootInput: boolean;
  prefix: { text: string; meaning: BilingualText } | null;
  root: { text: string; pos: string; meaning: BilingualText };
  suffix: { text: string; meaning: BilingualText } | null;
  classShift: BilingualText;
  recommendedPrefixes: AffixSuggestion[];
  recommendedSuffixes: AffixSuggestion[];
  combinedForms: Array<{
    formula: string;
    resultWord: string;
    pos: string;
    meaning: BilingualText;
  }>;
  derivatives: Array<{
    word: string;
    pos: string;
    gloss: string;
  }>;
}

export interface MorphemeResult {
  input: string;
  isSentence: boolean;
  tokens: Array<{
    raw: string;
    clean: string;
    hasAffix: boolean;
    analysis: MorphemeAnalysis | null;
  }>;
  selectedAnalysis: MorphemeAnalysis | null;
  elapsedMs: number;
}

export type PosCategory =
  | 'Noun'
  | 'Pronoun'
  | 'Verb'
  | 'Adjective'
  | 'Adverb'
  | 'Preposition'
  | 'Conjunction'
  | 'Interjection'
  | 'Determiner';

export interface PosToken {
  id: string;
  word: string;
  cleanWord: string;
  pos: PosCategory;
  posBn: string;
  definition: BilingualText;
  roleInSentence: BilingualText;
}

export interface PosResult {
  input: string;
  tokens: PosToken[];
  counts: Record<PosCategory, number>;
  elapsedMs: number;
}

export interface VerbForms {
  v1: string;
  v2: string;
  v3: string;
  ving: string;
  vs: string;
  isIrregular: boolean;
}

export interface TenseSentenceRow {
  tense: BilingualText;
  formula: string;
  example: string;
}

export interface VerbResult {
  input: string;
  extractedVerb: string;
  forms: VerbForms;
  matrix: TenseSentenceRow[];
  elapsedMs: number;
}

export type WriterTone = 'Exam Standard' | 'Academic' | 'Creative' | 'Simple';
export type WriterLength = 'Short' | 'Medium' | 'Detailed' | 'Custom';

export interface WriterResult {
  kind: 'paragraph' | 'dialogue' | 'composition' | 'story';
  title: string;
  body: string;
  keyPhrases: string[];
  bengaliNote?: string;
  wordCount: number;
  sentenceCount: number;
  lineCount: number;
  source: 'local' | 'ai';
}

export type GrammarExamTopic = 'narration' | 'voice' | 'morpheme' | 'pos' | 'verbs';
export type ExamDifficulty = 'Junior' | 'SSC Standard' | 'HSC Advanced';

export interface ExamQuestion {
  id: string;
  topic: GrammarExamTopic;
  difficulty: ExamDifficulty;
  type: 'text' | 'mcq';
  instruction: string;
  prompt: string;
  options?: string[];
  answer: string;
  acceptableAnswers?: string[];
  marks: number;
  explanation: BilingualText;
}

export interface MockExamPaper {
  id: string;
  title: string;
  difficulty: ExamDifficulty;
  topics: GrammarExamTopic[];
  totalMarks: number;
  durationMinutes: number;
  questions: ExamQuestion[];
  source: 'local' | 'ai';
}

export interface GradedQuestionResult {
  questionId: string;
  topic: GrammarExamTopic;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  earnedMarks: number;
  maxMarks: number;
}

export interface MockExamGradeReport {
  earnedMarks: number;
  totalMarks: number;
  correctCount: number;
  totalCount: number;
  percentage: number;
  letterGrade: string;
  results: GradedQuestionResult[];
  topicBreakdown: Array<{
    topic: GrammarExamTopic;
    correct: number;
    total: number;
    percentage: number;
  }>;
}

export interface HistoryItem {
  id: string;
  module: ModuleId;
  input: string;
  output: string;
  meta: string;
  createdAt: number;
  extra?: {
    tone?: WriterTone;
    length?: WriterLength;
    customCount?: number;
    speakers?: string;
  };
}

export interface StudioSettings {
  speechRate: number;
  autoSolveDefault: boolean;
  preferAiEnhancement: boolean;
  realRubberAnimation: boolean;
  pencilWriteAnimation: boolean;
}
