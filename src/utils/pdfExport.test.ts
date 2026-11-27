import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePdfFilename,
  parseWriterBodyBlocks,
  buildWriterPdfDocument,
  buildMockExamPdfDocument,
} from './pdfExport';
import { generateLocalWriting } from '../engine/writerFallback';
import { generateLocalMockExam } from '../engine/mockExam';

test('sanitizePdfFilename creates clean slug with module suffix', () => {
  assert.equal(
    sanitizePdfFilename('Importance of Reading Books!', 'paragraph'),
    'importance-of-reading-books-paragraph.pdf',
  );
  assert.equal(sanitizePdfFilename('   ', 'dialogue'), 'writing-studio-dialogue.pdf');
});

test('parseWriterBodyBlocks separates speakers in dialogue and keeps plain paragraphs in composition and story', () => {
  const dlg = generateLocalWriting({
    kind: 'dialogue',
    topic: 'Morning Walk',
    tone: 'Simple',
    length: 'Short',
    speakers: 'Rakib & Abdullah',
  });
  const dlgBlocks = parseWriterBodyBlocks(dlg.body, 'dialogue');
  assert.ok(dlgBlocks.every((b) => b.type === 'dialogue' && Boolean(b.speaker)));

  const comp = generateLocalWriting({
    kind: 'composition',
    topic: 'Value of Time',
    tone: 'Exam Standard',
    length: 'Medium',
  });
  const compBlocks = parseWriterBodyBlocks(comp.body, 'composition');
  assert.ok(compBlocks.length >= 3);
  assert.ok(compBlocks.every((b) => b.type === 'paragraph'));
  assert.ok(!compBlocks.some((b) => /^(Introduction|Conclusion|Core Significance)$/i.test(b.text)));

  const story = generateLocalWriting({
    kind: 'story',
    topic: 'A Liar Shepherd Boy',
    tone: 'Exam Standard',
    length: 'Detailed',
  });
  const storyBlocks = parseWriterBodyBlocks(story.body, 'story');
  assert.ok(storyBlocks.length >= 4);
  assert.ok(storyBlocks.every((b) => b.type === 'paragraph'));
});

test('buildWriterPdfDocument and buildMockExamPdfDocument output valid PDF document bytes', () => {
  const para = generateLocalWriting({
    kind: 'paragraph',
    topic: 'Tree Plantation',
    tone: 'Academic',
    length: 'Detailed',
  });
  const { doc, filename } = buildWriterPdfDocument(para, {
    tone: 'Academic',
    length: 'Detailed',
    generatedDate: 'Nov 23, 2026',
  });
  assert.equal(filename, 'tree-plantation-paragraph.pdf');
  const pdfOutput = doc.output('arraybuffer');
  const header = Buffer.from(pdfOutput).subarray(0, 5).toString('utf8');
  assert.equal(header, '%PDF-');
  assert.ok(doc.getNumberOfPages() >= 1);

  const exam = generateLocalMockExam({
    title: 'Grammar Section Practice Test',
    topics: ['narration', 'voice', 'morpheme', 'pos', 'verbs'],
    difficulty: 'SSC Standard',
    count: 10,
  });
  const examPdf = buildMockExamPdfDocument(exam, false);
  const keyPdf = buildMockExamPdfDocument(exam, true);
  assert.equal(examPdf.filename, 'grammar-section-practice-test-mock-exam.pdf');
  assert.equal(keyPdf.filename, 'grammar-section-practice-test-answer-key.pdf');
  assert.equal(Buffer.from(examPdf.doc.output('arraybuffer')).subarray(0, 5).toString('utf8'), '%PDF-');
  assert.equal(Buffer.from(keyPdf.doc.output('arraybuffer')).subarray(0, 5).toString('utf8'), '%PDF-');
});
