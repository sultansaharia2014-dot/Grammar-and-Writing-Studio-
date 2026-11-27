import { WriterLength, WriterResult, WriterTone } from '../types/studio';

export function countTextStats(text: string): {
  wordCount: number;
  sentenceCount: number;
  lineCount: number;
} {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    wordCount: words.length,
    sentenceCount: Math.max(1, sentences.length),
    lineCount: lines.length,
  };
}

/**
 * Parses natural user entries like "250", "250s", "150 words", "15 lines".
 */
export function parseCustomCountInput(raw: string): number | null {
  const match = raw.match(/\d+/);
  if (!match) return null;
  const num = parseInt(match[0], 10);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Adjusts a paragraph or multi-paragraph composition to match an exact target word count
 * while keeping complete sentences and natural punctuation.
 */
function fitToExactWordCount(
  sentencePool: string[],
  targetWords: number,
  isMultiParagraph: boolean,
  isStory = false,
): string {
  const clampedTarget = Math.max(20, Math.min(2000, Math.round(targetWords)));
  const selected: string[] = [];
  let currentWords = 0;

  // Cycle through rich sentences with slight connector variations if very large target
  const expandedPool: string[] = [...sentencePool];
  const connectors = isStory
    ? [
        'Soon after,',
        'Before long,',
        'As the day went on,',
        'With quiet resolve,',
        'From that moment onward,',
        'Yet in the quiet stillness,',
      ]
    : [
        'Moreover,',
        'In addition,',
        'Equally important,',
        'Beyond the classroom,',
        'Looking closer,',
        'Over time,',
      ];
  let pass = 0;
  while (
    expandedPool.reduce((acc, s) => acc + countWords(s), 0) < clampedTarget + 60 &&
    pass < 12
  ) {
    const conn = connectors[pass % connectors.length];
    const base = sentencePool[(pass + 1) % sentencePool.length];
    const lowered = base.charAt(0).toLowerCase() + base.slice(1);
    expandedPool.push(`${conn} ${lowered}`);
    pass += 1;
  }

  for (const sent of expandedPool) {
    const w = countWords(sent);
    if (currentWords + w <= clampedTarget) {
      selected.push(sent);
      currentWords += w;
    } else if (currentWords < clampedTarget) {
      const remaining = clampedTarget - currentWords;
      if (remaining >= 6) {
        const tailWords = sent.replace(/[.!?]+$/, '').split(/\s+/).slice(0, remaining);
        // Avoid trailing dangling prepositions/articles if possible
        while (
          tailWords.length > 4 &&
          /^(a|an|the|and|or|but|of|in|on|at|to|for|with|by)$/i.test(
            tailWords[tailWords.length - 1],
          )
        ) {
          tailWords.pop();
        }
        selected.push(`${tailWords.join(' ')}.`);
        currentWords = selected.reduce((acc, s) => acc + countWords(s), 0);
      }
      break;
    }
    if (currentWords >= clampedTarget) break;
  }

  // Fine-tune exact delta (usually 0-5 words) cleanly
  let allWords = selected.join(' ').trim().split(/\s+/).filter(Boolean);
  const padWords = ['truly', 'deeply', 'every', 'single', 'day', 'today'];
  if (allWords.length < clampedTarget) {
    const lastIdx = allWords.length - 1;
    const lastToken = allWords[lastIdx] || 'life.';
    const punctMatch = lastToken.match(/([.!?]+)$/);
    const punct = punctMatch ? punctMatch[1] : '.';
    allWords[lastIdx] = lastToken.replace(/[.!?]+$/, '');
    let pIdx = 0;
    while (allWords.length < clampedTarget) {
      const diff = clampedTarget - allWords.length;
      if (diff >= 3 && pIdx === 0) {
        allWords.push('in', 'our', 'lives');
      } else {
        allWords.push(padWords[pIdx % padWords.length]);
        pIdx += 1;
      }
    }
    allWords[allWords.length - 1] = `${allWords[allWords.length - 1]}${punct}`;
  } else if (allWords.length > clampedTarget) {
    allWords = allWords.slice(0, clampedTarget);
    const lastIdx = allWords.length - 1;
    if (!/[.!?]$/.test(allWords[lastIdx])) {
      allWords[lastIdx] = `${allWords[lastIdx].replace(/[,;:]+$/, '')}.`;
    }
  }

  const joined = allWords.join(' ');
  if (!isMultiParagraph) {
    return joined;
  }

  // Group into balanced readable paragraphs without altering word count
  const wordsArr = joined.split(/\s+/).filter(Boolean);
  if (wordsArr.length <= 75) return joined;

  const numParas = wordsArr.length >= 280 ? 4 : wordsArr.length >= 150 ? 3 : 2;
  const approxPerPara = Math.ceil(wordsArr.length / numParas);
  const paragraphs: string[] = [];
  let buf: string[] = [];

  for (let i = 0; i < wordsArr.length; i++) {
    buf.push(wordsArr[i]);
    const isSentenceEnd = /[.!?]$/.test(wordsArr[i]);
    if (
      isSentenceEnd &&
      buf.length >= approxPerPara - 10 &&
      paragraphs.length < numParas - 1 &&
      i < wordsArr.length - 12
    ) {
      paragraphs.push(buf.join(' '));
      buf = [];
    }
  }
  if (buf.length > 0) {
    paragraphs.push(buf.join(' '));
  }

  return paragraphs.join('\n\n');
}

const FORMAL_ROLE_OR_TOPIC_REGEX =
  /\b(bank|banker|manager|principal|headmaster|headmistress|head\s+teacher|teacher|professor|lecturer|dean|chancellor|doctor|physician|dentist|surgeon|nurse|patient|officer|inspector|police|magistrate|mayor|minister|director|ceo|hr|interviewer|interview|passport|visa|embassy|librarian|customer|client|applicant|candidate|receptionist|cashier|clerk|counselor|lawyer|advocate|judge|landlord|boss|supervisor|employer|account|loan|cheque|deposit|withdraw|atm|credit\s+card|application|leave\s+of\s+absence|transfer\s+certificate|testimonial|complaint|appointment|admission|formal|official|inquiry|enquiry|clinic|hospital|office|company|authority|scholarship|sir|madam|ma'am)\b/i;

const OFFICIAL_ROLE_REGEX =
  /\b(manager|principal|headmaster|headmistress|head\s+teacher|teacher|professor|lecturer|dean|doctor|physician|dentist|surgeon|officer|inspector|police|magistrate|mayor|minister|director|ceo|hr|interviewer|librarian|receptionist|cashier|clerk|counselor|lawyer|judge|landlord|boss|supervisor|employer|banker|authority)\b/i;

const BANKING_TOPIC_REGEX =
  /\b(bank|banker|bank\s+manager|account|loan|cheque|deposit|withdraw|atm|credit\s+card|debit\s+card|kyc|branch)\b/i;

const MEDICAL_TOPIC_REGEX =
  /\b(doctor|physician|dentist|surgeon|nurse|patient|clinic|hospital|health\s+checkup|prescription|medicine|appointment)\b/i;

const ACADEMIC_OFFICE_TOPIC_REGEX =
  /\b(principal|headmaster|headmistress|head\s+teacher|dean|admission|leave\s+of\s+absence|transfer\s+certificate|testimonial|scholarship|librarian|library)\b/i;

function cleanRoleLabel(raw: string, topic: string): string {
  const cleaned = raw
    .replace(/^(a|an|the|my|one)\s+/i, '')
    .replace(/[?.!,;:]+$/g, '')
    .trim();

  if (/^(me|myself|i)$/i.test(cleaned)) {
    if (BANKING_TOPIC_REGEX.test(topic)) return 'Customer';
    if (MEDICAL_TOPIC_REGEX.test(topic)) return 'Patient';
    if (ACADEMIC_OFFICE_TOPIC_REGEX.test(topic)) return 'Student';
    if (/\b(interview|visa|passport|embassy|job|application)\b/i.test(topic)) return 'Applicant';
    return 'Visitor';
  }

  return titleCase(cleaned);
}

export function isFormalDialogueTopic(
  topic: string,
  speakers?: string,
  tone?: WriterTone,
): boolean {
  const combined = `${topic} ${speakers || ''}`;
  if (FORMAL_ROLE_OR_TOPIC_REGEX.test(combined)) return true;
  if (tone === 'Academic' && OFFICIAL_ROLE_REGEX.test(combined)) return true;
  return false;
}

export function inferSpeakersFromTopic(topic: string): [string, string] | null {
  const trimmed = topic.trim();
  if (!trimmed) return null;

  const betweenMatch = trimmed.match(
    /\bbetween\s+(.+?)\s+and\s+(.+?)(?=\s+(?:about|on|regarding|for|at|in|to)\b|[?.!]|$)/i,
  );
  if (betweenMatch) {
    const first = cleanRoleLabel(betweenMatch[1], trimmed);
    const second = cleanRoleLabel(betweenMatch[2], trimmed);
    if (first && second && first.toLowerCase() !== second.toLowerCase()) {
      return [first, second];
    }
  }

  const withMatch = trimmed.match(
    /\b(?:conversation|dialogue|talk|meeting|interview)\s+with\s+(?:a|an|the)?\s*(.+?)(?=\s+(?:about|on|regarding|for)\b|[?.!]|$)/i,
  );
  if (withMatch) {
    const second = cleanRoleLabel(withMatch[1], trimmed);
    const first = cleanRoleLabel('me', trimmed);
    if (second && first.toLowerCase() !== second.toLowerCase()) {
      return [first, second];
    }
  }

  if (/\bbank\s+manager\b/i.test(trimmed)) return ['Customer', 'Bank Manager'];
  if (/\bdoctor\b/i.test(trimmed)) return ['Patient', 'Doctor'];
  if (/\bprincipal\b/i.test(trimmed)) return ['Student', 'Principal'];
  if (/\blibrarian\b/i.test(trimmed)) return ['Student', 'Librarian'];
  if (/\binterviewer\b/i.test(trimmed)) return ['Candidate', 'Interviewer'];
  if (/\bvisa\s+officer\b/i.test(trimmed)) return ['Applicant', 'Visa Officer'];

  return null;
}

export function resolveDialogueSpeakers(topic: string, speakers?: string): [string, string] {
  const raw = (speakers || '').trim();
  const isDefaultSpeakers =
    !raw || /^rakib\s*(&|and|,)\s*abdullah$/i.test(raw);

  if (isDefaultSpeakers) {
    const inferred = inferSpeakersFromTopic(topic);
    if (inferred) return inferred;
  }

  const parts = (raw || 'Rakib & Abdullah')
    .split(/&|,|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return [parts[0] || 'Rakib', parts[1] || 'Abdullah'];
}

function normalizeDialogueSubject(topic: string): string {
  let cleaned = topic
    .trim()
    .replace(/^(?:write\s+)?(?:a\s+)?(?:formal\s+)?(?:dialogue|conversation|talk|interview)\s+(?:between\s+.+?\s+and\s+.+?|with\s+.+?)\s+(?:on|about|regarding)\s+/i, '')
    .trim();

  if (cleaned !== topic.trim() && cleaned.length > 0) {
    return cleaned.replace(/[.?!]+$/, '');
  }

  // If topic itself is just "a conversation between me and a bank manager"
  if (/^(?:a\s+)?(?:formal\s+)?(?:dialogue|conversation|talk|meeting)\s+(?:between|with)\b/i.test(topic.trim())) {
    if (BANKING_TOPIC_REGEX.test(topic)) return 'opening a bank account and banking services';
    if (MEDICAL_TOPIC_REGEX.test(topic)) return 'a medical consultation';
    if (ACADEMIC_OFFICE_TOPIC_REGEX.test(topic)) return 'an official academic matter';
    return 'this official matter';
  }

  return topic.trim().replace(/[.?!]+$/, '');
}

function buildFormalDialogueLines(
  s1: string,
  s2: string,
  rawTopic: string,
  cleanSubject: string,
  targetLines: number,
): string {
  const clamped = Math.max(2, Math.min(250, Math.round(targetLines)));
  // Place inquirer first and official second for natural formal etiquette
  const s1IsOfficial = OFFICIAL_ROLE_REGEX.test(s1) && !OFFICIAL_ROLE_REGEX.test(s2);
  const inquirer = s1IsOfficial ? s2 : s1;
  const official = s1IsOfficial ? s1 : s2;
  const honorific = /\b(madam|ma'am|ms\.|mrs\.|headmistress)\b/i.test(`${rawTopic} ${official}`)
    ? "Ma'am"
    : 'Sir';

  const isBanking = BANKING_TOPIC_REGEX.test(`${rawTopic} ${s1} ${s2}`);
  const isMedical = MEDICAL_TOPIC_REGEX.test(`${rawTopic} ${s1} ${s2}`);

  const openings: Array<[string, string]> = isBanking
    ? [
        [inquirer, `Good morning, ${honorific}. May I come in?`],
        [official, `Good morning. Please come in and take a seat. How may I assist you today?`],
        [
          inquirer,
          `Thank you, ${honorific}. I would like to discuss ${cleanSubject} and learn about the required procedures.`,
        ],
        [
          official,
          `Certainly. I would be pleased to guide you. Could you let me know the specific type of service or account you need?`,
        ],
      ]
    : isMedical
      ? [
          [inquirer, `Good morning, Doctor. May I come in?`],
          [official, `Good morning. Please come in and have a seat. What brings you in today?`],
          [
            inquirer,
            `Thank you, Doctor. I am here regarding ${cleanSubject} and would appreciate your professional advice.`,
          ],
          [
            official,
            `Of course. Please describe your symptoms and how long you have been experiencing them.`,
          ],
        ]
      : [
          [inquirer, `Good morning, ${honorific}. May I come in?`],
          [official, `Good morning. Please come in and have a seat. How may I assist you today?`],
          [
            inquirer,
            `Thank you very much, ${honorific}. I have come to speak with you regarding ${cleanSubject}.`,
          ],
          [
            official,
            `Certainly. Please share the details clearly so that I can provide the appropriate guidance.`,
          ],
        ];

  const middlePool: Array<[string, string]> = isBanking
    ? [
        [
          inquirer,
          `I wish to open a personal savings account with regular transaction and online banking facilities.`,
        ],
        [
          official,
          `Very well. We offer standard savings accounts tailored for personal, student, and salaried clients.`,
        ],
        [
          inquirer,
          `Could you kindly inform me which official documents I need to submit with the application?`,
        ],
        [
          official,
          `You will need your valid national ID or passport, two recent passport-size photographs, and proof of address.`,
        ],
        [
          inquirer,
          `Is an introductory reference or an initial deposit required at the time of submission?`,
        ],
        [
          official,
          `Yes, a modest initial deposit is required, and our verification officer will review your KYC form.`,
        ],
        [
          inquirer,
          `May I also inquire about ATM card issuance and secure mobile banking activation?`,
        ],
        [
          official,
          `Both facilities are included once your identity verification is completed and approved by our branch.`,
        ],
        [
          inquirer,
          `How many working days does the complete account activation process normally take?`,
        ],
        [
          official,
          `It typically takes two to three working days, provided every document is accurate and complete.`,
        ],
        [
          inquirer,
          `Are there any annual maintenance charges or minimum balance requirements I should keep in mind?`,
        ],
        [
          official,
          `Yes, our schedule of charges explains the minimum balance policy clearly; I am providing a copy for your reference.`,
        ],
        [
          inquirer,
          `Thank you for clarifying that. Where should I submit the completed form and supporting papers?`,
        ],
        [
          official,
          `Please submit your signed application at Desk Two, where our customer service executive will issue an acknowledgment receipt.`,
        ],
      ]
    : isMedical
      ? [
          [
            inquirer,
            `The discomfort started three days ago and has made it difficult to rest properly at night.`,
          ],
          [
            official,
            `I understand. Let me examine your vitals carefully before recommending any treatment.`,
          ],
          [
            inquirer,
            `Should I undergo any diagnostic tests to confirm the exact cause?`,
          ],
          [
            official,
            `Yes, a routine blood screening will give us accurate clarity and ensure safe treatment.`,
          ],
          [
            inquirer,
            `Are there specific dietary precautions or daily habits I should follow this week?`,
          ],
          [
            official,
            `Stay well hydrated, take balanced meals on time, and avoid strenuous physical exertion.`,
          ],
          [
            inquirer,
            `How long should I continue the prescribed medication before scheduling a follow-up visit?`,
          ],
          [
            official,
            `Please complete the full five-day course and return next week with your test reports.`,
          ],
        ]
      : [
          [
            inquirer,
            `Could you please outline the official requirements and guidelines for ${cleanSubject}?`,
          ],
          [
            official,
            `Certainly. First, you must submit a formal written request along with the necessary supporting documents.`,
          ],
          [
            inquirer,
            `I have brought my identification and relevant records. Would you like me to present them now?`,
          ],
          [
            official,
            `Yes, please place them on the desk so I can verify everything thoroughly.`,
          ],
          [
            inquirer,
            `Is there a specific deadline or processing window I should be aware of?`,
          ],
          [
            official,
            `Applications are reviewed within three working days, and you will receive an official notification promptly.`,
          ],
          [
            inquirer,
            `Are there any additional formalities or approvals needed from another department?`,
          ],
          [
            official,
            `No further department clearance is necessary once our office completes the primary verification.`,
          ],
          [
            inquirer,
            `Could you confirm whom I should contact if I need an update on the status?`,
          ],
          [
            official,
            `You may contact our front inquiry desk during office hours with your reference number.`,
          ],
        ];

  const closings: Array<[string, string]> = [
    [
      inquirer,
      `Thank you very much for your valuable time and clear guidance, ${isMedical ? 'Doctor' : honorific}.`,
    ],
    [
      official,
      `You are most welcome. Please do not hesitate to reach out if you require any further assistance.`,
    ],
  ];

  if (clamped <= 4) {
    return openings
      .slice(0, clamped)
      .map(([sp, text]) => `${sp}: ${text}`)
      .join('\n');
  }

  const lines: string[] = openings.map(([sp, text]) => `${sp}: ${text}`);
  const middleNeeded = clamped - openings.length - closings.length;
  for (let i = 0; i < middleNeeded; i++) {
    const pair = middlePool[i % middlePool.length];
    const speaker = i % 2 === 0 ? inquirer : official;
    lines.push(`${speaker}: ${pair[1]}`);
  }

  const lastSpeakerWasInquirer = (openings.length + middleNeeded) % 2 === 1;
  const c1Speaker = lastSpeakerWasInquirer ? official : inquirer;
  const c2Speaker = c1Speaker === inquirer ? official : inquirer;
  lines.push(`${c1Speaker}: ${closings[0][1]}`);
  lines.push(`${c2Speaker}: ${closings[1][1]}`);

  return lines.slice(0, clamped).join('\n');
}

function buildDialogueLines(
  s1: string,
  s2: string,
  cleanTopic: string,
  targetLines: number,
  tone: WriterTone,
): string {
  if (isFormalDialogueTopic(cleanTopic, `${s1} & ${s2}`, tone)) {
    const subject = normalizeDialogueSubject(cleanTopic);
    return buildFormalDialogueLines(s1, s2, cleanTopic, subject, targetLines);
  }

  const clamped = Math.max(2, Math.min(250, Math.round(targetLines)));

  const openings: Array<[string, string]> = [
    [s1, `Assalamu Alaikum, ${s2}. How are you doing today?`],
    [s2, `Walaikum Assalam, ${s1}. I am doing great! What is on your mind?`],
    [s1, `I have been thinking a lot about ${cleanTopic} lately.`],
    [s2, `Oh, ${cleanTopic} is such an important and timely subject right now.`],
  ];

  const middlePool: Array<[string, string]> = [
    [s1, `Why do you think ${cleanTopic} matters so much in our everyday lives?`],
    [s2, `First, it directly shapes how we learn, solve problems, and plan our future.`],
    [s1, `That is true. Many students are eager to explore ${cleanTopic} more deeply.`],
    [s2, `Yes, and understanding both its benefits and responsibilities keeps us balanced.`],
    [s1, `What is the biggest advantage people gain from focusing on ${cleanTopic}?`],
    [s2, `It saves valuable time, opens fresh opportunities, and encourages creative thinking.`],
    [s1, `Are there any challenges we should be careful about along the way?`],
    [s2, `Definitely. Without discipline and clear judgment, small mistakes can turn into bad habits.`],
    [s1, `How can students practice wise habits when dealing with ${cleanTopic}?`],
    [s2, `Setting clear daily goals and asking mentors for guidance makes a huge difference.`],
    [s1, `I noticed our teachers also emphasized ${cleanTopic} during yesterday's seminar.`],
    [s2, `Right! They explained how real progress depends on curiosity paired with responsibility.`],
    [s1, `Could you share one practical example that relates to daily student life?`],
    [s2, `Sure—even dedicating twenty focused minutes each evening builds strong, lasting mastery.`],
    [s1, `That sounds realistic and easy to maintain even during busy exam weeks.`],
    [s2, `Consistency always beats occasional bursts of effort in the long run.`],
    [s1, `How do you see ${cleanTopic} evolving over the next few years?`],
    [s2, `It will become even more connected to teamwork, communication, and lifelong learning.`],
    [s1, `Do you think sharing what we learn with friends helps everyone improve faster?`],
    [s2, `Without a doubt! Discussion clarifies complex ideas and builds mutual confidence.`],
  ];

  const closings: Array<[string, string]> = [
    [s1, `Thank you so much for sharing such thoughtful insights on ${cleanTopic}, ${s2}.`],
    [s2, `You are most welcome, ${s1}! Let us continue exploring it together tomorrow.`],
  ];

  if (clamped <= 4) {
    return openings
      .slice(0, clamped)
      .map(([sp, text]) => `${sp}: ${text}`)
      .join('\n');
  }

  const lines: string[] = [];
  for (const [sp, text] of openings) {
    lines.push(`${sp}: ${text}`);
  }

  const middleNeeded = clamped - openings.length - closings.length;
  for (let i = 0; i < middleNeeded; i++) {
    const pair = middlePool[i % middlePool.length];
    const speaker = i % 2 === 0 ? s1 : s2;
    lines.push(`${speaker}: ${pair[1]}`);
  }

  // Ensure closing speakers alternate smoothly
  const lastSpeakerIsS1 = (openings.length + middleNeeded) % 2 === 1;
  const c1Speaker = lastSpeakerIsS1 ? s2 : s1;
  const c2Speaker = c1Speaker === s1 ? s2 : s1;
  lines.push(`${c1Speaker}: ${closings[0][1]}`);
  lines.push(`${c2Speaker}: ${closings[1][1]}`);

  return lines.slice(0, clamped).join('\n');
}

interface StoryTemplate {
  match: RegExp;
  title: string;
  paragraphs: string[];
  keyPhrases: string[];
  bengaliNote: string;
}

const CLASSIC_STORIES: StoryTemplate[] = [
  {
    match: /\b(liar\s+shepherd|shepherd\s+boy|boy\s+who\s+cried\s+wolf|cried\s+wolf)\b/i,
    title: 'A Liar Shepherd Boy',
    paragraphs: [
      'Once upon a time, there lived a young shepherd boy in a quiet hillside village near a thick green forest. Every morning, he drove his flock of sheep to graze on the sunny slopes while the villagers worked steadily in the fields below.',
      'Growing bored of watching the peaceful sheep hour after hour, the boy thought of a mischievous trick to amuse himself. Cupping his hands around his mouth, he shouted at the top of his lungs, "Wolf! Wolf! A fierce wolf is chasing my sheep!" Hearing his desperate cries, the kind-hearted farmers dropped their sickles and spades and sprinted up the hill with sticks in hand to drive the beast away.',
      'When they reached the pasture out of breath, there was no wolf to be seen anywhere. Instead, the shepherd boy sat on a rock laughing heartily at their worried faces. Shaking their heads in disappointment, the villagers warned him never to tell lies again and walked slowly back to their work. Yet a few days later, the foolish boy played the very same trick a second time, and once again he laughed as the farmers hurried up the slope in vain.',
      'One misty afternoon toward dusk, a real wolf crept silently out of the dark woods and sprang toward the helpless flock. Terrified, the shepherd boy leaped to his feet and screamed with all his strength, "Wolf! Wolf! Please come and save my sheep!" Although his voice echoed across the valley, the villagers below believed it was only another cruel joke and stayed in their fields.',
      'With nobody coming to help, the wolf scattered the flock and carried away the boy’s finest lambs into the forest. Sitting alone on the hillside with tears in his eyes, the boy finally learned the bitter lesson that nobody believes a liar, even when he speaks the plain truth.',
    ],
    keyPhrases: ['mischievous trick', 'kind-hearted villagers', 'cruel joke', 'nobody believes a liar'],
    bengaliNote: 'গল্প: A Liar Shepherd Boy — মিথ্যা বললে সত্যের সময়ও কেউ বিশ্বাস করে না, এই নৈতিক শিক্ষামূলক গল্প।',
  },
  {
    match: /\b(honesty\s+is\s+the\s+best\s+policy|honest\s+woodcutter|woodcutter|golden\s+axe)\b/i,
    title: 'Honesty is the Best Policy',
    paragraphs: [
      'Once upon a time, a poor yet truthful woodcutter lived in a modest cottage at the edge of a quiet forest. Every day he worked tirelessly from dawn till dusk, cutting dry branches to earn an honest living for his family.',
      'One scorching afternoon, while he was chopping a stout tree beside a deep rushing river, his iron axe slipped from his sweaty hands and plunged straight into the swirling water. The woodcutter stared helplessly into the stream because that single worn axe was his only means of livelihood, and he sat on the grassy bank weeping quietly.',
      'Moved by his genuine sorrow, a radiant water fairy rose from the shimmering surface and gently asked why he was crying. When the woodcutter explained his misfortune, the fairy dived beneath the waves and returned holding a gleaming axe made of pure solid gold. She held it out and asked, "Is this golden axe yours?" Looking straight at her, the poor man shook his head and replied honestly that it did not belong to him.',
      'The fairy dived a second time and brought up a polished silver axe, yet the woodcutter again refused, saying his own axe was only humble iron with a wooden handle. Finally, the fairy surfaced a third time carrying his old rusted iron axe, and the woodcutter’s face lit up with sincere gratitude as he claimed it as his own.',
      'Deeply impressed by his unwavering integrity, the fairy smiled warmly and rewarded him with both the golden and silver axes alongside his own iron one. He returned home with joy, proving through his character that honesty is truly the best policy in every circumstance of life.',
    ],
    keyPhrases: ['honest living', 'sincere gratitude', 'unwavering integrity', 'best policy'],
    bengaliNote: 'গল্প: Honesty is the Best Policy — সৎ কাঠুরের সততার পুরস্কার ও নৈতিক আদর্শের গল্প।',
  },
  {
    match: /\b(giant\s+and\s+his\s+garden|selfish\s+giant|giant's\s+garden)\b/i,
    title: 'A Giant and His Garden',
    paragraphs: [
      'Once upon a time, a towering giant owned a magnificent garden filled with soft green grass, sparkling blossoms, and twelve sweet peach trees that burst into delicate pink flowers every spring. Every afternoon after school, the village children ran happily into the garden to play beneath the shady branches and listen to the birds singing overhead.',
      'When the giant returned home after seven years away, his booming voice echoed across the lawn as he angrily chased the frightened children out of his gates. Determined to keep the beauty strictly to himself, he built a high stone wall all around the grounds and put up a stern sign forbidding anyone to enter.',
      'Soon spring arrived everywhere across the countryside, bringing warm sunshine and cheerful songbirds to every courtyard except the giant’s locked garden. Inside those tall stone walls, winter lingered stubbornly with biting frost, howling north winds, and heavy snow covering the silent branches because no laughter of children reached the trees.',
      'One bright morning, the giant heard a sweet melody outside his window and looked out in wonder. Through a tiny hole in the wall, the children had crept back in and climbed onto the boughs, and wherever a child sat, the blossoms opened joyfully and the grass turned green again—save in one far corner where a little boy stood crying, too small to reach the lowest branch.',
      'Seeing the lonely child melted the giant’s stony heart at once. Stepping gently outside, he lifted the little boy up into the tree, knocked down the high stone wall with his own hands, and welcomed the children forever after, discovering that his garden blossomed brightest when its joy was shared with others.',
    ],
    keyPhrases: ['delicate blossoms', 'high stone wall', 'stony heart', 'shared joy'],
    bengaliNote: 'গল্প: A Giant and His Garden — স্বার্থপরতা ত্যাগ করে ভালোবাসা ও আনন্দ ভাগ করে নেওয়ার হৃদয়স্পর্শী গল্প।',
  },
  {
    match: /\b(thirsty\s+crow|crow\s+and\s+the\s+pitcher)\b/i,
    title: 'A Thirsty Crow',
    paragraphs: [
      'On a blistering summer afternoon, a thirsty crow flew over dry fields and dusty rooftops searching desperately for a single drop of water. His throat felt parched and his wings grew heavy under the merciless noon sun, yet every pond and brook along the countryside had dried up completely.',
      'Just as his strength began to fade, he spotted an earthen pitcher resting in the cool shade of a courtyard wall. Swooping down hopefully, he peered inside and saw a little water shimmering at the very bottom, far below the reach of his short beak.',
      'The crow tried tipping the heavy jar, then stretched his neck as far as he could, but the water stayed stubbornly out of reach. Instead of giving up in despair, he paused to think carefully and noticed a scatter of small smooth pebbles lying nearby on the ground.',
      'Picking up one pebble at a time in his beak, the clever bird dropped them steadily into the pitcher. With every stone that sank to the bottom, the water level rose higher and higher until at last it reached the brim.',
      'The crow drank deeply to his heart’s content and flew smoothly into the breezy sky, proving that patience and cleverness can overcome even the toughest obstacle.',
    ],
    keyPhrases: ['blistering summer', 'parched throat', 'smooth pebbles', 'patience and cleverness'],
    bengaliNote: 'গল্প: A Thirsty Crow — বুদ্ধি ও ধৈর্যের মাধ্যমে অসম্ভবকে সম্ভব করার শিক্ষামূলক গল্প।',
  },
  {
    match: /\b(unity\s+is\s+strength|bundle\s+of\s+sticks|old\s+farmer\s+and\s+his\s+sons)\b/i,
    title: 'Unity is Strength',
    paragraphs: [
      'In a peaceful farming village lived an aging father who had worked hard all his life to build a prosperous homestead for his three sons. To his deep sorrow, the brothers quarreled constantly over minor matters and refused to help one another in the fields.',
      'Knowing that division would soon ruin everything he had built, the wise old man called all three sons to his bedside one evening. Handing them a tightly tied bundle of wooden sticks, he asked each son in turn to try breaking the bundle across his knee.',
      'One by one, the young men strained with all their might, yet not a single stick in the tied bundle bent or cracked. Smiling gently, the father untied the rope, handed one separate stick to each son, and asked them to try again—and each single stick snapped cleanly in an instant.',
      'Looking kindly at his silent sons, the father explained that just like those sticks, they would remain unbreakable if they stood together in harmony, yet fall easily if they stayed divided.',
      'Deeply moved by this clear lesson, the three brothers embraced one another, promised to work side by side from that day forward, and lived happily remembering that unity is always strength.',
    ],
    keyPhrases: ['bundle of sticks', 'constant quarrels', 'unbreakable bond', 'unity is strength'],
    bengaliNote: 'গল্প: Unity is Strength — একতাই বল, বিভেদ নয় সম্মিলিত প্রচেষ্টাই প্রকৃত শক্তি।',
  },
  {
    match: /\b(hare\s+and\s+the\s+tortoise|slow\s+and\s+steady)\b/i,
    title: 'The Hare and the Tortoise',
    paragraphs: [
      'Deep inside a sunlit meadow lived a boastful hare who loved teasing the slow-moving tortoise about his short legs and clumsy pace. Tired of his endless pride, the calm tortoise smiled one morning and challenged the hare to a friendly race across the forest path.',
      'Amused by the idea, the hare agreed at once, and the woodland animals gathered along the trail to watch. As soon as the signal sounded, the hare bounded ahead like a flash of wind, leaving the tortoise far behind in a cloud of soft dust.',
      'Halfway down the course, the hare glanced back and saw no sign of his rival anywhere on the winding road. Feeling certain of an effortless victory, he curled up beneath a shady oak tree and soon drifted into a deep afternoon nap.',
      'Meanwhile, the tortoise never paused for a moment, placing one steady step after another past the bushes, across the wooden bridge, and straight past the sleeping hare.',
      'When the hare finally woke with a start and dashed toward the finish line, the tortoise was already crossing it to joyful cheers, teaching everyone that slow and steady effort wins the race.',
    ],
    keyPhrases: ['boastful hare', 'steady pace', 'effortless victory', 'slow and steady'],
    bengaliNote: 'গল্প: The Hare and the Tortoise — অধ্যবসায় ও নিয়মিত প্রচেষ্টাই চূড়ান্ত সাফল্য এনে দেয়।',
  },
];

function buildStoryWriting(params: {
  cleanTopic: string;
  tone: WriterTone;
  length: WriterLength;
  customCount?: number;
}): WriterResult {
  const matched = CLASSIC_STORIES.find((item) => item.match.test(params.cleanTopic));
  const title = matched ? matched.title : titleCase(params.cleanTopic);

  const paragraphs = matched
    ? matched.paragraphs
    : [
        `Once upon a time, in a quiet corner of a sunlit town, an ordinary day took an unforgettable turn because of ${params.cleanTopic}. People around often spoke softly about courage and kindness, yet nobody expected how vividly those qualities would soon be tested.`,
        `At the heart of the story stood a thoughtful young learner named Rafi, who believed that patience and honesty mattered far more than hasty shortcuts. Whether walking through busy market lanes or sitting beneath the old banyan tree at dusk, Rafi noticed small details that others easily overlooked.`,
        `One afternoon, an unexpected challenge arrived that put everyone’s resolve under pressure. While others hesitated and looked around in confusion, Rafi stepped forward calmly, listening carefully to those in trouble and thinking through a fair, thoughtful plan step by step.`,
        `Guided by quiet perseverance, Rafi turned a moment of worry into an inspiring example of teamwork and care. Neighbors who had stood apart soon joined in willingly, proving how a single courageous act can awaken goodwill in an entire community.`,
        `When evening settled gently over the town, smiles returned to every doorstep, and the lesson of ${params.cleanTopic} remained etched in everyone’s memory as a timeless reminder that sincerity and determination always light the clearest path forward.`,
      ];

  const toneAdjusted = [...paragraphs];
  if (params.tone === 'Simple' && toneAdjusted.length > 0) {
    toneAdjusted[0] = toneAdjusted[0].replace(/^Once upon a time, /i, 'Long ago, ');
  } else if (params.tone === 'Creative' && toneAdjusted.length > 0) {
    toneAdjusted[0] = `${toneAdjusted[0]} Golden light drifted softly across the scene as the story began.`;
  }

  if (params.length === 'Custom' && params.customCount) {
    const sentencePool = toneAdjusted
      .join(' ')
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const body = fitToExactWordCount(sentencePool, params.customCount, true, true);
    const stats = countTextStats(body);
    return {
      kind: 'story',
      title,
      body,
      keyPhrases: matched?.keyPhrases ?? ['quiet perseverance', 'unexpected challenge', 'timeless reminder', 'clear path'],
      bengaliNote: `গল্প: ${title} — ঠিক ${stats.wordCount} শব্দে সাজানো পূর্ণাঙ্গ গল্প।`,
      ...stats,
      source: 'local',
    };
  }

  const chosenParagraphs =
    params.length === 'Short'
      ? [toneAdjusted[0], toneAdjusted[2] || toneAdjusted[1], toneAdjusted[toneAdjusted.length - 1]]
      : params.length === 'Medium'
        ? [toneAdjusted[0], toneAdjusted[1], toneAdjusted[3] || toneAdjusted[2], toneAdjusted[toneAdjusted.length - 1]]
        : toneAdjusted;

  const body = chosenParagraphs.join('\n\n');
  const stats = countTextStats(body);
  return {
    kind: 'story',
    title,
    body,
    keyPhrases: matched?.keyPhrases ?? ['quiet perseverance', 'unexpected challenge', 'timeless reminder', 'clear path'],
    bengaliNote: matched?.bengaliNote ?? `গল্প: ${title} — ${params.tone} স্টাইলে লেখা প্রাঞ্জল ইংরেজি গল্প।`,
    ...stats,
    source: 'local',
  };
}

export function generateLocalWriting(params: {
  kind: 'paragraph' | 'dialogue' | 'composition' | 'story';
  topic: string;
  tone: WriterTone;
  length: WriterLength;
  customCount?: number;
  speakers?: string;
}): WriterResult {
  const cleanTopic = params.topic.trim() || (params.kind === 'story' ? 'A Liar Shepherd Boy' : 'Importance of Reading Books');
  const title = titleCase(cleanTopic);

  if (params.kind === 'story') {
    return buildStoryWriting({
      cleanTopic,
      tone: params.tone,
      length: params.length,
      customCount: params.customCount,
    });
  }

  if (params.kind === 'dialogue') {
    const [s1, s2] = resolveDialogueSpeakers(cleanTopic, params.speakers);
    const formal = isFormalDialogueTopic(cleanTopic, `${s1} & ${s2}`, params.tone);

    const targetLines =
      params.length === 'Custom' && params.customCount
        ? params.customCount
        : params.length === 'Short'
          ? 6
          : params.length === 'Detailed'
            ? 14
            : 10;

    const body = buildDialogueLines(s1, s2, cleanTopic, targetLines, params.tone);
    const stats = countTextStats(body);
    const dlgTitle = formal
      ? `Formal Dialogue Between ${s1} and ${s2}`
      : `A Dialogue on ${title}`;
    return {
      kind: 'dialogue',
      title: dlgTitle,
      body,
      keyPhrases: formal
        ? ['formal inquiry', 'required documents', 'official procedure', 'valuable guidance']
        : ['timely subject', 'clear judgment', 'lasting mastery', 'mutual confidence'],
      bengaliNote: formal
        ? `বিষয়: ${dlgTitle} — ${s1} ও ${s2}-এর মধ্যে ${stats.lineCount} লাইনের আনুষ্ঠানিক (Formal) সংলাপ।`
        : `বিষয়: ${title} — ${s1} ও ${s2}-এর মধ্যে ${stats.lineCount} লাইনের প্রাঞ্জল সংলাপ।`,
      ...stats,
      source: 'local',
    };
  }

  const opener =
    params.tone === 'Academic'
      ? `${title} represents a foundational pillar of intellectual growth and modern civic responsibility.`
      : params.tone === 'Creative'
        ? `Like a gentle lantern illuminating an unfamiliar path, ${cleanTopic} brings warmth, clarity, and direction to our everyday world.`
        : params.tone === 'Simple'
          ? `${title} is very important in our daily life and learning.`
          : `${title} is an essential aspect of a purposeful and well-balanced life.`;

  const sentencePool: string[] = [
    opener,
    `It broadens our perspective, sharpens critical thinking, and encourages positive habits that remain valuable long after school years end.`,
    `Students and working professionals alike benefit tremendously when they devote regular time to understanding ${cleanTopic}.`,
    `In classrooms and communities around the world, people who engage thoughtfully with this subject demonstrate stronger problem-solving skills and deeper empathy.`,
    `Furthermore, cultivating awareness of ${cleanTopic} nurtures patience, improves communication, and builds quiet confidence during academic exams and real-world decisions.`,
    `Applying these principles does not require extraordinary resources; rather, it grows from consistent daily effort and curiosity.`,
    `Small, intentional steps—paired with responsible guidance—can transform ordinary routines into meaningful, lasting achievements.`,
    `At the same time, balancing enthusiasm with thoughtful discipline ensures that progress remains sustainable and ethical.`,
    `When young learners discuss ${cleanTopic} openly with mentors and peers, they discover practical ways to turn ideas into helpful action.`,
    `Looking toward the future, societies that prioritize these core values become wiser, more resilient, and better prepared for rapid change.`,
    `Every individual has the opportunity to contribute positively by practicing mindfulness and steady improvement each day.`,
    `Therefore, embracing ${cleanTopic} early in life empowers us all to build a brighter, kinder, and more informed community.`,
  ];

  if (params.length === 'Custom' && params.customCount) {
    const body = fitToExactWordCount(
      sentencePool,
      params.customCount,
      params.kind === 'composition',
      false,
    );
    const stats = countTextStats(body);
    return {
      kind: params.kind,
      title,
      body,
      keyPhrases: ['well-balanced life', 'critical thinking', 'consistent daily effort', 'lasting achievements'],
      bengaliNote: `${params.kind === 'composition' ? 'রচনা' : 'অনুচ্ছেদ'}: ${title} — ঠিক ${stats.wordCount} শব্দে সাজানো।`,
      ...stats,
      source: 'local',
    };
  }

  if (params.kind === 'composition') {
    // Plain continuous multi-paragraph prose without any section/point headings
    const paraOne = `${opener} Whether viewed from the perspective of a student, an educator, or a responsible citizen, understanding ${cleanTopic} builds clarity of thought and purposeful action.`;
    const paraTwo = `${sentencePool[1]} ${sentencePool[3]} ${sentencePool[4]}`;
    const paraThree = `${sentencePool[5]} ${sentencePool[6]} ${sentencePool[7]}`;
    const paraFour = `${sentencePool[8]} ${sentencePool[9]} ${sentencePool[11]}`;
    const paraShortClosing = `${sentencePool[10]} ${sentencePool[11]}`;

    const sections =
      params.length === 'Short'
        ? [paraOne, paraTwo, paraShortClosing]
        : params.length === 'Medium'
          ? [paraOne, paraTwo, paraThree, paraShortClosing]
          : [paraOne, paraTwo, paraThree, paraFour];

    const body = sections.join('\n\n');
    const stats = countTextStats(body);
    return {
      kind: 'composition',
      title,
      body,
      keyPhrases: ['clarity of thought', 'consistent daily effort', 'lasting achievements', 'informed community'],
      bengaliNote: `রচনা: ${title} — পয়েন্টের শিরোনাম ছাড়াই সাবলীল ও পূর্ণাঙ্গ গদ্য রচনা।`,
      ...stats,
      source: 'local',
    };
  }

  // Preset Paragraph
  const body =
    params.length === 'Short'
      ? `${opener} ${sentencePool[1]} ${sentencePool[11]}`
      : params.length === 'Medium'
        ? `${opener} ${sentencePool[1]} ${sentencePool[2]} ${sentencePool[11]}`
        : `${opener} ${sentencePool[1]} ${sentencePool[2]} ${sentencePool[4]} ${sentencePool[5]} ${sentencePool[11]}`;

  const stats = countTextStats(body);
  return {
    kind: 'paragraph',
    title,
    body,
    keyPhrases: ['well-balanced life', 'critical thinking', 'positive habits', 'real-world decisions'],
    bengaliNote: `অনুচ্ছেদ: ${title} — ${params.tone} স্টাইলে লেখা সুবিন্যস্ত অনুচ্ছেদ।`,
    ...stats,
    source: 'local',
  };
}
