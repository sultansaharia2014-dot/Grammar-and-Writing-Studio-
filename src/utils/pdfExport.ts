import { jsPDF } from 'jspdf';
import {
  MockExamPaper,
  WriterLength,
  WriterResult,
  WriterTone,
} from '../types/studio';

export interface PdfExportMeta {
  tone: WriterTone;
  length: WriterLength;
  customCount?: number;
  generatedDate?: string;
}

export function sanitizePdfFilename(title: string, kind: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${slug || 'writing-studio'}-${kind}.pdf`;
}

export interface ParsedBodyBlock {
  type: 'heading' | 'dialogue' | 'paragraph';
  speaker?: string;
  text: string;
}

export function parseWriterBodyBlocks(
  body: string,
  kind: WriterResult['kind'],
): ParsedBodyBlock[] {
  const rawLines = body.split(/\r?\n/);
  const blocks: ParsedBodyBlock[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (kind === 'dialogue') {
      const dlgMatch = trimmed.match(/^([^:]{1,36}):\s*(.+)$/);
      if (dlgMatch) {
        blocks.push({
          type: 'dialogue',
          speaker: dlgMatch[1].trim(),
          text: dlgMatch[2].trim(),
        });
        continue;
      }
    }

    blocks.push({
      type: 'paragraph',
      text: trimmed,
    });
  }

  return blocks;
}

export function buildWriterPdfDocument(
  result: WriterResult,
  meta: PdfExportMeta,
): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 20;

  // Top warm sunset header band
  doc.setFillColor(255, 245, 236);
  doc.rect(0, 0, pageWidth, 34, 'F');

  // Sunset coral accent stripe along top
  doc.setFillColor(229, 107, 85);
  doc.rect(0, 0, pageWidth, 2.8, 'F');

  // Studio masthead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(184, 98, 40);
  doc.text('GRAMMAR & WRITING STUDIO', marginX, 13);

  const dateStr =
    meta.generatedDate ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(122, 98, 82);
  doc.text(dateStr, pageWidth - marginX, 13, { align: 'right' });

  // Category & metadata line
  const kindLabel = result.kind.charAt(0).toUpperCase() + result.kind.slice(1);
  const lengthDisplay =
    meta.length === 'Custom' && meta.customCount
      ? result.kind === 'dialogue'
        ? `${meta.customCount} lines`
        : `${meta.customCount} words`
      : meta.length;
  const statsDetail =
    result.kind === 'dialogue'
      ? `${result.lineCount} lines  •  ${result.wordCount} words`
      : `${result.wordCount} words  •  ${result.sentenceCount} sentences`;
  const metaLine = `${kindLabel}  •  Tone: ${meta.tone}  •  Target: ${lengthDisplay}  •  ${statsDetail}`;
  doc.setFontSize(9.5);
  doc.setTextColor(110, 80, 72);
  doc.text(metaLine, marginX, 23);

  // Subtle hairline under header
  doc.setDrawColor(244, 162, 97);
  doc.setLineWidth(0.4);
  doc.line(marginX, 34, pageWidth - marginX, 34);

  // Document Title
  let y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(54, 33, 27);
  const titleLines = doc.splitTextToSize(result.title, contentWidth) as string[];
  for (const line of titleLines) {
    doc.text(line, marginX, y);
    y += 7.5;
  }

  // Accent divider below title
  y += 1.5;
  doc.setDrawColor(229, 107, 85);
  doc.setLineWidth(0.7);
  doc.line(marginX, y, marginX + 32, y);
  y += 9;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomLimit) {
      doc.addPage();
      y = 22;
    }
  };

  // Body blocks
  const blocks = parseWriterBodyBlocks(result.body, result.kind);
  for (const block of blocks) {
    if (block.type === 'heading') {
      ensureSpace(14);
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.setTextColor(184, 98, 40);
      doc.text(block.text, marginX, y);
      y += 6.5;
      continue;
    }

    if (block.type === 'dialogue' && block.speaker) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const speakerLabel = `${block.speaker}: `;
      const speakerWidth = doc.getTextWidth(speakerLabel);
      const wrapped = doc.splitTextToSize(block.text, contentWidth - Math.min(speakerWidth, 38)) as string[];
      ensureSpace(wrapped.length * 6 + 4);

      doc.setTextColor(212, 91, 110);
      doc.text(speakerLabel, marginX, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(54, 36, 25);
      const textX = marginX + speakerWidth;
      if (wrapped.length > 0) {
        doc.text(wrapped[0], textX, y);
        y += 6;
        for (let i = 1; i < wrapped.length; i++) {
          ensureSpace(6);
          doc.text(wrapped[i], marginX + 4, y);
          y += 6;
        }
      }
      y += 2.5;
      continue;
    }

    // Standard paragraph
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(54, 36, 25);
    const paraLines = doc.splitTextToSize(block.text, contentWidth) as string[];
    for (const line of paraLines) {
      ensureSpace(6.2);
      doc.text(line, marginX, y);
      y += 6.2;
    }
    y += 4;
  }

  // Optional Key Phrases study callout box
  if (result.keyPhrases && result.keyPhrases.length > 0) {
    const phraseText = `Key Expressions: ${result.keyPhrases.join('  •  ')}`;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    const phraseLines = doc.splitTextToSize(phraseText, contentWidth - 10) as string[];
    const boxHeight = phraseLines.length * 5 + 8;
    ensureSpace(boxHeight + 6);
    y += 3;
    doc.setFillColor(253, 244, 232);
    doc.setDrawColor(244, 162, 97);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, y, contentWidth, boxHeight, 3, 3, 'FD');
    doc.setTextColor(122, 98, 82);
    let py = y + 6.5;
    for (const line of phraseLines) {
      doc.text(line, marginX + 5, py);
      py += 5;
    }
  }

  // Page numbers footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(235, 220, 205);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(135, 110, 96);
    doc.text('Generated with Grammar & Writing Studio', marginX, pageHeight - 9);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 9, {
      align: 'right',
    });
  }

  return {
    doc,
    filename: sanitizePdfFilename(result.title, result.kind),
  };
}

export function downloadWriterPdf(result: WriterResult, meta: PdfExportMeta): string {
  const { doc, filename } = buildWriterPdfDocument(result, meta);
  doc.save(filename);
  return filename;
}

const TOPIC_LABELS: Record<string, string> = {
  narration: 'Narration',
  voice: 'Voice Change',
  morpheme: 'Suffix & Prefix',
  pos: 'Parts of Speech',
  verbs: 'Verb Changing',
};

export function buildMockExamPdfDocument(
  paper: MockExamPaper,
  includeAnswers = false,
): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 20;

  // Warm sunset header band
  doc.setFillColor(255, 245, 236);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setFillColor(229, 107, 85);
  doc.rect(0, 0, pageWidth, 2.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(184, 98, 40);
  doc.text('GRAMMAR & WRITING STUDIO · MOCK EXAM', marginX, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(122, 98, 82);
  doc.text(
    includeAnswers ? 'Question Paper + Answer Key' : 'Student Question Paper',
    pageWidth - marginX,
    13,
    { align: 'right' },
  );

  const timeLabel = paper.durationMinutes > 0 ? `${paper.durationMinutes} min` : 'Untimed';
  const topicText = paper.topics.map((t) => TOPIC_LABELS[t] || t).join(', ');
  doc.setFontSize(9);
  doc.setTextColor(110, 80, 72);
  doc.text(
    `Level: ${paper.difficulty}  •  Questions: ${paper.questions.length}  •  Full Marks: ${paper.totalMarks}  •  Time: ${timeLabel}`,
    marginX,
    22,
  );
  doc.text(`Sections: ${topicText}`, marginX, 28);

  doc.setDrawColor(244, 162, 97);
  doc.setLineWidth(0.4);
  doc.line(marginX, 34, pageWidth - marginX, 34);

  let y = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(54, 33, 27);
  const titleLines = doc.splitTextToSize(paper.title, contentWidth) as string[];
  for (const line of titleLines) {
    doc.text(line, marginX, y);
    y += 7;
  }
  y += 4;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomLimit) {
      doc.addPage();
      y = 20;
    }
  };

  paper.questions.forEach((q, idx) => {
    const cleanPrompt = q.prompt.replace(/\*\*/g, '');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const promptLines = doc.splitTextToSize(cleanPrompt, contentWidth - 6) as string[];
    const needed = 12 + promptLines.length * 5.2 + (q.options ? 12 : 8) + (includeAnswers ? 12 : 0);
    ensureSpace(needed);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(184, 98, 40);
    doc.text(
      `Q${idx + 1}. [${TOPIC_LABELS[q.topic] || q.topic}]  ${q.instruction}  (${q.marks} mark${q.marks > 1 ? 's' : ''})`,
      marginX,
      y,
    );
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.8);
    doc.setTextColor(54, 36, 25);
    for (const line of promptLines) {
      ensureSpace(5.5);
      doc.text(line, marginX + 4, y);
      y += 5.2;
    }

    if (q.type === 'mcq' && q.options && q.options.length > 0) {
      const optStr = q.options
        .map((opt, oIdx) => `(${String.fromCharCode(65 + oIdx)}) ${opt}`)
        .join('    ');
      const optLines = doc.splitTextToSize(optStr, contentWidth - 6) as string[];
      doc.setFontSize(9.8);
      doc.setTextColor(92, 68, 56);
      for (const line of optLines) {
        ensureSpace(5);
        doc.text(line, marginX + 6, y);
        y += 4.8;
      }
    } else if (!includeAnswers) {
      doc.setDrawColor(210, 195, 182);
      doc.setLineWidth(0.3);
      doc.line(marginX + 4, y + 3, pageWidth - marginX, y + 3);
      y += 6;
    }

    if (includeAnswers) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(46, 111, 64);
      const ansLines = doc.splitTextToSize(`Answer: ${q.answer}`, contentWidth - 6) as string[];
      for (const line of ansLines) {
        ensureSpace(5);
        doc.text(line, marginX + 4, y);
        y += 4.8;
      }
    }

    y += 4;
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(235, 220, 205);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(135, 110, 96);
    doc.text('Grammar & Writing Studio · Mock Exam Generator', marginX, pageHeight - 9);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 9, {
      align: 'right',
    });
  }

  return {
    doc,
    filename: sanitizePdfFilename(paper.title, includeAnswers ? 'answer-key' : 'mock-exam'),
  };
}

export function downloadMockExamPdf(
  paper: MockExamPaper,
  includeAnswers = false,
): string {
  const { doc, filename } = buildMockExamPdfDocument(paper, includeAnswers);
  doc.save(filename);
  return filename;
}
