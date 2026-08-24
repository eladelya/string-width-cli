// src/ranges.ts
interface UnicodeRange {
    start: number;
    end: number;
}

const ZERO_WIDTH_CHARS = new Set([
    0x200D, // ZWJ (Zero Width Joiner)
    0x200C, // ZWNJ (Zero Width Non-Joiner)
    0xFEFF, // Zero Width No-Break Space (BOM)
    0x00AD, // Soft Hyphen
    0x200B, // Zero Width Space
    0x2060, // Word Joiner
]);

export function isRegionalIndicator(codePoint: number): boolean {
    return codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF;
}

export function isZeroWidthCodePoint(codePoint: number): boolean {
    if (ZERO_WIDTH_CHARS.has(codePoint)) {
        return true;
    }

    // סימני כיווניות ועיצוב נסתרים (Bidi controls)
    if (codePoint >= 0x202A && codePoint <= 0x202E) return true;
    if (codePoint >= 0x2066 && codePoint <= 0x2069) return true;
    // Combining Diacritical Marks (סימני ניקוד שאין להם רוחב משל עצמם)
    if (codePoint >= 0x0300 && codePoint <= 0x036F) return true;
    if (codePoint >= 0x1AB0 && codePoint <= 0x1AFF) return true;
    if (codePoint >= 0x1DC0 && codePoint <= 0x1DFF) return true;
    if (codePoint >= 0x20D0 && codePoint <= 0x20FF) return true;
    if (codePoint >= 0xFE20 && codePoint <= 0xFE2F) return true;

    // console.log("\nThis code point is not zero:")
    // console.log(codePoint); 

    return false;
}

// from emoji-data.txt 
const EMOJI_RANGES: UnicodeRange[] = [
    { start: 0x231A, end: 0x231B }, // Watch, Hourglass
    { start: 0x23E9, end: 0x23F3 }, // Fast-forward, timers, alarms
    { start: 0x23F8, end: 0x23FA }, // Pause, Play, Record
    { start: 0x25AA, end: 0x25AB }, // Small squares
    { start: 0x25FB, end: 0x25FE }, // Medium/Large squares
    { start: 0x2600, end: 0x27EF }, // Miscellaneous Symbols, Dingbats
    { start: 0x2B50, end: 0x2B50 }, // White Medium Star
    { start: 0x2B55, end: 0x2B55 }, // Heavy Large Circle
    { start: 0x3030, end: 0x3030 }, // Wavy Dash
    { start: 0x303D, end: 0x303D }, // Part Alternation Mark
    { start: 0x3297, end: 0x3297 }, // Circled Ideograph Congratulation
    { start: 0x3299, end: 0x3299 }, // Circled Ideograph Secret
    { start: 0x1F004, end: 0x1F004 }, // Mahjong Tile Red Dragon
    { start: 0x1F0CF, end: 0x1F0CF }, // Playing Card Black Joker
    { start: 0x1F18E, end: 0x1F18E }, // Negative Squared AB
    { start: 0x1F191, end: 0x1F19A }, // Squared ID, NEW, etc.
    // { start: 0x1F1E6, end: 0x1F1FF }, // Regional Indicator Symbols (Flags)
    { start: 0x1F201, end: 0x1F251 }, // Enclosed CJK Letters and Supplement
    { start: 0x1F300, end: 0x1F5FF }, // Miscellaneous Symbols and Pictographs
    { start: 0x1F600, end: 0x1F64F }, // Emoticons
    { start: 0x1F680, end: 0x1F6FF }, // Transport and Map Symbols
    { start: 0x1F700, end: 0x1F77F }, // Alchemical Symbols
    { start: 0x1F780, end: 0x1F7FF }, // Geometric Shapes Extended
    { start: 0x1F800, end: 0x1F8FF }, // Supplemental Arrows-C
    { start: 0x1F900, end: 0x1F9FF }, // Supplemental Symbols and Pictographs
    { start: 0x1FA70, end: 0x1FAFF }, // Symbols and Pictographs Extended-A
];

// from EastAsianWidth.txt
const EAST_ASIAN_WIDE_RANGES: UnicodeRange[] = [
    { start: 0x1100, end: 0x115F },   // Hangul Jamo
    { start: 0x2329, end: 0x232A },   // Left-Pointing Angle Bracket, Right-Pointing Angle Bracket
    { start: 0x2E80, end: 0x2FFF },   // CJK Radicals Supplement, Kangxi Radicals
    { start: 0x3000, end: 0x303F },   // CJK Symbols and Punctuation
    { start: 0x3040, end: 0x309F },   // Hiragana
    { start: 0x30A0, end: 0x30FF },   // Katakana
    { start: 0x3100, end: 0x312F },   // Bopomofo
    { start: 0x3130, end: 0x318F },   // Hangul Compatibility Jamo
    { start: 0x3190, end: 0x319F },   // Kanbun
    { start: 0x31A0, end: 0x31BF },   // Bopomofo Extended
    { start: 0x31C0, end: 0x31EF },   // CJK Strokes
    { start: 0x31F0, end: 0x31FF },   // Katakana Phonetic Extensions
    { start: 0x3200, end: 0x32FF },   // Enclosed CJK Letters and Months
    { start: 0x3300, end: 0x33FF },   // CJK Compatibility
    { start: 0x3400, end: 0x4DBF },   // CJK Unified Ideographs Extension A
    { start: 0x4E00, end: 0x9FFF },   // CJK Unified Ideographs
    { start: 0xA000, end: 0xA4CF },   // Yi Syllables, Yi Radicals
    { start: 0xAC00, end: 0xD7A3 },   // Hangul Syllables
    { start: 0xF900, end: 0xFAFF },   // CJK Compatibility Ideographs
    { start: 0xFE10, end: 0xFE1F },   // Vertical Forms
    { start: 0xFE30, end: 0xFE4F },   // CJK Compatibility Forms
    { start: 0xFE50, end: 0xFE6F },   // Small Form Variants (Fullwidth/Wide variants)
    { start: 0xFF00, end: 0xFF60 },   // Fullwidth ASCII variants & Fullwidth punctuation
    { start: 0xFFE0, end: 0xFFE6 },   // Fullwidth Symbol Variants
    { start: 0x20000, end: 0x2A6DF }, // CJK Unified Ideographs Extension B
    { start: 0x2A700, end: 0x2B73F }, // CJK Unified Ideographs Extension C
    { start: 0x2B740, end: 0x2B81F }, // CJK Unified Ideographs Extension D
    { start: 0x2B820, end: 0x2CEAF }, // CJK Unified Ideographs Extension E
    { start: 0x2CEB0, end: 0x2EBEF }, // CJK Unified Ideographs Extension F
    { start: 0x2F800, end: 0x2FA1F }, // CJK Compatibility Ideographs Supplement
    { start: 0x30000, end: 0x3134F }, // CJK Unified Ideographs Extension G/H
];


// check weather a aspesific code point falls somewhere between given ranges - binary search
function isInRanges(codePoint: number, ranges: UnicodeRange[]): boolean {
    let left = 0;
    let right = ranges.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const range = ranges[mid];

        if (!range) break; // In case the range is invaild for some reason

        if (codePoint >= range.start && codePoint <= range.end) {
            return true;
        } else if (codePoint < range.start) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    return false;
}

export function isEmojiCodePoint(codePoint: number): boolean {
    return isInRanges(codePoint, EMOJI_RANGES);
}

export function isEastAsianWide(codePoint: number): boolean {
    return isInRanges(codePoint, EAST_ASIAN_WIDE_RANGES);
}