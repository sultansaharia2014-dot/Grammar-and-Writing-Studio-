import {
  ExamDifficulty,
  ExamQuestion,
  GrammarExamTopic,
  GradedQuestionResult,
  MockExamGradeReport,
  MockExamPaper,
} from '../types/studio';

export const GRAMMAR_TOPIC_META: Record<
  GrammarExamTopic,
  { en: string; bn: string; short: string }
> = {
  narration: {
    en: 'Narration',
    bn: 'Narration · উক্তি পরিবর্তন',
    short: 'Narration',
  },
  voice: {
    en: 'Voice Change',
    bn: 'Voice · বাচ্য পরিবর্তন',
    short: 'Voice',
  },
  morpheme: {
    en: 'Suffix & Prefix',
    bn: 'Suffix & Prefix · উপসর্গ-প্রত্যয়',
    short: 'Suffix & Prefix',
  },
  pos: {
    en: 'Parts of Speech',
    bn: 'Parts of Speech · পদ প্রকরণ',
    short: 'Parts of Speech',
  },
  verbs: {
    en: 'Verb Changing',
    bn: 'Verb Changing · ক্রিয়ার রূপ',
    short: 'Verb Changing',
  },
};

export const ALL_GRAMMAR_TOPICS: GrammarExamTopic[] = [
  'narration',
  'voice',
  'morpheme',
  'pos',
  'verbs',
];

const QUESTION_BANK: ExamQuestion[] = [
  // NARRATION
  {
    id: 'nar-j-1',
    topic: 'narration',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'He said to me, "I am reading a book now."',
    answer: 'He told me that he was reading a book then.',
    acceptableAnswers: [
      'He told me that he was reading a book then.',
      'He said to me that he was reading a book then.',
    ],
    marks: 1,
    explanation: {
      en: 'Present Continuous changes to Past Continuous ("was reading"), "I" becomes "he", and "now" becomes "then".',
      bn: 'Present Continuous থেকে Past Continuous ("was reading"), "I" থেকে "he" এবং "now" থেকে "then" হয়।',
    },
  },
  {
    id: 'nar-j-2',
    topic: 'narration',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'Mother said, "The sun rises in the east."',
    answer: 'Mother said that the sun rises in the east.',
    acceptableAnswers: ['Mother said that the sun rises in the east.'],
    marks: 1,
    explanation: {
      en: 'Universal truth keeps the Present Simple tense unchanged after "that".',
      bn: 'চিরন্তন সত্য (Universal Truth) হলে reported speech-এর tense পরিবর্তন হয় না।',
    },
  },
  {
    id: 'nar-j-3',
    topic: 'narration',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'The teacher said to the students, "Always speak the truth."',
    answer: 'The teacher advised the students to speak the truth always.',
    acceptableAnswers: [
      'The teacher advised the students to speak the truth always.',
      'The teacher advised the students to always speak the truth.',
      'The teacher told the students to always speak the truth.',
    ],
    marks: 1,
    explanation: {
      en: 'An advisory imperative takes "advised" + object + "to" + base verb.',
      bn: 'উপদেশমূলক Imperative বাক্যে "advised" এবং verb-এর আগে "to" বসে।',
    },
  },
  {
    id: 'nar-s-1',
    topic: 'narration',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'She said to me, "Are you coming to the library tomorrow?"',
    answer: 'She asked me if I was coming to the library the next day.',
    acceptableAnswers: [
      'She asked me if I was coming to the library the next day.',
      'She asked me whether I was coming to the library the next day.',
      'She asked me if I was going to the library the next day.',
    ],
    marks: 1,
    explanation: {
      en: 'Yes/No questions use "asked ... if/whether" with assertive word order and change "tomorrow" to "the next day".',
      bn: 'প্রশ্নবোধক বাক্যে "asked ... if/whether" বসে এবং "tomorrow" পরিবর্তিত হয়ে "the next day" হয়।',
    },
  },
  {
    id: 'nar-s-2',
    topic: 'narration',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'He said, "What a beautiful morning it is!"',
    answer: 'He exclaimed with joy that it was a very beautiful morning.',
    acceptableAnswers: [
      'He exclaimed with joy that it was a very beautiful morning.',
      'He exclaimed that it was a very beautiful morning.',
      'He exclaimed with wonder that it was a very beautiful morning.',
    ],
    marks: 1,
    explanation: {
      en: 'Exclamatory sentences starting with "What a..." change to "exclaimed with joy/wonder that ... was a very ...".',
      bn: 'বিস্ময়সূচক বাক্য "exclaimed with joy/wonder that" হয়ে assertive কাঠামোতে রূপান্তরিত হয়।',
    },
  },
  {
    id: 'nar-s-3',
    topic: 'narration',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Direct Speech:',
    prompt: 'He told me that he had finished his homework the previous day.',
    answer: 'He said to me, "I finished my homework yesterday."',
    acceptableAnswers: [
      'He said to me, "I finished my homework yesterday."',
      'He said to me, "I have finished my homework yesterday."',
    ],
    marks: 1,
    explanation: {
      en: '"told" reverses to "said to", Past Perfect reverses to Past Indefinite, and "the previous day" returns to "yesterday".',
      bn: '"told" থেকে "said to", Past Perfect থেকে Past Indefinite এবং "the previous day" থেকে "yesterday" হয়।',
    },
  },
  {
    id: 'nar-h-1',
    topic: 'narration',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'Rakib said to Abdullah, "Hey, friend, I am waiting for you."',
    answer: 'Addressing Abdullah as friend, Rakib told him that he was waiting for him.',
    acceptableAnswers: [
      'Addressing Abdullah as friend, Rakib told him that he was waiting for him.',
      'Addressing Abdullah as a friend, Rakib told him that he was waiting for him.',
      'Addressing him as friend, Rakib told Abdullah that he was waiting for him.',
    ],
    marks: 1,
    explanation: {
      en: 'Vocative words like "friend" are introduced with "Addressing ... as friend," followed by standard indirect narration.',
      bn: 'সম্বোধন পদ থাকলে শুরুতে "Addressing ... as ..." যুক্ত করে বাকি অংশ Indirect Narration করা হয়।',
    },
  },
  {
    id: 'nar-h-2',
    topic: 'narration',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'The old man said to the boy, "May Allah bless you."',
    answer: 'The old man prayed that Allah might bless the boy.',
    acceptableAnswers: [
      'The old man prayed that Allah might bless the boy.',
      'The old man wished that Allah might bless the boy.',
      'The old man prayed for the boy that Allah might bless him.',
    ],
    marks: 1,
    explanation: {
      en: 'Optative sentences use "prayed that" or "wished that" with "may" shifting to "might".',
      bn: 'ইচ্ছা বা প্রার্থনামূলক বাক্যে "prayed that / wished that" এবং "may" পরিবর্তিত হয়ে "might" হয়।',
    },
  },
  {
    id: 'nar-h-3',
    topic: 'narration',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'He said to his friend, "Let us go out for a walk."',
    answer: 'He proposed to his friend that they should go out for a walk.',
    acceptableAnswers: [
      'He proposed to his friend that they should go out for a walk.',
      'He suggested to his friend that they should go out for a walk.',
    ],
    marks: 1,
    explanation: {
      en: '"Let us..." proposals convert to "proposed/suggested to ... that they should ...".',
      bn: '"Let us" যুক্ত প্রস্তাবনায় "proposed/suggested to ... that they should" ব্যবহৃত হয়।',
    },
  },
  {
    id: 'nar-j-4',
    topic: 'narration',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'Rina said to me, "I like painting landscapes."',
    answer: 'Rina told me that she liked painting landscapes.',
    acceptableAnswers: [
      'Rina told me that she liked painting landscapes.',
      'Rina said to me that she liked painting landscapes.',
    ],
    marks: 1,
    explanation: {
      en: 'Present Simple "like" shifts to Past Simple "liked", and "I" changes to "she".',
      bn: 'Present Simple "like" পরিবর্তিত হয়ে Past Simple "liked" এবং "I" থেকে "she" হয়।',
    },
  },
  {
    id: 'nar-j-5',
    topic: 'narration',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'Father said to his son, "Do not waste your time."',
    answer: 'Father advised his son not to waste his time.',
    acceptableAnswers: [
      'Father advised his son not to waste his time.',
      'Father forbade his son to waste his time.',
      'Father told his son not to waste his time.',
    ],
    marks: 1,
    explanation: {
      en: 'Negative imperatives use "advised/told ... not to + V1" or "forbade ... to + V1".',
      bn: 'নিষেধাজ্ঞামূলক Imperative বাক্যে "not to + V1" অথবা "forbade ... to + V1" বসে।',
    },
  },
  {
    id: 'nar-j-6',
    topic: 'narration',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'He says, "I am happy today."',
    answer: 'He says that he is happy today.',
    acceptableAnswers: ['He says that he is happy today.'],
    marks: 1,
    explanation: {
      en: 'When the reporting verb ("says") is in Present Tense, the reported tense does not shift back.',
      bn: 'Reporting verb Present Tense হলে reported speech-এর tense পরিবর্তন হয় না।',
    },
  },
  {
    id: 'nar-j-7',
    topic: 'narration',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'She said to her brother, "Please pass me the dictionary."',
    answer: 'She requested her brother to pass her the dictionary.',
    acceptableAnswers: ['She requested her brother to pass her the dictionary.'],
    marks: 1,
    explanation: {
      en: 'Polite requests with "Please" change reporting verb to "requested" + object + "to + V1".',
      bn: '"Please" থাকলে reporting verb "requested" হয় এবং verb-এর আগে "to" বসে।',
    },
  },
  {
    id: 'nar-s-4',
    topic: 'narration',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'The stranger said to me, "Where do you live?"',
    answer: 'The stranger asked me where I lived.',
    acceptableAnswers: ['The stranger asked me where I lived.'],
    marks: 1,
    explanation: {
      en: 'WH-questions keep the WH-word ("where") as linker, drop "do", and use assertive Subject + Verb order.',
      bn: 'WH-প্রশ্নে WH-শব্দটিই linker থাকে এবং Subject-এর পর Past Simple verb বসে।',
    },
  },
  {
    id: 'nar-s-5',
    topic: 'narration',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'My friend said to me, "I have bought a new bicycle."',
    answer: 'My friend told me that he had bought a new bicycle.',
    acceptableAnswers: [
      'My friend told me that he had bought a new bicycle.',
      'My friend told me that she had bought a new bicycle.',
    ],
    marks: 1,
    explanation: {
      en: 'Present Perfect ("have bought") shifts back to Past Perfect ("had bought").',
      bn: 'Present Perfect ("have bought") পরিবর্তিত হয়ে Past Perfect ("had bought") হয়।',
    },
  },
  {
    id: 'nar-s-6',
    topic: 'narration',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'The captain said, "Hurrah! We have won the match."',
    answer: 'The captain exclaimed with joy that they had won the match.',
    acceptableAnswers: ['The captain exclaimed with joy that they had won the match.'],
    marks: 1,
    explanation: {
      en: '"Hurrah!" converts to "exclaimed with joy that", with "we" -> "they" and "have won" -> "had won".',
      bn: '"Hurrah!"-এর পরিবর্তে "exclaimed with joy that" এবং Present Perfect থেকে Past Perfect হয়।',
    },
  },
  {
    id: 'nar-s-7',
    topic: 'narration',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Direct Speech:',
    prompt: 'She asked me why I was laughing.',
    answer: 'She said to me, "Why are you laughing?"',
    acceptableAnswers: ['She said to me, "Why are you laughing?"'],
    marks: 1,
    explanation: {
      en: '"asked" reverts to "said to", Past Continuous reverses to Present Continuous inside quotation marks.',
      bn: '"asked" থেকে "said to" এবং Past Continuous থেকে Present Continuous হয়।',
    },
  },
  {
    id: 'nar-h-4',
    topic: 'narration',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'He said, "Alas! I am undone."',
    answer: 'He exclaimed with sorrow that he was undone.',
    acceptableAnswers: [
      'He exclaimed with sorrow that he was undone.',
      'He exclaimed with grief that he was undone.',
    ],
    marks: 1,
    explanation: {
      en: '"Alas!" expresses grief, shifting to "exclaimed with sorrow/grief that".',
      bn: '"Alas!" দুঃখ প্রকাশ করায় "exclaimed with sorrow/grief that" বসে।',
    },
  },
  {
    id: 'nar-h-5',
    topic: 'narration',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'The boy said to his mother, "Let me finish my drawing."',
    answer: 'The boy told his mother that he might be allowed to finish his drawing.',
    acceptableAnswers: [
      'The boy told his mother that he might be allowed to finish his drawing.',
      'The boy requested his mother to let him finish his drawing.',
    ],
    marks: 1,
    explanation: {
      en: '"Let me..." permission requests convert to "might be allowed to" or "requested ... to let him".',
      bn: 'অনুমতি বোঝাতে "Let me" থাকলে "might be allowed to" অথবা "requested ... to let" হয়।',
    },
  },
  {
    id: 'nar-h-6',
    topic: 'narration',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Indirect Speech:',
    prompt: 'The teacher said, "Honesty is the best policy."',
    answer: 'The teacher said that honesty is the best policy.',
    acceptableAnswers: ['The teacher said that honesty is the best policy.'],
    marks: 1,
    explanation: {
      en: 'Proverbs and habitual truths retain Present Simple tense in indirect speech.',
      bn: 'প্রবাদ বা চিরন্তন সত্য বাক্যে tense অপরিবর্তিত থাকে।',
    },
  },

  // VOICE CHANGE
  {
    id: 'voi-j-1',
    topic: 'voice',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'She writes a letter.',
    answer: 'A letter is written by her.',
    acceptableAnswers: ['A letter is written by her.'],
    marks: 1,
    explanation: {
      en: 'Present Indefinite passive structure: Object + is/am/are + V3 + by + Agent.',
      bn: 'Present Indefinite-এর Passive গঠন: Object + is/am/are + V3 + by + Subject-এর object রূপ।',
    },
  },
  {
    id: 'voi-j-2',
    topic: 'voice',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Open the window immediately.',
    answer: 'Let the window be opened immediately.',
    acceptableAnswers: [
      'Let the window be opened immediately.',
      'Let the window be opened.',
    ],
    marks: 1,
    explanation: {
      en: 'Imperative active sentences take "Let + object + be + V3".',
      bn: 'Imperative বাক্যে "Let + object + be + V3" দিয়ে Passive করা হয়।',
    },
  },
  {
    id: 'voi-j-3',
    topic: 'voice',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'The students are planting trees in the yard.',
    answer: 'Trees are being planted by the students in the yard.',
    acceptableAnswers: [
      'Trees are being planted by the students in the yard.',
      'Trees are being planted in the yard by the students.',
    ],
    marks: 1,
    explanation: {
      en: 'Present Continuous uses "am/is/are + being + V3" in passive voice.',
      bn: 'Present Continuous-এর Passive রূপ হলো "am/is/are + being + V3"।',
    },
  },
  {
    id: 'voi-s-1',
    topic: 'voice',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'She wrote a thoughtful essay yesterday.',
    answer: 'A thoughtful essay was written by her yesterday.',
    acceptableAnswers: [
      'A thoughtful essay was written by her yesterday.',
      'Yesterday a thoughtful essay was written by her.',
    ],
    marks: 1,
    explanation: {
      en: 'Past Indefinite passive structure: Object + was/were + V3 + by + Agent.',
      bn: 'Past Indefinite-এর Passive গঠন: Object + was/were + V3 + by + Agent।',
    },
  },
  {
    id: 'voi-s-2',
    topic: 'voice',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'We must protect our natural environment.',
    answer: 'Our natural environment must be protected by us.',
    acceptableAnswers: [
      'Our natural environment must be protected by us.',
      'Our natural environment must be protected.',
    ],
    marks: 1,
    explanation: {
      en: 'Modal verbs ("must", "can", "should") take "modal + be + V3" in passive voice.',
      bn: 'Modal verb থাকলে Passive-এ "modal + be + V3" বসে।',
    },
  },
  {
    id: 'voi-s-3',
    topic: 'voice',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Active Voice:',
    prompt: 'A delicious meal was cooked by my grandmother.',
    answer: 'My grandmother cooked a delicious meal.',
    acceptableAnswers: ['My grandmother cooked a delicious meal.'],
    marks: 1,
    explanation: {
      en: 'The agent "my grandmother" becomes the subject and "was cooked" returns to Past Indefinite "cooked".',
      bn: '"by my grandmother"-এর agent অংশ Subject হয়ে যায় এবং "was cooked" থেকে "cooked" হয়।',
    },
  },
  {
    id: 'voi-h-1',
    topic: 'voice',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Who broke the glass vase?',
    answer: 'By whom was the glass vase broken?',
    acceptableAnswers: [
      'By whom was the glass vase broken?',
      'Who was the glass vase broken by?',
    ],
    marks: 1,
    explanation: {
      en: 'Interrogative "Who" becomes "By whom" followed by auxiliary verb + subject + V3.',
      bn: 'প্রশ্নবোধক "Who" থাকলে Passive-এ শুরুতে "By whom + auxiliary + subject + V3" বসে।',
    },
  },
  {
    id: 'voi-h-2',
    topic: 'voice',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Panic seized the villagers at midnight.',
    answer: 'The villagers were seized with panic at midnight.',
    acceptableAnswers: [
      'The villagers were seized with panic at midnight.',
      'The villagers were seized by panic at midnight.',
    ],
    marks: 1,
    explanation: {
      en: 'The verb "seize" idiomatically takes the preposition "with" rather than "by" in passive voice.',
      bn: '"seize" verb-এর Passive রূপে সাধারণত "by"-এর পরিবর্তে "with" বসে।',
    },
  },
  {
    id: 'voi-h-3',
    topic: 'voice',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'I know his real intention.',
    answer: 'His real intention is known to me.',
    acceptableAnswers: ['His real intention is known to me.'],
    marks: 1,
    explanation: {
      en: '"Know" takes the preposition "to" ("known to me") instead of "by" in passive voice.',
      bn: '"know" verb-এর পর Passive-এ "by" না বসে "to" বসে ("known to me")।',
    },
  },
  {
    id: 'voi-j-4',
    topic: 'voice',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'They play cricket in the field.',
    answer: 'Cricket is played by them in the field.',
    acceptableAnswers: [
      'Cricket is played by them in the field.',
      'Cricket is played in the field by them.',
    ],
    marks: 1,
    explanation: {
      en: 'Singular object "Cricket" takes "is" + V3 "played" + "by them".',
      bn: '"Cricket" একবচন হওয়ায় "is played by them" গঠিত হয়।',
    },
  },
  {
    id: 'voi-j-5',
    topic: 'voice',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'He has completed the assignment.',
    answer: 'The assignment has been completed by him.',
    acceptableAnswers: ['The assignment has been completed by him.'],
    marks: 1,
    explanation: {
      en: 'Present Perfect passive structure: Object + has/have + been + V3 + by + Agent.',
      bn: 'Present Perfect-এর Passive গঠন: Object + has/have + been + V3 + by + Agent।',
    },
  },
  {
    id: 'voi-j-6',
    topic: 'voice',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Do not tell a lie.',
    answer: 'Let not a lie be told.',
    acceptableAnswers: ['Let not a lie be told.', 'Let a lie not be told.'],
    marks: 1,
    explanation: {
      en: 'Negative imperative sentences take "Let not + object + be + V3".',
      bn: 'না-বোধক Imperative বাক্যের Passive হলো "Let not + object + be + V3"।',
    },
  },
  {
    id: 'voi-j-7',
    topic: 'voice',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Mother will bake a chocolate cake.',
    answer: 'A chocolate cake will be baked by mother.',
    acceptableAnswers: ['A chocolate cake will be baked by mother.'],
    marks: 1,
    explanation: {
      en: 'Future Simple passive takes "will + be + V3".',
      bn: 'Future Simple-এর Passive গঠন "will + be + V3"।',
    },
  },
  {
    id: 'voi-s-4',
    topic: 'voice',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Did you finish the science project?',
    answer: 'Was the science project finished by you?',
    acceptableAnswers: ['Was the science project finished by you?'],
    marks: 1,
    explanation: {
      en: 'Past Indefinite questions start with "Was/Were + object + V3 + by + agent?"',
      bn: 'Past Indefinite প্রশ্নবোধক বাক্যে শুরুতে "Was/Were + object + V3 + by + agent?" বসে।',
    },
  },
  {
    id: 'voi-s-5',
    topic: 'voice',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'They were repairing the broken bridge.',
    answer: 'The broken bridge was being repaired by them.',
    acceptableAnswers: ['The broken bridge was being repaired by them.'],
    marks: 1,
    explanation: {
      en: 'Past Continuous passive uses "was/were + being + V3".',
      bn: 'Past Continuous-এর Passive গঠন হলো "was/were + being + V3"।',
    },
  },
  {
    id: 'voi-s-6',
    topic: 'voice',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Active Voice:',
    prompt: 'The injured bird was rescued by a kind girl.',
    answer: 'A kind girl rescued the injured bird.',
    acceptableAnswers: ['A kind girl rescued the injured bird.'],
    marks: 1,
    explanation: {
      en: '"a kind girl" becomes subject and "was rescued" returns to Past Indefinite "rescued".',
      bn: '"a kind girl" Subject হয় এবং "was rescued" থেকে Past Simple "rescued" হয়।',
    },
  },
  {
    id: 'voi-s-7',
    topic: 'voice',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Please keep your mobile silent.',
    answer: 'You are requested to keep your mobile silent.',
    acceptableAnswers: ['You are requested to keep your mobile silent.'],
    marks: 1,
    explanation: {
      en: 'Imperative requests beginning with "Please" transform into "You are requested to + V1...".',
      bn: '"Please" যুক্ত অনুরোধসূচক বাক্যে Passive-এ "You are requested to..." বসে।',
    },
  },
  {
    id: 'voi-h-4',
    topic: 'voice',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Whom did you invite to the seminar?',
    answer: 'Who was invited by you to the seminar?',
    acceptableAnswers: [
      'Who was invited by you to the seminar?',
      'Who was invited to the seminar by you?',
    ],
    marks: 1,
    explanation: {
      en: 'Object interrogative "Whom" becomes subject "Who" in passive voice.',
      bn: '"Whom" পরিবর্তিত হয়ে Passive-এ Subject "Who" হয়ে যায়।',
    },
  },
  {
    id: 'voi-h-5',
    topic: 'voice',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'Honey tastes sweet.',
    answer: 'Honey is sweet when it is tasted.',
    acceptableAnswers: [
      'Honey is sweet when it is tasted.',
      'Honey is tasted sweet.',
    ],
    marks: 1,
    explanation: {
      en: 'Quasi-passive verbs like "taste" expand to "Subject + is + adjective + when it is + V3".',
      bn: 'Quasi-passive বাক্যে "Subject + is + adjective + when it is + V3" গঠন ব্যবহৃত হয়।',
    },
  },
  {
    id: 'voi-h-6',
    topic: 'voice',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Change into Passive Voice:',
    prompt: 'His behavior surprised all the guests.',
    answer: 'All the guests were surprised at his behavior.',
    acceptableAnswers: [
      'All the guests were surprised at his behavior.',
      'All the guests were surprised by his behavior.',
    ],
    marks: 1,
    explanation: {
      en: '"Surprised" idiomatically pairs with the preposition "at" in passive voice.',
      bn: '"surprised"-এর পর Passive-এ সাধারণত "at" বসে ("surprised at")।',
    },
  },

  // SUFFIX & PREFIX
  {
    id: 'mor-j-1',
    topic: 'morpheme',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Add the correct Prefix to form the opposite of the word in brackets:',
    prompt: 'Nobody trusts a _____ (honest) person.',
    answer: 'dishonest',
    acceptableAnswers: ['dishonest'],
    marks: 1,
    explanation: {
      en: 'Adding the prefix "dis-" to "honest" forms the antonym adjective "dishonest".',
      bn: '"honest"-এর আগে "dis-" prefix যোগ করলে বিপরীতার্থক বিশেষণ "dishonest" গঠিত হয়।',
    },
  },
  {
    id: 'mor-j-2',
    topic: 'morpheme',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Add a suitable Prefix to make the word mean "not possible":',
    prompt: 'Nothing is _____ (possible) for a hardworking student.',
    answer: 'impossible',
    acceptableAnswers: ['impossible'],
    marks: 1,
    explanation: {
      en: 'Words beginning with "p" or "m" typically take the negative prefix "im-" ("impossible").',
      bn: '"p" দিয়ে শুরু হওয়া "possible"-এর আগে "im-" উপসর্গ বসে "impossible" হয়।',
    },
  },
  {
    id: 'mor-j-3',
    topic: 'morpheme',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Add a Suffix to turn the adjective into an abstract noun:',
    prompt: 'True _____ (happy) comes from kindness and gratitude.',
    answer: 'happiness',
    acceptableAnswers: ['happiness'],
    marks: 1,
    explanation: {
      en: 'Adding the noun suffix "-ness" to "happy" changes final "y" to "i", forming "happiness".',
      bn: '"happy"-এর সাথে "-ness" suffix যুক্ত হয়ে "happiness" (Noun) তৈরি হয়।',
    },
  },
  {
    id: 'mor-s-1',
    topic: 'morpheme',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Fill in the blank using the right Prefix or Suffix on the root word:',
    prompt: 'Cutting down trees indiscriminately is an _____ (legal) act.',
    answer: 'illegal',
    acceptableAnswers: ['illegal'],
    marks: 1,
    explanation: {
      en: 'Root words beginning with "l" take the negative prefix "il-" ("illegal").',
      bn: '"l" দিয়ে শুরু হওয়া "legal"-এর আগে "il-" বসে "illegal" হয়।',
    },
  },
  {
    id: 'mor-s-2',
    topic: 'morpheme',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Add both Prefix and Suffix if needed to fit the sentence:',
    prompt: 'Smoking is extremely _____ (harm) to public health.',
    answer: 'harmful',
    acceptableAnswers: ['harmful'],
    marks: 1,
    explanation: {
      en: 'The suffix "-ful" turns the noun/verb "harm" into the adjective "harmful".',
      bn: '"harm"-এর শেষে "-ful" प्रत्यয় যোগ করে Adjective "harmful" গঠিত হয়।',
    },
  },
  {
    id: 'mor-s-3',
    topic: 'morpheme',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Transform the root word using an appropriate Prefix or Suffix:',
    prompt: 'Our country needs _____ (educate) and skilled citizens.',
    answer: 'educated',
    acceptableAnswers: ['educated'],
    marks: 1,
    explanation: {
      en: 'Adding "-d" / "-ed" produces the participial adjective "educated" modifying "citizens".',
      bn: '"citizens" noun-কে বিশেষিত করতে Adjective হিসেবে "educated" বসে।',
    },
  },
  {
    id: 'mor-h-1',
    topic: 'morpheme',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete the sentence with the correct affixed form:',
    prompt: 'Her sudden _____ (appear) from the stage surprised everyone.',
    answer: 'disappearance',
    acceptableAnswers: ['disappearance'],
    marks: 1,
    explanation: {
      en: 'Combine prefix "dis-" + root "appear" + noun suffix "-ance" to express "vanishing".',
      bn: 'অর্থ অনুযায়ী "dis-" + "appear" + "-ance" মিলে "disappearance" (অন্তর্ধান) বসে।',
    },
  },
  {
    id: 'mor-h-2',
    topic: 'morpheme',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Transform the bracketed word to fit the context grammatically:',
    prompt: 'Youth should be _____ (courage) to participate in community service.',
    answer: 'encouraged',
    acceptableAnswers: ['encouraged'],
    marks: 1,
    explanation: {
      en: 'Prefix "en-" + "courage" + "-d" creates the passive verb form "encouraged".',
      bn: '"en-" + "courage" + "-d" যুক্ত হয়ে Passive verb "encouraged" হয়।',
    },
  },
  {
    id: 'mor-h-3',
    topic: 'morpheme',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Transform the bracketed word into an appropriate adverb:',
    prompt: 'The committee reviewed the proposal _____ (care).',
    answer: 'carefully',
    acceptableAnswers: ['carefully'],
    marks: 1,
    explanation: {
      en: 'Add "-ful" + "-ly" to form the manner adverb "carefully" modifying "reviewed".',
      bn: '"reviewed" verb-কে modify করতে Adverb হিসেবে "carefully" বসে।',
    },
  },
  {
    id: 'mor-j-4',
    topic: 'morpheme',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Add a Suffix to turn the adjective into an abstract noun:',
    prompt: 'We admired her _____ (kind) toward stray animals.',
    answer: 'kindness',
    acceptableAnswers: ['kindness'],
    marks: 1,
    explanation: {
      en: 'Suffix "-ness" converts adjective "kind" into abstract noun "kindness".',
      bn: '"kind"-এর শেষে "-ness" যোগ করলে Abstract Noun "kindness" গঠিত হয়।',
    },
  },
  {
    id: 'mor-j-5',
    topic: 'morpheme',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Add a Prefix to form the opposite meaning:',
    prompt: 'It is _____ (polite) to interrupt someone while they speak.',
    answer: 'impolite',
    acceptableAnswers: ['impolite'],
    marks: 1,
    explanation: {
      en: 'Adjectives starting with "p" take negative prefix "im-" ("impolite").',
      bn: '"p" দিয়ে শুরু হওয়ায় "polite"-এর আগে "im-" বসে "impolite" হয়।',
    },
  },
  {
    id: 'mor-j-6',
    topic: 'morpheme',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Add a Suffix to form the person noun:',
    prompt: 'The _____ (teach) explained the grammar rule clearly.',
    answer: 'teacher',
    acceptableAnswers: ['teacher'],
    marks: 1,
    explanation: {
      en: 'Agent suffix "-er" added to "teach" gives the noun "teacher".',
      bn: '"teach" verb-এর শেষে "-er" যোগ হয়ে ব্যক্তিবাচক Noun "teacher" হয়।',
    },
  },
  {
    id: 'mor-j-7',
    topic: 'morpheme',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Add a Prefix to mean "again":',
    prompt: 'Please _____ (write) the messy paragraph neatly.',
    answer: 'rewrite',
    acceptableAnswers: ['rewrite'],
    marks: 1,
    explanation: {
      en: 'Prefix "re-" means "again", forming the verb "rewrite".',
      bn: '"re-" উপসর্গ "পুনরায়" অর্থে ব্যবহৃত হয়ে "rewrite" গঠন করে।',
    },
  },
  {
    id: 'mor-s-4',
    topic: 'morpheme',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Add an appropriate Prefix to form an antonym:',
    prompt: 'Students should avoid _____ (regular) attendance in class.',
    answer: 'irregular',
    acceptableAnswers: ['irregular'],
    marks: 1,
    explanation: {
      en: 'Words beginning with "r" take the negative prefix "ir-" ("irregular").',
      bn: '"r" দিয়ে শুরু হওয়া "regular"-এর পূর্বে "ir-" বসে "irregular" হয়।',
    },
  },
  {
    id: 'mor-s-5',
    topic: 'morpheme',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Transform the bracketed word using a suitable Suffix:',
    prompt: 'Good _____ (friend) makes difficult times easier.',
    answer: 'friendship',
    acceptableAnswers: ['friendship'],
    marks: 1,
    explanation: {
      en: 'The noun suffix "-ship" added to "friend" creates the abstract noun "friendship".',
      bn: '"friend"-এর শেষে "-ship" प्रत्यয় যোগে "friendship" গঠিত হয়।',
    },
  },
  {
    id: 'mor-s-6',
    topic: 'morpheme',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Fill in the blank using a suitable Prefix or Suffix:',
    prompt: 'Clean water is _____ (essence) for healthy living.',
    answer: 'essential',
    acceptableAnswers: ['essential'],
    marks: 1,
    explanation: {
      en: 'Replacing final "-e" with "-ial" turns noun "essence" into adjective "essential".',
      bn: '"essence"-এর সাথে "-ial" প্রত্যয় যুক্ত হয়ে Adjective "essential" হয়।',
    },
  },
  {
    id: 'mor-s-7',
    topic: 'morpheme',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Add Prefix or Suffix to fit the sentence:',
    prompt: 'Deforestation creates ecological _____ (balance).',
    answer: 'imbalance',
    acceptableAnswers: ['imbalance'],
    marks: 1,
    explanation: {
      en: 'Negative prefix "im-" before "balance" forms "imbalance".',
      bn: '"b" দিয়ে শুরু হওয়া "balance"-এর পূর্বে "im-" বসে "imbalance" (ভারসাম্যহীনতা) হয়।',
    },
  },
  {
    id: 'mor-h-4',
    topic: 'morpheme',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete the sentence with the correct affixed noun:',
    prompt: 'Active _____ (participate) in debate sharpens reasoning.',
    answer: 'participation',
    acceptableAnswers: ['participation'],
    marks: 1,
    explanation: {
      en: 'Verb "participate" becomes noun "participation" via the "-tion" suffix.',
      bn: '"participate" verb-এর সাথে "-tion" যুক্ত হয়ে Noun "participation" গঠিত হয়।',
    },
  },
  {
    id: 'mor-h-5',
    topic: 'morpheme',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete the sentence with an appropriate adjective:',
    prompt: 'Fresh vegetables are rich in _____ (nutrition) value.',
    answer: 'nutritional',
    acceptableAnswers: ['nutritional', 'nutritious'],
    marks: 1,
    explanation: {
      en: 'Adding "-al" forms the adjective "nutritional" modifying "value".',
      bn: '"value" noun-এর পূর্বে Adjective হিসেবে "nutritional" (বা "nutritious") বসে।',
    },
  },
  {
    id: 'mor-h-6',
    topic: 'morpheme',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Add Prefix and/or Suffix to fit the meaning:',
    prompt: 'Careless driving often causes _____ (avoid) accidents.',
    answer: 'unavoidable',
    acceptableAnswers: ['unavoidable'],
    marks: 1,
    explanation: {
      en: 'Combine prefix "un-" + "avoid" + suffix "-able" to express "inevitable/cannot be avoided".',
      bn: '"un-" + "avoid" + "-able" মিলে "unavoidable" (অনিবার্য) বিশেষণ তৈরি হয়।',
    },
  },

  // PARTS OF SPEECH
  {
    id: 'pos-j-1',
    topic: 'pos',
    difficulty: 'Junior',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'The **clever** fox jumped over the wall.',
    options: ['Noun', 'Adjective', 'Adverb', 'Verb'],
    answer: 'Adjective',
    marks: 1,
    explanation: {
      en: '"Clever" describes the noun "fox", so it functions as an Adjective.',
      bn: '"clever" শব্দটি "fox" (Noun)-এর গুণ প্রকাশ করছে, তাই এটি Adjective।',
    },
  },
  {
    id: 'pos-j-2',
    topic: 'pos',
    difficulty: 'Junior',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'She walked **quickly** toward the library.',
    options: ['Adjective', 'Adverb', 'Preposition', 'Conjunction'],
    answer: 'Adverb',
    marks: 1,
    explanation: {
      en: '"Quickly" modifies the verb "walked" by showing manner, so it is an Adverb.',
      bn: '"quickly" শব্দটি "walked" ক্রিয়ার ধরন নির্দেশ করছে, তাই এটি Adverb।',
    },
  },
  {
    id: 'pos-j-3',
    topic: 'pos',
    difficulty: 'Junior',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: '**Wow!** What a splendid victory that was!',
    options: ['Interjection', 'Conjunction', 'Pronoun', 'Determiner'],
    answer: 'Interjection',
    marks: 1,
    explanation: {
      en: '"Wow!" expresses sudden excitement or admiration and stands as an Interjection.',
      bn: '"Wow!" আকস্মিক আবেগ বা বিস্ময় প্রকাশ করায় এটি Interjection।',
    },
  },
  {
    id: 'pos-s-1',
    topic: 'pos',
    difficulty: 'SSC Standard',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: '**Honesty** is the best policy for every citizen.',
    options: ['Adjective', 'Abstract Noun', 'Adverb', 'Verb'],
    answer: 'Abstract Noun',
    acceptableAnswers: ['Abstract Noun', 'Noun'],
    marks: 1,
    explanation: {
      en: '"Honesty" names a moral quality acting as the sentence subject, making it an Abstract Noun.',
      bn: '"Honesty" একটি গুণের নাম এবং বাক্যের Subject, তাই এটি Abstract Noun।',
    },
  },
  {
    id: 'pos-s-2',
    topic: 'pos',
    difficulty: 'SSC Standard',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'The train arrived **after** the heavy storm had ended.',
    options: ['Preposition', 'Conjunction', 'Adverb', 'Pronoun'],
    answer: 'Conjunction',
    marks: 1,
    explanation: {
      en: 'Here "after" joins two full clauses ("The train arrived" and "the heavy storm had ended"), so it is a Conjunction.',
      bn: 'এখানে "after" দুটি সম্পূর্ণ clause-কে যুক্ত করেছে, তাই এটি Conjunction।',
    },
  },
  {
    id: 'pos-s-3',
    topic: 'pos',
    difficulty: 'SSC Standard',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'He placed his notebook **beneath** the reading lamp.',
    options: ['Adverb', 'Preposition', 'Conjunction', 'Adjective'],
    answer: 'Preposition',
    marks: 1,
    explanation: {
      en: '"Beneath" links the verb action to the noun phrase "the reading lamp", showing spatial relation as a Preposition.',
      bn: '"beneath" অবস্থান বোঝাতে Noun phrase-এর পূর্বে বসেছে, তাই এটি Preposition।',
    },
  },
  {
    id: 'pos-h-1',
    topic: 'pos',
    difficulty: 'HSC Advanced',
    type: 'mcq',
    instruction: 'Identify the grammatical function of the highlighted word:',
    prompt: 'We should **water** the saplings every morning.',
    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    answer: 'Verb',
    marks: 1,
    explanation: {
      en: 'Placed right after the modal "should", "water" denotes the action of pouring water, functioning as a Verb.',
      bn: '"should" modal-এর পরে বসে কাজ বোঝানোয় এখানে "water" একটি Verb।',
    },
  },
  {
    id: 'pos-h-2',
    topic: 'pos',
    difficulty: 'HSC Advanced',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'She runs **fast** enough to win the championship.',
    options: ['Adjective', 'Adverb', 'Noun', 'Preposition'],
    answer: 'Adverb',
    marks: 1,
    explanation: {
      en: 'When "fast" modifies the action verb "runs", it functions as an Adverb (not an adjective).',
      bn: 'এখানে "fast" সরাসরি "runs" ক্রিয়াকে modify করায় এটি Adverb।',
    },
  },
  {
    id: 'pos-h-3',
    topic: 'pos',
    difficulty: 'HSC Advanced',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: '**Every** diligent student deserves fair encouragement.',
    options: ['Pronoun', 'Determiner', 'Adverb', 'Conjunction'],
    answer: 'Determiner',
    acceptableAnswers: ['Determiner', 'Adjective'],
    marks: 1,
    explanation: {
      en: '"Every" specifies quantity before the noun phrase "diligent student" and functions as a Determiner.',
      bn: 'Noun phrase-এর পূর্বে নির্দিষ্টতা বা পরিমাণ বোঝাতে "Every" একটি Determiner হিসেবে কাজ করে।',
    },
  },
  {
    id: 'pos-j-4',
    topic: 'pos',
    difficulty: 'Junior',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: '**They** visited the botanical garden yesterday.',
    options: ['Noun', 'Pronoun', 'Determiner', 'Adverb'],
    answer: 'Pronoun',
    marks: 1,
    explanation: {
      en: '"They" replaces specific plural nouns as the sentence subject, so it is a Pronoun.',
      bn: '"They" একাধিক ব্যক্তির নামের পরিবর্তে ব্যবহৃত হওয়ায় এটি Pronoun।',
    },
  },
  {
    id: 'pos-j-5',
    topic: 'pos',
    difficulty: 'Junior',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'She brought an umbrella **because** dark clouds filled the sky.',
    options: ['Preposition', 'Conjunction', 'Adverb', 'Interjection'],
    answer: 'Conjunction',
    marks: 1,
    explanation: {
      en: '"Because" connects the reason clause to the main clause as a subordinating Conjunction.',
      bn: '"because" দুটি বাক্যাংশকে কারণ-ফলাফলের সম্পর্কে যুক্ত করায় এটি Conjunction।',
    },
  },
  {
    id: 'pos-j-6',
    topic: 'pos',
    difficulty: 'Junior',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'The old bridge crosses **over** the calm river.',
    options: ['Adjective', 'Preposition', 'Verb', 'Pronoun'],
    answer: 'Preposition',
    marks: 1,
    explanation: {
      en: '"Over" precedes "the calm river" to show spatial relation, functioning as a Preposition.',
      bn: 'Noun phrase-এর আগে বসে অবস্থান নির্দেশ করায় "over" এখানে Preposition।',
    },
  },
  {
    id: 'pos-j-7',
    topic: 'pos',
    difficulty: 'Junior',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'Fresh **sunlight** warmed the classroom floor.',
    options: ['Verb', 'Noun', 'Adjective', 'Adverb'],
    answer: 'Noun',
    marks: 1,
    explanation: {
      en: '"Sunlight" names a thing and serves as the subject noun modified by "Fresh".',
      bn: '"sunlight" একটি জিনিসের নাম এবং বাক্যের Subject, তাই এটি Noun।',
    },
  },
  {
    id: 'pos-s-4',
    topic: 'pos',
    difficulty: 'SSC Standard',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'He **seldom** misses his morning walk.',
    options: ['Adjective', 'Adverb', 'Preposition', 'Conjunction'],
    answer: 'Adverb',
    marks: 1,
    explanation: {
      en: '"Seldom" tells how frequently the verb "misses" happens, making it an Adverb of frequency.',
      bn: '"seldom" কাজের পুনরাবৃত্তি বা frequency বোঝানোয় এটি Adverb।',
    },
  },
  {
    id: 'pos-s-5',
    topic: 'pos',
    difficulty: 'SSC Standard',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'Look closely **down** the quiet narrow lane.',
    options: ['Adverb', 'Preposition', 'Noun', 'Conjunction'],
    answer: 'Preposition',
    marks: 1,
    explanation: {
      en: 'Followed by the noun object "the quiet narrow lane", "down" acts as a Preposition.',
      bn: 'পরে object ("the quiet narrow lane") থাকায় "down" এখানে Preposition।',
    },
  },
  {
    id: 'pos-s-6',
    topic: 'pos',
    difficulty: 'SSC Standard',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'Reading **classic** novels enriches our vocabulary.',
    options: ['Noun', 'Adjective', 'Adverb', 'Verb'],
    answer: 'Adjective',
    marks: 1,
    explanation: {
      en: '"Classic" modifies the plural noun "novels", functioning as an Adjective.',
      bn: '"novels" (Noun)-এর ধরন বা গুণ প্রকাশ করায় "classic" এখানে Adjective।',
    },
  },
  {
    id: 'pos-s-7',
    topic: 'pos',
    difficulty: 'SSC Standard',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: '**Alas!** The brave sailor lost his compass at sea.',
    options: ['Interjection', 'Adverb', 'Pronoun', 'Preposition'],
    answer: 'Interjection',
    marks: 1,
    explanation: {
      en: '"Alas!" expresses sudden sorrow and stands grammatically independent as an Interjection.',
      bn: '"Alas!" হঠাৎ দুঃখ প্রকাশ করায় এটি একটি Interjection।',
    },
  },
  {
    id: 'pos-h-4',
    topic: 'pos',
    difficulty: 'HSC Advanced',
    type: 'mcq',
    instruction: 'Identify the grammatical role of the highlighted word:',
    prompt: 'The mountain **book** fair drew thousands of readers.',
    options: ['Verb', 'Adjective', 'Pronoun', 'Adverb'],
    answer: 'Adjective',
    acceptableAnswers: ['Adjective', 'Noun'],
    marks: 1,
    explanation: {
      en: 'Here "book" modifies another noun ("fair"), functioning attributively as an Adjective (noun adjunct).',
      bn: 'এখানে "book" পরের noun "fair"-কে বিশেষিত করায় Adjective-এর মতো কাজ করছে।',
    },
  },
  {
    id: 'pos-h-5',
    topic: 'pos',
    difficulty: 'HSC Advanced',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'We waited **until** the rain stopped completely.',
    options: ['Preposition', 'Conjunction', 'Interjection', 'Determiner'],
    answer: 'Conjunction',
    marks: 1,
    explanation: {
      en: '"Until" joins the subordinate clause "the rain stopped completely", so it acts as a Conjunction.',
      bn: 'এখানে "until" একটি সম্পূর্ণ clause যুক্ত করায় এটি Conjunction।',
    },
  },
  {
    id: 'pos-h-6',
    topic: 'pos',
    difficulty: 'HSC Advanced',
    type: 'mcq',
    instruction: 'Identify the Part of Speech of the highlighted word:',
    prompt: 'Someone left **their** umbrella near the doorway.',
    options: ['Pronoun', 'Determiner', 'Adverb', 'Conjunction'],
    answer: 'Determiner',
    acceptableAnswers: ['Determiner', 'Pronoun'],
    marks: 1,
    explanation: {
      en: 'Possessive "their" introduces and specifies the noun "umbrella" as a possessive Determiner.',
      bn: 'Noun-এর পূর্বে অধিকার নির্দেশ করতে "their" possessive Determiner হিসেবে বসেছে।',
    },
  },

  // VERB CHANGING
  {
    id: 'vrb-j-1',
    topic: 'verbs',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Write the Past Participle (V3) form of the verb in brackets:',
    prompt: 'She has _____ (write) three poems this week.',
    answer: 'written',
    acceptableAnswers: ['written'],
    marks: 1,
    explanation: {
      en: 'After auxiliary "has", Present Perfect takes the Past Participle (V3) of "write", which is "written".',
      bn: '"has"-এর পর Verb-এর V3 (Past Participle) বসে; "write"-এর V3 হলো "written"।',
    },
  },
  {
    id: 'vrb-j-2',
    topic: 'verbs',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Fill in the blank with the right Tense form of the verb:',
    prompt: 'Birds _____ (fly) in the sky every morning.',
    answer: 'fly',
    acceptableAnswers: ['fly'],
    marks: 1,
    explanation: {
      en: '"Every morning" expresses a habitual truth with plural subject "Birds", requiring base V1 "fly".',
      bn: 'নিয়মিত অভ্যাস বোঝালে এবং Subject বহুবচন ("Birds") হলে Verb-এর V1 ("fly") বসে।',
    },
  },
  {
    id: 'vrb-j-3',
    topic: 'verbs',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Write the Past Simple (V2) form of the verb in brackets:',
    prompt: 'Yesterday we _____ (go) to the science museum.',
    answer: 'went',
    acceptableAnswers: ['went'],
    marks: 1,
    explanation: {
      en: '"Yesterday" signals Past Indefinite; the V2 form of irregular verb "go" is "went".',
      bn: '"Yesterday" অতীত নির্দেশ করায় "go"-এর V2 রূপ "went" বসে।',
    },
  },
  {
    id: 'vrb-s-1',
    topic: 'verbs',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'He _____ (study) English for two hours before dinner last night.',
    answer: 'had been studying',
    acceptableAnswers: ['had been studying', 'studied'],
    marks: 1,
    explanation: {
      en: 'Duration ("for two hours") preceding a past event ("before dinner last night") uses Past Perfect Continuous ("had been studying").',
      bn: 'অতীতের কোনো ঘটনার আগে নির্দিষ্ট সময় ধরে কাজ চলছিল বোঝালে Past Perfect Continuous ("had been studying") বসে।',
    },
  },
  {
    id: 'vrb-s-2',
    topic: 'verbs',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'If you work sincerely, you _____ (succeed) in life.',
    answer: 'will succeed',
    acceptableAnswers: ['will succeed', 'can succeed'],
    marks: 1,
    explanation: {
      en: 'First Conditional (If + Present Simple) pairs with "will + V1" in the main clause.',
      bn: 'First Conditional-এ If-যুক্ত অংশ Present Simple হলে মূল অংশে "will + V1" বসে।',
    },
  },
  {
    id: 'vrb-s-3',
    topic: 'verbs',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'She prefers _____ (read) biographies before sleeping.',
    answer: 'reading',
    acceptableAnswers: ['reading', 'to read'],
    marks: 1,
    explanation: {
      en: 'After "prefer", the gerund "reading" (or infinitive "to read") expresses general preference.',
      bn: '"prefer"-এর পর সাধারণ পছন্দ বোঝাতে Gerund ("reading") অথবা Infinitive ("to read") বসে।',
    },
  },
  {
    id: 'vrb-h-1',
    topic: 'verbs',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete using the correct Right Form of Verb:',
    prompt: 'No sooner had the bell rung than the students _____ (enter) the hall.',
    answer: 'entered',
    acceptableAnswers: ['entered'],
    marks: 1,
    explanation: {
      en: '"No sooner had + S + V3 ... than + S + V2" requires Past Simple ("entered") in the "than" clause.',
      bn: '"No sooner had ... than" কাঠামোতে "than"-এর পরবর্তী অংশে Verb-এর V2 ("entered") বসে।',
    },
  },
  {
    id: 'vrb-h-2',
    topic: 'verbs',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete using the correct Right Form of Verb:',
    prompt: 'It is high time we _____ (protect) our rivers from pollution.',
    answer: 'protected',
    acceptableAnswers: ['protected'],
    marks: 1,
    explanation: {
      en: 'After "It is high time + subject", English uses the subjunctive Past Simple form ("protected").',
      bn: '"It is high time + subject"-এর পরে সর্বদা Verb-এর Past রূপ (V2 "protected") বসে।',
    },
  },
  {
    id: 'vrb-h-3',
    topic: 'verbs',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete using the correct Right Form of Verb:',
    prompt: 'Had I known about the seminar, I _____ (attend) it gladly.',
    answer: 'would have attended',
    acceptableAnswers: ['would have attended'],
    marks: 1,
    explanation: {
      en: 'Third Conditional ("Had I + V3...") requires "would have + V3" in the result clause.',
      bn: 'Third Conditional ("Had I + V3") হলে ফলাফলের অংশে "would have + V3" বসে।',
    },
  },
  {
    id: 'vrb-j-4',
    topic: 'verbs',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Write the Past Simple (V2) form of the verb in brackets:',
    prompt: 'The boy _____ (swim) across the calm pond yesterday.',
    answer: 'swam',
    acceptableAnswers: ['swam'],
    marks: 1,
    explanation: {
      en: '"Yesterday" calls for Past Simple; the V2 of irregular verb "swim" is "swam".',
      bn: '"Yesterday" অতীত নির্দেশ করায় "swim"-এর V2 রূপ "swam" বসে।',
    },
  },
  {
    id: 'vrb-j-5',
    topic: 'verbs',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'Listen! Someone _____ (knock) at the front door.',
    answer: 'is knocking',
    acceptableAnswers: ['is knocking'],
    marks: 1,
    explanation: {
      en: '"Listen!" signals an action happening right now, using Present Continuous ("is knocking").',
      bn: '"Listen!" বর্তমান চলমান কাজ বোঝানোয় Present Continuous ("is knocking") বসে।',
    },
  },
  {
    id: 'vrb-j-6',
    topic: 'verbs',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Write the Past Participle (V3) form of the verb in brackets:',
    prompt: 'They have already _____ (choose) their team captain.',
    answer: 'chosen',
    acceptableAnswers: ['chosen'],
    marks: 1,
    explanation: {
      en: 'After "have", Present Perfect requires V3 of "choose", which is "chosen".',
      bn: '"have"-এর পর "choose"-এর V3 রূপ "chosen" বসে।',
    },
  },
  {
    id: 'vrb-j-7',
    topic: 'verbs',
    difficulty: 'Junior',
    type: 'text',
    instruction: 'Fill in the blank with the right form of the verb:',
    prompt: 'Water _____ (boil) at 100 degrees Celsius.',
    answer: 'boils',
    acceptableAnswers: ['boils'],
    marks: 1,
    explanation: {
      en: 'Scientific facts use Present Simple; uncountable singular subject "Water" takes "-s" ("boils").',
      bn: 'বৈজ্ঞানিক সত্য বোঝালে Present Simple এবং একবচন Subject-এর সাথে "boils" বসে।',
    },
  },
  {
    id: 'vrb-s-4',
    topic: 'verbs',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'While I _____ (walk) home, it suddenly started raining.',
    answer: 'was walking',
    acceptableAnswers: ['was walking'],
    marks: 1,
    explanation: {
      en: 'An ongoing past action interrupted by another past event takes Past Continuous ("was walking").',
      bn: 'অতীতে চলমান কোনো কাজের মাঝে আরেকটি কাজ ঘটলে চলমান অংশে Past Continuous ("was walking") বসে।',
    },
  },
  {
    id: 'vrb-s-5',
    topic: 'verbs',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'English is _____ (speak) in many countries around the world.',
    answer: 'spoken',
    acceptableAnswers: ['spoken'],
    marks: 1,
    explanation: {
      en: 'Passive structure "is + V3" requires the Past Participle "spoken".',
      bn: 'Passive বাক্যে "is"-এর পর Verb-এর V3 ("spoken") বসে।',
    },
  },
  {
    id: 'vrb-s-6',
    topic: 'verbs',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'She looks forward to _____ (meet) her cousins next Friday.',
    answer: 'meeting',
    acceptableAnswers: ['meeting'],
    marks: 1,
    explanation: {
      en: 'Phrasal prepositional expressions like "look forward to" are followed by a gerund ("meeting").',
      bn: '"look forward to"-এর পরে Verb-এর সাথে "-ing" (Gerund "meeting") বসে।',
    },
  },
  {
    id: 'vrb-s-7',
    topic: 'verbs',
    difficulty: 'SSC Standard',
    type: 'text',
    instruction: 'Use the right form of the verb in brackets:',
    prompt: 'Neither Rahim nor his friends _____ (be) present yesterday.',
    answer: 'were',
    acceptableAnswers: ['were'],
    marks: 1,
    explanation: {
      en: 'With "Neither ... nor ...", the verb agrees with the nearer plural subject ("friends") in Past Simple -> "were".',
      bn: '"Neither...nor" থাকলে নিকটবর্তী Subject ("friends") বহুবচন হওয়ায় অতীতকালে "were" বসে।',
    },
  },
  {
    id: 'vrb-h-4',
    topic: 'verbs',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete using the correct Right Form of Verb:',
    prompt: 'He talks as if he _____ (know) everything about astronomy.',
    answer: 'knew',
    acceptableAnswers: ['knew'],
    marks: 1,
    explanation: {
      en: 'When the clause before "as if" is Present Simple ("talks"), the clause after takes Past Simple ("knew").',
      bn: '"as if"-এর পূর্বের অংশ Present Simple হলে পরের অংশে Past Simple ("knew") বসে।',
    },
  },
  {
    id: 'vrb-h-5',
    topic: 'verbs',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete using the correct Right Form of Verb:',
    prompt: 'Five years have passed since we last _____ (visit) Sylhet.',
    answer: 'visited',
    acceptableAnswers: ['visited'],
    marks: 1,
    explanation: {
      en: 'When "since" is preceded by Present Perfect/Simple, the "since" clause uses Past Indefinite ("visited").',
      bn: '"since"-এর আগের অংশ Present হলে পরের অংশ Past Indefinite ("visited") হয়।',
    },
  },
  {
    id: 'vrb-h-6',
    topic: 'verbs',
    difficulty: 'HSC Advanced',
    type: 'text',
    instruction: 'Complete using the correct Right Form of Verb:',
    prompt: 'Walk carefully lest you _____ (stumble) on the wet stairs.',
    answer: 'should stumble',
    acceptableAnswers: ['should stumble', 'might stumble', 'stumble'],
    marks: 1,
    explanation: {
      en: 'The conjunction "lest" takes "should/might + V1" ("should stumble").',
      bn: '"lest" থাকলে Subject-এর পর "should / might + V1" বসে।',
    },
  },
];

export function normalizeExamAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .trim();
}

export function isExamAnswerCorrect(
  userAnswer: string,
  question: Pick<ExamQuestion, 'answer' | 'acceptableAnswers'>,
): boolean {
  const normUser = normalizeExamAnswer(userAnswer);
  if (!normUser) return false;
  const accepted = [
    question.answer,
    ...(question.acceptableAnswers || []),
  ].map(normalizeExamAnswer);
  return accepted.includes(normUser);
}

export function generateLocalMockExam(params: {
  title?: string;
  topics: GrammarExamTopic[];
  difficulty: ExamDifficulty;
  count: number;
  durationMinutes?: number;
  shuffle?: boolean;
}): MockExamPaper {
  const selectedTopics =
    params.topics.length > 0 ? params.topics : [...ALL_GRAMMAR_TOPICS];
  const clampedCount = Math.max(3, Math.min(25, Math.round(params.count || 10)));

  // Tier-exact first, then fallback to other difficulties within selected topics
  const exactMatches = QUESTION_BANK.filter(
    (q) => selectedTopics.includes(q.topic) && q.difficulty === params.difficulty,
  );
  const remainingTopicMatches = QUESTION_BANK.filter(
    (q) => selectedTopics.includes(q.topic) && q.difficulty !== params.difficulty,
  );

  const orderedPool = params.shuffle
    ? [
        ...[...exactMatches].sort(() => Math.random() - 0.5),
        ...[...remainingTopicMatches].sort(() => Math.random() - 0.5),
      ]
    : [...exactMatches, ...remainingTopicMatches];

  // Round-robin by selected topics for balanced coverage when multiple topics chosen
  const picked: ExamQuestion[] = [];
  const usedIds = new Set<string>();

  let round = 0;
  while (picked.length < clampedCount && round < clampedCount + 5) {
    let addedThisRound = false;
    for (const topic of selectedTopics) {
      if (picked.length >= clampedCount) break;
      const candidate = orderedPool.find(
        (q) => q.topic === topic && !usedIds.has(q.id),
      );
      if (candidate) {
        picked.push(candidate);
        usedIds.add(candidate.id);
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break;
    round += 1;
  }

  // Fill any remainder from pool if requested count exceeds unique topic-balanced slots
  for (const q of orderedPool) {
    if (picked.length >= clampedCount) break;
    if (!usedIds.has(q.id)) {
      picked.push(q);
      usedIds.add(q.id);
    }
  }

  const totalMarks = picked.reduce((sum, q) => sum + q.marks, 0);
  const title =
    params.title?.trim() || `${params.difficulty} Grammar Section Mock Exam`;

  return {
    id: `exam-${Date.now().toString(36)}`,
    title,
    difficulty: params.difficulty,
    topics: selectedTopics,
    totalMarks,
    durationMinutes: params.durationMinutes ?? 0,
    questions: picked,
    source: 'local',
  };
}

export function gradeMockExam(
  paper: MockExamPaper,
  userAnswers: Record<string, string>,
): MockExamGradeReport {
  const results: GradedQuestionResult[] = [];
  const topicStats = new Map<GrammarExamTopic, { correct: number; total: number }>();

  let earnedMarks = 0;
  let correctCount = 0;

  for (const q of paper.questions) {
    const userAnswer = userAnswers[q.id] ?? '';
    const isCorrect = isExamAnswerCorrect(userAnswer, q);
    const earned = isCorrect ? q.marks : 0;
    earnedMarks += earned;
    if (isCorrect) correctCount += 1;

    const currentTopicStat = topicStats.get(q.topic) || { correct: 0, total: 0 };
    currentTopicStat.total += 1;
    if (isCorrect) currentTopicStat.correct += 1;
    topicStats.set(q.topic, currentTopicStat);

    results.push({
      questionId: q.id,
      topic: q.topic,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect,
      earnedMarks: earned,
      maxMarks: q.marks,
    });
  }

  const totalCount = paper.questions.length;
  const totalMarks = paper.totalMarks || totalCount || 1;
  const percentage = Math.round((earnedMarks / totalMarks) * 100);

  const letterGrade =
    percentage >= 80
      ? 'A+'
      : percentage >= 70
        ? 'A'
        : percentage >= 60
          ? 'A-'
          : percentage >= 50
            ? 'B'
            : percentage >= 40
              ? 'C'
              : percentage >= 33
                ? 'D'
                : 'F';

  const topicBreakdown = Array.from(topicStats.entries()).map(([topic, stat]) => ({
    topic,
    correct: stat.correct,
    total: stat.total,
    percentage: Math.round((stat.correct / Math.max(1, stat.total)) * 100),
  }));

  return {
    earnedMarks,
    totalMarks,
    correctCount,
    totalCount,
    percentage,
    letterGrade,
    results,
    topicBreakdown,
  };
}
