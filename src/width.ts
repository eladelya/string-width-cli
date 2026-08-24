// src/width.ts
import { stripAnsi } from './utils.js';
import { isEmojiCodePoint, isEastAsianWide, isZeroWidthCodePoint, isRegionalIndicator} from './ranges.js';


// Unicode Variation Selectors
const VS15 = 0xFE0E; // Text Presentation Selector (Forces width 1)
const VS16 = 0xFE0F; // Emoji Presentation Selector (Forces width 2)

// calculates a single grapheme width
function getGraphemeWidth(grapheme: string): number {
// zw chars check
    const codePoint = grapheme.codePointAt(0);
    if (!grapheme || codePoint !== undefined && isZeroWidthCodePoint(codePoint)) {
        return 0;
    }

    let hasVs15 = false;
    let hasVs16 = false;
    let isEmoji = false;
    let isWide = false;
    let regionalIndicatorCount = 0;

    for (let i = 0; i < grapheme.length; i++) {
        const codePoint = grapheme.codePointAt(i);
        if (codePoint === undefined) continue;
        // if the code point grater than that, then it took two chars for this single char represented by its unicode, so need to move on to the next char and no the second half of the current one that's in the following 16 bits
        if (codePoint > 0xFFFF) {
            i++; 
        }
        if (codePoint === VS15) {
            hasVs15 = true;
        }
        else if (codePoint === VS16) {
            hasVs16 = true;
        }
        else if (isZeroWidthCodePoint(codePoint)) {
            // check rest of the grapheme
            continue;
        }
        else if (isRegionalIndicator(codePoint)) {
            regionalIndicatorCount++;
        }
        else {
            if (isEmojiCodePoint(codePoint)) {
            isEmoji = true;
        }
            if (isEastAsianWide(codePoint)) {
                isWide = true;
            }
        }
    }
        if (hasVs15) return 1;
        if (regionalIndicatorCount >= 2) return 2;
        if (hasVs16 && isEmoji || isEmoji || isWide) return 2; // the check here is kinda weird - that's because it is not complete and in the future the "isEmoji" check should be is_Emoji_with_default_width_2 check
        // deafault
        return 1;
    }

// outside of the function to avoid creating each invokation
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

// calcualtes total width of a string
export function stringWidth(str: string): number {
    if (!str || typeof str !== 'string') {
        // console.log("Invalid input")
        return 0;
    }
    const cleanStr = stripAnsi(str);    
    let totalWidth = 0;
    for (const { segment } of segmenter.segment(cleanStr)) {
        totalWidth += getGraphemeWidth(segment);
    }

    return totalWidth;
}