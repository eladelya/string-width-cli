# string-width-cli

A lightweight, zero-runtime-dependency TypeScript library for calculating the visual width of strings in a terminal, conforming to Unicode standards.

This project leverages native `Intl.Segmenter` and a build-time range compilation pipeline to accurately handle complex edge cases such as emojis, variation selectors, zero-width joiners (ZWJ), and terminal escape sequences (including OSC 8 hyperlinks).

## ✨ Key Features

* **Native Grapheme Segmentation**
  Uses V8's `Intl.Segmenter` to accurately parse ZWJ sequences (e.g. `👨‍👩‍👧‍👦`), flags (e.g. `🇮🇱`), and combining marks without fragile regular expressions.

* **Optimized Lookups**
  Compiles raw Unicode data into compressed hexadecimal ranges, utilizing an O(log N) binary search for fast runtime code-point evaluation.

* **Variation Selector Support**
  Correctly handles Text Presentation (VS15, `\uFE0E`) and Emoji Presentation (VS16, `\uFE0F`) selectors.

* **Terminal Escape Handling**
  Safely strips ANSI escape codes and modern OSC 8 hyperlinks, ensuring layout widths are computed based strictly on visible text.

* **Configurable Options**
  Supports custom tab widths and legacy CJK ambiguous character handling.

## Installation & Setup

Install the dependencies:

```bash
npm install
```

Ensure the Unicode range maps are compiled:

```bash
npm run build:ranges
```

## Usage

```ts
import { stringWidth } from './src/width.js';

stringWidth('Hello'); // 5
stringWidth('你好'); // 4
stringWidth('🤣'); // 2
stringWidth('👨‍👩‍👧‍👦'); // 2
stringWidth('🇮🇱'); // 2
stringWidth('\u001b[31mHello\u001b[0m'); // 5
```

### Options API

Pass an options object as the second argument:

```ts
// Custom Tab Width (Default is 4)
stringWidth('a\tb', { tabWidth: 8 }); // 10

// Ambiguous Characters Handling
stringWidth('±', { ambiguousIsWide: true }); // 2
```

## Architecture

### 1. Build Pipeline

`scripts/build-ranges.ts` fetches official Unicode data files (`emoji-data.txt`, `EastAsianWidth.txt`) and compiles them into static range maps (`src/ranges.ts`).

### 2. Segmentation

Inputs are broken down into visual grapheme clusters using `Intl.Segmenter`.

### 3. Evaluation

Each cluster is evaluated against the pre-compiled ranges using binary search.

## Testing

The library includes a comprehensive test suite covering edge cases such as surrogates, ANSI stripping, ZWJ sequences, and variation selectors.

Run the tests with:

```bash
npm test
```

## Known Limitations

* **Malformed Grapheme Clusters:** Highly malformed or truncated sequences may be handled incorrectly.
* **Single-Line Context:** Newlines (`\n`) and carriage returns (`\r`) are treated as zero-width control characters.
