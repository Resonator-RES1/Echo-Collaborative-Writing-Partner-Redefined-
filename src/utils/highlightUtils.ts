import { RefineDraftResult } from '../services/gemini/refine';

export interface HighlightRange {
  start: number;
  end: number;
  type: 'restraint' | 'lore';
  metadata: any;
}

/**
 * Finds the indices of snippets mentioned in the restraintLog and loreCorrections
 * within the refined text.
 */
export const getHighlightRanges = (refinedText: string, result: RefineDraftResult): HighlightRange[] => {
  const ranges: HighlightRange[] = [];

  // 1. Lore Corrections (Red)
  result.loreCorrections.forEach(correction => {
    if (correction.snippet && correction.snippet.length > 0) {
      let index = refinedText.indexOf(correction.snippet);
      // We use a while loop in case the same snippet appears multiple times, 
      // though usually these are specific enough.
      while (index !== -1) {
        // Check if this range already exists to avoid duplicates
        const exists = ranges.some(r => r.start === index && r.end === index + correction.snippet.length && r.type === 'lore');
        if (!exists) {
          ranges.push({
            start: index,
            end: index + correction.snippet.length,
            type: 'lore',
            metadata: correction
          });
        }
        index = refinedText.indexOf(correction.snippet, index + 1);
      }
    }
  });

  // 2. Restraint Log (Blue)
  result.restraintLog.forEach(log => {
    if (log.snippet && log.snippet.length > 0) {
      let index = refinedText.indexOf(log.snippet);
      while (index !== -1) {
        const exists = ranges.some(r => r.start === index && r.end === index + log.snippet.length);
        if (!exists) {
          ranges.push({
            start: index,
            end: index + log.snippet.length,
            type: 'restraint',
            metadata: log
          });
        }
        index = refinedText.indexOf(log.snippet, index + 1);
      }
    }
  });

  // Sort ranges by start index
  return ranges.sort((a, b) => a.start - b.start);
};
