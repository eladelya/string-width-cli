# String Width CLI 📏

A lightweight, high-performance TypeScript library to calculate the exact terminal display width of strings. It fully supports complex Unicode characters, emojis, and ANSI escape codes.

Built with a focus on robust architecture, performance, and Unicode standard compliance.

For a deep dive into the research, architecture decisions, and Unicode edge cases, please see WRITEUP.pdf.

## Features ✨
* **Native Grapheme Segmentation:** Uses `Intl.Segmenter` to accurately group complex graphemes (e.g., ZWJ sequences and skin-tone modifiers).
* **Advanced Emoji Support:** Correctly processes Emoji Presentation Selectors (`\uFE0E` for text presentation, `\uFE0F` for emoji presentation).
* **East Asian Width:** Full support for Wide and Fullwidth CJK characters via efficient `O(log k)` binary search over compressed ranges.
* **Terminal-Ready:** Cleanly strips ANSI escape codes and seamlessly handles zero-width control characters (e.g., `\u200B`, LTR/RTL marks).
* **Regional Indicators:** Accurately resolves pairing for flag emojis.

## Getting Started 🚀

### Installation
```bash
npm install
```

### Usage
```typescript
import { stringWidth } from './src/index.js';

console.log(stringWidth('Hello'));         // Output: 5
console.log(stringWidth('שלום'));          // Output: 4
console.log(stringWidth('👨‍👩‍👦'));          // Output: 2 (ZWJ Sequence)
console.log(stringWidth('\u2764\uFE0E'));  // Output: 1 (Text Presentation VS15)
console.log(stringWidth('🇮🇱'));            // Output: 2 (Regional Indicators Flag)
```

## Architecture & Trade-offs 🛠️
This v1.0.0 implementation prioritizes high performance and stability for CLI environments:
* **Static Ranges (MVP):** Unicode ranges for Emojis and East Asian characters are currently hardcoded for fast execution and zero dependencies. A planned v2.0 feature includes an automated build script to fetch and parse the latest tables directly from `unicode.org`.
* **Ambiguous Characters:** Characters defined as `Ambiguous` in the Unicode standard currently default to width 1.

## Testing 🧪
The core logic is fully covered by an automated test suite. Run the tests using Vitest:
```bash
npm test
```