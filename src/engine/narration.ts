import { NarrationResult, TransformationStep } from '../types/studio';

const TIME_PLACE_MAP: Array<[RegExp, string, string, string]> = [
  [/\btomorrow\b/gi, 'the next day', 'tomorrow', 'the next day'],
  [/\byesterday\b/gi, 'the previous day', 'yesterday', 'the previous day'],
  [/\btonight\b/gi, 'that night', 'tonight', 'that night'],
  [/\btoday\b/gi, 'that day', 'today', 'that day'],
  [/\bnow\b/gi, 'then', 'now', 'then'],
  [/\bhere\b/gi, 'there', 'here', 'there'],
  [/\bthis\b/gi, 'that', 'this', 'that'],
  [/\bthese\b/gi, 'those', 'these', 'those'],
  [/\bago\b/gi, 'before', 'ago', 'before'],
  [/\bnext week\b/gi, 'the following week', 'next week', 'the following week'],
  [/\blast night\b/gi, 'the previous night', 'last night', 'the previous night'],
];

const REVERSE_TIME_PLACE_MAP: Array<[RegExp, string, string, string]> = [
  [/\bthe next day\b|\bthe following day\b/gi, 'tomorrow', 'the next day', 'tomorrow'],
  [/\bthe previous day\b|\bthe day before\b/gi, 'yesterday', 'the previous day', 'yesterday'],
  [/\bthat night\b/gi, 'tonight', 'that night', 'tonight'],
  [/\bthat day\b/gi, 'today', 'that day', 'today'],
  [/\bthen\b/gi, 'now', 'then', 'now'],
  [/\bthere\b/gi, 'here', 'there', 'here'],
  [/\bthe following week\b/gi, 'next week', 'the following week', 'next week'],
  [/\bthe previous night\b/gi, 'last night', 'the previous night', 'last night'],
];

const UNIVERSAL_TRUTHS = [
  'earth moves round the sun',
  'earth revolves around the sun',
  'sun rises in the east',
  'sun sets in the west',
  'honesty is the best policy',
  'two and two make four',
  'water boils at',
  'man is mortal',
  'time and tide wait for none',
  'milk is white',
  'ice floats on water',
  'stars shine at night',
  'birds fly in the sky',
];

const IRREGULAR_PAST_TO_BASE: Record<string, string> = {
  was: 'am/is',
  were: 'are',
  had: 'have',
  did: 'do',
  went: 'go',
  came: 'come',
  saw: 'see',
  wrote: 'write',
  read: 'read',
  took: 'take',
  made: 'make',
  gave: 'give',
  told: 'tell',
  said: 'say',
  ate: 'eat',
  drank: 'drink',
  spoke: 'speak',
  broke: 'break',
  bought: 'buy',
  brought: 'bring',
  caught: 'catch',
  taught: 'teach',
  thought: 'think',
  found: 'find',
  knew: 'know',
  felt: 'feel',
  kept: 'keep',
  left: 'leave',
  met: 'meet',
  ran: 'run',
  sat: 'sit',
  stood: 'stand',
  understood: 'understand',
  won: 'win',
  lost: 'lose',
  sent: 'send',
  built: 'build',
  slept: 'sleep',
  finished: 'finish',
  worked: 'work',
  played: 'play',
  studied: 'study',
  visited: 'visit',
  helped: 'help',
  opened: 'open',
  closed: 'close',
};

const BASE_TO_PAST: Record<string, string> = {
  am: 'was',
  is: 'was',
  are: 'were',
  have: 'had',
  has: 'had',
  do: 'did',
  does: 'did',
  can: 'could',
  will: 'would',
  shall: 'should',
  may: 'might',
  go: 'went',
  goes: 'went',
  come: 'came',
  comes: 'came',
  see: 'saw',
  sees: 'saw',
  write: 'wrote',
  writes: 'wrote',
  take: 'took',
  takes: 'took',
  make: 'made',
  makes: 'made',
  give: 'gave',
  gives: 'gave',
  eat: 'ate',
  eats: 'ate',
  speak: 'spoke',
  speaks: 'spoke',
  know: 'knew',
  knows: 'knew',
  read: 'read',
  reads: 'read',
  buy: 'bought',
  buys: 'bought',
  teach: 'taught',
  teaches: 'taught',
  think: 'thought',
  thinks: 'thought',
  feel: 'felt',
  feels: 'felt',
  live: 'lived',
  lives: 'lived',
  love: 'loved',
  loves: 'loved',
  like: 'liked',
  likes: 'liked',
  want: 'wanted',
  wants: 'wanted',
  need: 'needed',
  needs: 'needed',
  work: 'worked',
  works: 'worked',
  play: 'played',
  plays: 'played',
  study: 'studied',
  studies: 'studied',
  finish: 'finished',
  finishes: 'finished',
  move: 'moved',
  moves: 'moved',
  run: 'ran',
  runs: 'ran',
};

interface GenderGuess {
  subj: string;
  obj: string;
  poss: string;
}

const FEMALE_NAMES = new Set([
  'she', 'her', 'mother', 'mom', 'sister', 'aunt', 'queen', 'girl', 'woman', 'lady',
  'mina', 'rina', 'tina', 'sara', 'sarah', 'ayesha', 'fatima', 'nadia', 'farhana',
  'nusrat', 'sumaiya', 'mary', 'anna', 'emma', 'sophia', 'tasnim', 'maliha',
]);

const PLURAL_NAMES = new Set([
  'they', 'them', 'students', 'boys', 'girls', 'teachers', 'friends', 'people', 'children', 'we',
]);

function guessGender(name: string): GenderGuess {
  const lower = name.toLowerCase().replace(/[^a-z]/g, '');
  if (PLURAL_NAMES.has(lower)) {
    return { subj: 'they', obj: 'them', poss: 'their' };
  }
  if (FEMALE_NAMES.has(lower)) {
    return { subj: 'she', obj: 'her', poss: 'her' };
  }
  return { subj: 'he', obj: 'him', poss: 'his' };
}

function getListenerPronoun(listener: string): GenderGuess {
  const lower = listener.toLowerCase().trim();
  if (lower === 'me') return { subj: 'I', obj: 'me', poss: 'my' };
  if (lower === 'us') return { subj: 'we', obj: 'us', poss: 'our' };
  if (lower === 'you') return { subj: 'you', obj: 'you', poss: 'your' };
  if (lower === 'him') return { subj: 'he', obj: 'him', poss: 'his' };
  if (lower === 'her') return { subj: 'she', obj: 'her', poss: 'her' };
  if (lower === 'them' || lower.includes('students') || lower.includes('friends')) {
    return { subj: 'they', obj: 'them', poss: 'their' };
  }
  return guessGender(listener.replace(/^the\s+/i, ''));
}

function getSpeakerPronoun(speaker: string): GenderGuess {
  const lower = speaker.toLowerCase().trim();
  if (lower === 'i') return { subj: 'I', obj: 'me', poss: 'my' };
  if (lower === 'we') return { subj: 'we', obj: 'us', poss: 'our' };
  if (lower === 'you') return { subj: 'you', obj: 'you', poss: 'your' };
  if (lower === 'she') return { subj: 'she', obj: 'her', poss: 'her' };
  if (lower === 'they') return { subj: 'they', obj: 'them', poss: 'their' };
  return guessGender(speaker.replace(/^the\s+/i, ''));
}

function shiftPronounsDirectToIndirect(
  clause: string,
  speaker: string,
  listener: string | null,
): { text: string; changes: Array<[string, string]> } {
  const sp = getSpeakerPronoun(speaker);
  const li = listener ? getListenerPronoun(listener) : { subj: 'I', obj: 'me', poss: 'my' };
  const changes: Array<[string, string]> = [];

  const tokens = clause.split(/(\b[A-Za-z']+\b)/);
  const out = tokens.map((tok) => {
    const low = tok.toLowerCase();
    let rep: string | null = null;
    if (low === 'i') rep = sp.subj;
    else if (low === 'me') rep = sp.obj;
    else if (low === 'my') rep = sp.poss;
    else if (low === 'mine') rep = sp.poss === 'her' ? 'hers' : sp.poss === 'their' ? 'theirs' : 'his';
    else if (low === 'we') rep = 'they';
    else if (low === 'us') rep = 'them';
    else if (low === 'our') rep = 'their';
    else if (low === 'you') {
      // Heuristic: if preceded by verb/preposition, use obj else subj; handled nicely below
      rep = li.subj;
    } else if (low === 'your') rep = li.poss;

    if (rep && rep.toLowerCase() !== low) {
      changes.push([tok, rep]);
      return tok[0] === tok[0].toUpperCase() && tok.length > 1
        ? rep[0].toUpperCase() + rep.slice(1)
        : rep;
    }
    return tok;
  });

  return { text: out.join(''), changes };
}

function backshiftVerb(clause: string, isPastReporting: boolean): { text: string; change: [string, string] | null } {
  if (!isPastReporting) return { text: clause, change: null };

  // Check universal truth
  const lowerClause = clause.toLowerCase();
  if (UNIVERSAL_TRUTHS.some((truth) => lowerClause.includes(truth))) {
    return { text: clause, change: null };
  }

  // Handle "Subject + am/is/are + ..." and modals and simple verbs
  const patterns: Array<[RegExp, (m: string, subj: string, v: string) => string]> = [
    [/\b(I|he|she|it|there|this|that|[A-Z][a-z]+)\s+(am|is)\b/i, (_m, s, _v) => `${s} was`],
    [/\b(we|they|you|these|those)\s+(are)\b/i, (_m, s) => `${s} were`],
    [/\b(I|we|they|you)\s+(have)\b/i, (_m, s) => `${s} had`],
    [/\b(he|she|it|[A-Z][a-z]+)\s+(has)\b/i, (_m, s) => `${s} had`],
    [/\b(will)\b/i, () => 'would'],
    [/\b(shall)\b/i, () => 'should'],
    [/\b(can)\b/i, () => 'could'],
    [/\b(may)\b/i, () => 'might'],
    [/\b(must)\b/i, () => 'had to'],
    [/\b(do not|don't)\b/i, () => 'did not'],
    [/\b(does not|doesn't)\b/i, () => 'did not'],
    [/\b(did not|didn't)\s+([a-z]+)\b/i, (_m, _d, v) => `had not ${toPastParticipleSimple(v)}`],
    [/\b(was|were)\s+([a-z]+ing)\b/i, (_m, _w, v) => `had been ${v}`],
    [/\b(has|have)\s+([a-z]+)\b/i, (_m, _h, v) => `had ${v}`],
  ];

  for (const [regex, replacer] of patterns) {
    const match = clause.match(regex);
    if (match) {
      const updated = clause.replace(regex, replacer as (...args: string[]) => string);
      if (updated !== clause) {
        const beforeVerb = match[2] || match[1] || match[0];
        const afterVerb =
          updated.match(/\b(was|were|had been [a-z]+ing|had to|had not [a-z]+|had|would|should|could|might|did not)\b/)?.[0] ||
          'shifted';
        return { text: updated, change: [beforeVerb, afterVerb] };
      }
    }
  }

  // Try standalone am/is/are if pronoun got replaced
  const auxStandalone = clause.match(/\b(am|is|are|have|has)\b/i);
  if (auxStandalone) {
    const v = auxStandalone[1].toLowerCase();
    const mapped = v === 'am' || v === 'is' ? 'was' : v === 'are' ? 'were' : 'had';
    const updated = clause.replace(/\b(am|is|are|have|has)\b/i, mapped);
    return { text: updated, change: [auxStandalone[1], mapped] };
  }

  // Try simple present/past finite verb after subject
  const words = clause.split(/\s+/);
  for (let i = 1; i < Math.min(words.length, 4); i++) {
    const clean = words[i].toLowerCase().replace(/[^a-z]/g, '');
    if (BASE_TO_PAST[clean]) {
      const punct = words[i].slice(clean.length);
      const before = words[i];
      words[i] = BASE_TO_PAST[clean] + punct;
      return { text: words.join(' '), change: [before, words[i]] };
    }
  }

  return { text: clause, change: null };
}

function toPastParticipleSimple(base: string): string {
  const map: Record<string, string> = {
    go: 'gone',
    do: 'done',
    write: 'written',
    see: 'seen',
    eat: 'eaten',
    take: 'taken',
    give: 'given',
    come: 'come',
    speak: 'spoken',
    break: 'broken',
    know: 'known',
  };
  return map[base.toLowerCase()] || (base.endsWith('e') ? `${base}d` : `${base}ed`);
}

function shiftTimePlace(
  clause: string,
  map: Array<[RegExp, string, string, string]>,
): { text: string; changes: Array<[string, string]> } {
  let text = clause;
  const changes: Array<[string, string]> = [];
  for (const [rx, replacement, beforeLabel, afterLabel] of map) {
    if (rx.test(text)) {
      text = text.replace(rx, replacement);
      changes.push([beforeLabel, afterLabel]);
    }
  }
  return { text, changes };
}

function capitalizeFirst(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return '';
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

function extractVocative(quoted: string): {
  vocative: string | null;
  vocativePhrase: string | null;
  remainder: string;
} {
  const match = quoted.match(
    /^(?:Hey|Hello|Hi|Dear|My dear|O|Oh)?\s*,?\s*(friend|friends|brother|sister|sir|madam|mother|father|mom|dad|teacher|boys|girls|students|son|daughter|uncle|aunt|[A-Z][a-z]+)\s*[,!]\s*(.+)$/i,
  );
  if (match) {
    const rawVoc = match[0].slice(0, match[0].length - match[2].length).replace(/[,\s]+$/, '').trim();
    const role = match[1].trim();
    return {
      vocative: role,
      vocativePhrase: rawVoc,
      remainder: match[2].trim(),
    };
  }
  return { vocative: null, vocativePhrase: null, remainder: quoted };
}

function convertDirectToIndirect(raw: string, startMs: number): NarrationResult {
  const steps: TransformationStep[] = [];
  const trimmed = raw.trim();

  // Parse reporting part + quoted speech
  const quoteMatch = trimmed.match(/^(.*?)[,:]?\s*["“'](.+?)["”']\s*$/);
  if (!quoteMatch) {
    // Fallback if user didn't put quotes around simple sentence
    return {
      input: raw,
      converted: `He said that ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`,
      direction: 'direct-to-indirect',
      detectedType: { en: 'Assertive (Unquoted)', bn: 'বিবৃতিমূলক বাক্য' },
      steps: [
        {
          id: 'rv',
          label: { en: 'Reporting Clause', bn: 'রিপোর্টিং অংশ' },
          before: '(none)',
          after: 'He said that',
          explanation: {
            en: 'Added a standard reporting clause since quotation marks were omitted.',
            bn: 'উদ্ধৃতি চিহ্ন না থাকায় একটি সাধারণ রিপোর্টিং অংশ যোগ করা হয়েছে।',
          },
        },
      ],
      elapsedMs: Math.max(0.2, performance.now() - startMs),
    };
  }

  const reportingPart = quoteMatch[1].trim();
  let quoted = quoteMatch[2].trim();

  // Extract speaker and listener from reportingPart
  const repMatch = reportingPart.match(
    /^(.+?)\s+(said to|says to|will say to|told|asked|said|says|replied)\s*(.*)$/i,
  );
  const speaker = repMatch ? repMatch[1].trim() : 'He';
  const rawRv = repMatch ? repMatch[2].trim() : 'said';
  const listener = repMatch && repMatch[3].trim() ? repMatch[3].trim() : null;
  const isPastReporting = !/says|will say/i.test(rawRv);

  // Extract vocative like "Hey, friend,"
  const { vocative, vocativePhrase, remainder } = extractVocative(quoted);
  if (vocative && vocativePhrase) {
    quoted = remainder;
    const addrTarget = listener || 'him';
    steps.push({
      id: 'vocative',
      label: { en: 'Addressing / Vocative', bn: 'সম্বোধন পদ' },
      before: vocativePhrase,
      after: `Addressing ${addrTarget} as ${vocative.toLowerCase()}`,
      explanation: {
        en: `Vocative "${vocative}" is moved to the start using "Addressing + object + as + ${vocative.toLowerCase()}".`,
        bn: `বাক্যের সম্বোধন পদ "${vocative}" শুরুতে "Addressing ... as ..." হিসেবে বসানো হয়েছে।`,
      },
    });
  }

  const listenerObj = listener ? getListenerPronoun(listener).obj : null;
  const effectiveListenerDisplay = listener
    ? vocative
      ? listenerObj || listener
      : listener
    : null;

  // Detect sentence type inside quotes
  const lowerQuoted = quoted.toLowerCase();
  const isExclamatory = /!$/.test(quoted) || /^(what a|what an|how |hurrah|alas|bravo)/i.test(quoted);
  const isInterrogative = /\?$/.test(quoted);
  const isOptative = /^(may |long live )/i.test(quoted);
  const isImperative =
    !isInterrogative &&
    !isExclamatory &&
    !isOptative &&
    /^(please|kindly|do not|don't|never|always|open|close|go|come|write|read|help|give|take|sit|stand|listen|let)\b/i.test(
      quoted,
    );

  const isUniversal = UNIVERSAL_TRUTHS.some((t) => lowerQuoted.includes(t));

  let prefixClause = '';
  let bodyClause = '';
  let detectedType = { en: 'Assertive', bn: 'বিবৃতিমূলক' };

  if (vocative) {
    detectedType = { en: 'Assertive + Vocative', bn: 'বিবৃতিমূলক + সম্বোধন' };
  }

  const addressingPrefix = vocative
    ? `Addressing ${listener || 'him'} as ${vocative.toLowerCase()}, `
    : '';

  if (isInterrogative) {
    detectedType = { en: 'Interrogative', bn: 'প্রশ্নবোধক' };
    const cleanQ = quoted.replace(/\?+$/, '').trim();
    const rvOut = listener ? `${speaker} asked ${listener}` : `${speaker} asked`;
    steps.push({
      id: 'rv',
      label: { en: 'Reporting Verb', bn: 'রিপোর্টিং ভার্ব' },
      before: `${rawRv}${listener ? ' ' + listener : ''}`,
      after: `asked${listener ? ' ' + listener : ''}`,
      explanation: {
        en: 'For questions, reporting verb "said to" changes to "asked".',
        bn: 'প্রশ্নবোধক বাক্যে "said to" পরিবর্তিত হয়ে "asked" হয়।',
      },
    });

    const whMatch = cleanQ.match(/^(who|whom|whose|which|what|when|where|why|how)\s+(.+)$/i);
    if (whMatch) {
      const whWord = whMatch[1].toLowerCase();
      let rest = whMatch[2].trim();
      // Convert "are you coming" -> "you are coming" or "do you like" -> "you like"
      const doMatch = rest.match(/^(do|does|did)\s+([a-z]+)\s+(.+)$/i);
      const auxMatch = rest.match(/^(am|is|are|was|were|can|could|will|would|shall|should|have|has|had|may)\s+([a-z]+)\s+(.+)$/i);
      if (doMatch) {
        const aux = doMatch[1].toLowerCase();
        rest = `${doMatch[2]} ${doMatch[3]}`;
        if (aux === 'did') {
          rest = `${doMatch[2]} had ${toPastParticipleSimple(doMatch[3].split(' ')[0])} ${doMatch[3].split(' ').slice(1).join(' ')}`.trim();
        }
      } else if (auxMatch) {
        rest = `${auxMatch[2]} ${auxMatch[1].toLowerCase()} ${auxMatch[3]}`;
      }
      const pron = shiftPronounsDirectToIndirect(rest, speaker, listener);
      if (pron.changes.length) {
        steps.push({
          id: 'pronoun',
          label: { en: 'Pronouns', bn: 'সর্বনাম পরিবর্তন' },
          before: pron.changes.map((c) => c[0]).join(', '),
          after: pron.changes.map((c) => c[1]).join(', '),
          explanation: {
            en: '1st and 2nd person pronouns adjust to match the speaker and listener.',
            bn: 'বক্তা ও শ্রোতা অনুযায়ী ১ম ও ২য় পুরুষের সর্বনাম পরিবর্তিত হয়েছে।',
          },
        });
      }
      const shifted = backshiftVerb(pron.text, isPastReporting);
      if (shifted.change) {
        steps.push({
          id: 'tense',
          label: { en: 'Tense Shift', bn: 'কাল পরিবর্তন' },
          before: shifted.change[0],
          after: shifted.change[1],
          explanation: {
            en: 'Interrogative structure becomes assertive and tense shifts back.',
            bn: 'প্রশ্নবোধক গঠনটি বিবৃতিমূলক হয়ে ক্রিয়ার কাল এক ধাপ অতীতে সরে গেছে।',
          },
        });
      }
      const tp = shiftTimePlace(shifted.text, TIME_PLACE_MAP);
      if (tp.changes.length) {
        steps.push({
          id: 'time',
          label: { en: 'Time / Place', bn: 'সময় ও স্থান' },
          before: tp.changes.map((c) => c[0]).join(', '),
          after: tp.changes.map((c) => c[1]).join(', '),
          explanation: {
            en: 'Near-time/place words shift to distant equivalents.',
            bn: 'নিকটবর্তী সময় বা স্থানবাচক শব্দ দূরবর্তী শব্দে রূপান্তরিত হয়েছে।',
          },
        });
      }
      prefixClause = `${addressingPrefix}${rvOut} ${whWord} `;
      bodyClause = tp.text;
    } else {
      // Yes/No question
      let rest = cleanQ;
      const doMatch = rest.match(/^(do|does|did)\s+([a-z]+)\s+(.+)$/i);
      const auxMatch = rest.match(/^(am|is|are|was|were|can|could|will|would|shall|should|have|has|had|may)\s+([a-z]+)\s+(.+)$/i);
      if (doMatch) {
        rest = `${doMatch[2]} ${doMatch[3]}`;
      } else if (auxMatch) {
        rest = `${auxMatch[2]} ${auxMatch[1].toLowerCase()} ${auxMatch[3]}`;
      }
      const pron = shiftPronounsDirectToIndirect(rest, speaker, listener);
      if (pron.changes.length) {
        steps.push({
          id: 'pronoun',
          label: { en: 'Pronouns', bn: 'সর্বনাম পরিবর্তন' },
          before: pron.changes.map((c) => c[0]).join(', '),
          after: pron.changes.map((c) => c[1]).join(', '),
          explanation: {
            en: 'Pronouns adjust to the reporting speaker and listener.',
            bn: 'বক্তা ও শ্রোতা অনুযায়ী সর্বনাম পরিবর্তিত হয়েছে।',
          },
        });
      }
      const shifted = backshiftVerb(pron.text, isPastReporting);
      if (shifted.change) {
        steps.push({
          id: 'tense',
          label: { en: 'Tense Shift', bn: 'কাল পরিবর্তন' },
          before: shifted.change[0],
          after: shifted.change[1],
          explanation: {
            en: 'Yes/No question takes "if / whether" and shifts verb tense back.',
            bn: 'Yes/No প্রশ্নে "if" বসে এবং ক্রিয়ার কাল অতীতে পরিবর্তিত হয়।',
          },
        });
      }
      const tp = shiftTimePlace(shifted.text, TIME_PLACE_MAP);
      if (tp.changes.length) {
        steps.push({
          id: 'time',
          label: { en: 'Time / Place', bn: 'সময় ও স্থান' },
          before: tp.changes.map((c) => c[0]).join(', '),
          after: tp.changes.map((c) => c[1]).join(', '),
          explanation: {
            en: 'Near-time expressions shift to distant equivalents.',
            bn: 'সময়বাচক শব্দ দূরবর্তী রূপে পরিবর্তিত হয়েছে।',
          },
        });
      }
      prefixClause = `${addressingPrefix}${rvOut} if `;
      bodyClause = tp.text;
    }
  } else if (isImperative) {
    detectedType = { en: 'Imperative', bn: 'অনুজ্ঞাসূচক' };
    const cleanImp = quoted.replace(/[.!]+$/, '').trim();
    const isPlease = /^(please|kindly)\s+/i.test(cleanImp);
    const isNegative = /^(do not|don't|never)\s+/i.test(cleanImp);
    const isAlways = /^always\s+/i.test(cleanImp);

    let rvWord = 'told';
    if (isPlease) rvWord = 'requested';
    else if (isAlways || /\b(truth|parents|elders|health|hard)\b/i.test(cleanImp)) rvWord = 'advised';
    else if (/teacher|captain|commander|officer|boss/i.test(speaker)) rvWord = 'ordered';

    const rvOut = listener ? `${speaker} ${rvWord} ${listener}` : `${speaker} ${rvWord}`;
    steps.push({
      id: 'rv',
      label: { en: 'Reporting Verb', bn: 'রিপোর্টিং ভার্ব' },
      before: rawRv,
      after: rvWord,
      explanation: {
        en: `Imperative tone selects "${rvWord}" and links the verb with an infinitive ("to" / "not to").`,
        bn: `ভাব অনুযায়ী "${rvWord}" ব্যবহৃত হয়েছে এবং ক্রিয়ার আগে "to" বা "not to" বসেছে।`,
      },
    });

    let coreImp = cleanImp.replace(/^(please|kindly)\s+/i, '').trim();
    let connector = 'to';
    if (isNegative) {
      coreImp = coreImp.replace(/^(do not|don't)\s+/i, '').replace(/^never\s+/i, '');
      connector = /^never/i.test(cleanImp) ? 'never to' : 'not to';
    } else if (isAlways) {
      coreImp = coreImp.replace(/^always\s+/i, '');
      connector = 'always to';
    }
    coreImp = coreImp.charAt(0).toLowerCase() + coreImp.slice(1);
    const pron = shiftPronounsDirectToIndirect(coreImp, speaker, listener);
    const tp = shiftTimePlace(pron.text, TIME_PLACE_MAP);
    prefixClause = `${addressingPrefix}${rvOut} ${connector} `;
    bodyClause = tp.text;
  } else if (isExclamatory) {
    detectedType = { en: 'Exclamatory', bn: 'বিস্ময়সূচক' };
    const cleanEx = quoted.replace(/!+$/, '').trim();
    let rvWord = 'exclaimed with joy';
    let body = cleanEx;

    if (/^alas\b/i.test(cleanEx)) {
      rvWord = 'exclaimed with sorrow';
      body = cleanEx.replace(/^alas[!,\s]*/i, '');
    } else if (/^hurrah\b/i.test(cleanEx)) {
      rvWord = 'exclaimed with joy';
      body = cleanEx.replace(/^hurrah[!,\s]*/i, '');
    } else if (/^bravo\b/i.test(cleanEx)) {
      rvWord = 'applauded';
      body = cleanEx.replace(/^bravo[!,\s]*/i, '');
    } else {
      rvWord = 'exclaimed with wonder';
      // "What a beautiful morning it is" -> "it was a very beautiful morning"
      const whatMatch = cleanEx.match(/^what\s+(a|an)\s+(.+?)\s+(it|he|she|they|this|that)\s+(is|are|was|were)$/i);
      const howMatch = cleanEx.match(/^how\s+([a-z]+)\s+(.+?)\s+(is|are|was|were)$/i);
      if (whatMatch) {
        const adjNoun = whatMatch[2];
        const subj = whatMatch[3].toLowerCase();
        const verb = /are|were/i.test(whatMatch[4]) ? 'were' : 'was';
        body = `${subj} ${verb} ${whatMatch[1].toLowerCase()} very ${adjNoun}`;
      } else if (howMatch) {
        const adj = howMatch[1];
        const subj = howMatch[2];
        const verb = /are|were/i.test(howMatch[3]) ? 'were' : 'was';
        body = `${subj} ${verb} very ${adj}`;
      }
    }

    steps.push({
      id: 'rv',
      label: { en: 'Reporting Verb', bn: 'রিপোর্টিং ভার্ব' },
      before: rawRv,
      after: rvWord,
      explanation: {
        en: 'Exclamatory sentences replace "said" with "exclaimed with joy/sorrow/wonder" and turn "what/how" into "very/great".',
        bn: 'বিস্ময়সূচক বাক্যে "said" এর বদলে "exclaimed with..." এবং "what/how" এর বদলে "very/great" বসে।',
      },
    });

    const pron = shiftPronounsDirectToIndirect(body, speaker, listener);
    const shifted = backshiftVerb(pron.text, isPastReporting);
    const tp = shiftTimePlace(shifted.text, TIME_PLACE_MAP);
    prefixClause = `${addressingPrefix}${speaker} ${rvWord} that `;
    bodyClause = tp.text;
  } else if (isOptative) {
    detectedType = { en: 'Optative', bn: 'ইচ্ছা বা প্রার্থনামূলক' };
    const cleanOpt = quoted.replace(/[.!]+$/, '').trim();
    steps.push({
      id: 'rv',
      label: { en: 'Reporting Verb', bn: 'রিপোর্টিং ভার্ব' },
      before: rawRv,
      after: 'wished / prayed',
      explanation: {
        en: 'Optative sentences use "wished" or "prayed" + "that" + subject + "might".',
        bn: 'ইচ্ছাসূচক বাক্যে "wished" বা "prayed" এর পর "that + subject + might" বসে।',
      },
    });
    const mayMatch = cleanOpt.match(/^may\s+([a-z]+)\s+(.+)$/i);
    let body = cleanOpt;
    if (mayMatch) {
      body = `${mayMatch[1]} might ${mayMatch[2]}`;
    }
    const pron = shiftPronounsDirectToIndirect(body, speaker, listener);
    prefixClause = `${addressingPrefix}${speaker} wished that `;
    bodyClause = pron.text;
  } else {
    // Assertive (including Universal Truth)
    if (isUniversal) {
      detectedType = { en: 'Universal Truth', bn: 'চিরন্তন সত্য' };
    }
    const cleanAssert = quoted.replace(/[.]+$/, '').trim();
    const rvTarget = effectiveListenerDisplay ? `told ${effectiveListenerDisplay}` : rawRv;
    const rvDisplay = /said to/i.test(rawRv) && effectiveListenerDisplay ? `${speaker} told ${effectiveListenerDisplay}` : `${speaker} ${rvTarget}`;

    steps.push({
      id: 'rv',
      label: { en: 'Reporting Verb', bn: 'রিপোর্টিং ভার্ব' },
      before: `${rawRv}${listener ? ' ' + listener : ''}`,
      after: effectiveListenerDisplay && /said to/i.test(rawRv) ? `told ${effectiveListenerDisplay}` : rawRv,
      explanation: {
        en: listener ? '"said to" changes to "told" followed by "that".' : 'Reporting verb remains "said" followed by connector "that".',
        bn: listener ? '"said to" পরিবর্তিত হয়ে "told" এবং সংযোজক "that" বসেছে।' : '"said" এর পর সংযোজক "that" যুক্ত হয়েছে।',
      },
    });

    const pron = shiftPronounsDirectToIndirect(cleanAssert, speaker, listener);
    if (pron.changes.length) {
      steps.push({
        id: 'pronoun',
        label: { en: 'Pronouns', bn: 'সর্বনাম পরিবর্তন' },
        before: pron.changes.map((c) => c[0]).join(', '),
        after: pron.changes.map((c) => c[1]).join(', '),
        explanation: {
          en: 'First and second person pronouns change according to the subject and object of the reporting verb.',
          bn: 'বক্তা ও শ্রোতার পুরুষ অনুযায়ী সর্বনাম পরিবর্তিত হয়েছে।',
        },
      });
    }

    const shifted = backshiftVerb(pron.text, isPastReporting);
    if (isUniversal) {
      steps.push({
        id: 'tense',
        label: { en: 'Tense Kept (Truth)', bn: 'কাল অপরিবর্তিত (চিরন্তন সত্য)' },
        before: 'Present Tense',
        after: 'Present Tense (Unchanged)',
        explanation: {
          en: 'Universal truths and habitual facts never shift tense even after a past reporting verb.',
          bn: 'চিরন্তন সত্য বাক্যের Tense কখনোই পরিবর্তিত হয় না।',
        },
      });
    } else if (shifted.change) {
      steps.push({
        id: 'tense',
        label: { en: 'Tense Shift', bn: 'কাল পরিবর্তন' },
        before: shifted.change[0],
        after: shifted.change[1],
        explanation: {
          en: 'Because the reporting verb is in the past tense, the reported verb shifts one step back.',
          bn: 'রিপোর্টিং ভার্ব Past Tense হওয়ায় মূল ক্রিয়ার কাল এক ধাপ অতীতে সরে গেছে।',
        },
      });
    }

    const tp = shiftTimePlace(shifted.text, TIME_PLACE_MAP);
    if (tp.changes.length) {
      steps.push({
        id: 'time',
        label: { en: 'Time / Place', bn: 'সময় ও স্থান' },
        before: tp.changes.map((c) => c[0]).join(', '),
        after: tp.changes.map((c) => c[1]).join(', '),
        explanation: {
          en: 'Near-time and near-place adverbs convert into distant equivalents.',
          bn: 'সময় ও স্থান নির্দেশক শব্দগুলো দূরবর্তী রূপে পরিবর্তিত হয়েছে।',
        },
      });
    }

    prefixClause = `${addressingPrefix}${rvDisplay} that `;
    bodyClause = tp.text;
  }

  let finalBody = bodyClause.trim();
  // Keep lowercase "I" capitalized
  finalBody = finalBody.replace(/\bi\b/g, 'I');
  const fullConverted = capitalizeFirst(`${prefixClause}${finalBody}`.replace(/\s+/g, ' ')) + '.';

  return {
    input: raw,
    converted: fullConverted,
    direction: 'direct-to-indirect',
    detectedType,
    steps,
    elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
  };
}

function convertIndirectToDirect(raw: string, startMs: number): NarrationResult {
  const steps: TransformationStep[] = [];
  const trimmed = raw.trim().replace(/[.]+$/, '');

  // Handle "Addressing X as Y, ..."
  let working = trimmed;
  let vocativeInsert = '';
  const addrMatch = working.match(/^Addressing\s+(.+?)\s+as\s+(?:a|an|the)?\s*([^,]+),\s*(.+)$/i);
  if (addrMatch) {
    vocativeInsert = `Hey, ${addrMatch[2].trim()}, `;
    working = addrMatch[3].trim();
    steps.push({
      id: 'vocative-rev',
      label: { en: 'Restore Vocative', bn: 'সম্বোধন ফিরিয়ে আনা' },
      before: `Addressing ${addrMatch[1]} as ${addrMatch[2]}`,
      after: vocativeInsert.trim(),
      explanation: {
        en: 'Restored the addressing phrase back inside the quotation marks.',
        bn: 'সম্বোধন পদটি পুনরায় উদ্ধৃতি চিহ্নের ভেতরে বসানো হয়েছে।',
      },
    });
  }

  // Ask / Question Indirect -> Direct
  const askMatch = working.match(/^(.+?)\s+asked\s*(.*?)\s+(if|whether|who|whom|whose|which|what|when|where|why|how)\s+(.+)$/i);
  if (askMatch) {
    const speaker = askMatch[1].trim();
    const listener = askMatch[2].trim();
    const connector = askMatch[3].toLowerCase();
    let clause = askMatch[4].trim();

    const tp = shiftTimePlace(clause, REVERSE_TIME_PLACE_MAP);
    clause = tp.text;

    // Reverse pronoun (he/she -> I or you)
    clause = clause.replace(/\b(he|she)\b/gi, 'I').replace(/\bhis\b|\bher\b/gi, 'my');
    clause = clause.replace(/\bhad\s+([a-z]+ed|finished|gone|done|written)\b/i, '$1').replace(/\bwas\b/gi, 'am').replace(/\bwere\b/gi, 'are');

    const rv = listener ? `${speaker} said to ${listener}` : `${speaker} said`;
    const isYesNo = connector === 'if' || connector === 'whether';
    let qBody = clause;
    if (isYesNo) {
      const m = clause.match(/^(I|you|we|they|he|she)\s+(am|is|are|was|were|can|will|would|could)\s+(.+)$/i);
      if (m) {
        const presentAux = m[2].toLowerCase() === 'would' ? 'will' : m[2].toLowerCase() === 'could' ? 'can' : m[2];
        qBody = `${capitalizeFirst(presentAux)} ${m[1] === 'I' ? 'I' : m[1].toLowerCase()} ${m[3]}`;
      }
    } else {
      qBody = `${capitalizeFirst(connector)} ${clause}`;
    }

    steps.push({
      id: 'rv-rev',
      label: { en: 'Reporting Verb', bn: 'রিপোর্টিং ভার্ব' },
      before: 'asked',
      after: listener ? 'said to' : 'said',
      explanation: {
        en: 'Restored direct reporting verb and question mark inside quotation marks.',
        bn: '"asked" এর বদলে "said / said to" এবং প্রশ্নবোধক চিহ্ন ফিরিয়ে আনা হয়েছে।',
      },
    });

    return {
      input: raw,
      converted: `${rv}, "${vocativeInsert}${capitalizeFirst(qBody)}?"`,
      direction: 'indirect-to-direct',
      detectedType: { en: 'Interrogative (Reversed)', bn: 'প্রশ্নবোধক (বিপরীত রূপান্তর)' },
      steps,
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  // Assertive Indirect -> Direct
  const thatMatch = working.match(/^(.+?)\s+(told|said|replied)\s*(.*?)\s+that\s+(.+)$/i);
  if (thatMatch) {
    const speaker = thatMatch[1].trim();
    const rvVerb = thatMatch[2].toLowerCase();
    const listener = thatMatch[3].trim();
    let body = thatMatch[4].trim();

    const sp = getSpeakerPronoun(speaker);
    // Restore 3rd person pronouns matching speaker back to 1st person
    const spRegex = new RegExp(`\\b${sp.subj}\\b`, 'gi');
    const spObjRegex = new RegExp(`\\b${sp.obj}\\b`, 'gi');
    const spPossRegex = new RegExp(`\\b${sp.poss}\\b`, 'gi');
    const pronBefore = body;
    body = body.replace(spRegex, 'I').replace(spObjRegex, 'me').replace(spPossRegex, 'my');
    if (pronBefore !== body) {
      steps.push({
        id: 'pron-rev',
        label: { en: 'Pronouns', bn: 'সর্বনাম' },
        before: sp.subj,
        after: 'I',
        explanation: {
          en: 'Restored third-person pronoun back to first person inside direct speech.',
          bn: 'উদ্ধৃতি চিহ্নের ভেতরে প্রথম পুরুষের সর্বনাম ফিরিয়ে আনা হয়েছে।',
        },
      });
    }

    // Shift back past tense -> present where clear
    const beforeTense = body;
    body = body
      .replace(/\bI\s+was\b/gi, 'I am')
      .replace(/\bhad\s+([a-z]+)\b/gi, (_m, v) => IRREGULAR_PAST_TO_BASE[v.toLowerCase()] || v)
      .replace(/\bwould\b/gi, 'will')
      .replace(/\bcould\b/gi, 'can')
      .replace(/\bmight\b/gi, 'may')
      .replace(/\bhad to\b/gi, 'must');

    if (beforeTense !== body) {
      steps.push({
        id: 'tense-rev',
        label: { en: 'Tense Restored', bn: 'কাল পুনরুদ্ধার' },
        before: 'Past shifted form',
        after: 'Direct present/past form',
        explanation: {
          en: 'Reversed tense backshift into direct speech.',
          bn: 'বক্তার মূল সময়ের কাল ফিরিয়ে আনা হয়েছে।',
        },
      });
    }

    const tp = shiftTimePlace(body, REVERSE_TIME_PLACE_MAP);
    if (tp.changes.length) {
      steps.push({
        id: 'time-rev',
        label: { en: 'Time / Place', bn: 'সময় ও স্থান' },
        before: tp.changes.map((c) => c[0]).join(', '),
        after: tp.changes.map((c) => c[1]).join(', '),
        explanation: {
          en: 'Restored distant time/place words to direct speech expressions.',
          bn: 'দূরবর্তী সময় বা স্থানবাচক শব্দ নিকটবর্তী রূপে ফিরিয়ে আনা হয়েছে।',
        },
      });
    }
    body = tp.text;

    const rvOut = rvVerb === 'told' && listener ? `${speaker} said to ${listener}` : `${speaker} ${rvVerb}`;
    steps.unshift({
      id: 'rv-rev',
      label: { en: 'Reporting Verb', bn: 'রিপোর্টিং ভার্ব' },
      before: `${rvVerb}${listener ? ' ' + listener : ''} that`,
      after: rvOut,
      explanation: {
        en: 'Removed "that" and restored quotation marks around the spoken clause.',
        bn: '"that" তুলে দিয়ে উদ্ধৃতি চিহ্ন ("...") যুক্ত করা হয়েছে।',
      },
    });

    return {
      input: raw,
      converted: `${rvOut}, "${vocativeInsert}${capitalizeFirst(body)}."`,
      direction: 'indirect-to-direct',
      detectedType: { en: 'Assertive (Reversed)', bn: 'বিবৃতিমূলক (বিপরীত রূপান্তর)' },
      steps,
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  return {
    input: raw,
    converted: `He said, "${capitalizeFirst(working)}."`,
    direction: 'indirect-to-direct',
    detectedType: { en: 'Indirect → Direct', bn: 'পরোক্ষ → প্রত্যক্ষ' },
    steps: [
      {
        id: 'wrap',
        label: { en: 'Quotation Wrap', bn: 'উদ্ধৃতি চিহ্ন যোগ' },
        before: working,
        after: `"${capitalizeFirst(working)}."`,
        explanation: {
          en: 'Wrapped sentence in direct speech quotation marks.',
          bn: 'বাক্যটিকে সরাসরি উক্তির উদ্ধৃতি চিহ্নের মধ্যে রাখা হয়েছে।',
        },
      },
    ],
    elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
  };
}

export function solveNarration(
  input: string,
  mode: 'auto' | 'direct-to-indirect' | 'indirect-to-direct' = 'auto',
): NarrationResult {
  const startMs = performance.now();
  const trimmed = input.trim();
  const looksDirect = /["“'].+["”']/.test(trimmed) || /\bsaid to\b/i.test(trimmed);
  const direction =
    mode === 'auto' ? (looksDirect ? 'direct-to-indirect' : 'indirect-to-direct') : mode;

  return direction === 'direct-to-indirect'
    ? convertDirectToIndirect(trimmed, startMs)
    : convertIndirectToDirect(trimmed, startMs);
}
