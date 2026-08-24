import { describe, it, expect } from 'vitest';
import { stringWidth } from './width.js';

describe('stringWidth() - Extreme Edge Cases & Real-World Chaos', () => {

    describe('1. Skin Tone Modifiers (Emoji ZWJ & Modifiers)', () => {
        it('should handle single emojis with skin tone modifiers as width 2', () => {
            expect(stringWidth('👋🏽')).toBe(2); // Waving hand + Medium skin tone
            expect(stringWidth('🏿')).toBe(2);  // Standalone dark skin tone patch
            expect(stringWidth('👮🏿‍♀️')).toBe(2); // Police officer + dark skin tone + female sign
        });

        it('should handle complex multi-person handshake sequences with skin tones', () => {
            // Handshake between light skin and dark skin
            const complexHandshake = '🤝🏻🏾';
            expect(stringWidth(complexHandshake)).toBe(2);
        });
    });

    describe('2. Bidirectional Text Chaos (Hebrew, Arabic & LTR mixing)', () => {
        it('should calculate mixed Hebrew text with English and numbers correctly', () => {
            expect(stringWidth('שלום world 123')).toBe(14); // 5 (Hebrew) + 1 (space) + 5 (English) + 1 (space) + 3 (nums) = 15
        });

        it('should ignore bidi control marks embedded inside RTL text', () => {
            // RLM (\u200F), LRM (\u200E), LRE, RLE etc.
            const bidiString = 'שלום\u200Fעולם\u200Etest';
            // שלום (4) + עולם (4) + test (4) = 12 (control marks are width 0)
            expect(stringWidth(bidiString)).toBe(12);
        });
    });

    describe('3. Zero-Width Spaces & Invisible Characters Stress Test', () => {
        it('should return 0 for strings containing only zero-width spaces or soft hyphens', () => {
            expect(stringWidth('\u200B')).toBe(0); // Zero Width Space
            expect(stringWidth('\u200C')).toBe(0); // Zero Width Non-Joiner
            expect(stringWidth('\u200D')).toBe(0); // Zero Width Joiner
            expect(stringWidth('\uFEFF')).toBe(0); // Zero Width No-Break Space (BOM)
            expect(stringWidth('\u00AD')).toBe(1); // Soft Hyphen classified as width 1 by standard tables
        });

        it('should not inflate width when surrounded by invisible formatting', () => {
            expect(stringWidth('\u200Bhello\u200B')).toBe(5);
        });
    });

    describe('4. Multiple & Conflicting Variation Selectors', () => {
        it('should handle excessive repetition of variation selectors gracefully', () => {
            // Multiple VS16 (Emoji presentation overload)
            expect(stringWidth('☀\uFE0F\uFE0F\uFE0F')).toBe(2);
            // Multiple VS15 (Text presentation overload)
            expect(stringWidth('🤣\uFE0E\uFE0E\uFE0E')).toBe(1);
        });

        it('should handle switching presentation back and forth', () => {
            // Narrow -> Wide -> Narrow -> Wide
            const chaotic = '☀\uFE0F\uFE0E\uFE0F'; // Last is VS16 -> Width 2
            expect(stringWidth(chaotic)).toBe(2);
        });
    });

    describe('5. Malformed Flags & Regional Indicators', () => {
        it('should handle odd numbers of regional indicators', () => {
            // 3 regional indicators: A, B, C. Should pair first two (flag) + last one alone (width 1) -> Total 2 + 1 = 3
            expect(stringWidth('🇺🇸🇦')).toBe(3); 
        });

        it('should handle unsupported or private-use regional codes', () => {
            // Invalid country code symbols
            expect(stringWidth('🏴󐁧󐁢󐁥󐁮󐁧󐁿')).toBe(8); // Tag sequence (Scotland flag / special tags)
        });
    });

    describe('6. Edge Cases from Real CLI Libraries (wcwidth / string-width suites)', () => {
        it('should handle strings with multiple tabs and carriage returns', () => {
            expect(stringWidth('a\t\tb')).toBe(1 + 4 + 4 + 1); // Assuming default tab = 4 -> 10
            expect(stringWidth('a\r\nb', { tabWidth: 4 })).toBe(2); 
            // Let's re-verify: 'a' (1), '\r' (0), '\n' (0), 'b' (1) => Total 2.
            expect(stringWidth('a\r\nb')).toBe(2);
        });

        it('should handle null bytes and ascii control characters embedded in text', () => {
            expect(stringWidth('hello\x00world')).toBe(10); // \x00 is width 0
            expect(stringWidth('foo\x1Bbar')).toBe(6); // \x1B is ESC, handled by control check or stripped? Wait, control check catches it -> width 6.
        });

        it('should handle unmatched surrogate halves (malformed strings safely without crashing)', () => {
            // High surrogate alone without low surrogate
            const malformed = '\uD800';
            // Should not throw an exception, should return a fallback safe width (1 or 0)
            expect(() => stringWidth(malformed)).not.toThrow();
        });
    });

    describe('7. Heavy Mixed Stress Test (The Ultimate Frankengroup)', () => {
        it('should calculate a monstrous mixed string without breaking', () => {
            // ANSI styling + Hebrew + CJK + ZWJ Emoji + Combining marks + Control + Tab
            const frankenstein = '\u001b[32mשלום\u001b[0m' + // שלום (4)
                                 '字' +                  // CJK (2)
                                 '👨‍👩‍👧‍👦' +              // Family ZWJ (2)
                                 'A\u0301' +             // A + Nikkud (1)
                                 '\t' +                  // Tab (4)
                                 '\n';                   // Newline (0)
            
            // Expected width: 4 + 2 + 2 + 1 + 4 + 0 = 13
            expect(stringWidth(frankenstein, { tabWidth: 4 })).toBe(13);
        });
    });
});