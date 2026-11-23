import test from 'node:test';
import assert from 'node:assert/strict';
import { solveNarration } from './narration';
import { solveVoice } from './voice';
import { solveMorphemes } from './morpheme';
import { solvePartsOfSpeech } from './pos';
import { solveVerbChanging } from './verbs';
import { generateLocalWriting, parseCustomCountInput } from './writerFallback';
import { normalizeStudioSettings } from '../context/StudioPrefsContext';

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
