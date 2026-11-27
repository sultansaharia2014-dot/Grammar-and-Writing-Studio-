import test from 'node:test';
import assert from 'node:assert/strict';
import { solveNarration } from './narration';
import { solveVoice } from './voice';
import { solveMorphemes } from './morpheme';
import { solvePartsOfSpeech } from './pos';
import { solveVerbChanging } from './verbs';
import {
  generateLocalWriting,
  isFormalDialogueTopic,
  parseCustomCountInput,
  resolveDialogueSpeakers,
} from './writerFallback';
import { normalizeStudioSettings } from '../context/StudioPrefsContext';
import { pickStudioMaleVoice, prepareTextForReading } from '../utils/studioSpeech';

test('Narration: Direct -> Indirect with vocative addressing', () => {
  const res = solveNarration('Rakib said to Abdullah, "Hey, friend, I am Rakib."', 'auto');
  assert.equal(res.direction, 'direct-to-indirect');
  assert.match(res.converted, /^Addressing Abdullah as friend/i);
  assert.match(res.converted, /Rakib told him that he was Rakib\.$/i);
  assert.ok(res.steps.some((s) => s.id === 'vocative'));
});

test('Narration: Interrogative and Universal Truth handling', () => {
  const q = solveNarration('She said to me, "Are you coming to the library tomorrow?"', 'auto');
  assert.equal(q.detectedType.en, 'Interrogative');
  assert.match(q.converted, /asked me if/i);
  assert.match(q.converted, /the next day/i);

  const truth = solveNarration('Mother said, "The earth moves round the sun."', 'auto');
  assert.equal(truth.detectedType.en, 'Universal Truth');
  assert.match(truth.converted, /moves round the sun/i);
});

test('Narration: Indirect -> Direct reversal', () => {
  const res = solveNarration(
    'He told me that he had finished his homework the previous day.',
    'indirect-to-direct',
  );
  assert.equal(res.direction, 'indirect-to-direct');
  assert.match(res.converted, /"/);
  assert.match(res.converted, /yesterday/i);
});

test('Voice: Active <-> Passive conversion and swap diagram', () => {
  const past = solveVoice('She wrote a thoughtful essay yesterday.', 'auto');
  assert.equal(past.direction, 'active-to-passive');
  assert.equal(past.converted, 'A thoughtful essay was written by her yesterday.');
  assert.equal(past.swapDiagram.activeNodes[0].text, 'She');

  const rev = solveVoice('A delicious meal was cooked by my grandmother.', 'auto');
  assert.equal(rev.direction, 'passive-to-active');
  assert.match(rev.converted, /^My grandmother cooked a delicious meal\.$/i);
});

test('Morpheme: Suffix & Prefix finder recommends right prefixes and suffixes for root and affixed words', () => {
  const happy = solveMorphemes('happy');
  assert.equal(happy.selectedAnalysis?.isRootInput, true);
  assert.ok(happy.selectedAnalysis?.recommendedPrefixes.some((p) => p.affix === 'un-' && p.resultWord === 'unhappy'));
  assert.ok(happy.selectedAnalysis?.recommendedSuffixes.some((s) => s.affix === '-ness' && s.resultWord === 'happiness'));

  const possible = solveMorphemes('possible');
  assert.ok(possible.selectedAnalysis?.recommendedPrefixes.some((p) => p.affix === 'im-' && p.resultWord === 'impossible'));

  const legal = solveMorphemes('legal');
  assert.ok(legal.selectedAnalysis?.recommendedPrefixes.some((p) => p.affix === 'il-' && p.resultWord === 'illegal'));

  const honest = solveMorphemes('honest');
  assert.ok(honest.selectedAnalysis?.recommendedPrefixes.some((p) => p.affix === 'dis-' && p.resultWord === 'dishonest'));
  assert.ok(honest.selectedAnalysis?.recommendedSuffixes.some((s) => s.affix === '-y' && s.resultWord === 'honesty'));

  const word = solveMorphemes('unhappiness');
  assert.equal(word.isSentence, false);
  assert.equal(word.selectedAnalysis?.prefix?.text, 'un-');
  assert.equal(word.selectedAnalysis?.root.text, 'happy');
  assert.equal(word.selectedAnalysis?.suffix?.text, '-ness');

  const sent = solveMorphemes('The hardworking student achieved remarkable success.');
  assert.equal(sent.isSentence, true);
  assert.ok(sent.tokens.some((t) => t.hasAffix));
});

test('Parts of Speech: Tagging and counts', () => {
  const res = solvePartsOfSpeech('Wow! The clever fox quickly jumped over the lazy dog.');
  assert.equal(res.tokens[0].pos, 'Interjection');
  assert.equal(res.tokens[1].pos, 'Determiner');
  assert.equal(res.tokens[2].pos, 'Adjective');
  assert.equal(res.tokens[4].pos, 'Adverb');
  assert.equal(res.tokens[5].pos, 'Verb');
  assert.equal(res.tokens[6].pos, 'Preposition');
  assert.equal(res.counts.Determiner, 2);
});

test('Verb Changing: 5 forms and tense matrix', () => {
  const writeRes = solveVerbChanging('write');
  assert.equal(writeRes.forms.v1, 'write');
  assert.equal(writeRes.forms.v2, 'wrote');
  assert.equal(writeRes.forms.v3, 'written');
  assert.equal(writeRes.forms.ving, 'writing');
  assert.equal(writeRes.forms.vs, 'writes');
  assert.ok(writeRes.matrix.length >= 8);

  const sentVerb = solveVerbChanging('The birds fly across the golden sky.');
  assert.equal(sentVerb.extractedVerb, 'fly');
  assert.equal(sentVerb.forms.v2, 'flew');
});

test('Writer fallback generates structured paragraph, dialogue, and composition', () => {
  const para = generateLocalWriting({
    kind: 'paragraph',
    topic: 'Importance of Reading Books',
    tone: 'Exam Standard',
    length: 'Medium',
  });
  assert.ok(para.wordCount > 30);

  const dlg = generateLocalWriting({
    kind: 'dialogue',
    topic: 'Benefits of Morning Walk',
    tone: 'Simple',
    length: 'Short',
    speakers: 'Rakib & Abdullah',
  });
  assert.match(dlg.body, /Rakib:/);
  assert.match(dlg.body, /Abdullah:/);
});

test('Writer Custom length produces exact words for paragraph/composition and exact lines for dialogue', () => {
  assert.equal(parseCustomCountInput('250s'), 250);
  assert.equal(parseCustomCountInput('150 words'), 150);
  assert.equal(parseCustomCountInput('15 lines'), 15);

  const comp250 = generateLocalWriting({
    kind: 'composition',
    topic: 'AI in Everyday Life',
    tone: 'Exam Standard',
    length: 'Custom',
    customCount: 250,
  });
  assert.equal(comp250.wordCount, 250);

  const para150 = generateLocalWriting({
    kind: 'paragraph',
    topic: 'Value of Time',
    tone: 'Academic',
    length: 'Custom',
    customCount: 150,
  });
  assert.equal(para150.wordCount, 150);

  const dlg15 = generateLocalWriting({
    kind: 'dialogue',
    topic: 'AI Life',
    tone: 'Simple',
    length: 'Custom',
    customCount: 15,
    speakers: 'Rakib & Abdullah',
  });
  assert.equal(dlg15.lineCount, 15);

  const dlg60 = generateLocalWriting({
    kind: 'dialogue',
    topic: 'AI Life',
    tone: 'Simple',
    length: 'Custom',
    customCount: 60,
    speakers: 'Rakib & Abdullah',
  });
  assert.equal(dlg60.lineCount, 60);
});

test('normalizeStudioSettings defaults realRubberAnimation and pencilWriteAnimation to true and preserves toggles', () => {
  const migrated = normalizeStudioSettings({ speechRate: 1.1 });
  assert.equal(migrated.realRubberAnimation, true);
  assert.equal(migrated.pencilWriteAnimation, true);
  assert.equal(migrated.speechRate, 1.1);

  const disabled = normalizeStudioSettings({
    realRubberAnimation: false,
    pencilWriteAnimation: false,
  });
  assert.equal(disabled.realRubberAnimation, false);
  assert.equal(disabled.pencilWriteAnimation, false);
});

test('Writer formal dialogue detection, speaker inference, and formal structure', () => {
  const topic = 'a conversation between me and a Bank Manager';
  assert.equal(isFormalDialogueTopic(topic, 'Rakib & Abdullah', 'Exam Standard'), true);
  assert.equal(isFormalDialogueTopic('Benefits of Morning Walk', 'Rakib & Abdullah', 'Simple'), false);

  assert.deepEqual(
    resolveDialogueSpeakers(topic, 'Rakib & Abdullah'),
    ['Customer', 'Bank Manager'],
  );
  assert.deepEqual(
    resolveDialogueSpeakers('meeting with a doctor about fever', 'Rakib & Abdullah'),
    ['Patient', 'Doctor'],
  );

  const formal15 = generateLocalWriting({
    kind: 'dialogue',
    topic,
    tone: 'Exam Standard',
    length: 'Custom',
    customCount: 15,
    speakers: 'Rakib & Abdullah',
  });
  assert.equal(formal15.lineCount, 15);
  assert.match(formal15.title, /Formal Dialogue Between Customer and Bank Manager/i);
  assert.match(formal15.body, /^Customer: Good morning, Sir\. May I come in\?/);
  assert.match(formal15.body, /Bank Manager:/);
  assert.doesNotMatch(formal15.body, /How are you doing|What is on your mind|I am doing great/i);

  const casual = generateLocalWriting({
    kind: 'dialogue',
    topic: 'Benefits of Morning Walk',
    tone: 'Simple',
    length: 'Short',
    speakers: 'Rakib & Abdullah',
  });
  assert.match(casual.body, /How are you doing today/i);
});

test('studioSpeech picks warm male English narrator voice and normalizes multi-line text for reading', () => {
  const chosen = pickStudioMaleVoice([
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Microsoft Zira Desktop', lang: 'en-US' },
    { name: 'Microsoft Andrew Online (Natural) - English (United States)', lang: 'en-US' },
    { name: 'Google Deutsch', lang: 'de-DE' },
  ]);
  assert.equal(chosen?.name, 'Microsoft Andrew Online (Natural) - English (United States)');

  const cleaned = prepareTextForReading('Introduction\n\nReading   books  helps.\nIt builds focus.');
  assert.equal(cleaned, 'Introduction. Reading books helps. It builds focus.');
});

import {
  ALL_GRAMMAR_TOPICS,
  generateLocalMockExam,
  gradeMockExam,
  normalizeExamAnswer,
} from './mockExam';

test('Composition Maker generates plain prose without Introduction/Significance/Conclusion point headings', () => {
  for (const length of ['Short', 'Medium', 'Detailed'] as const) {
    const comp = generateLocalWriting({
      kind: 'composition',
      topic: 'Science in Everyday Life',
      tone: 'Exam Standard',
      length,
    });
    assert.doesNotMatch(
      comp.body,
      /^(Introduction|Core Significance|Practical Role in Daily Life|Future Outlook|Conclusion)$/im,
    );
    assert.ok(comp.body.includes('\n\n'));
  }
});

test('Story Writer builds classic stories and respects Custom exact word count', () => {
  const shepherd = generateLocalWriting({
    kind: 'story',
    topic: 'A Liar Shepherd Boy',
    tone: 'Exam Standard',
    length: 'Detailed',
  });
  assert.equal(shepherd.kind, 'story');
  assert.equal(shepherd.title, 'A Liar Shepherd Boy');
  assert.match(shepherd.body, /nobody believes a liar/i);

  const honesty = generateLocalWriting({
    kind: 'story',
    topic: 'Honesty is the Best Policy',
    tone: 'Exam Standard',
    length: 'Medium',
  });
  assert.match(honesty.body, /golden.*axe|woodcutter/i);

  const giant = generateLocalWriting({
    kind: 'story',
    topic: 'A Giant and His Garden',
    tone: 'Creative',
    length: 'Medium',
  });
  assert.match(giant.body, /giant|garden|stone wall/i);

  const customStory = generateLocalWriting({
    kind: 'story',
    topic: 'A Liar Shepherd Boy',
    tone: 'Exam Standard',
    length: 'Custom',
    customCount: 120,
  });
  assert.equal(customStory.wordCount, 120);
});

test('Grammar Mock Exam generator covers selected topics and grades answers accurately', () => {
  assert.equal(normalizeExamAnswer('  A letter is   written by her.  '), 'a letter is written by her');

  const paper = generateLocalMockExam({
    title: 'Grammar Practice Paper',
    topics: [...ALL_GRAMMAR_TOPICS],
    difficulty: 'SSC Standard',
    count: 10,
    durationMinutes: 15,
    shuffle: false,
  });
  assert.equal(paper.questions.length, 10);
  assert.equal(paper.totalMarks, 10);
  const coveredTopics = new Set(paper.questions.map((q) => q.topic));
  for (const topic of ALL_GRAMMAR_TOPICS) {
    assert.ok(coveredTopics.has(topic));
  }

  // Answer first 6 correctly (varying casing/punctuation) and leave last 4 blank/wrong
  const answers: Record<string, string> = {};
  paper.questions.forEach((q, idx) => {
    if (idx < 6) {
      answers[q.id] = q.answer.replace(/\.$/, '').toLowerCase();
    } else {
      answers[q.id] = 'wrong answer';
    }
  });

  const report = gradeMockExam(paper, answers);
  assert.equal(report.correctCount, 6);
  assert.equal(report.earnedMarks, 6);
  assert.equal(report.totalMarks, 10);
  assert.equal(report.percentage, 60);
  assert.equal(report.letterGrade, 'A-');

  // Verify 10, 15, and 20 question counts never cap at 9 even for a single topic
  for (const topic of ALL_GRAMMAR_TOPICS) {
    for (const count of [10, 15, 20]) {
      const singlePaper = generateLocalMockExam({
        topics: [topic],
        difficulty: 'SSC Standard',
        count,
      });
      assert.equal(singlePaper.questions.length, count, `${topic} should yield ${count} questions`);
      assert.equal(singlePaper.totalMarks, count);
    }
  }

  const full20 = generateLocalMockExam({
    topics: [...ALL_GRAMMAR_TOPICS],
    difficulty: 'HSC Advanced',
    count: 20,
  });
  assert.equal(full20.questions.length, 20);
});

