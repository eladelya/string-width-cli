import { describe, it, expect } from 'vitest';
import { stringWidth } from './width.js';

describe('stringWidth() - The Ultimate Test Suite', () => {

    describe('1. Basic ASCII & Standard Characters', () => {
        it('should return 0 for empty strings', () => {
            expect(stringWidth('')).toBe(0);
        });

        it('should return 1 for standard English letters and numbers', () => {
            expect(stringWidth('a')).toBe(1);
            expect(stringWidth('A')).toBe(1);
            expect(stringWidth('1')).toBe(1);
            expect(stringWidth('@')).toBe(1);
        });

        it('should calculate basic words correctly', () => {
            expect(stringWidth('Hello World!')).toBe(12); // 12 chars
            expect(stringWidth('12345')).toBe(5);
        });
    });

    describe('2. Wide Characters (CJK)', () => {
        it('should return 2 for CJK ideographs', () => {
            expect(stringWidth('字')).toBe(2);
            expect(stringWidth('你好')).toBe(4); // 2 chars, width 2 each
        });

        it('should calculate mixed strings of ASCII and CJK', () => {
            expect(stringWidth('abc字def')).toBe(8); // 3 + 2 + 3
        });
    });

    describe('3. Emojis (Standard vs Narrow)', () => {
        it('should return 2 for standard wide emojis', () => {
            expect(stringWidth('🤣')).toBe(2);
            expect(stringWidth('🚎')).toBe(2); // The Trolleybus!
            expect(stringWidth('🍎')).toBe(2);
        });

        it('should return 1 for text-presentation default emojis (Narrow)', () => {
            expect(stringWidth('☀')).toBe(1); // Sun
            expect(stringWidth('⌚')).toBe(2); // Watch
            expect(stringWidth('✉')).toBe(1); // Envelope
        });
    });

    describe('4. Variation Selectors (VS15 & VS16)', () => {
        it('should expand a narrow emoji to width 2 when VS16 is appended', () => {
            expect(stringWidth('☀\uFE0F')).toBe(2); // Sun + VS16
            expect(stringWidth('✉\uFE0F')).toBe(2);
        });

        it('should shrink a wide emoji to width 1 when VS15 is appended', () => {
            expect(stringWidth('🤣\uFE0E')).toBe(1); // ROFL + VS15
        });

        it('should respect the LAST variation selector if multiple exist in one grapheme', () => {
            // Sun + VS16 (makes it 2) + VS15 (makes it 1)
            expect(stringWidth('☀\uFE0F\uFE0E')).toBe(1);
            // Sun + VS15 (makes it 1) + VS16 (makes it 2)
            expect(stringWidth('☀\uFE0E\uFE0F')).toBe(2);
        });
    });

    describe('5. Regional Indicators (Flags)', () => {
        it('should return 2 for a valid 2-letter flag', () => {
            expect(stringWidth('🇮🇱')).toBe(2); // Israel flag
            expect(stringWidth('🇺🇸')).toBe(2); // US flag
        });

        it('should return 1 for a single, isolated regional indicator (Edge case)', () => {
            expect(stringWidth('🇮')).toBe(1); 
            expect(stringWidth('🇱')).toBe(1);
        });

        it('should handle multiple flags and text correctly', () => {
            expect(stringWidth('Hi 🇮🇱 and 🇺🇸')).toBe(12); 
            expect(stringWidth('Hi 🇮🇱')).toBe(5);
        });
    });

    describe('6. Zero Width & Bidi Controls', () => {
        it('should ignore Zero Width Joiners and Spaces', () => {
            expect(stringWidth('\u200B')).toBe(0); // ZWSP
            expect(stringWidth('a\u200Bb')).toBe(2);
        });

        it('should ignore RTL/LTR Bidi control characters', () => {
            expect(stringWidth('\u200E')).toBe(0); // LRM
            expect(stringWidth('\u200F')).toBe(0); // RLM
            expect(stringWidth('א\u200Fב')).toBe(2); // Aleph + RLM + Bet
        });
    });

    describe('7. Complex Emojis (ZWJ Sequences)', () => {
        it('should correctly measure ZWJ combined emojis as width 2', () => {
            // Farmer: Man (2) + ZWJ (0) + Tractor (2) -> Segmented as 1 grapheme -> Returns 2!
            expect(stringWidth('👨‍🌾')).toBe(2); 
            // Family: Man + ZWJ + Woman + ZWJ + Girl + ZWJ + Boy
            expect(stringWidth('👨‍👩‍👧‍👦')).toBe(2);
        });
    });

    describe('8. Problem 7: Combining Marks (Accents & Nikkud)', () => {
        it('should return 1 when combining marks are attached to a base character (absorbed)', () => {
            expect(stringWidth('A\u0301\u0308')).toBe(1); // A + Acute + Diaeresis
            expect(stringWidth('שׁ')).toBe(1); // Shin + Shin Dot (Hebrew)
            expect(stringWidth('aֶ')).toBe(1); // 'a' + Segol
        });

        it('should return 1 when combining marks appear COMPLETELY ALONE (drawn on a dotted circle)', () => {
            expect(stringWidth('\u0301\u0308')).toBe(1); 
            expect(stringWidth('\u05B1')).toBe(1); // Standalone Hataf Segol
        });

        it('should return 1 for standalone musical symbols that were forgotten in the past', () => {
            expect(stringWidth('𝅮')).toBe(1); // U+1D16E (Musical symbol)
        });
    });

    describe('9. Control Characters (New Lines, Null, etc.)', () => {
        it('should return 0 for non-printable control characters', () => {
            expect(stringWidth('\n')).toBe(0); // Line Feed
            expect(stringWidth('\r')).toBe(0); // Carriage Return
            expect(stringWidth('\0')).toBe(0); // Null char
            expect(stringWidth('\x07')).toBe(0); // Bell / Alert
        });

        it('should measure text correctly around control characters', () => {
            expect(stringWidth('Line1\nLine2')).toBe(10); // 5 + 0 + 5
        });
    });

    describe('10. Options: Custom Tab Width', () => {
        it('should default to width 4 for tabs if no option is provided', () => {
            expect(stringWidth('\t')).toBe(4);
            expect(stringWidth('a\tb')).toBe(6); // 1 + 4 + 1
        });

        it('should respect custom tab widths passed via options', () => {
            expect(stringWidth('\t', { tabWidth: 2 })).toBe(2);
            expect(stringWidth('a\tb', { tabWidth: 8 })).toBe(10); // 1 + 8 + 1
            expect(stringWidth('\t', { tabWidth: 0 })).toBe(0); // Edge case: zero width tab
        });
    });

    describe('11. Options: Ambiguous Characters', () => {
        // Greek letters and Cyrillic are classic examples of Ambiguous width (usually 1, but 2 in legacy CJK terminals)
        it('should default to width 1 for ambiguous characters', () => {
            expect(stringWidth('±')).toBe(1); // Plus-minus sign is ambiguous
            expect(stringWidth('α')).toBe(1); // Greek Alpha is ambiguous
        });

        it('should return width 2 for ambiguous characters when ambiguousIsWide is true', () => {
            expect(stringWidth('±', { ambiguousIsWide: true })).toBe(2);
            expect(stringWidth('α', { ambiguousIsWide: true })).toBe(2);
        });

        it('should not affect standard narrow ASCII characters when ambiguousIsWide is true', () => {
            expect(stringWidth('a', { ambiguousIsWide: true })).toBe(1);
        });
    });

    describe('12. ANSI Escape Codes (Integration Test)', () => {
        it('should ignore ANSI styling codes when measuring width', () => {
            const redText = '\u001b[31mHello\u001b[0m';
            expect(stringWidth(redText)).toBe(5); // Should strip the \u001b codes and measure "Hello"
        });
    });
});