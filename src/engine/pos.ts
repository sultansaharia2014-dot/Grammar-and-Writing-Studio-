import { BilingualText, PosCategory, PosResult, PosToken } from '../types/studio';

const POS_BN: Record<PosCategory, string> = {
  Noun: 'বিশেষ্য (Noun)',
  Pronoun: 'সর্বনাম (Pronoun)',
  Verb: 'ক্রিয়া (Verb)',
  Adjective: 'বিশেষণ (Adjective)',
  Adverb: 'ক্রিয়া-বিশেষণ (Adverb)',
  Preposition: 'পদান্বয়ী অব্যয় (Preposition)',
  Conjunction: 'সংযোজক অব্যয় (Conjunction)',
  Interjection: 'আবেগসূচক অব্যয় (Interjection)',
  Determiner: 'নির্দেশক (Determiner)',
};

const POS_DEFINITIONS: Record<PosCategory, BilingualText> = {
  Noun: {
    en: 'Names a person, place, thing, quality, or abstract concept.',
    bn: 'কোনো ব্যক্তি, বস্তু, স্থান, গুণ বা ধারণার নাম বোঝায়।',
  },
  Pronoun: {
    en: 'Stands in place of a noun to avoid repetition.',
    bn: 'বিশেষ্যের পরিবর্তে ব্যবহৃত শব্দ।',
  },
  Verb: {
    en: 'Expresses an action, occurrence, or state of being.',
    bn: 'কোনো কাজ করা, ঘটা বা অবস্থা বোঝায়।',
  },
  Adjective: {
    en: 'Describes or modifies a noun or pronoun.',
    bn: 'বিশেষ্য বা সর্বনামের দোষ, গুণ, অবস্থা বা সংখ্যা বোঝায়।',
  },
  Adverb: {
    en: 'Modifies a verb, adjective, or another adverb (how, when, where).',
    bn: 'ক্রিয়া, বিশেষণ বা অন্য ক্রিয়া-বিশেষণকে বিশেষিত করে।',
  },
  Preposition: {
    en: 'Shows spatial, temporal, or logical relationship before a noun phrase.',
    bn: 'বিশেষ্যের পূর্বে বসে বাক্যের অন্যান্য শব্দের সাথে সম্পর্ক স্থাপন করে।',
  },
  Conjunction: {
    en: 'Connects words, phrases, or clauses together.',
    bn: 'দুটি শব্দ, বাক্যাংশ বা বাক্যকে যুক্ত করে।',
  },
  Interjection: {
    en: 'Expresses sudden emotion, surprise, or exclamation.',
    bn: 'হঠাৎ আনন্দ, দুঃখ, বিস্ময় বা আবেগ প্রকাশ করে।',
  },
  Determiner: {
    en: 'Introduces and specifies a noun (articles, demonstratives, quantifiers).',
    bn: 'বিশেষ্যের আগে বসে সেটিকে নির্দিষ্ট বা অনির্দিষ্ট করে।',
  },
};

const DETERMINERS = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'every', 'each', 'some', 'any',
  'many', 'much', 'few', 'little', 'several', 'all', 'both', 'no', 'my', 'your', 'his',
  'her', 'its', 'our', 'their',
]);

const PRONOUNS = new Set([
  'i', 'me', 'we', 'us', 'you', 'he', 'him', 'she', 'her', 'it', 'they', 'them',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
  'who', 'whom', 'whose', 'which', 'what', 'someone', 'anyone', 'everyone', 'nobody',
]);

const PREPOSITIONS = new Set([
  'in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'over', 'under', 'above',
  'below', 'across', 'through', 'between', 'among', 'into', 'onto', 'upon', 'around',
  'about', 'against', 'during', 'before', 'after', 'since', 'until', 'without', 'within',
]);

const CONJUNCTIONS = new Set([
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'because', 'although', 'though',
  'while', 'whereas', 'unless', 'if', 'whether', 'since', 'until', 'as',
]);

const INTERJECTIONS = new Set([
  'wow', 'oh', 'ah', 'alas', 'hurrah', 'bravo', 'ouch', 'hey', 'hi', 'hello', 'oops', 'phew',
]);

const ADVERBS = new Set([
  'always', 'never', 'often', 'sometimes', 'usually', 'seldom', 'rarely', 'already',
  'soon', 'now', 'then', 'here', 'there', 'today', 'yesterday', 'tomorrow', 'very',
  'quite', 'too', 'almost', 'just', 'well', 'fast', 'hard', 'really', 'only', 'also',
]);

const ADJECTIVES = new Set([
  'good', 'best', 'better', 'bad', 'worst', 'clever', 'lazy', 'quick', 'beautiful',
  'neat', 'happy', 'sad', 'big', 'small', 'large', 'tall', 'short', 'long', 'young',
  'old', 'new', 'bright', 'dark', 'warm', 'cold', 'honest', 'kind', 'wise', 'strong',
  'weak', 'golden', 'natural', 'hardworking', 'remarkable', 'careful', 'silent', 'loud',
  'important', 'sweet', 'great', 'red', 'blue', 'green', 'white', 'black',
]);

const VERBS = new Set([
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may',
  'might', 'must', 'jump', 'jumped', 'jumps', 'run', 'ran', 'runs', 'speak', 'speaks',
  'spoke', 'write', 'writes', 'wrote', 'read', 'reads', 'go', 'goes', 'went', 'come',
  'came', 'comes', 'see', 'saw', 'make', 'made', 'take', 'took', 'give', 'gave',
  'achieve', 'achieved', 'fly', 'flies', 'flew', 'love', 'loves', 'loved', 'help',
  'helps', 'helped', 'study', 'studies', 'studied', 'work', 'works', 'worked',
  'play', 'plays', 'played', 'plant', 'planting', 'protect', 'protects', 'learn',
  'learns', 'learned', 'shine', 'shines', 'moves', 'move', 'eat', 'ate', 'drink',
]);

function inferPos(clean: string, index: number, cleans: string[]): PosCategory {
  const prev = index > 0 ? cleans[index - 1] : '';
  const next = index < cleans.length - 1 ? cleans[index + 1] : '';

  if (INTERJECTIONS.has(clean)) return 'Interjection';
  if (CONJUNCTIONS.has(clean)) return 'Conjunction';
  if (PREPOSITIONS.has(clean)) return 'Preposition';

  // "her" can be Pronoun (object) or Determiner (possessive before noun)
  if (clean === 'her' && next && !PREPOSITIONS.has(next) && !CONJUNCTIONS.has(next)) {
    return 'Determiner';
  }
  if (DETERMINERS.has(clean)) return 'Determiner';
  if (PRONOUNS.has(clean)) return 'Pronoun';
  if (ADVERBS.has(clean)) return 'Adverb';
  if (VERBS.has(clean)) return 'Verb';
  if (ADJECTIVES.has(clean)) return 'Adjective';

  // Morphological suffix heuristics
  if (clean.endsWith('ly') && clean.length > 4) return 'Adverb';
  if (/(tion|sion|ment|ness|ity|ship|hood|ism|ist|ance|ence)$/.test(clean)) return 'Noun';
  if (/(ous|ful|less|able|ible|ive|ic|al|ish)$/.test(clean)) return 'Adjective';

  if (/(ed|ing)$/.test(clean)) {
    // If preceded by determiner and followed by noun, act as Adjective
    if (DETERMINERS.has(prev) && next && !PREPOSITIONS.has(next) && !CONJUNCTIONS.has(next)) {
      return 'Adjective';
    }
    return 'Verb';
  }

  // Contextual rule: after determiner/preposition/adjective -> likely Noun
  if (DETERMINERS.has(prev) || PREPOSITIONS.has(prev) || ADJECTIVES.has(prev)) {
    // Unless followed by a noun and looks adjective-like, check next
    if (next && !PREPOSITIONS.has(next) && !CONJUNCTIONS.has(next) && !VERBS.has(next) && DETERMINERS.has(prev)) {
      // e.g. "the clever fox" -> clever is Adj, fox is Noun
      if (index + 1 < cleans.length && !ADVERBS.has(next)) {
        return ADJECTIVES.has(clean) ? 'Adjective' : 'Noun';
      }
    }
    return 'Noun';
  }

  if (PRONOUNS.has(prev) && !clean.endsWith('ness')) {
    return 'Verb';
  }

  return 'Noun';
}

function describeRole(pos: PosCategory, word: string, index: number, total: number): BilingualText {
  switch (pos) {
    case 'Noun':
      return index === 0 || index <= 2
        ? { en: `"${word}" acts as a subject or key entity.`, bn: `"${word}" বাক্যে কর্তা বা প্রধান নামপদ হিসেবে কাজ করছে।` }
        : { en: `"${word}" serves as an object or complement noun.`, bn: `"${word}" বাক্যে কর্ম বা পরিপূরক বিশেষ্য হিসেবে ব্যবহৃত হয়েছে।` };
    case 'Pronoun':
      return { en: `"${word}" stands in for a noun participant.`, bn: `"${word}" বিশেষ্যের পরিবর্তে ব্যবহৃত সর্বনাম।` };
    case 'Verb':
      return { en: `"${word}" carries the action or state of the clause.`, bn: `"${word}" বাক্যের মূল কাজ বা অবস্থা প্রকাশ করছে।` };
    case 'Adjective':
      return { en: `"${word}" modifies and adds quality to a nearby noun.`, bn: `"${word}" নিকটবর্তী বিশেষ্যের গুণ বা বৈশিষ্ট্য প্রকাশ করছে।` };
    case 'Adverb':
      return { en: `"${word}" modifies how, when, or to what degree an action happens.`, bn: `"${word}" ক্রিয়া বা বিশেষণের ধরন, সময় বা মাত্রা নির্দেশ করছে।` };
    case 'Preposition':
      return { en: `"${word}" links the following noun phrase to the rest of the sentence.`, bn: `"${word}" পরবর্তী বিশেষ্যাংশের সাথে বাক্যের সম্পর্ক তৈরি করছে।` };
    case 'Conjunction':
      return { en: `"${word}" bridges ideas or clauses smoothly.`, bn: `"${word}" শব্দ বা বাক্যাংশকে সংযুক্ত করছে।` };
    case 'Interjection':
      return { en: `"${word}" expresses immediate emotion at the start.`, bn: `"${word}" বাক্যের শুরুতে আকস্মিক আবেগ প্রকাশ করছে।` };
    case 'Determiner':
      return index < total - 1
        ? { en: `"${word}" introduces and specifies the noun that follows.`, bn: `"${word}" পরবর্তী বিশেষ্যকে নির্দিষ্ট বা নির্দেশ করছে।` }
        : { en: `"${word}" acts as a determiner.`, bn: `"${word}" একটি নির্দেশক পদ।` };
  }
}

export function solvePartsOfSpeech(input: string): PosResult {
  const startMs = performance.now();
  const trimmed = input.trim();
  const rawWords = trimmed.split(/\s+/).filter(Boolean);
  const cleans = rawWords.map((w) => w.toLowerCase().replace(/[^a-z']/g, ''));

  const counts: Record<PosCategory, number> = {
    Noun: 0,
    Pronoun: 0,
    Verb: 0,
    Adjective: 0,
    Adverb: 0,
    Preposition: 0,
    Conjunction: 0,
    Interjection: 0,
    Determiner: 0,
  };

  const tokens: PosToken[] = rawWords.map((word, idx) => {
    const clean = cleans[idx] || word.toLowerCase();
    const pos = inferPos(clean, idx, cleans);
    counts[pos] += 1;
    return {
      id: `${idx}-${clean}`,
      word,
      cleanWord: clean,
      pos,
      posBn: POS_BN[pos],
      definition: POS_DEFINITIONS[pos],
      roleInSentence: describeRole(pos, word.replace(/[.,!?;:]+$/, ''), idx, rawWords.length),
    };
  });

  return {
    input: trimmed,
    tokens,
    counts,
    elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
  };
}
