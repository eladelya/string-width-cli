// src/utils.ts
// import stripAnsi from 'strip-ansi';

// export { stripAnsi }; 



// Regex standard for matching ANSI escape codes, internet
const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export function stripAnsi(str: string): string {
    if (typeof str !== 'string') return str;
    return str.replace(ANSI_REGEX, '');
}

export function isControlCharacter(codePoint: number): boolean {
    // כל תווי הבקרה למעט טאב (0x0009) שנטופל בנפרד
    if (codePoint >= 0x0000 && codePoint <= 0x001F && codePoint !== 0x0009) return true;
    if (codePoint >= 0x007F && codePoint <= 0x009F) return true;
    return false;
}