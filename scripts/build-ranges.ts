import fs from 'node:fs';
import path from 'node:path';

const EMOJI_DATA_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt';
const EAST_ASIAN_WIDTH_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt';

async function fetchFileSafe(url: string, fileName: string): Promise<string> {
    try {
        console.log(`Downloading ${fileName}...`);
        const res = await fetch(url);
        
        // בדיקה אם השרת החזיר שגיאת HTTP (כמו 404 או 500)
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
        }
        
        return await res.text();
    } catch (error: unknown) {
        console.error('\n❌ Build Failed: Network Error!');
        console.error(`Could not download ${fileName} from Unicode.org.`);
        console.error('Please check your internet connection and try again.');
        
        // Type Narrowing בטוח
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error details: ${errorMessage}\n`);
        
        // חשוב מאוד: הורג את הסקריפט עם קוד שגיאה כדי שמערכות Build (כמו GitHub Actions) ידעו שהבנייה נכשלה
        process.exit(1); 
    }
}

type Range = { start: number; end: number };

// הגדרת משמעויות לכל תו בעזרת ביטים
const FLAG_EMOJI = 1 << 0;               // 1
const FLAG_EMOJI_PRESENTATION = 1 << 1;  // 2
const FLAG_WIDE = 1 << 2;                // 4
const FLAG_AMBIGUOUS = 1 << 3;           // 8

async function fetchAndParse() {
    console.log('Downloading Unicode data files...');
    
    const emojiDataText = await fetchFileSafe(EMOJI_DATA_URL, 'emoji-data.txt');
    const eawText = await fetchFileSafe(EAST_ASIAN_WIDTH_URL, 'EastAsianWidth.txt');    

    console.log('Parsing data...');

    // מערך שמייצג את כל מרחב היוניקוד 
    // כל תא יחזיק מספר שמייצג את הדגלים שהדלקנו עליו
    const unicodeSpace = new Uint8Array(0x10FFFF + 1);

    const lineRegex = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s+;\s+([A-Za-z_]+)/;

    // פונקציה שמדליקה דגל על טווח מסוים
    function applyProperty(text: string, propMatch: string, flag: number) {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.startsWith('#') || line.trim() === '') continue;
            const match = line.match(lineRegex);
            
            // אם המאפיין בשורה מתאים למאפיין שאנחנו מחפשים
            if (match && match[3]! === propMatch) {
                const start = parseInt(match[1]!, 16);
                const end = match[2] ? parseInt(match[2]!, 16) : start;
                
                // מדליקים את הביט הרלוונטי לכל התווים בטווח
                for (let i = start; i <= end; i++) {
                    unicodeSpace[i]! |= flag;
                }
            }
        }
    }

    // מעבר על הקבצים והדלקת הדגלים הרלוונטיים
    applyProperty(emojiDataText, 'Emoji', FLAG_EMOJI);
    applyProperty(emojiDataText, 'Emoji_Presentation', FLAG_EMOJI_PRESENTATION);
    applyProperty(eawText, 'W', FLAG_WIDE);
    applyProperty(eawText, 'F', FLAG_WIDE);
    applyProperty(eawText, 'A', FLAG_AMBIGUOUS);

    // פונקציית עזר שהופכת אינדקסים רציפים חזרה למערך של Range[]
    function compressToRanges(condition: (val: number) => boolean): Range[] {
        const ranges: Range[] = [];
        let rangeStart = -1;

        for (let i = 0; i <= 0x10FFFF; i++) {
            const meetsCondition = condition(unicodeSpace[i]!);
            
            if (meetsCondition && rangeStart === -1) {
                rangeStart = i; // התחלת טווח חדש
            } else if (!meetsCondition && rangeStart !== -1) {
                ranges.push({ start: rangeStart, end: i - 1 }); // סגירת הטווח
                rangeStart = -1;
            }
        }
        // סגירת טווח במקרה שהוא מגיע עד סוף המערך
        if (rangeStart !== -1) {
            ranges.push({ start: rangeStart, end: 0x10FFFF });
        }
        return ranges;
    }
    
    // Wide emojis or wide chars
    const wideRanges = compressToRanges(val => 
        (val & FLAG_WIDE) !== 0 || (val & FLAG_EMOJI_PRESENTATION) !== 0
    );

    // Narrow emojis
    const narrowEmojiRanges = compressToRanges(val => 
        (val & FLAG_EMOJI) !== 0 && (val & FLAG_EMOJI_PRESENTATION) === 0
    );

    // ambigouos
    const ambiguousRanges = compressToRanges(val => 
        (val & FLAG_AMBIGUOUS) !== 0
    );

    // console.log(`Found ${wideRanges.length} wide ranges.`);
    // console.log(`Found ${narrowEmojiRanges.length} narrow emoji ranges.`);
    // console.log(`Found ${ambiguousRanges.length} ambiguous ranges.`);


//     function isInRange(cp: number, ranges: Range[]) {
//     return ranges.some(r => cp >= r.start && cp <= r.end);
// }
// console.log('\n--- Sanity Checks ---');
// // אימוג'י רגיל שאמור להיות רחב
// console.log('🤣 (ROFL) is wide?', isInRange(0x1F923, wideRanges)); // צפה ל: true

// // אימוג'י צר (שזיהינו בסעיף 2 ב-Writeup)
// console.log('☀ (Sun) is narrow emoji?', isInRange(0x2600, narrowEmojiRanges)); // צפה ל: true
// console.log('☀ (Sun) is wide?', isInRange(0x2600, wideRanges)); // צפה ל: false

// // תו CJK שאמור להיות רחב תמיד
// console.log('字 (CJK) is wide?', isInRange(0x5B57, wideRanges)); // צפה ל: true

// // אות רגילה לחלוטין שאמורה לא להופיע באף רשימה פה
// console.log('א (Aleph) is wide?', isInRange(0x05D0, wideRanges)); // צפה ל: false
    // ... אחרי ההדפסות של ה-console.log ...

    // פונקציית עזר להמרת מערך טווחים לטקסט של קוד TypeScript
    function stringifyRanges(ranges: Range[]) {
        const lines = ranges.map(r => 
            `  { start: 0x${r.start.toString(16).toUpperCase()}, end: 0x${r.end.toString(16).toUpperCase()} }`
        );
        return `[\n${lines.join(',\n')}\n]`;
    }

    const fileContent = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
// Generated on: ${new Date().toISOString()}

export interface Range {
  start: number;
  end: number;
}

export const WIDE_RANGES: Range[] = ${stringifyRanges(wideRanges)};

export const NARROW_EMOJI_RANGES: Range[] = ${stringifyRanges(narrowEmojiRanges)};

export const AMBIGUOUS_RANGES: Range[] = ${stringifyRanges(ambiguousRanges)};

export function inRange(ranges: Range[], codePoint: number): boolean {
    let low = 0;
    let high = ranges.length - 1;
    
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const range = ranges[mid];
        
        if (codePoint >= range!.start && codePoint <= range!.end) {
            return true;
        } else if (codePoint < range!.start) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return false;
}

export function isRegionalIndicator(codePoint: number): boolean {
    return codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF;
}
    export function isWide(codePoint: number): boolean {
        return inRange(WIDE_RANGES, codePoint);
    }
    
    export function isNarrowEmoji(codePoint: number): boolean {
        return inRange(NARROW_EMOJI_RANGES, codePoint);
    }
    
    export function isAmbiguous(codePoint: number): boolean {
        return inRange(AMBIGUOUS_RANGES, codePoint);
    }
    
    export function isZeroWidthCodePoint(codePoint: number): boolean {
        return (
            // Zero Width Spaces & Joiners 
            codePoint === 0x200B || // Zero Width Space (ZWSP)
            codePoint === 0x200C || // Zero Width Non-Joiner (ZWNJ)
            codePoint === 0x200D || // Zero Width Joiner (ZWJ) 
            codePoint === 0x2060 || // Word Joiner (WJ)
            codePoint === 0xFEFF || // Zero Width No-Break Space (BOM)
            // Bidi Control Characters (RTL/LTR) 
            (codePoint >= 0x200E && codePoint <= 0x200F) || // LRM, RLM
            (codePoint >= 0x202A && codePoint <= 0x202E) || // LRE, RLE, PDF, LRO, RLO
            (codePoint >= 0x2066 && codePoint <= 0x2069)    // LRI, RLI, FSI, PDI
        );
    }
    
`;

    // (cwd returns string-width, not scripts)
    const outputPath = path.join(process.cwd(), 'src', 'ranges.ts');
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`Successfully generated ${outputPath}`);

}

fetchAndParse().catch(console.error);



