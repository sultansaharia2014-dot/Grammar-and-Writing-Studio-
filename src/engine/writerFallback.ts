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
  isComposition: boolean,
): string {
  const clampedTarget = Math.max(20, Math.min(2000, Math.round(targetWords)));
  const selected: string[] = [];
  let currentWords = 0;

  // Cycle through rich sentences with slight connector variations if very large target
  const expandedPool: string[] = [...sentencePool];
  const connectors = [
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
  if (!isComposition) {
    return joined;
  }

  // Group into balanced readable paragraphs for Composition (without altering word count!)
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

function buildDialogueLines(
  s1: string,
  s2: string,
  cleanTopic: string,
  targetLines: number,
): string {
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

export function generateLocalWriting(params: {
  kind: 'paragraph' | 'dialogue' | 'composition';
  topic: string;
  tone: WriterTone;
  length: WriterLength;
  customCount?: number;
  speakers?: string;
}): WriterResult {
  const cleanTopic = params.topic.trim() || 'Importance of Reading Books';
  const title = titleCase(cleanTopic);

  if (params.kind === 'dialogue') {
    const rawSpeakers = (params.speakers || 'Rakib & Abdullah')
      .split(/&|,|\band\b/i)
      .map((s) => s.trim())
      .filter(Boolean);
    const s1 = rawSpeakers[0] || 'Rakib';
    const s2 = rawSpeakers[1] || 'Abdullah';

    const targetLines =
      params.length === 'Custom' && params.customCount
        ? params.customCount
        : params.length === 'Short'
          ? 6
          : params.length === 'Detailed'
            ? 14
            : 10;

    const body = buildDialogueLines(s1, s2, cleanTopic, targetLines);
    const stats = countTextStats(body);
    return {
      kind: 'dialogue',
      title: `A Dialogue on ${title}`,
      body,
      keyPhrases: ['timely subject', 'clear judgment', 'lasting mastery', 'mutual confidence'],
      bengaliNote: `বিষয়: ${title} — ${s1} ও ${s2}-এর মধ্যে ${stats.lineCount} লাইনের প্রাঞ্জল সংলাপ।`,
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
    const intro = `Introduction\n${opener} Whether viewed from the perspective of a student, an educator, or a responsible citizen, understanding ${cleanTopic} builds clarity of thought and purposeful action.`;
    const bodyOne = `Core Significance\n${sentencePool[1]} ${sentencePool[3]}`;
    const bodyTwo = `Practical Role in Daily Life\n${sentencePool[5]} ${sentencePool[6]}`;
    const conclusion = `Conclusion\n${sentencePool[11]}`;

    const sections =
      params.length === 'Short'
        ? [intro, bodyOne, conclusion]
        : params.length === 'Medium'
          ? [intro, bodyOne, bodyTwo, conclusion]
          : [
              intro,
              bodyOne,
              bodyTwo,
              `Future Outlook\n${sentencePool[8]} ${sentencePool[9]}`,
              conclusion,
            ];

    const body = sections.join('\n\n');
    const stats = countTextStats(body);
    return {
      kind: 'composition',
      title,
      body,
      keyPhrases: ['clarity of thought', 'consistent daily effort', 'lasting achievements', 'informed community'],
      bengaliNote: `রচনা: ${title} — ভূমিকা, মূল আলোচনা ও উপসংহারসহ সুসংগঠিত প্রবন্ধ।`,
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
