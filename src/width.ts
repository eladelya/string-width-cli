// src/width.ts
import { stripAnsi , isControlCharacter} from './utils.js';
import { 
    isWide, 
    isNarrowEmoji, 
    isAmbiguous, 
    isRegionalIndicator, 
    isZeroWidthCodePoint
} from './ranges.js';

// Unicode Variation Selectors
const VS15 = 0xFE0E; // Text Presentation Selector (Forces width 1)
const VS16 = 0xFE0F; // Emoji Presentation Selector (Forces width 2)
const TAB = 0x0009;

export interface StringWidthOptions {
    ambiguousIsWide?: boolean;
    tabWidth?: number;
}

// calculates a single grapheme width
// calculates a single grapheme width
function getGraphemeWidth(grapheme: string, options: StringWidthOptions = {}): number {
    const firstCodePoint = grapheme.codePointAt(0);
    
    // Explicit handling for tabs (\t)
    if (firstCodePoint === TAB) {
        return options.tabWidth ?? 4; 
    }

    // non tab control chars handling
    if (firstCodePoint !== undefined && isControlCharacter(firstCodePoint)) {
        return 0;
    }

    // zw chars check
    if (!grapheme || (firstCodePoint !== undefined && isZeroWidthCodePoint(firstCodePoint))) {
        return 0;
    }

    let lastVS: number | null = null;
    let hasWideBase = false;
    let hasNarrowEmojiBase = false;
    let regionalIndicatorCount = 0;

    for (const char of grapheme) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined) continue;

        if (codePoint === VS15 || codePoint === VS16) {
            lastVS = codePoint; // overriding previous selectors
        }
        else if (isZeroWidthCodePoint(codePoint)) {
            // check rest of the grapheme
            continue;
        }
        else if (isRegionalIndicator(codePoint)) {
            regionalIndicatorCount++;
        }
        else {
            if (isWide(codePoint)) {
                hasWideBase = true;
            } else if (isNarrowEmoji(codePoint)) {
                hasNarrowEmojiBase = true;
            } else if (options.ambiguousIsWide && isAmbiguous(codePoint)) {
                hasWideBase = true;
            }
        }
    }

    // --- Final width calculation based on priority ---

    // 1. Text Presentation Selector forces width 1
    if (lastVS === VS15) return 1;
    
    // 2. Two regional indicators make a flag of width 2
    if (regionalIndicatorCount >= 2) return 2;
    
    // 3. Emoji Presentation Selector forces width 2 (only if base is a valid emoji)
    if (lastVS === VS16 && (hasWideBase || hasNarrowEmojiBase)) return 2;
    
    // 4. Inherent wide characters / Default wide emojis
    if (hasWideBase) return 2;
    
    // Default
    return 1;
}

// outside of the function to avoid creating each invocation
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

// calculates total width of a string
export function stringWidth(str: string, options?: StringWidthOptions): number {
    if (!str || typeof str !== 'string') {
        return 0;
    }
    const cleanStr = stripAnsi(str);    
    let totalWidth = 0;
    
    for (const { segment } of segmenter.segment(cleanStr)) {
        totalWidth += getGraphemeWidth(segment, options);
    }

    return totalWidth;
}