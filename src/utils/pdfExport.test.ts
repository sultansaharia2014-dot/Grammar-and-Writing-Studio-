import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePdfFilename,
  parseWriterBodyBlocks,
  buildWriterPdfDocument,
} from './pdfExport';
import { generateLocalWriting } from '../engine/writerFallback';

test('sanitizePdfFilename creates clean slug with module suffix', () => {
  assert.equal(
    sanitizePdfFilename('Importance of Reading Books!', 'paragraph'),
    'importance-of-reading-books-paragraph.pdf',
  );
  assert.equal(sanitizePdfFilename('   ', 'dialogue'), 'writing-studio-dialogue.pdf');
});

test('parseWriterBodyBlocks separates speakers in dialogue and headings in composition', () => {
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
  assert.ok(compBlocks.some((b) => b.type === 'heading' && b.text === 'Introduction'));
  assert.ok(compBlocks.some((b) => b.type === 'heading' && b.text === 'Conclusion'));
});

test('buildWriterPdfDocument outputs valid PDF document bytes', () => {
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
});
