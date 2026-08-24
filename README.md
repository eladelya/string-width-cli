# string-width (v2.0.0)

A highly accurate, dependency-free TypeScript library for calculating the visual width of strings in a terminal. 

This major release (v2.0.0) introduces a completely new architecture, leveraging native `Intl.Segmenter` and an automated Unicode data build pipeline to solve long-standing edge cases with complex emojis, variation selectors, and combining marks.

## ✨ Key Features

* **100% Accurate Grapheme Segmentation:** Uses the native V8 `Intl.Segmenter` to perfectly parse ZWJ sequences (e.g., 👨‍👩‍👧‍👦), flags (🇮🇱), and combining marks (◌́◌̈) without relying on fragile regex.
* **Always Up-to-Date:** Ships with an automated build script (`npm run build:ranges`) that fetches and parses the latest official `emoji-data.txt` and `EastAsianWidth.txt` directly from Unicode.org.
* **Blazing Fast:** Uses memory-efficient Bitwise flags for parsing and `O(log N)` Binary Search for runtime code-point lookups.
* **Variation Selector Support:** Correctly shrinks or expands characters based on Text Presentation (VS15, `\uFE0E`) and Emoji Presentation (VS16, `\uFE0F`) selectors.
* **Fully Configurable:** Support for custom tab widths and ambiguous character handling.

## 📦 Installation

```bash
npm install # or yarn / pnpm
```

## 🚀 Usage

```typescript
import { stringWidth } from './src/width.js';

// Standard characters
stringWidth('Hello'); // 5

// East Asian Wide characters
stringWidth('你好'); // 4

// Emojis and ZWJ sequences
stringWidth('🤣'); // 2
stringWidth('👨‍👩‍👧‍👦'); // 2 (Measured as a single grapheme!)

// Regional Indicators (Flags)
stringWidth('🇮🇱'); // 2

// Control Characters and Zero-Width
stringWidth('A\u0301\u0308'); // 1 (Combining marks are absorbed)
stringWidth('Line1\nLine2'); // 10 (\n is width 0)
```

### Options API

You can pass an options object as the second argument to customize the calculation:

```typescript
import { stringWidth } from './src/width.js';

// Custom Tab Width (Default is 4)
stringWidth('a\tb', { tabWidth: 8 }); // 10

// Ambiguous Characters Handling (Default is false/width 1)
// Useful for legacy CJK terminals where ambiguous characters take 2 columns
stringWidth('±', { ambiguousIsWide: true }); // 2
```

## 🛠️ How It Works (Architecture)

1. **Build Step:** The `scripts/build-ranges.ts` script fetches Unicode data, parses it into an optimized memory map using Bitwise operations, and compresses it into clean, continuous hexadecimal ranges (`src/ranges.ts`).
2. **Segmentation:** At runtime, the library splits the input string into visual graphemes using `Intl.Segmenter`.
3. **Evaluation:** Each grapheme is evaluated against the compiled ranges using a Binary Search algorithm, considering variation selectors, regional indicators, and zero-width characters.

## 🧪 Testing

The library is fully covered by a comprehensive test suite testing dozens of edge cases (Control chars, ANSI stripping, mixed widths, VS15/VS16 conflicts).

```bash
npm test
# Runs Vitest suite (width.test.ts)
```