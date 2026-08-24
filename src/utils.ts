// src/utils.ts
import stripAnsi from 'strip-ansi';

export { stripAnsi }; 

export function isControlCharacter(codePoint: number): boolean {
    // כל תווי הבקרה למעט טאב (0x0009) שנטופל בנפרד
    if (codePoint >= 0x0000 && codePoint <= 0x001F && codePoint !== 0x0009) return true;
    if (codePoint >= 0x007F && codePoint <= 0x009F) return true;
    return false;
}