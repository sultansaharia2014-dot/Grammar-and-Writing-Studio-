import { AffixSuggestion, BilingualText, MorphemeAnalysis, MorphemeResult } from '../types/studio';

interface AffixEntry {
  affix: string;
  meaning: BilingualText;
  resultPos?: string;
}

const PREFIXES: AffixEntry[] = [
  { affix: 'inter', meaning: { en: 'between / among', bn: 'মধ্যে / পারস্পরিক' } },
  { affix: 'trans', meaning: { en: 'across / beyond', bn: 'অন্যপারে / রূপান্তর' } },
  { affix: 'super', meaning: { en: 'above / beyond', bn: 'অতিরিক্ত / শ্রেষ্ঠ' } },
  { affix: 'under', meaning: { en: 'below / insufficient', bn: 'নিচে / অপর্যাপ্ত' } },
  { affix: 'over', meaning: { en: 'excessive / above', bn: 'অতিরিক্ত / উপরে' } },
  { affix: 'anti', meaning: { en: 'against / opposite', bn: 'বিরুদ্ধে / প্রতিরোধী' } },
  { affix: 'auto', meaning: { en: 'self', bn: 'স্বয়ংক্রিয়' } },
  { affix: 'semi', meaning: { en: 'half / partly', bn: 'অর্ধ / আংশিক' } },
  { affix: 'mis', meaning: { en: 'wrongly / badly', bn: 'ভুলভাবে' } },
  { affix: 'dis', meaning: { en: 'not / opposite of', bn: 'না / বিপরীত' } },
  { affix: 'pre', meaning: { en: 'before', bn: 'পূর্বে / আগে' } },
  { affix: 'sub', meaning: { en: 'under / secondary', bn: 'নিচে / উপ-' } },
  { affix: 'non', meaning: { en: 'not / without', bn: 'নয় / বিহীন' } },
  { affix: 'out', meaning: { en: 'exceeding / outer', bn: 'অতিক্রম / বাহির' } },
  { affix: 'un', meaning: { en: 'not / reverse', bn: 'না-বোধক / বিপরীত' } },
  { affix: 'in', meaning: { en: 'not / into', bn: 'নয় / ভেতরে' } },
  { affix: 'im', meaning: { en: 'not (before b/m/p)', bn: 'না-বোধক (b/m/p এর আগে)' } },
  { affix: 'il', meaning: { en: 'not (before l)', bn: 'না-বোধক (l এর আগে)' } },
  { affix: 'ir', meaning: { en: 'not (before r)', bn: 'না-বোধক (r এর আগে)' } },
  { affix: 're', meaning: { en: 'again / back', bn: 'পুনরায় / ফিরে' } },
  { affix: 'en', meaning: { en: 'cause to be / put in', bn: 'পরিণত করা' } },
  { affix: 'em', meaning: { en: 'cause to be (before b/p)', bn: 'পরিণত করা' } },
  { affix: 'de', meaning: { en: 'remove / reverse', bn: 'অপসারণ / বিপরীত' } },
];

const SUFFIXES: AffixEntry[] = [
  { affix: 'ization', meaning: { en: 'process of making', bn: 'প্রক্রিয়া (Noun)' }, resultPos: 'Noun' },
  { affix: 'isation', meaning: { en: 'process of making', bn: 'প্রক্রিয়া (Noun)' }, resultPos: 'Noun' },
  { affix: 'fulness', meaning: { en: 'state of being full of', bn: 'পূর্ণ অবস্থা (Noun)' }, resultPos: 'Noun' },
  { affix: 'lessness', meaning: { en: 'state of lacking', bn: 'অভাবের অবস্থা (Noun)' }, resultPos: 'Noun' },
  { affix: 'lessly', meaning: { en: 'without / lacking manner', bn: 'হীনভাবে (Adverb)' }, resultPos: 'Adverb' },
  { affix: 'fully', meaning: { en: 'in a manner full of', bn: 'পূর্ণভাবে (Adverb)' }, resultPos: 'Adverb' },
  { affix: 'ation', meaning: { en: 'action or process', bn: 'কার্য বা প্রক্রিয়া (Noun)' }, resultPos: 'Noun' },
  { affix: 'ition', meaning: { en: 'state or action', bn: 'অবস্থা বা কার্য (Noun)' }, resultPos: 'Noun' },
  { affix: 'ment', meaning: { en: 'action, state, or result', bn: 'অবস্থা বা ফলাফল (Noun)' }, resultPos: 'Noun' },
  { affix: 'ness', meaning: { en: 'state or quality of', bn: 'গুণ বা অবস্থা (Noun)' }, resultPos: 'Noun' },
  { affix: 'able', meaning: { en: 'capable of being', bn: 'যোগ্য / সক্ষম (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'ible', meaning: { en: 'capable of being', bn: 'যোগ্য / সক্ষম (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'less', meaning: { en: 'without / lacking', bn: 'বিহীন / হীন (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'tion', meaning: { en: 'state or action', bn: 'অবস্থা বা কার্য (Noun)' }, resultPos: 'Noun' },
  { affix: 'sion', meaning: { en: 'state or action', bn: 'অবস্থা বা কার্য (Noun)' }, resultPos: 'Noun' },
  { affix: 'ship', meaning: { en: 'position or relationship', bn: 'পদমর্যাদা বা সম্পর্ক (Noun)' }, resultPos: 'Noun' },
  { affix: 'hood', meaning: { en: 'state or condition', bn: 'অবস্থা বা কাল (Noun)' }, resultPos: 'Noun' },
  { affix: 'ious', meaning: { en: 'characterized by', bn: 'গুণবিশিষ্ট (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'ous', meaning: { en: 'full of / having', bn: 'পূর্ণ / বিশিষ্ট (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'ive', meaning: { en: 'tending to / quality', bn: 'প্রবণ / গুণবাচক (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'ful', meaning: { en: 'full of', bn: 'পূর্ণ (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'ize', meaning: { en: 'to make or become', bn: 'পরিণত করা (Verb)' }, resultPos: 'Verb' },
  { affix: 'ise', meaning: { en: 'to make or become', bn: 'পরিণত করা (Verb)' }, resultPos: 'Verb' },
  { affix: 'ify', meaning: { en: 'to make or cause', bn: 'করা বা পরিণত করা (Verb)' }, resultPos: 'Verb' },
  { affix: 'ity', meaning: { en: 'quality or condition', bn: 'গুণ বা অবস্থা (Noun)' }, resultPos: 'Noun' },
  { affix: 'ing', meaning: { en: 'action / present participle', bn: 'চলমান ক্রিয়া / গুণ' }, resultPos: 'Adjective' },
  { affix: 'ist', meaning: { en: 'person who practices', bn: 'ব্যক্তি / বিশেষজ্ঞ (Noun)' }, resultPos: 'Noun' },
  { affix: 'ism', meaning: { en: 'belief or system', bn: 'মতবাদ বা ব্যবস্থা (Noun)' }, resultPos: 'Noun' },
  { affix: 'est', meaning: { en: 'superlative degree', bn: 'সর্বোচ্চ মাত্রা (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'al', meaning: { en: 'relating to', bn: 'সম্পর্কিত (Adjective)' }, resultPos: 'Adjective' },
  { affix: 'ly', meaning: { en: 'in a manner / quality', bn: 'ভাবে / ধরন (Adverb)' }, resultPos: 'Adverb' },
  { affix: 'er', meaning: { en: 'one who / comparative', bn: 'কর্তা / তুলনামূলক' }, resultPos: 'Noun' },
  { affix: 'or', meaning: { en: 'one who performs', bn: 'কর্তা / কারক (Noun)' }, resultPos: 'Noun' },
  { affix: 'en', meaning: { en: 'to make / made of', bn: 'করা বা তৈরি (Verb/Adj)' }, resultPos: 'Verb' },
  { affix: 'ed', meaning: { en: 'past / having quality', bn: 'অতীত বা গুণবিশিষ্ট' }, resultPos: 'Adjective' },
  { affix: 'y', meaning: { en: 'quality or full of', bn: 'গুণ বা বৈশিষ্ট্য' }, resultPos: 'Noun' },
];

interface RootFamily {
  root: string;
  pos: string;
  meaning: BilingualText;
  prefixes: Array<{ affix: string; result: string; pos: string; en: string; bn: string }>;
  suffixes: Array<{ affix: string; result: string; pos: string; en: string; bn: string }>;
  combined?: Array<{ formula: string; result: string; pos: string; en: string; bn: string }>;
}

const ROOT_FAMILIES: Record<string, RootFamily> = {
  happy: {
    root: 'happy',
    pos: 'Adjective',
    meaning: { en: 'feeling or showing joy and contentment', bn: 'সুখী বা আনন্দিত' },
    prefixes: [
      { affix: 'un-', result: 'unhappy', pos: 'Adjective', en: 'not happy; sad', bn: 'অসুখী / দুঃখিত' },
    ],
    suffixes: [
      { affix: '-ness', result: 'happiness', pos: 'Noun', en: 'state of being happy (y → i)', bn: 'সুখ / আনন্দ' },
      { affix: '-ly', result: 'happily', pos: 'Adverb', en: 'in a joyful manner (y → i)', bn: 'আনন্দের সাথে' },
      { affix: '-er', result: 'happier', pos: 'Adjective', en: 'more happy (comparative)', bn: 'অধিকতর সুখী' },
      { affix: '-est', result: 'happiest', pos: 'Adjective', en: 'most happy (superlative)', bn: 'সবচেয়ে সুখী' },
    ],
    combined: [
      { formula: 'un- + happy + -ness', result: 'unhappiness', pos: 'Noun', en: 'state of sadness', bn: 'অসুখ / বিষাদ' },
      { formula: 'un- + happy + -ly', result: 'unhappily', pos: 'Adverb', en: 'in an unhappy way', bn: 'দুঃখজনকভাবে' },
    ],
  },
  honest: {
    root: 'honest',
    pos: 'Adjective',
    meaning: { en: 'truthful, sincere, and trustworthy', bn: 'সৎ বা সত্যবাদী' },
    prefixes: [
      { affix: 'dis-', result: 'dishonest', pos: 'Adjective', en: 'not honest; deceitful', bn: 'অসৎ' },
    ],
    suffixes: [
      { affix: '-y', result: 'honesty', pos: 'Noun', en: 'quality of being honest', bn: 'সততা' },
      { affix: '-ly', result: 'honestly', pos: 'Adverb', en: 'in an honest manner', bn: 'সততার সাথে' },
    ],
    combined: [
      { formula: 'dis- + honest + -y', result: 'dishonesty', pos: 'Noun', en: 'lack of honesty', bn: 'অসততা' },
      { formula: 'dis- + honest + -ly', result: 'dishonestly', pos: 'Adverb', en: 'in a dishonest way', bn: 'অসৎভাবে' },
    ],
  },
  possible: {
    root: 'possible',
    pos: 'Adjective',
    meaning: { en: 'able to happen or be done', bn: 'সম্ভব' },
    prefixes: [
      { affix: 'im-', result: 'impossible', pos: 'Adjective', en: 'not possible (im- before p)', bn: 'অসম্ভব' },
    ],
    suffixes: [
      { affix: '-ity', result: 'possibility', pos: 'Noun', en: 'chance that something may happen', bn: 'সম্ভাবনা' },
      { affix: '-ly', result: 'possibly', pos: 'Adverb', en: 'perhaps / maybe', bn: 'সম্ভবত' },
    ],
    combined: [
      { formula: 'im- + possible + -ity', result: 'impossibility', pos: 'Noun', en: 'state of being impossible', bn: 'অসম্ভবতা' },
      { formula: 'im- + possible + -ly', result: 'impossibly', pos: 'Adverb', en: 'to an impossible degree', bn: 'অসম্ভবভাবে' },
    ],
  },
  legal: {
    root: 'legal',
    pos: 'Adjective',
    meaning: { en: 'permitted by law', bn: 'বৈধ / আইনগত' },
    prefixes: [
      { affix: 'il-', result: 'illegal', pos: 'Adjective', en: 'against the law (il- before l)', bn: 'অবৈধ' },
    ],
    suffixes: [
      { affix: '-ly', result: 'legally', pos: 'Adverb', en: 'according to law', bn: 'আইনগতভাবে' },
      { affix: '-ity', result: 'legality', pos: 'Noun', en: 'quality of being lawful', bn: 'বৈধতা' },
      { affix: '-ize', result: 'legalize', pos: 'Verb', en: 'make lawful', bn: 'বৈধ করা' },
    ],
    combined: [
      { formula: 'il- + legal + -ly', result: 'illegally', pos: 'Adverb', en: 'unlawfully', bn: 'অবৈধভাবে' },
      { formula: 'il- + legal + -ity', result: 'illegality', pos: 'Noun', en: 'unlawful status', bn: 'অবৈধতা' },
    ],
  },
  regular: {
    root: 'regular',
    pos: 'Adjective',
    meaning: { en: 'happening at steady intervals; consistent', bn: 'নিয়মিত' },
    prefixes: [
      { affix: 'ir-', result: 'irregular', pos: 'Adjective', en: 'not regular (ir- before r)', bn: 'অনিয়মিত' },
    ],
    suffixes: [
      { affix: '-ly', result: 'regularly', pos: 'Adverb', en: 'at uniform intervals', bn: 'নিয়মিতভাবে' },
      { affix: '-ity', result: 'regularity', pos: 'Noun', en: 'state of being regular', bn: 'নিয়মানুবর্তিতা' },
      { affix: '-ize', result: 'regularize', pos: 'Verb', en: 'make regular', bn: 'নিয়মিত করা' },
    ],
    combined: [
      { formula: 'ir- + regular + -ly', result: 'irregularly', pos: 'Adverb', en: 'in an uneven way', bn: 'অনিয়মিতভাবে' },
      { formula: 'ir- + regular + -ity', result: 'irregularity', pos: 'Noun', en: 'lack of regularity', bn: 'অনিয়ম' },
    ],
  },
  moral: {
    root: 'moral',
    pos: 'Adjective / Noun',
    meaning: { en: 'concerned with right and wrong behavior', bn: 'নৈতিক' },
    prefixes: [
      { affix: 'im-', result: 'immoral', pos: 'Adjective', en: 'not moral (im- before m)', bn: 'অনৈতিক' },
      { affix: 'a-', result: 'amoral', pos: 'Adjective', en: 'unconcerned with morality', bn: 'নীতি-নিরপেক্ষ' },
    ],
    suffixes: [
      { affix: '-ity', result: 'morality', pos: 'Noun', en: 'principles of right conduct', bn: 'নৈতিকতা' },
      { affix: '-ly', result: 'morally', pos: 'Adverb', en: 'in a moral sense', bn: 'নৈতিকভাবে' },
      { affix: '-ize', result: 'moralize', pos: 'Verb', en: 'comment on morals', bn: 'নীতি উপদেশ দেওয়া' },
    ],
    combined: [
      { formula: 'im- + moral + -ity', result: 'immorality', pos: 'Noun', en: 'wicked or unethical behavior', bn: 'অনৈতিকতা' },
    ],
  },
  polite: {
    root: 'polite',
    pos: 'Adjective',
    meaning: { en: 'respectful and considerate in manner', bn: 'ভদ্র / বিনয়ী' },
    prefixes: [
      { affix: 'im-', result: 'impolite', pos: 'Adjective', en: 'rude; not polite (im- before p)', bn: 'অভদ্র' },
    ],
    suffixes: [
      { affix: '-ly', result: 'politely', pos: 'Adverb', en: 'in a courteous manner', bn: 'ভদ্রভাবে' },
      { affix: '-ness', result: 'politeness', pos: 'Noun', en: 'courteous behavior', bn: 'ভদ্রতা / বিনয়' },
    ],
    combined: [
      { formula: 'im- + polite + -ly', result: 'impolitely', pos: 'Adverb', en: 'rudely', bn: 'অভদ্রভাবে' },
      { formula: 'im- + polite + -ness', result: 'impoliteness', pos: 'Noun', en: 'rudeness', bn: 'অভদ্রতা' },
    ],
  },
  patient: {
    root: 'patient',
    pos: 'Adjective / Noun',
    meaning: { en: 'calm under delay or difficulty', bn: 'ধৈর্যশীল' },
    prefixes: [
      { affix: 'im-', result: 'impatient', pos: 'Adjective', en: 'restless; lacking patience', bn: 'অধৈর্য' },
    ],
    suffixes: [
      { affix: '-ly', result: 'patiently', pos: 'Adverb', en: 'with calm endurance', bn: 'ধৈর্যের সাথে' },
      { affix: '-ce', result: 'patience', pos: 'Noun', en: 'capacity to wait calmly', bn: 'ধৈর্য' },
    ],
    combined: [
      { formula: 'im- + patient + -ly', result: 'impatiently', pos: 'Adverb', en: 'eagerly / restlessly', bn: 'অধৈর্যভাবে' },
      { formula: 'im- + patient + -ce', result: 'impatience', pos: 'Noun', en: 'lack of patience', bn: 'অধৈর্যতা' },
    ],
  },
  literate: {
    root: 'literate',
    pos: 'Adjective',
    meaning: { en: 'able to read and write', bn: 'শিক্ষিত / সাক্ষর' },
    prefixes: [
      { affix: 'il-', result: 'illiterate', pos: 'Adjective', en: 'unable to read or write (il- before l)', bn: 'নিরক্ষর' },
    ],
    suffixes: [
      { affix: '-cy', result: 'literacy', pos: 'Noun', en: 'ability to read and write', bn: 'সাক্ষরতা' },
    ],
    combined: [
      { formula: 'il- + literate + -cy', result: 'illiteracy', pos: 'Noun', en: 'inability to read and write', bn: 'নিরক্ষরতা' },
    ],
  },
  responsible: {
    root: 'responsible',
    pos: 'Adjective',
    meaning: { en: 'dependable and accountable for duties', bn: 'দায়িত্বশীল' },
    prefixes: [
      { affix: 'ir-', result: 'irresponsible', pos: 'Adjective', en: 'not showing care for duty', bn: 'দায়িত্বহীন' },
    ],
    suffixes: [
      { affix: '-ly', result: 'responsibly', pos: 'Adverb', en: 'in a dependable way', bn: 'দায়িত্বশীলভাবে' },
      { affix: '-ity', result: 'responsibility', pos: 'Noun', en: 'duty or obligation', bn: 'দায়িত্ব' },
    ],
    combined: [
      { formula: 'ir- + responsible + -ly', result: 'irresponsibly', pos: 'Adverb', en: 'carelessly', bn: 'দায়িত্বহীনভাবে' },
      { formula: 'ir- + responsible + -ity', result: 'irresponsibility', pos: 'Noun', en: 'lack of responsibility', bn: 'দায়িত্বহীনতা' },
    ],
  },
  nation: {
    root: 'nation',
    pos: 'Noun',
    meaning: { en: 'a country or community united by history', bn: 'জাতি বা রাষ্ট্র' },
    prefixes: [
      { affix: 'inter-', result: 'internation', pos: 'Noun (stem)', en: 'between nations', bn: 'আন্তঃজাতীয়' },
      { affix: 'multi-', result: 'multination', pos: 'Noun (stem)', en: 'many nations', bn: 'বহুজাতিক' },
    ],
    suffixes: [
      { affix: '-al', result: 'national', pos: 'Adjective', en: 'relating to a nation', bn: 'জাতীয়' },
      { affix: '-hood', result: 'nationhood', pos: 'Noun', en: 'status of being a nation', bn: 'জাতীয়তা / রাষ্ট্রত্ব' },
      { affix: '-wide', result: 'nationwide', pos: 'Adjective / Adv', en: 'across the whole nation', bn: 'দেশব্যাপী' },
    ],
    combined: [
      { formula: 'inter- + nation + -al', result: 'international', pos: 'Adjective', en: 'between countries', bn: 'আন্তর্জাতিক' },
      { formula: 'nation + -al + -ity', result: 'nationality', pos: 'Noun', en: 'citizenship', bn: 'জাতীয়তা' },
    ],
  },
  agree: {
    root: 'agree',
    pos: 'Verb',
    meaning: { en: 'to share the same opinion or consent', bn: 'একমত হওয়া' },
    prefixes: [
      { affix: 'dis-', result: 'disagree', pos: 'Verb', en: 'have a different opinion', bn: 'ভিন্নমত হওয়া' },
    ],
    suffixes: [
      { affix: '-ment', result: 'agreement', pos: 'Noun', en: 'harmony or contract', bn: 'চুক্তি / সম্মতি' },
      { affix: '-able', result: 'agreeable', pos: 'Adjective', en: 'pleasant / acceptable', bn: 'সম্মত / মনোরম' },
      { affix: '-ably', result: 'agreeably', pos: 'Adverb', en: 'in a pleasant way', bn: 'সম্মতিসহকারে' },
    ],
    combined: [
      { formula: 'dis- + agree + -ment', result: 'disagreement', pos: 'Noun', en: 'difference of opinion', bn: 'মতবিরোধ' },
      { formula: 'dis- + agree + -able', result: 'disagreeable', pos: 'Adjective', en: 'unpleasant', bn: 'অপ্রীতিকর' },
    ],
  },
  care: {
    root: 'care',
    pos: 'Noun / Verb',
    meaning: { en: 'serious attention, caution, or affection', bn: 'যত্ন বা মনোযোগ' },
    prefixes: [
      { affix: 'un-', result: 'uncaring', pos: 'Adjective (with -ing)', en: 'not showing kindness', bn: 'উদাসীন' },
    ],
    suffixes: [
      { affix: '-ful', result: 'careful', pos: 'Adjective', en: 'full of caution', bn: 'সতর্ক / যত্নশীল' },
      { affix: '-less', result: 'careless', pos: 'Adjective', en: 'without attention', bn: 'অসতর্ক' },
      { affix: '-fully', result: 'carefully', pos: 'Adverb', en: 'with great caution', bn: 'সতর্কতার সাথে' },
      { affix: '-lessly', result: 'carelessly', pos: 'Adverb', en: 'without care', bn: 'অসতর্কভাবে' },
    ],
    combined: [
      { formula: 'care + -less + -ness', result: 'carelessness', pos: 'Noun', en: 'lack of attention', bn: 'অসতর্কতা' },
    ],
  },
  kind: {
    root: 'kind',
    pos: 'Adjective',
    meaning: { en: 'friendly, generous, and considerate', bn: 'দয়ালু' },
    prefixes: [
      { affix: 'un-', result: 'unkind', pos: 'Adjective', en: 'not kind; harsh', bn: 'নিষ্ঠুর / অদয়ালু' },
    ],
    suffixes: [
      { affix: '-ness', result: 'kindness', pos: 'Noun', en: 'quality of being kind', bn: 'দয়া' },
      { affix: '-ly', result: 'kindly', pos: 'Adverb', en: 'in a gentle way', bn: 'দয়াপরবশ হয়ে' },
    ],
    combined: [
      { formula: 'un- + kind + -ness', result: 'unkindness', pos: 'Noun', en: 'cruel behavior', bn: 'নিষ্ঠুরতা' },
      { formula: 'un- + kind + -ly', result: 'unkindly', pos: 'Adverb', en: 'harshly', bn: 'কঠোরভাবে' },
    ],
  },
  beauty: {
    root: 'beauty',
    pos: 'Noun',
    meaning: { en: 'qualities that please the senses or mind', bn: 'সৌন্দর্য' },
    prefixes: [],
    suffixes: [
      { affix: '-ful', result: 'beautiful', pos: 'Adjective', en: 'pleasing to look at (y → i)', bn: 'সুন্দর' },
      { affix: '-fully', result: 'beautifully', pos: 'Adverb', en: 'in a lovely manner', bn: 'সুন্দরভাবে' },
      { affix: '-fy', result: 'beautify', pos: 'Verb', en: 'improve appearance (y → i)', bn: 'সুন্দর করা' },
    ],
    combined: [
      { formula: 'beauty + -fi + -cation', result: 'beautification', pos: 'Noun', en: 'process of making beautiful', bn: 'সৌন্দর্যবর্ধন' },
    ],
  },
  educate: {
    root: 'educate',
    pos: 'Verb',
    meaning: { en: 'to teach and develop knowledge', bn: 'শিক্ষা দেওয়া' },
    prefixes: [
      { affix: 're-', result: 're-educate', pos: 'Verb', en: 'educate anew', bn: 'পুনঃশিক্ষা দেওয়া' },
      { affix: 'un-', result: 'uneducated', pos: 'Adjective (with -ed)', en: 'lacking schooling', bn: 'অশিক্ষিত' },
    ],
    suffixes: [
      { affix: '-ion', result: 'education', pos: 'Noun', en: 'process of teaching/learning', bn: 'শিক্ষা' },
      { affix: '-al', result: 'educational', pos: 'Adjective', en: 'relating to learning', bn: 'শিক্ষামূলক' },
      { affix: '-or', result: 'educator', pos: 'Noun', en: 'a teacher or instructor', bn: 'শিক্ষক' },
      { affix: '-ed', result: 'educated', pos: 'Adjective', en: 'having good schooling', bn: 'শিক্ষিত' },
    ],
    combined: [
      { formula: 'un- + educate + -ed', result: 'uneducated', pos: 'Adjective', en: 'not educated', bn: 'অশিক্ষিত' },
      { formula: 'educate + -ion + -ally', result: 'educationally', pos: 'Adverb', en: 'in educational terms', bn: 'শিক্ষাগতভাবে' },
    ],
  },
  use: {
    root: 'use',
    pos: 'Verb / Noun',
    meaning: { en: 'to employ for a purpose', bn: 'ব্যবহার / ব্যবহার করা' },
    prefixes: [
      { affix: 'mis-', result: 'misuse', pos: 'Verb / Noun', en: 'use wrongly', bn: 'অপব্যবহার' },
      { affix: 're-', result: 'reuse', pos: 'Verb', en: 'use again', bn: 'পুনর্ব্যবহার' },
      { affix: 'un-', result: 'unused', pos: 'Adjective (with -ed)', en: 'not yet used', bn: 'অব্যবহৃত' },
    ],
    suffixes: [
      { affix: '-ful', result: 'useful', pos: 'Adjective', en: 'helpful / practical', bn: 'উপকারী' },
      { affix: '-less', result: 'useless', pos: 'Adjective', en: 'serving no purpose', bn: 'অকেজো / নিরর্থক' },
      { affix: '-able', result: 'usable', pos: 'Adjective', en: 'fit to be used (drop e)', bn: 'ব্যবহারযোগ্য' },
      { affix: '-age', result: 'usage', pos: 'Noun', en: 'the way something is used', bn: 'ব্যবহারবিধি' },
    ],
    combined: [
      { formula: 'use + -ful + -ness', result: 'usefulness', pos: 'Noun', en: 'quality of being helpful', bn: 'উপকারিতা' },
      { formula: 're- + use + -able', result: 'reusable', pos: 'Adjective', en: 'can be used again', bn: 'পুনর্ব্যবহারযোগ্য' },
    ],
  },
  help: {
    root: 'help',
    pos: 'Verb / Noun',
    meaning: { en: 'to assist or make easier', bn: 'সাহায্য / সাহায্য করা' },
    prefixes: [
      { affix: 'un-', result: 'unhelpful', pos: 'Adjective (with -ful)', en: 'not offering help', bn: 'অসহযোগী' },
    ],
    suffixes: [
      { affix: '-ful', result: 'helpful', pos: 'Adjective', en: 'ready to give help', bn: 'সহায়ক' },
      { affix: '-less', result: 'helpless', pos: 'Adjective', en: 'unable to defend oneself', bn: 'অসহায়' },
      { affix: '-er', result: 'helper', pos: 'Noun', en: 'one who assists', bn: 'সাহায্যকারী' },
    ],
    combined: [
      { formula: 'help + -less + -ness', result: 'helplessness', pos: 'Noun', en: 'state of being helpless', bn: 'অসহায়ত্ব' },
    ],
  },
  friend: {
    root: 'friend',
    pos: 'Noun',
    meaning: { en: 'a person one knows and trusts', bn: 'বন্ধু' },
    prefixes: [
      { affix: 'be-', result: 'befriend', pos: 'Verb', en: 'act as a friend to', bn: 'বন্ধুত্ব করা' },
      { affix: 'un-', result: 'unfriendly', pos: 'Adjective (with -ly)', en: 'not warm or welcoming', bn: 'অবন্ধুসুলভ' },
    ],
    suffixes: [
      { affix: '-ship', result: 'friendship', pos: 'Noun', en: 'bond between friends', bn: 'বন্ধুত্ব' },
      { affix: '-ly', result: 'friendly', pos: 'Adjective', en: 'kind and pleasant', bn: 'বন্ধুত্বপূর্ণ' },
      { affix: '-less', result: 'friendless', pos: 'Adjective', en: 'having no friends', bn: 'বন্ধুহীন' },
    ],
    combined: [
      { formula: 'un- + friend + -ly', result: 'unfriendly', pos: 'Adjective', en: 'hostile or cold', bn: 'অবন্ধুসুলভ' },
    ],
  },
  comfort: {
    root: 'comfort',
    pos: 'Noun / Verb',
    meaning: { en: 'a state of physical or emotional ease', bn: 'আরাম / সান্ত্বনা' },
    prefixes: [
      { affix: 'dis-', result: 'discomfort', pos: 'Noun / Verb', en: 'slight pain or unease', bn: 'অস্বস্তি' },
    ],
    suffixes: [
      { affix: '-able', result: 'comfortable', pos: 'Adjective', en: 'giving ease', bn: 'আরামদায়ক' },
      { affix: '-ably', result: 'comfortably', pos: 'Adverb', en: 'in ease', bn: 'আরামের সাথে' },
    ],
    combined: [
      { formula: 'un- + comfort + -able', result: 'uncomfortable', pos: 'Adjective', en: 'causing unease', bn: 'অস্বস্তিকর' },
    ],
  },
  success: {
    root: 'success',
    pos: 'Noun',
    meaning: { en: 'the accomplishment of an aim or purpose', bn: 'সফলতা' },
    prefixes: [
      { affix: 'un-', result: 'unsuccessful', pos: 'Adjective (with -ful)', en: 'failing to achieve aim', bn: 'ব্যর্থ' },
    ],
    suffixes: [
      { affix: '-ful', result: 'successful', pos: 'Adjective', en: 'achieving desired aims', bn: 'সফল' },
      { affix: '-fully', result: 'successfully', pos: 'Adverb', en: 'with a favorable result', bn: 'সফলভাবে' },
    ],
    combined: [
      { formula: 'un- + success + -fully', result: 'unsuccessfully', pos: 'Adverb', en: 'without success', bn: 'ব্যর্থভাবে' },
    ],
  },
  create: {
    root: 'create',
    pos: 'Verb',
    meaning: { en: 'to bring something new into existence', bn: 'সৃষ্টি করা' },
    prefixes: [
      { affix: 're-', result: 'recreate', pos: 'Verb', en: 'create again / refresh', bn: 'পুনর্নির্মাণ করা' },
    ],
    suffixes: [
      { affix: '-ion', result: 'creation', pos: 'Noun', en: 'act of creating (drop e)', bn: 'সৃষ্টি' },
      { affix: '-ive', result: 'creative', pos: 'Adjective', en: 'imaginative and original', bn: 'সৃজনশীল' },
      { affix: '-or', result: 'creator', pos: 'Noun', en: 'person who creates', bn: 'সৃষ্টিকর্তা / নির্মাতা' },
    ],
    combined: [
      { formula: 'create + -ive + -ity', result: 'creativity', pos: 'Noun', en: 'inventive imagination', bn: 'সৃজনশীলতা' },
    ],
  },
  active: {
    root: 'active',
    pos: 'Adjective',
    meaning: { en: 'engaged in energetic action', bn: 'সক্রিয়' },
    prefixes: [
      { affix: 'in-', result: 'inactive', pos: 'Adjective', en: 'not moving or working', bn: 'নিষ্ক্রিয়' },
      { affix: 'pro-', result: 'proactive', pos: 'Adjective', en: 'taking initiative ahead', bn: 'অগ্রসর / উদ্যোগী' },
    ],
    suffixes: [
      { affix: '-ly', result: 'actively', pos: 'Adverb', en: 'with energy', bn: 'সক্রিয়ভাবে' },
      { affix: '-ity', result: 'activity', pos: 'Noun', en: 'energetic action (drop e)', bn: 'কার্যকলাপ' },
      { affix: '-ate', result: 'activate', pos: 'Verb', en: 'make active', bn: 'সক্রিয় করা' },
    ],
    combined: [
      { formula: 'in- + active + -ity', result: 'inactivity', pos: 'Noun', en: 'lack of motion', bn: 'নিষ্ক্রিয়তা' },
    ],
  },
  pure: {
    root: 'pure',
    pos: 'Adjective',
    meaning: { en: 'clean, unmixed, and free of impurity', bn: 'খাঁটি / বিশুদ্ধ' },
    prefixes: [
      { affix: 'im-', result: 'impure', pos: 'Adjective', en: 'mixed with dirt/flaw (im- before p)', bn: 'অবিশুদ্ধ / ভেজাল' },
    ],
    suffixes: [
      { affix: '-ity', result: 'purity', pos: 'Noun', en: 'freedom from impurities', bn: 'বিশুদ্ধতা' },
      { affix: '-ly', result: 'purely', pos: 'Adverb', en: 'completely / solely', bn: 'সম্পূর্ণরূপে' },
      { affix: '-ify', result: 'purify', pos: 'Verb', en: 'make clean/pure', bn: 'বিশুদ্ধ করা' },
    ],
    combined: [
      { formula: 'im- + pure + -ity', result: 'impurity', pos: 'Noun', en: 'contaminating element', bn: 'ভেজাল / অশুদ্ধি' },
    ],
  },
  wise: {
    root: 'wise',
    pos: 'Adjective',
    meaning: { en: 'showing good judgment and knowledge', bn: 'জ্ঞানী' },
    prefixes: [
      { affix: 'un-', result: 'unwise', pos: 'Adjective', en: 'foolish; lacking wisdom', bn: 'অজ্ঞ / নির্বোধ' },
    ],
    suffixes: [
      { affix: '-dom', result: 'wisdom', pos: 'Noun', en: 'sound judgment (drop e)', bn: 'প্রজ্ঞা / জ্ঞান' },
      { affix: '-ly', result: 'wisely', pos: 'Adverb', en: 'with good judgment', bn: 'বুদ্ধিমত্তার সাথে' },
    ],
    combined: [
      { formula: 'un- + wise + -ly', result: 'unwisely', pos: 'Adverb', en: 'foolishly', bn: 'নির্বোধের মতো' },
    ],
  },
  danger: {
    root: 'danger',
    pos: 'Noun',
    meaning: { en: 'the possibility of harm or injury', bn: 'বিপদ' },
    prefixes: [
      { affix: 'en-', result: 'endanger', pos: 'Verb', en: 'put at risk', bn: 'বিপন্ন করা' },
    ],
    suffixes: [
      { affix: '-ous', result: 'dangerous', pos: 'Adjective', en: 'likely to cause harm', bn: 'বিপজ্জনক' },
      { affix: '-ously', result: 'dangerously', pos: 'Adverb', en: 'in an unsafe way', bn: 'বিপজ্জনকভাবে' },
    ],
    combined: [
      { formula: 'en- + danger + -ed', result: 'endangered', pos: 'Adjective', en: 'at risk of extinction', bn: 'বিপন্ন' },
    ],
  },
  power: {
    root: 'power',
    pos: 'Noun',
    meaning: { en: 'strength, authority, or energy', bn: 'শক্তি / ক্ষমতা' },
    prefixes: [
      { affix: 'em-', result: 'empower', pos: 'Verb', en: 'give authority/confidence (em- before p)', bn: 'ক্ষমতায়ন করা' },
      { affix: 'over-', result: 'overpower', pos: 'Verb', en: 'defeat with greater strength', bn: 'পরাস্ত করা' },
    ],
    suffixes: [
      { affix: '-ful', result: 'powerful', pos: 'Adjective', en: 'having great strength', bn: 'শক্তিশালী' },
      { affix: '-less', result: 'powerless', pos: 'Adjective', en: 'lacking ability/influence', bn: 'ক্ষমতাহীন' },
    ],
    combined: [
      { formula: 'em- + power + -ment', result: 'empowerment', pos: 'Noun', en: 'process of becoming stronger', bn: 'ক্ষমতায়ন' },
    ],
  },
  hope: {
    root: 'hope',
    pos: 'Noun / Verb',
    meaning: { en: 'feeling of expectation and desire', bn: 'আশা' },
    prefixes: [],
    suffixes: [
      { affix: '-ful', result: 'hopeful', pos: 'Adjective', en: 'feeling optimism', bn: 'আশাবাদী' },
      { affix: '-less', result: 'hopeless', pos: 'Adjective', en: 'feeling despair', bn: 'নিরাশ' },
      { affix: '-fully', result: 'hopefully', pos: 'Adverb', en: 'with optimism', bn: 'আশা নিয়ে' },
    ],
    combined: [
      { formula: 'hope + -less + -ness', result: 'hopelessness', pos: 'Noun', en: 'complete lack of hope', bn: 'হতাশা' },
    ],
  },
  hardwork: {
    root: 'hardwork',
    pos: 'Noun',
    meaning: { en: 'diligent, steady effort', bn: 'কঠোর পরিশ্রম' },
    prefixes: [],
    suffixes: [
      { affix: '-ing', result: 'hardworking', pos: 'Adjective', en: 'diligent and industrious', bn: 'পরিশ্রমী' },
    ],
  },
  mark: {
    root: 'mark',
    pos: 'Noun / Verb',
    meaning: { en: 'a sign, symbol, or notice', bn: 'চিহ্ন বা লক্ষ্য করা' },
    prefixes: [
      { affix: 're-', result: 'remark', pos: 'Verb / Noun', en: 'mention or comment', bn: 'মন্তব্য করা' },
    ],
    suffixes: [
      { affix: '-ed', result: 'marked', pos: 'Adjective', en: 'clearly noticeable', bn: 'চিহ্নিত' },
      { affix: '-er', result: 'marker', pos: 'Noun', en: 'an object that marks', bn: 'চিহ্নক' },
    ],
    combined: [
      { formula: 're- + mark + -able', result: 'remarkable', pos: 'Adjective', en: 'worthy of attention', bn: 'অসাধারণ / উল্লেখযোগ্য' },
      { formula: 'un- + re- + mark + -able', result: 'unremarkable', pos: 'Adjective', en: 'ordinary', bn: 'সাধারণ' },
    ],
  },
};

/**
 * Generates phonologically & orthographically valid prefix/suffix suggestions
 * even for general English words outside the curated dictionary.
 */
function generateSmartGeneralSuggestions(root: string): {
  prefixes: AffixSuggestion[];
  suffixes: AffixSuggestion[];
  combined: Array<{ formula: string; resultWord: string; pos: string; meaning: BilingualText }>;
} {
  const first = root[0] || '';
  let negPrefix = 'un-';
  let negDesc = { en: 'not / opposite of', bn: 'না-বোধক / বিপরীত' };
  if (first === 'l') {
    negPrefix = 'il-';
    negDesc = { en: 'not (il- assimilates before l)', bn: 'না-বোধক (l-এর আগে il-)' };
  } else if (first === 'r') {
    negPrefix = 'ir-';
    negDesc = { en: 'not (ir- assimilates before r)', bn: 'না-বোধক (r-এর আগে ir-)' };
  } else if (first === 'p' || first === 'm' || first === 'b') {
    negPrefix = 'im-';
    negDesc = { en: 'not (im- assimilates before b/m/p)', bn: 'না-বোধক (b/m/p-এর আগে im-)' };
  }

  const cleanPre = negPrefix.replace('-', '');
  const prefixes: AffixSuggestion[] = [
    {
      affix: negPrefix,
      resultWord: `${cleanPre}${root}`,
      pos: 'Opposite / Negation',
      meaning: negDesc,
    },
    {
      affix: 're-',
      resultWord: `re${root}`,
      pos: 'Verb / Action',
      meaning: { en: 'again / anew', bn: 'পুনরায়' },
    },
  ];

  // Spelling rules for suffixes
  const yToI = root.endsWith('y') && !/[aeiou]y$/.test(root) ? `${root.slice(0, -1)}i` : root;
  const dropE = root.endsWith('e') ? root.slice(0, -1) : root;
  const keepE = root;

  const suffixes: AffixSuggestion[] = [
    {
      affix: '-ness',
      resultWord: `${yToI}ness`,
      pos: 'Noun',
      meaning: { en: 'state or quality of', bn: 'অবস্থা বা গুণ (Noun)' },
    },
    {
      affix: '-ly',
      resultWord: `${yToI}ly`,
      pos: 'Adverb',
      meaning: { en: 'in that manner', bn: 'ভাবে / ধরন (Adverb)' },
    },
    {
      affix: '-ful',
      resultWord: `${yToI}ful`,
      pos: 'Adjective',
      meaning: { en: 'full of this quality', bn: 'পূর্ণ (Adjective)' },
    },
    {
      affix: '-able',
      resultWord: `${dropE}able`,
      pos: 'Adjective',
      meaning: { en: 'capable of being', bn: 'যোগ্য / সক্ষম (Adjective)' },
    },
    {
      affix: '-ment',
      resultWord: `${keepE}ment`,
      pos: 'Noun',
      meaning: { en: 'action or resulting state', bn: 'ফলাফল বা অবস্থা (Noun)' },
    },
  ];

  const combined = [
    {
      formula: `${negPrefix} + ${root} + -ness`,
      resultWord: `${cleanPre}${yToI}ness`,
      pos: 'Noun',
      meaning: { en: `state of lacking ${root}`, bn: `বিপরীত অবস্থা` },
    },
  ];

  return { prefixes, suffixes, combined };
}

function restoreRootStem(stem: string, suffix: string | null): string {
  if (!stem) return stem;
  if (stem.endsWith('i') && suffix && /^(ness|ly|ful|less|er|est|able)/.test(suffix)) {
    return `${stem.slice(0, -1)}y`;
  }
  if (suffix && /^(able|ible|ive|ation|ition|ing|ize|ise)/.test(suffix) && !/[aeiou]$/.test(stem)) {
    const candidateE = `${stem}e`;
    if (ROOT_FAMILIES[candidateE]) return candidateE;
    if (/(believ|creat|act|educat|observ|inspir|imagin|mov|lov|car|us|writ|mak)$/.test(stem)) {
      return candidateE;
    }
  }
  return stem;
}

function toSuggestionsFromFamily(family: RootFamily) {
  const recommendedPrefixes: AffixSuggestion[] = family.prefixes.map((p) => ({
    affix: p.affix,
    resultWord: p.result,
    pos: p.pos,
    meaning: { en: p.en, bn: p.bn },
  }));
  const recommendedSuffixes: AffixSuggestion[] = family.suffixes.map((s) => ({
    affix: s.affix,
    resultWord: s.result,
    pos: s.pos,
    meaning: { en: s.en, bn: s.bn },
  }));
  const combinedForms = (family.combined || []).map((c) => ({
    formula: c.formula,
    resultWord: c.result,
    pos: c.pos,
    meaning: { en: c.en, bn: c.bn },
  }));
  const derivatives = [
    { word: family.root, pos: 'Root', gloss: 'Base word' },
    ...family.prefixes.map((p) => ({ word: p.result, pos: p.pos, gloss: p.en })),
    ...family.suffixes.map((s) => ({ word: s.result, pos: s.pos, gloss: s.en })),
    ...(family.combined || []).map((c) => ({ word: c.result, pos: c.pos, gloss: c.en })),
  ];
  return { recommendedPrefixes, recommendedSuffixes, combinedForms, derivatives };
}

export function analyzeWordMorphemes(word: string): MorphemeAnalysis | null {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanWord.length < 2) return null;

  // 1. Direct Root Word Match! User typed a root word (e.g. "happy", "honest", "possible")
  const directFamily = ROOT_FAMILIES[cleanWord];
  if (directFamily) {
    const sugg = toSuggestionsFromFamily(directFamily);
    return {
      word,
      cleanWord,
      isRootInput: true,
      prefix: null,
      root: {
        text: directFamily.root,
        pos: directFamily.pos,
        meaning: directFamily.meaning,
      },
      suffix: null,
      classShift: {
        en: `Root Word (${directFamily.pos}) → Valid Prefixes & Suffixes`,
        bn: `মূল শব্দ (${directFamily.pos}) → সঠিক Prefix ও Suffix তালিকা`,
      },
      ...sugg,
    };
  }

  // 2. Check if cleanWord is one of the known affixed words inside ROOT_FAMILIES
  for (const family of Object.values(ROOT_FAMILIES)) {
    const preMatch = family.prefixes.find((p) => p.result === cleanWord);
    const sufMatch = family.suffixes.find((s) => s.result === cleanWord);
    const combMatch = (family.combined || []).find((c) => c.result === cleanWord);

    if (preMatch || sufMatch || combMatch) {
      let foundPre: { text: string; meaning: BilingualText } | null = null;
      let foundSuf: { text: string; meaning: BilingualText } | null = null;
      let shiftEn = 'Derived Form';

      if (preMatch) {
        const preEntry = PREFIXES.find((p) => p.affix === preMatch.affix.replace('-', ''));
        foundPre = {
          text: preMatch.affix,
          meaning: preEntry?.meaning || { en: preMatch.en, bn: preMatch.bn },
        };
        shiftEn = `${family.pos} → ${preMatch.pos} (Prefix)`;
      } else if (sufMatch) {
        const sufEntry = SUFFIXES.find((s) => s.affix === sufMatch.affix.replace('-', ''));
        foundSuf = {
          text: sufMatch.affix,
          meaning: sufEntry?.meaning || { en: sufMatch.en, bn: sufMatch.bn },
        };
        shiftEn = `${family.pos} → ${sufMatch.pos}`;
      } else if (combMatch) {
        const parts = combMatch.formula.split('+').map((p) => p.trim());
        const preText = parts.find((p) => p.endsWith('-')) || null;
        const sufText = parts.filter((p) => p.startsWith('-')).join('');
        if (preText) {
          const preEntry = PREFIXES.find((p) => p.affix === preText.replace('-', ''));
          foundPre = {
            text: preText,
            meaning: preEntry?.meaning || { en: 'prefix modifier', bn: 'উপসর্গ' },
          };
        }
        if (sufText) {
          const sufEntry = SUFFIXES.find((s) => s.affix === sufText.replace('-', ''));
          foundSuf = {
            text: sufText,
            meaning: sufEntry?.meaning || { en: combMatch.en, bn: combMatch.bn },
          };
        }
        shiftEn = `${family.pos} → ${combMatch.pos}`;
      }

      const sugg = toSuggestionsFromFamily(family);
      return {
        word,
        cleanWord,
        isRootInput: false,
        prefix: foundPre,
        root: {
          text: family.root,
          pos: family.pos,
          meaning: family.meaning,
        },
        suffix: foundSuf,
        classShift: { en: shiftEn, bn: `${shiftEn} রূপান্তর` },
        ...sugg,
      };
    }
  }

  // 3. Algorithmic Affix Splitting + Right Prefix/Suffix Generation for any word
  let working = cleanWord;
  let foundPrefix: AffixEntry | null = null;
  let foundSuffix: AffixEntry | null = null;

  for (const pre of PREFIXES) {
    if (working.startsWith(pre.affix) && working.length - pre.affix.length >= 3) {
      if (pre.affix === 'in' && /^(ter|to|de|sp)/.test(working.slice(2))) continue;
      if (pre.affix === 're' && /^(ad|al|qu|st|sp|ce)/.test(working.slice(2)) && working.length < 6) continue;
      foundPrefix = pre;
      working = working.slice(pre.affix.length);
      break;
    }
  }

  for (const suf of SUFFIXES) {
    if (working.endsWith(suf.affix) && working.length - suf.affix.length >= 3) {
      foundSuffix = suf;
      working = working.slice(0, working.length - suf.affix.length);
      break;
    }
  }

  if (!foundPrefix && !foundSuffix) {
    const smart = generateSmartGeneralSuggestions(cleanWord);
    return {
      word,
      cleanWord,
      isRootInput: true,
      prefix: null,
      root: {
        text: cleanWord,
        pos: 'Root Word',
        meaning: { en: `Base word "${cleanWord}" ready for prefixes & suffixes`, bn: `মূল শব্দ "${cleanWord}"-এর উপসর্গ ও প্রত্যয়` },
      },
      suffix: null,
      classShift: { en: 'Root Word → Valid Prefixes & Suffixes', bn: 'মূল শব্দ → সঠিক Prefix ও Suffix' },
      recommendedPrefixes: smart.prefixes,
      recommendedSuffixes: smart.suffixes,
      combinedForms: smart.combined,
      derivatives: [
        { word: cleanWord, pos: 'Root', gloss: 'Base root word' },
        ...smart.prefixes.map((p) => ({ word: p.resultWord, pos: p.pos, gloss: p.meaning.en })),
        ...smart.suffixes.map((s) => ({ word: s.resultWord, pos: s.pos, gloss: s.meaning.en })),
      ],
    };
  }

  const restoredRoot = restoreRootStem(working, foundSuffix?.affix ?? null);
  const rootFamily = ROOT_FAMILIES[restoredRoot];
  const smartOrFamily = rootFamily
    ? toSuggestionsFromFamily(rootFamily)
    : (() => {
        const smart = generateSmartGeneralSuggestions(restoredRoot);
        return {
          recommendedPrefixes: smart.prefixes,
          recommendedSuffixes: smart.suffixes,
          combinedForms: smart.combined,
          derivatives: [
            { word: restoredRoot, pos: 'Root', gloss: 'Base root word' },
            ...smart.prefixes.map((p) => ({ word: p.resultWord, pos: p.pos, gloss: p.meaning.en })),
            ...smart.suffixes.map((s) => ({ word: s.resultWord, pos: s.pos, gloss: s.meaning.en })),
          ],
        };
      })();

  const shiftEn = foundSuffix?.resultPos
    ? `Root → ${foundSuffix.resultPos}`
    : foundPrefix
      ? 'Prefix Applied'
      : 'Derived Form';
  const shiftBn = foundSuffix?.resultPos ? `মূল শব্দ → ${foundSuffix.resultPos}` : 'উপসর্গযুক্ত রূপ';

  return {
    word,
    cleanWord,
    isRootInput: false,
    prefix: foundPrefix ? { text: `${foundPrefix.affix}-`, meaning: foundPrefix.meaning } : null,
    root: {
      text: restoredRoot,
      pos: rootFamily?.pos || 'Root',
      meaning: rootFamily?.meaning || {
        en: `Core stem "${restoredRoot}" carrying primary meaning`,
        bn: `মূল ধাতু "${restoredRoot}" যা প্রধান অর্থ বহন করে`,
      },
    },
    suffix: foundSuffix ? { text: `-${foundSuffix.affix}`, meaning: foundSuffix.meaning } : null,
    classShift: { en: shiftEn, bn: shiftBn },
    ...smartOrFamily,
  };
}

export function solveMorphemes(input: string, selectedWord?: string): MorphemeResult {
  const startMs = performance.now();
  const trimmed = input.trim();
  const rawTokens = trimmed.split(/\s+/).filter(Boolean);
  const isSentence = rawTokens.length > 1;

  const tokens = rawTokens.map((raw) => {
    const clean = raw.toLowerCase().replace(/[^a-z]/g, '');
    const analysis = clean.length >= 2 ? analyzeWordMorphemes(raw) : null;
    const hasAffix = Boolean(analysis && (analysis.prefix || analysis.suffix));
    return { raw, clean, hasAffix, analysis };
  });

  let selectedAnalysis: MorphemeAnalysis | null = null;
  if (selectedWord) {
    const targetClean = selectedWord.toLowerCase().replace(/[^a-z]/g, '');
    selectedAnalysis =
      tokens.find((t) => t.clean === targetClean)?.analysis ?? analyzeWordMorphemes(selectedWord);
  } else {
    selectedAnalysis =
      tokens.find((t) => t.hasAffix)?.analysis ?? tokens.find((t) => t.analysis)?.analysis ?? null;
  }

  return {
    input: trimmed,
    isSentence,
    tokens,
    selectedAnalysis,
    elapsedMs: Math.max(0.2, Number((performance.now() - startMs).toFixed(2))),
  };
}
