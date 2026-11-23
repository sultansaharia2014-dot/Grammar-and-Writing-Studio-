import { TenseSentenceRow, VerbForms, VerbResult } from '../types/studio';

const IRREGULAR_VERBS: Record<string, [string, string, string]> = {
  be: ['be', 'was / were', 'been'],
  am: ['be', 'was / were', 'been'],
  is: ['be', 'was / were', 'been'],
  are: ['be', 'was / were', 'been'],
  was: ['be', 'was / were', 'been'],
  were: ['be', 'was / were', 'been'],
  write: ['write', 'wrote', 'written'],
  wrote: ['write', 'wrote', 'written'],
  written: ['write', 'wrote', 'written'],
  go: ['go', 'went', 'gone'],
  went: ['go', 'went', 'gone'],
  gone: ['go', 'went', 'gone'],
  do: ['do', 'did', 'done'],
  did: ['do', 'did', 'done'],
  done: ['do', 'did', 'done'],
  have: ['have', 'had', 'had'],
  has: ['have', 'had', 'had'],
  had: ['have', 'had', 'had'],
  speak: ['speak', 'spoke', 'spoken'],
  spoke: ['speak', 'spoke', 'spoken'],
  spoken: ['speak', 'spoke', 'spoken'],
  fly: ['fly', 'flew', 'flown'],
  flew: ['fly', 'flew', 'flown'],
  flown: ['fly', 'flew', 'flown'],
  eat: ['eat', 'ate', 'eaten'],
  ate: ['eat', 'ate', 'eaten'],
  eaten: ['eat', 'ate', 'eaten'],
  take: ['take', 'took', 'taken'],
  took: ['take', 'took', 'taken'],
  taken: ['take', 'took', 'taken'],
  give: ['give', 'gave', 'given'],
  gave: ['give', 'gave', 'given'],
  given: ['give', 'gave', 'given'],
  see: ['see', 'saw', 'seen'],
  saw: ['see', 'saw', 'seen'],
  seen: ['see', 'saw', 'seen'],
  come: ['come', 'came', 'come'],
  came: ['come', 'came', 'come'],
  make: ['make', 'made', 'made'],
  made: ['make', 'made', 'made'],
  know: ['know', 'knew', 'known'],
  knew: ['know', 'knew', 'known'],
  known: ['know', 'knew', 'known'],
  run: ['run', 'ran', 'run'],
  ran: ['run', 'ran', 'run'],
  read: ['read', 'read', 'read'],
  break: ['break', 'broke', 'broken'],
  broke: ['break', 'broke', 'broken'],
  broken: ['break', 'broke', 'broken'],
  buy: ['buy', 'bought', 'bought'],
  bought: ['buy', 'bought', 'bought'],
  teach: ['teach', 'taught', 'taught'],
  taught: ['teach', 'taught', 'taught'],
  think: ['think', 'thought', 'thought'],
  thought: ['think', 'thought', 'thought'],
  sing: ['sing', 'sang', 'sung'],
  sang: ['sing', 'sang', 'sung'],
  sung: ['sing', 'sang', 'sung'],
  swim: ['swim', 'swam', 'swum'],
  swam: ['swim', 'swam', 'swum'],
  swum: ['swim', 'swam', 'swum'],
  begin: ['begin', 'began', 'begun'],
  began: ['begin', 'began', 'begun'],
  begun: ['begin', 'began', 'begun'],
  drink: ['drink', 'drank', 'drunk'],
  drank: ['drink', 'drank', 'drunk'],
  drunk: ['drink', 'drank', 'drunk'],
  draw: ['draw', 'drew', 'drawn'],
  drew: ['draw', 'drew', 'drawn'],
  drawn: ['draw', 'drew', 'drawn'],
  drive: ['drive', 'drove', 'driven'],
  drove: ['drive', 'drove', 'driven'],
  driven: ['drive', 'drove', 'driven'],
  bring: ['bring', 'brought', 'brought'],
  brought: ['bring', 'brought', 'brought'],
  catch: ['catch', 'caught', 'caught'],
  caught: ['catch', 'caught', 'caught'],
  feel: ['feel', 'felt', 'felt'],
  felt: ['feel', 'felt', 'felt'],
  find: ['find', 'found', 'found'],
  found: ['find', 'found', 'found'],
  keep: ['keep', 'kept', 'kept'],
  kept: ['keep', 'kept', 'kept'],
  leave: ['leave', 'left', 'left'],
  left: ['leave', 'left', 'left'],
  meet: ['meet', 'met', 'met'],
  met: ['meet', 'met', 'met'],
  send: ['send', 'sent', 'sent'],
  sent: ['send', 'sent', 'sent'],
  sit: ['sit', 'sat', 'sat'],
  sat: ['sit', 'sat', 'sat'],
  sleep: ['sleep', 'slept', 'slept'],
  slept: ['sleep', 'slept', 'slept'],
  stand: ['stand', 'stood', 'stood'],
  stood: ['stand', 'stood', 'stood'],
  win: ['win', 'won', 'won'],
  won: ['win', 'won', 'won'],
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'i', 'we', 'you', 'he', 'she', 'they', 'it', 'this', 'that',
  'these', 'those', 'my', 'your', 'his', 'her', 'our', 'their', 'in', 'on', 'at',
  'by', 'for', 'with', 'from', 'to', 'of', 'across', 'over', 'under', 'and', 'but',
  'or', 'always', 'never', 'quickly', 'softly', 'birds', 'student', 'students',
  'book', 'books', 'sky', 'golden', 'letter', 'school',
]);

function makeVing(v1: string): string {
  if (v1 === 'be') return 'being';
  if (v1 === 'have') return 'having';
  if (v1.endsWith('ie')) return `${v1.slice(0, -2)}ying`;
  if (v1.endsWith('e') && !/(ee|ye|oe)$/.test(v1)) return `${v1.slice(0, -1)}ing`;
  if (/^[a-z]*[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvz]$/.test(v1) && v1.length <= 4 && !/[wxy]$/.test(v1)) {
    return `${v1}${v1.slice(-1)}ing`;
  }
  return `${v1}ing`;
}

function makeVs(v1: string): string {
  if (v1 === 'be') return 'is';
  if (v1 === 'have') return 'has';
  if (v1 === 'do') return 'does';
  if (v1 === 'go') return 'goes';
  if (/(s|sh|ch|x|z|o)$/.test(v1)) return `${v1}es`;
  if (v1.endsWith('y') && !/[aeiou]y$/.test(v1)) return `${v1.slice(0, -1)}ies`;
  return `${v1}s`;
}

function normalizeToBaseVerb(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 'write';
  if (IRREGULAR_VERBS[clean]) return IRREGULAR_VERBS[clean][0];
  if (clean.endsWith('ies') && clean.length > 4) return `${clean.slice(0, -3)}y`;
  if (clean.endsWith('ied') && clean.length > 4) return `${clean.slice(0, -3)}y`;
  if (clean.endsWith('ing') && clean.length > 5) {
    const stem = clean.slice(0, -3);
    if (IRREGULAR_VERBS[stem]) return stem;
    if (IRREGULAR_VERBS[`${stem}e`]) return `${stem}e`;
    return stem;
  }
  if (clean.endsWith('ed') && clean.length > 4) {
    const stem = clean.slice(0, -2);
    if (IRREGULAR_VERBS[`${stem}e`]) return `${stem}e`;
    return stem;
  }
  if (clean.endsWith('es') && clean.length > 4 && /(sh|ch|x|z|s)es$/.test(clean)) {
    return clean.slice(0, -2);
  }
  if (clean.endsWith('s') && clean.length > 3 && !clean.endsWith('ss')) {
    return clean.slice(0, -1);
  }
  return clean;
}

export function conjugateVerb(rawVerb: string): VerbForms {
  const base = normalizeToBaseVerb(rawVerb);
  const irregular = IRREGULAR_VERBS[base];
  if (irregular) {
    const [v1, v2, v3] = irregular;
    return {
      v1,
      v2,
      v3,
      ving: makeVing(v1),
      vs: makeVs(v1),
      isIrregular: true,
    };
  }

  let past = `${base}ed`;
  if (base.endsWith('e')) past = `${base}d`;
  else if (base.endsWith('y') && !/[aeiou]y$/.test(base)) past = `${base.slice(0, -1)}ied`;
  else if (/^[a-z]*[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvz]$/.test(base) && base.length <= 4) {
    past = `${base}${base.slice(-1)}ed`;
  }

  return {
    v1: base,
    v2: past,
    v3: past,
    ving: makeVing(base),
    vs: makeVs(base),
    isIrregular: false,
  };
}

function extractVerbFromInput(input: string): string {
  const words = input
    .trim()
    .split(/\s+/)
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))
    .filter(Boolean);

  if (words.length <= 1) return words[0] || 'write';

  // Prefer known irregular verb in sentence (excluding auxiliary "be" if another main verb exists)
  const mainIrregular = words.find((w) => IRREGULAR_VERBS[w] && !['be', 'am', 'is', 'are', 'was', 'were'].includes(w));
  if (mainIrregular) return mainIrregular;

  const contentCandidate = words.find((w, idx) => idx > 0 && !STOP_WORDS.has(w) && w.length >= 2);
  return contentCandidate || words[0];
}

export function solveVerbChanging(input: string): VerbResult {
  const startMs = performance.now();
  const trimmed = input.trim();
  const extractedVerb = extractVerbFromInput(trimmed);
  const forms = conjugateVerb(extractedVerb);

  const v2Single = forms.v2.includes('/') ? 'was' : forms.v2;
  const v1Pres = forms.v1 === 'be' ? 'am / are' : forms.v1;
  const v1Be = forms.v1 === 'be' ? 'be' : forms.v1;

  const matrix: TenseSentenceRow[] = [
    {
      tense: { en: 'Present Indefinite', bn: 'সাধারণ বর্তমান' },
      formula: 'Subject + V1 / V-s',
      example: `She ${forms.vs} with clarity every day.`,
    },
    {
      tense: { en: 'Present Continuous', bn: 'চলমান বর্তমান' },
      formula: 'Subject + am/is/are + V-ing',
      example: `They are ${forms.ving} right now.`,
    },
    {
      tense: { en: 'Present Perfect', bn: 'পুরাঘটিত বর্তমান' },
      formula: 'Subject + has/have + V3',
      example: `He has ${forms.v3} already.`,
    },
    {
      tense: { en: 'Present Perfect Continuous', bn: 'পুরাঘটিত চলমান বর্তমান' },
      formula: 'Subject + has/have been + V-ing',
      example: `We have been ${forms.ving} for an hour.`,
    },
    {
      tense: { en: 'Past Indefinite', bn: 'সাধারণ অতীত' },
      formula: 'Subject + V2',
      example: `She ${v2Single} yesterday evening.`,
    },
    {
      tense: { en: 'Past Continuous', bn: 'চলমান অতীত' },
      formula: 'Subject + was/were + V-ing',
      example: `I was ${forms.ving} when you called.`,
    },
    {
      tense: { en: 'Past Perfect', bn: 'পুরাঘটিত অতীত' },
      formula: 'Subject + had + V3',
      example: `They had ${forms.v3} before noon.`,
    },
    {
      tense: { en: 'Future Indefinite', bn: 'সাধারণ ভবিষ্যৎ' },
      formula: 'Subject + will + V1',
      example: `You will ${v1Be} tomorrow.`,
    },
    {
      tense: { en: 'Future Continuous', bn: 'চলমান ভবিষ্যৎ' },
      formula: 'Subject + will be + V-ing',
      example: `She will be ${forms.ving} soon.`,
    },
    {
      tense: { en: 'Future Perfect', bn: 'পুরাঘটিত ভবিষ্যৎ' },
      formula: 'Subject + will have + V3',
      example: `We will have ${forms.v3} by Friday.`,
    },
  ];

  // Ensure v1Pres is referenced cleanly if needed
  void v1Pres;

  return {
    input: trimmed,
    extractedVerb: forms.v1,
    forms,
    matrix,
    elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
  };
}
