// src/width.test.ts
import { describe, it, expect } from 'vitest';
import { stringWidth } from './width.js';

describe('stringWidth Comprehensive Tests', () => {
  
  describe('Basic Text & Mixed Languages', () => {
    it('should calculate ASCII and Latin correctly', () => {
      expect(stringWidth('Hello World')).toBe(11);
      expect(stringWidth('12345')).toBe(5);
    });

    it('should calculate Hebrew correctly', () => {
      expect(stringWidth('שלום עולם')).toBe(9); // כולל רווח
    });

    it('should handle mixed English, Hebrew, and numbers', () => {
      expect(stringWidth('Hi שלום 123')).toBe(11);
    });
  });

  describe('Emojis & Complex Graphemes', () => {
    it('should handle single emojis with and without variation selectors', () => {
      expect(stringWidth('😀')).toBe(2);
      expect(stringWidth('❤️')).toBe(2);
      expect(stringWidth('❤')).toBe(2); // גם בלי ה-VS16
    });

    it('should handle Zero-Width Joiner (ZWJ) sequences correctly', () => {
      expect(stringWidth('👨‍👩‍👦')).toBe(2); // משפחה
      expect(stringWidth('👩‍💻')).toBe(2); // אישה מתכנתת
    });

    it('should handle skin-tone modifiers correctly', () => {
      expect(stringWidth('👋🏽')).toBe(2);
      expect(stringWidth('👍🏿')).toBe(2);
    });

    it('should handle Regional Indicator Symbols (Flags)', () => {
      expect(stringWidth('🇺🇸')).toBe(2); // דגל ארה"ب
      expect(stringWidth('🇮🇱')).toBe(2); // דגל ישראל
    });
  });

  describe('East Asian Wide & Fullwidth', () => {
    it('should handle CJK and Kana characters as width 2', () => {
      expect(stringWidth('漢字')).toBe(4);
      expect(stringWidth('あ')).toBe(2);
    });

    it('should handle Fullwidth ASCII variants', () => {
      expect(stringWidth('Ａ')).toBe(2); // Fullwidth A
      expect(stringWidth('！')).toBe(2); // Fullwidth exclamation mark
    });
  });

  describe('Zero-Width Characters & Modifiers', () => {
    it('should return 0 for standalone zero-width characters', () => {
      expect(stringWidth('\u200D')).toBe(0); // ZWJ
      expect(stringWidth('\u200C')).toBe(0); // ZWNJ
      expect(stringWidth('\uFEFF')).toBe(0); // BOM
    });

    it('should handle strings with combining diacritical marks / accents', () => {
      // אות עם סימני ניקוד/טעם שלא מוסיפים רוחב לעמודה בטרמינל
      expect(stringWidth('e\u0301')).toBe(1); // é מורכב
    });
  });

  describe('ANSI Escape Codes', () => {
    it('should strip various ANSI styles and colors', () => {
      expect(stringWidth('\u001b[31mRed Text\u001b[0m')).toBe(8);
      expect(stringWidth('\u001b[1m\u001b[42mStyled\u001b[0m')).toBe(6);
    });
  });


  
  describe('Real-World & Mixed Strings', () => {
    it('should correctly calculate width for heavily mixed strings', () => {
      // "שלום" (4) + רווח (1) + "World!" (6) = 11
      expect(stringWidth('שלום World!')).toBe(11);

      // "היי " (4) + לב אדום ❤️ (2) + "!" (1) = 7
      expect(stringWidth('היי ❤️!')).toBe(7);

      // אימוג'י משפחה 👨‍👩‍👦 (2) + רווח (1) + עברית "משפחה" (5) = 8
      expect(stringWidth('👨‍👩‍👦 משפחה')).toBe(8);

      // דגל ישראל 🇮🇱 (2) + רווח (1) + "Israel" (6) = 9
      expect(stringWidth('🇮🇱 Israel')).toBe(9);

      // שילוב פרוע: קודי ANSI (0) + עברית (4) + אימוג'י (2) + אנגלית (5) = 11
      expect(stringWidth('\u001b[32mשלום\u001b[0m 👋🏽 12345')).toBe(13);
    });
  });
  
  describe('Edge Cases & Invalid Inputs', () => {
    it('should handle empty strings and falsy values safely', () => {
      expect(stringWidth('')).toBe(0);
      // @ts-ignore
      expect(stringWidth(null)).toBe(0);
      // @ts-ignore
      expect(stringWidth(undefined)).toBe(0);
      // @ts-ignore
      expect(stringWidth(12345)).toBe(0);
    });
  });
});