import { VoiceResult } from '../types/studio';

const SUBJ_TO_OBJ_PRONOUN: Record<string, string> = {
  i: 'me',
  we: 'us',
  you: 'you',
  he: 'him',
  she: 'her',
  they: 'them',
  it: 'it',
  who: 'whom',
};

const OBJ_TO_SUBJ_PRONOUN: Record<string, string> = {
  me: 'I',
  us: 'we',
  you: 'you',
  him: 'he',
  her: 'she',
  them: 'they',
  it: 'it',
  whom: 'who',
};

const V1_TO_V3: Record<string, string> = {
  write: 'written',
  writes: 'written',
  wrote: 'written',
  eat: 'eaten',
  eats: 'eaten',
  ate: 'eaten',
  take: 'taken',
  takes: 'taken',
  took: 'taken',
  make: 'made',
  makes: 'made',
  made: 'made',
  do: 'done',
  does: 'done',
  did: 'done',
  see: 'seen',
  sees: 'seen',
  saw: 'seen',
  give: 'given',
  gives: 'given',
  gave: 'given',
  break: 'broken',
  breaks: 'broken',
  broke: 'broken',
  speak: 'spoken',
  speaks: 'spoken',
  spoke: 'spoken',
  sing: 'sung',
  sings: 'sung',
  sang: 'sung',
  draw: 'drawn',
  draws: 'drawn',
  drew: 'drawn',
  know: 'known',
  knows: 'known',
  knew: 'known',
  buy: 'bought',
  buys: 'bought',
  bought: 'bought',
  teach: 'taught',
  teaches: 'taught',
  taught: 'taught',
  catch: 'caught',
  catches: 'caught',
  caught: 'caught',
  build: 'built',
  builds: 'built',
  built: 'built',
  send: 'sent',
  sends: 'sent',
  sent: 'sent',
  read: 'read',
  reads: 'read',
  protect: 'protected',
  protects: 'protected',
  plant: 'planted',
  planting: 'planted',
  open: 'opened',
  opens: 'opened',
  close: 'closed',
  closes: 'closed',
  cook: 'cooked',
  cooks: 'cooked',
  cooked: 'cooked',
  help: 'helped',
  helps: 'helped',
  helped: 'helped',
  love: 'loved',
  loves: 'loved',
  loved: 'loved',
  clean: 'cleaned',
  cleans: 'cleaned',
  cleaned: 'cleaned',
  finish: 'finished',
  finishes: 'finished',
  finished: 'finished',
  solve: 'solved',
  solves: 'solved',
  solved: 'solved',
};

const V3_TO_V1: Record<string, string> = {
  written: 'write',
  eaten: 'eat',
  taken: 'take',
  made: 'make',
  done: 'do',
  seen: 'see',
  given: 'give',
  broken: 'break',
  spoken: 'speak',
  sung: 'sing',
  drawn: 'draw',
  known: 'know',
  bought: 'buy',
  taught: 'teach',
  caught: 'catch',
  built: 'build',
  sent: 'send',
  read: 'read',
  cooked: 'cook',
  protected: 'protect',
  planted: 'plant',
  opened: 'open',
  closed: 'close',
  helped: 'help',
  loved: 'love',
  cleaned: 'clean',
  finished: 'finish',
  solved: 'solve',
};

const V3_TO_V2: Record<string, string> = {
  written: 'wrote',
  eaten: 'ate',
  taken: 'took',
  made: 'made',
  done: 'did',
  seen: 'saw',
  given: 'gave',
  broken: 'broke',
  spoken: 'spoke',
  sung: 'sang',
  drawn: 'drew',
  known: 'knew',
  bought: 'bought',
  taught: 'taught',
  caught: 'caught',
  built: 'built',
  sent: 'sent',
  read: 'read',
};

const PAST_TENSE_VERBS = new Set([
  'wrote', 'ate', 'took', 'made', 'did', 'saw', 'gave', 'broke', 'spoke', 'sang',
  'drew', 'knew', 'bought', 'taught', 'caught', 'built', 'sent',
]);

function toV3(verb: string): string {
  const low = verb.toLowerCase();
  if (V1_TO_V3[low]) return V1_TO_V3[low];
  if (low.endsWith('ing')) {
    const stem = low.slice(0, -3);
    if (V1_TO_V3[stem]) return V1_TO_V3[stem];
    if (V1_TO_V3[`${stem}e`]) return V1_TO_V3[`${stem}e`];
    return `${stem}ed`;
  }
  if (low.endsWith('ed')) return low;
  if (low.endsWith('e')) return `${low}d`;
  if (low.endsWith('y') && !/[aeiou]y$/.test(low)) return `${low.slice(0, -1)}ied`;
  return `${low}ed`;
}

function toBaseFromV3(v3: string): string {
  const low = v3.toLowerCase();
  if (V3_TO_V1[low]) return V3_TO_V1[low];
  if (low.endsWith('ied')) return `${low.slice(0, -3)}y`;
  if (low.endsWith('ed')) return low.slice(0, -2);
  return low;
}

function toPastFromV3(v3: string): string {
  const low = v3.toLowerCase();
  if (V3_TO_V2[low]) return V3_TO_V2[low];
  if (low.endsWith('ed')) return low;
  return `${low}ed`;
}

function toSubjectPronoun(phrase: string): string {
  const low = phrase.trim().toLowerCase();
  if (OBJ_TO_SUBJ_PRONOUN[low]) return OBJ_TO_SUBJ_PRONOUN[low];
  return phrase.trim();
}

function toObjectPronoun(phrase: string): string {
  const low = phrase.trim().toLowerCase();
  if (SUBJ_TO_OBJ_PRONOUN[low]) return SUBJ_TO_OBJ_PRONOUN[low];
  return phrase.trim();
}

function isPluralSubject(subj: string): boolean {
  const low = subj.trim().toLowerCase();
  if (['we', 'they', 'you', 'these', 'those'].includes(low)) return true;
  if (/\band\b/i.test(low)) return true;
  if (/s$/.test(low) && !/(ss|us|is|news|mathematics|physics)$/.test(low)) return true;
  return false;
}

function capFirst(s: string): string {
  const t = s.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : '';
}

function chooseBe(tense: string, subj: string): string {
  const plural = isPluralSubject(subj);
  const low = subj.trim().toLowerCase();
  if (tense === 'present-simple') return low === 'i' ? 'am' : plural ? 'are' : 'is';
  if (tense === 'past-simple') return plural || low === 'you' ? 'were' : 'was';
  if (tense === 'present-continuous') return low === 'i' ? 'am being' : plural ? 'are being' : 'is being';
  if (tense === 'past-continuous') return plural || low === 'you' ? 'were being' : 'was being';
  if (tense === 'present-perfect') return plural || low === 'i' || low === 'you' ? 'have been' : 'has been';
  if (tense === 'past-perfect') return 'had been';
  if (tense === 'future-simple') return 'will be';
  return 'is';
}

function splitTailAdverb(sentence: string): { core: string; tail: string } {
  const m = sentence.match(
    /^(.*?)\s+(\b(?:yesterday|today|tomorrow|now|always|often|quickly|carefully|immediately|every day|last night|in the [a-z\s]+|at [a-z\s]+|on [a-z\s]+))$/i,
  );
  if (m) return { core: m[1].trim(), tail: m[2].trim() };
  return { core: sentence.trim(), tail: '' };
}

function solveActiveToPassive(raw: string, startMs: number): VoiceResult {
  const cleaned = raw.trim();

  // 1. Who-question: "Who broke the glass vase?"
  const whoMatch = cleaned.match(/^Who\s+([a-z]+)\s+(.+?)\?$/i);
  if (whoMatch) {
    const verb = whoMatch[1];
    const obj = whoMatch[2].trim();
    const isPast = PAST_TENSE_VERBS.has(verb.toLowerCase()) || verb.toLowerCase().endsWith('ed');
    const be = isPast ? (isPluralSubject(obj) ? 'were' : 'was') : isPluralSubject(obj) ? 'are' : 'is';
    const v3 = toV3(verb);
    const converted = `By whom ${be} ${obj} ${v3}?`;
    return {
      input: raw,
      converted,
      direction: 'active-to-passive',
      detectedVoice: { en: 'Active Voice · Interrogative (Who)', bn: 'Active Voice · প্রশ্নবোধক (Who)' },
      tenseLabel: isPast ? { en: 'Past Indefinite', bn: 'অতীত সাধারণ' } : { en: 'Present Indefinite', bn: 'বর্তমান সাধারণ' },
      swapDiagram: {
        activeNodes: [
          { role: { en: 'Subject', bn: 'কর্তা' }, text: 'Who' },
          { role: { en: 'Verb', bn: 'ক্রিয়া' }, text: verb },
          { role: { en: 'Object', bn: 'কর্ম' }, text: obj },
        ],
        passiveNodes: [
          { role: { en: 'By + Agent', bn: 'দ্বারা + কর্তা' }, text: 'By whom' },
          { role: { en: 'Be + V3', bn: 'সহায়ক + V3' }, text: `${be} ... ${v3}` },
          { role: { en: 'New Subject', bn: 'নতুন কর্তা' }, text: obj },
        ],
      },
      rules: [
        {
          title: { en: 'Interrogative "Who" Rule', bn: '"Who" প্রশ্নবোধক নিয়ম' },
          detail: {
            en: '"Who" changes to "By whom" at the front, followed by auxiliary "was/were/is/are" before the new subject and V3.',
            bn: 'Active বাক্য "Who" দিয়ে শুরু হলে Passive-এ "By whom" + সাহায্যকারী ক্রিয়া + নতুন কর্তা + V3 বসে।',
          },
        },
      ],
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  // 2. Imperative: "Open the window immediately."
  const noPunct = cleaned.replace(/[.!]+$/, '').trim();
  const impMatch = noPunct.match(
    /^(?:(Do not|Don't)\s+)?(Open|Close|Write|Read|Help|Do|Make|Finish|Clean|Plant|Protect|Solve|Bring|Take|Give)\s+(.+)$/i,
  );
  if (impMatch) {
    const isNeg = Boolean(impMatch[1]);
    const verb = impMatch[2];
    const rest = impMatch[3].trim();
    const { core: obj, tail } = splitTailAdverb(rest);
    const v3 = toV3(verb);
    const converted = `${isNeg ? 'Let not' : 'Let'} ${obj} be ${v3}${tail ? ' ' + tail : ''}.`;
    return {
      input: raw,
      converted,
      direction: 'active-to-passive',
      detectedVoice: { en: 'Active Voice · Imperative', bn: 'Active Voice · অনুজ্ঞাসূচক' },
      tenseLabel: { en: 'Imperative Command', bn: 'আদেশ/অনুরোধ' },
      swapDiagram: {
        activeNodes: [
          { role: { en: 'Implied Subject', bn: 'উহ্য কর্তা' }, text: '(You)' },
          { role: { en: 'Base Verb (V1)', bn: 'মূল ক্রিয়া' }, text: verb },
          { role: { en: 'Object', bn: 'কর্ম' }, text: obj },
        ],
        passiveNodes: [
          { role: { en: 'Let + Object', bn: 'Let + কর্ম' }, text: `${isNeg ? 'Let not' : 'Let'} ${obj}` },
          { role: { en: 'Be + V3', bn: 'be + V3' }, text: `be ${v3}` },
          { role: { en: 'Modifier', bn: 'অতিরিক্ত অংশ' }, text: tail || '—' },
        ],
      },
      rules: [
        {
          title: { en: 'Imperative Passive Formula', bn: 'অনুজ্ঞাসূচক Passive সূত্র' },
          detail: {
            en: 'Imperative sentences transform using "Let + Object + be + V3".',
            bn: 'আদেশসূচক বাক্যে "Let + Object + be + V3" গঠন ব্যবহৃত হয়।',
          },
        },
      ],
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  // 3. Standard declarative SVO(+tail)
  const { core, tail } = splitTailAdverb(noPunct);

  // Match Modal: Subj + (can|could|may|might|must|should|would|will|shall) + V1 + Obj
  const modalMatch = core.match(
    /^(.+?)\s+(can|could|may|might|must|should|would|will|shall)\s+([a-z]+)\s+(.+)$/i,
  );
  if (modalMatch) {
    const [, subj, modal, verb, obj] = modalMatch;
    const v3 = toV3(verb);
    const newSubj = capFirst(toSubjectPronoun(obj));
    const agent = toObjectPronoun(subj);
    const converted = `${newSubj} ${modal.toLowerCase()} be ${v3} by ${agent}${tail ? ' ' + tail : ''}.`;
    return {
      input: raw,
      converted,
      direction: 'active-to-passive',
      detectedVoice: { en: 'Active Voice · Modal Verb', bn: 'Active Voice · মোডাল ক্রিয়া' },
      tenseLabel: { en: `Modal (${modal})`, bn: `Modal (${modal})` },
      swapDiagram: {
        activeNodes: [
          { role: { en: 'Subject', bn: 'কর্তা' }, text: subj },
          { role: { en: 'Modal + V1', bn: 'মোডাল + V1' }, text: `${modal} ${verb}` },
          { role: { en: 'Object', bn: 'কর্ম' }, text: obj },
        ],
        passiveNodes: [
          { role: { en: 'New Subject', bn: 'নতুন কর্তা' }, text: newSubj },
          { role: { en: 'Modal + be + V3', bn: 'মোডাল + be + V3' }, text: `${modal.toLowerCase()} be ${v3}` },
          { role: { en: 'By + Agent', bn: 'দ্বারা + কর্তা' }, text: `by ${agent}` },
        ],
      },
      rules: [
        {
          title: { en: 'Modal Auxiliary Rule', bn: 'Modal Auxiliary নিয়ম' },
          detail: {
            en: 'Insert "be" right after the modal verb and convert the main verb to its Past Participle (V3).',
            bn: 'Modal ক্রিয়ার পর "be" বসিয়ে মূল ক্রিয়ার V3 (Past Participle) রূপ ব্যবহার করতে হয়।',
          },
        },
      ],
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  // Match Continuous: Subj + (am|is|are|was|were) + V-ing + Obj
  const contMatch = core.match(/^(.+?)\s+(am|is|are|was|were)\s+([a-z]+ing)\s+(.+)$/i);
  if (contMatch) {
    const [, subj, aux, ving, obj] = contMatch;
    const isPast = /was|were/i.test(aux);
    const tenseKey = isPast ? 'past-continuous' : 'present-continuous';
    const tenseLabel = isPast
      ? { en: 'Past Continuous', bn: 'চলমান অতীত' }
      : { en: 'Present Continuous', bn: 'চলমান বর্তমান' };
    const newSubj = capFirst(toSubjectPronoun(obj));
    const be = chooseBe(tenseKey, newSubj);
    const v3 = toV3(ving);
    const agent = toObjectPronoun(subj);
    const converted = `${newSubj} ${be} ${v3} by ${agent}${tail ? ' ' + tail : ''}.`;
    return {
      input: raw,
      converted,
      direction: 'active-to-passive',
      detectedVoice: { en: 'Active Voice', bn: 'Active Voice · কর্তৃবাচ্য' },
      tenseLabel,
      swapDiagram: {
        activeNodes: [
          { role: { en: 'Subject', bn: 'কর্তা' }, text: subj },
          { role: { en: 'Be + V-ing', bn: 'সহায়ক + V-ing' }, text: `${aux} ${ving}` },
          { role: { en: 'Object', bn: 'কর্ম' }, text: obj },
        ],
        passiveNodes: [
          { role: { en: 'New Subject', bn: 'নতুন কর্তা' }, text: newSubj },
          { role: { en: 'Be + being + V3', bn: 'সহায়ক + being + V3' }, text: `${be} ${v3}` },
          { role: { en: 'By + Agent', bn: 'দ্বারা + কর্তা' }, text: `by ${agent}` },
        ],
      },
      rules: [
        {
          title: { en: 'Continuous Tense Rule', bn: 'Continuous Tense নিয়ম' },
          detail: {
            en: 'Continuous tenses add "being" between the auxiliary (is/are/was/were) and V3.',
            bn: 'Continuous কাল পরিবর্তনের সময় সাহায্যকারী ক্রিয়ার পর "being" + V3 বসে।',
          },
        },
      ],
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  // Match Perfect: Subj + (has|have|had) + V3 + Obj
  const perfMatch = core.match(/^(.+?)\s+(has|have|had)\s+([a-z]+)\s+(.+)$/i);
  if (perfMatch) {
    const [, subj, aux, v3Raw, obj] = perfMatch;
    const isPast = aux.toLowerCase() === 'had';
    const tenseKey = isPast ? 'past-perfect' : 'present-perfect';
    const tenseLabel = isPast
      ? { en: 'Past Perfect', bn: 'পুরাঘটিত অতীত' }
      : { en: 'Present Perfect', bn: 'পুরাঘটিত বর্তমান' };
    const newSubj = capFirst(toSubjectPronoun(obj));
    const be = chooseBe(tenseKey, newSubj);
    const v3 = toV3(v3Raw);
    const agent = toObjectPronoun(subj);
    const converted = `${newSubj} ${be} ${v3} by ${agent}${tail ? ' ' + tail : ''}.`;
    return {
      input: raw,
      converted,
      direction: 'active-to-passive',
      detectedVoice: { en: 'Active Voice', bn: 'Active Voice · কর্তৃবাচ্য' },
      tenseLabel,
      swapDiagram: {
        activeNodes: [
          { role: { en: 'Subject', bn: 'কর্তা' }, text: subj },
          { role: { en: 'Have/Has + V3', bn: 'Have/Has + V3' }, text: `${aux} ${v3Raw}` },
          { role: { en: 'Object', bn: 'কর্ম' }, text: obj },
        ],
        passiveNodes: [
          { role: { en: 'New Subject', bn: 'নতুন কর্তা' }, text: newSubj },
          { role: { en: 'Have/Has + been + V3', bn: 'Have/Has + been + V3' }, text: `${be} ${v3}` },
          { role: { en: 'By + Agent', bn: 'দ্বারা + কর্তা' }, text: `by ${agent}` },
        ],
      },
      rules: [
        {
          title: { en: 'Perfect Tense Rule', bn: 'Perfect Tense নিয়ম' },
          detail: {
            en: 'Insert "been" after has/have/had and retain the Past Participle (V3).',
            bn: 'has/have/had এর পর "been" বসিয়ে মূল ক্রিয়ার V3 রূপ অপরিবর্তিত থাকে।',
          },
        },
      ],
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  // Match Simple Present / Past: Subj + Verb + Obj
  const simpleMatch = core.match(
    /^(I|We|You|He|She|They|It|The\s+[a-z]+|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+([a-z]+)\s+(.+)$/,
  );
  if (simpleMatch) {
    const [, subj, verb, obj] = simpleMatch;
    const lowVerb = verb.toLowerCase();
    const isPast = PAST_TENSE_VERBS.has(lowVerb) || (lowVerb.endsWith('ed') && !['need', 'feed', 'bleed'].includes(lowVerb));
    const tenseKey = isPast ? 'past-simple' : 'present-simple';
    const tenseLabel = isPast
      ? { en: 'Past Indefinite', bn: 'সাধারণ অতীত' }
      : { en: 'Present Indefinite', bn: 'সাধারণ বর্তমান' };

    const newSubj = capFirst(toSubjectPronoun(obj));
    const be = chooseBe(tenseKey, newSubj);
    const v3 = toV3(verb);
    const agent = toObjectPronoun(subj);
    const converted = `${newSubj} ${be} ${v3} by ${agent}${tail ? ' ' + tail : ''}.`;

    return {
      input: raw,
      converted,
      direction: 'active-to-passive',
      detectedVoice: { en: 'Active Voice', bn: 'Active Voice · কর্তৃবাচ্য' },
      tenseLabel,
      swapDiagram: {
        activeNodes: [
          { role: { en: 'Subject', bn: 'কর্তা' }, text: subj },
          { role: { en: 'Verb', bn: 'ক্রিয়া' }, text: verb },
          { role: { en: 'Object', bn: 'কর্ম' }, text: obj },
        ],
        passiveNodes: [
          { role: { en: 'New Subject', bn: 'নতুন কর্তা' }, text: newSubj },
          { role: { en: 'Be + V3', bn: 'সহায়ক + V3' }, text: `${be} ${v3}` },
          { role: { en: 'By + Agent', bn: 'দ্বারা + কর্তা' }, text: `by ${agent}` },
        ],
      },
      rules: [
        {
          title: { en: 'Subject ↔ Object Swap', bn: 'কর্তা ↔ কর্ম স্থান বিনিময়' },
          detail: {
            en: `The object "${obj}" becomes the subject, the verb shifts to "${be} ${v3}", and "${subj}" becomes "by ${agent}".`,
            bn: `কর্ম "${obj}" নতুন কর্তা হয়েছে, ক্রিয়া "${be} ${v3}" রূপে পরিবর্তিত হয়েছে এবং "${subj}" শেষে "by ${agent}" হিসেবে বসেছে।`,
          },
        },
      ],
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  return {
    input: raw,
    converted: raw,
    direction: 'active-to-passive',
    detectedVoice: { en: 'Active Voice', bn: 'Active Voice' },
    tenseLabel: { en: 'Intransitive / Unchanged', bn: 'অকর্মক / অপরিবর্তিত' },
    swapDiagram: {
      activeNodes: [
        { role: { en: 'Subject', bn: 'কর্তা' }, text: 'Subject' },
        { role: { en: 'Verb', bn: 'ক্রিয়া' }, text: 'Verb' },
        { role: { en: 'Object', bn: 'কর্ম' }, text: '(needs direct object)' },
      ],
      passiveNodes: [
        { role: { en: 'New Subject', bn: 'নতুন কর্তা' }, text: 'Object' },
        { role: { en: 'Be + V3', bn: 'be + V3' }, text: 'be + V3' },
        { role: { en: 'By + Agent', bn: 'দ্বারা + কর্তা' }, text: 'by Subject' },
      ],
    },
    rules: [
      {
        title: { en: 'Direct Object Needed', bn: 'সরাসরি কর্ম প্রয়োজন' },
        detail: {
          en: 'Ensure the sentence follows a Subject + Transitive Verb + Object pattern.',
          bn: 'Passive করার জন্য বাক্যে Subject + সকর্মক Verb + Object থাকতে হবে।',
        },
      },
    ],
    elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
  };
}

function solvePassiveToActive(raw: string, startMs: number): VoiceResult {
  const noPunct = raw.trim().replace(/[.!]+$/, '').trim();
  const m = noPunct.match(
    /^(.+?)\s+(am|is|are|was|were|will be|can be|must be|should be|has been|have been|had been)\s+(?:(being)\s+)?([a-z]+)\s+by\s+(.+)$/i,
  );

  if (m) {
    const [, passSubj, aux, beingWord, v3, agent] = m;
    const activeSubj = capFirst(toSubjectPronoun(agent));
    const activeObj = toObjectPronoun(passSubj);

    let activeVerb = toBaseFromV3(v3);
    let tenseLabel = { en: 'Present Indefinite', bn: 'সাধারণ বর্তমান' };

    const lowAux = aux.toLowerCase();
    if (beingWord) {
      const base = toBaseFromV3(v3);
      const ing = base.endsWith('e') ? `${base.slice(0, -1)}ing` : `${base}ing`;
      const isPast = lowAux === 'was' || lowAux === 'were';
      const activeAux = isPast
        ? isPluralSubject(activeSubj) ? 'were' : 'was'
        : activeSubj.toLowerCase() === 'i' ? 'am' : isPluralSubject(activeSubj) ? 'are' : 'is';
      activeVerb = `${activeAux} ${ing}`;
      tenseLabel = isPast
        ? { en: 'Past Continuous', bn: 'চলমান অতীত' }
        : { en: 'Present Continuous', bn: 'চলমান বর্তমান' };
    } else if (lowAux === 'was' || lowAux === 'were') {
      activeVerb = toPastFromV3(v3);
      tenseLabel = { en: 'Past Indefinite', bn: 'সাধারণ অতীত' };
    } else if (lowAux === 'has been' || lowAux === 'have been' || lowAux === 'had been') {
      const head = lowAux === 'had been' ? 'had' : isPluralSubject(activeSubj) || activeSubj === 'I' ? 'have' : 'has';
      activeVerb = `${head} ${v3}`;
      tenseLabel = lowAux === 'had been'
        ? { en: 'Past Perfect', bn: 'পুরাঘটিত অতীত' }
        : { en: 'Present Perfect', bn: 'পুরাঘটিত বর্তমান' };
    } else if (lowAux.endsWith(' be')) {
      const modal = lowAux.replace(' be', '');
      activeVerb = `${modal} ${toBaseFromV3(v3)}`;
      tenseLabel = { en: `Modal (${modal})`, bn: `Modal (${modal})` };
    } else {
      const base = toBaseFromV3(v3);
      activeVerb = !isPluralSubject(activeSubj) && activeSubj.toLowerCase() !== 'i' && activeSubj.toLowerCase() !== 'you'
        ? `${base}s`
        : base;
    }

    const converted = `${activeSubj} ${activeVerb} ${activeObj}.`;
    return {
      input: raw,
      converted,
      direction: 'passive-to-active',
      detectedVoice: { en: 'Passive Voice', bn: 'Passive Voice · কর্মবাচ্য' },
      tenseLabel,
      swapDiagram: {
        activeNodes: [
          { role: { en: 'New Subject (Agent)', bn: 'নতুন কর্তা' }, text: activeSubj },
          { role: { en: 'Active Verb', bn: 'সক্রিয় ক্রিয়া' }, text: activeVerb },
          { role: { en: 'Restored Object', bn: 'পুনরুদ্ধারকৃত কর্ম' }, text: activeObj },
        ],
        passiveNodes: [
          { role: { en: 'Passive Subject', bn: 'Passive কর্তা' }, text: passSubj },
          { role: { en: 'Be + V3', bn: 'সহায়ক + V3' }, text: `${aux}${beingWord ? ' being' : ''} ${v3}` },
          { role: { en: 'By + Agent', bn: 'দ্বারা + কর্তা' }, text: `by ${agent}` },
        ],
      },
      rules: [
        {
          title: { en: 'Agent Promotion', bn: 'Agent-কে কর্তা করা' },
          detail: {
            en: `"by ${agent}" moves to the subject position as "${activeSubj}", and "${aux} ${v3}" simplifies to "${activeVerb}".`,
            bn: `"by ${agent}" শুরুতে "${activeSubj}" হিসেবে বসেছে এবং ক্রিয়া "${activeVerb}" রূপে ফিরে এসেছে।`,
          },
        },
      ],
      elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
    };
  }

  return solveActiveToPassive(raw, startMs);
}

export function solveVoice(
  input: string,
  mode: 'auto' | 'active-to-passive' | 'passive-to-active' = 'auto',
): VoiceResult {
  const startMs = performance.now();
  const trimmed = input.trim();
  const looksPassive =
    /\b(am|is|are|was|were|be|been)\s+(?:being\s+)?[a-z]+(ed|en|wn|nt|de|ne|ht)\s+by\b/i.test(
      trimmed,
    );
  const direction =
    mode === 'auto' ? (looksPassive ? 'passive-to-active' : 'active-to-passive') : mode;

  return direction === 'passive-to-active'
    ? solvePassiveToActive(trimmed, startMs)
    : solveActiveToPassive(trimmed, startMs);
}
