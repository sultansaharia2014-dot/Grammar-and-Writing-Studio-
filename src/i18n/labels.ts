import { LanguageMode, ModuleId } from '../types/studio';

export const MODULE_META: Record<
  ModuleId,
  {
    id: ModuleId;
    title: { en: string; bn: string };
    shortTitle: { en: string; bn: string };
    subtitle: { en: string; bn: string };
    placeholder: { en: string; bn: string };
    examples: string[];
  }
> = {
  narration: {
    id: 'narration',
    title: { en: 'Narration Solver', bn: 'Narration Solver · উক্তি পরিবর্তন' },
    shortTitle: { en: 'Narration', bn: 'Narration · উক্তি' },
    subtitle: {
      en: 'Instant Direct ↔ Indirect speech conversion with vocative, tense, and pronoun breakdown.',
      bn: 'সম্বোধন, কাল ও সর্বনাম পরিবর্তনসহ Direct ↔ Indirect উক্তি রূপান্তর।',
    },
    placeholder: {
      en: 'e.g. Rakib said to Abdullah, "Hey, friend, I am reading a book now."',
      bn: 'উদাহরণ: Rakib said to Abdullah, "Hey, friend, I am reading a book now."',
    },
    examples: [
      'Rakib said to Abdullah, "Hey, friend, I am Rakib."',
      'The teacher said to the students, "Always speak the truth."',
      'She said to me, "Are you coming to the library tomorrow?"',
      'He said, "What a beautiful morning it is!"',
      'Mother said, "The earth moves round the sun."',
      'He told me that he had finished his homework the previous day.',
    ],
  },
  voice: {
    id: 'voice',
    title: { en: 'Voice Solver', bn: 'Voice Solver · বাচ্য পরিবর্তন' },
    shortTitle: { en: 'Voice', bn: 'Voice · বাচ্য' },
    subtitle: {
      en: 'Convert Active ↔ Passive voice across tenses, modals, questions, and imperatives.',
      bn: 'Tense, Modal, প্রশ্ন ও আদেশসূচক বাক্যের Active ↔ Passive বাচ্য রূপান্তর।',
    },
    placeholder: {
      en: 'e.g. She wrote a thoughtful essay yesterday.',
      bn: 'উদাহরণ: She wrote a thoughtful essay yesterday.',
    },
    examples: [
      'She wrote a thoughtful essay yesterday.',
      'The students are planting trees in the school yard.',
      'We must protect our natural environment.',
      'Open the window immediately.',
      'Who broke the glass vase?',
      'A delicious meal was cooked by my grandmother.',
    ],
  },
  morpheme: {
    id: 'morpheme',
    title: { en: 'Suffix & Prefix', bn: 'Suffix & Prefix · উপসর্গ ও প্রত্যয়' },
    shortTitle: { en: 'Suffix & Prefix', bn: 'Suffix & Prefix' },
    subtitle: {
      en: 'Type any root word to get its valid Prefixes & Suffixes, or split affixed words into morpheme bubbles.',
      bn: 'যেকোনো মূল শব্দের সঠিক Prefix ও Suffix খুঁজুন অথবা যুক্ত শব্দ বিশ্লেষণ করুন।',
    },
    placeholder: {
      en: 'Enter a root word (e.g. happy, honest, possible) or an affixed word / sentence...',
      bn: 'একটি মূল শব্দ (যেমন happy, honest, possible) বা সম্পূর্ণ বাক্য লিখুন...',
    },
    examples: [
      'happy',
      'possible',
      'honest',
      'legal',
      'unhappiness',
      'The hardworking student achieved remarkable success.',
    ],
  },
  pos: {
    id: 'pos',
    title: { en: 'Parts of Speech', bn: 'Parts of Speech · পদ প্রকরণ' },
    shortTitle: { en: 'Parts of Speech', bn: 'Parts of Speech' },
    subtitle: {
      en: 'Inspect every word in context with pastel POS tags, grammatical roles, and counts.',
      bn: 'বাক্যের প্রতিটি শব্দের পদ, অর্থ এবং ব্যাকরণগত ভূমিকা বিশ্লেষণ।',
    },
    placeholder: {
      en: 'Type any sentence to inspect every word’s Part of Speech...',
      bn: 'প্রতিটি শব্দের পদ দেখতে যেকোনো ইংরেজি বাক্য লিখুন...',
    },
    examples: [
      'Wow! The clever fox quickly jumped over the lazy dog.',
      'She always speaks softly and writes neat notes in her notebook.',
      'Honesty is the best policy for every student.',
    ],
  },
  verbs: {
    id: 'verbs',
    title: { en: 'Verb Changing', bn: 'Verb Changing · ক্রিয়ার রূপ' },
    shortTitle: { en: 'Verb Changing', bn: 'Verb · ক্রিয়ার রূপ' },
    subtitle: {
      en: 'Get all 5 verb forms (V1–V5) and a 12-tense sentence matrix from any verb or sentence.',
      bn: 'যেকোনো Verb বা বাক্য থেকে ৫টি ক্রিয়ার রূপ ও ১২টি Tense-এর উদাহরণ।',
    },
    placeholder: {
      en: 'Enter a verb (e.g. write, go, study) or a sentence...',
      bn: 'একটি Verb (যেমন write, go) অথবা একটি বাক্য লিখুন...',
    },
    examples: [
      'write',
      'go',
      'study',
      'speak',
      'The birds fly across the golden sky.',
    ],
  },
  paragraph: {
    id: 'paragraph',
    title: { en: 'Paragraph Writer', bn: 'Paragraph Writer · অনুচ্ছেদ রচনা' },
    shortTitle: { en: 'Paragraph', bn: 'Paragraph · অনুচ্ছেদ' },
    subtitle: {
      en: 'Craft cohesive, high-scoring paragraphs tailored by tone and exam length.',
      bn: 'টোন ও দৈর্ঘ্য অনুযায়ী পরীক্ষার মানসম্মত ও আকর্ষণীয় অনুচ্ছেদ তৈরি করুন।',
    },
    placeholder: {
      en: 'Enter a paragraph topic (e.g. Importance of Reading Books)...',
      bn: 'অনুচ্ছেদের বিষয় লিখুন (যেমন Importance of Reading Books)...',
    },
    examples: [
      'Importance of Reading Books',
      'Tree Plantation',
      'A Rainy Day',
      'Early Rising',
    ],
  },
  dialogue: {
    id: 'dialogue',
    title: { en: 'Dialogue Writer', bn: 'Dialogue Writer · সংলাপ রচনা' },
    shortTitle: { en: 'Dialogue', bn: 'Dialogue · সংলাপ' },
    subtitle: {
      en: 'Generate natural, well-paced conversations between custom speakers.',
      bn: 'দুইজন বক্তার মধ্যে স্বাভাবিক ও প্রাঞ্জল ইংরেজি সংলাপ তৈরি করুন।',
    },
    placeholder: {
      en: 'Enter a dialogue topic (e.g. Importance of Learning English)...',
      bn: 'সংলাপের বিষয় লিখুন (যেমন Importance of Learning English)...',
    },
    examples: [
      'Importance of Learning English',
      'Benefits of Morning Walk',
      'Preparing for the Final Exam',
      'Uses and Abuses of Mobile Phones',
    ],
  },
  composition: {
    id: 'composition',
    title: { en: 'Composition Writer', bn: 'Composition Writer · রচনা লিখন' },
    shortTitle: { en: 'Composition', bn: 'Composition · রচনা' },
    subtitle: {
      en: 'Create structured multi-paragraph essays with Introduction, Body, and Conclusion.',
      bn: 'ভূমিকা, মূল অংশ ও উপসংহারসহ পূর্ণাঙ্গ ইংরেজি রচনা তৈরি করুন।',
    },
    placeholder: {
      en: 'Enter a composition topic (e.g. Science in Everyday Life)...',
      bn: 'রচনার বিষয় লিখুন (যেমন Science in Everyday Life)...',
    },
    examples: [
      'Science in Everyday Life',
      'Duties of a Student',
      'Digital Bangladesh & Smart Future',
      'Value of Time',
    ],
  },
};

export function pickText(text: { en: string; bn: string }, lang: LanguageMode): string {
  return lang === 'bn' ? `${text.en} · ${text.bn}` : text.en;
}

export const UI_COPY = {
  tryExample: { en: 'Try an Example', bn: 'উদাহরণ দেখুন' },
  autoSolve: { en: 'Auto-Solve', bn: 'স্বয়ংক্রিয় সমাধান' },
  rubber: { en: 'Rubber', bn: 'মুছুন (Rubber)' },
  solveNow: { en: 'Transform Now', bn: 'রূপান্তর করুন' },
  enhanceAi: { en: 'Refine with AI', bn: 'AI দিয়ে উন্নত করুন' },
  copy: { en: 'Copy', bn: 'কপি' },
  copied: { en: 'Copied!', bn: 'কপি হয়েছে!' },
  listen: { en: 'Listen', bn: 'শুনুন' },
  stopListening: { en: 'Stop', bn: 'থামুন' },
  saveHistory: { en: 'Save', bn: 'সংরক্ষণ' },
  saved: { en: 'Saved', bn: 'সংরক্ষিত' },
  downloadPdf: { en: 'Download PDF', bn: 'PDF ডাউনলোড' },
  pdfSaved: { en: 'PDF Saved!', bn: 'PDF সংরক্ষিত!' },
  history: { en: 'History', bn: 'ইতিহাস' },
  wipeAll: { en: 'Wipe All with Rubber', bn: 'সব মুছে ফেলুন' },
  emptyPrompt: {
    en: 'Type a sentence or pick an example pill above to see an instant transformation.',
    bn: 'তাৎক্ষণিক সমাধান দেখতে উপরে একটি বাক্য লিখুন বা উদাহরণ বেছে নিন।',
  },
};
