import { describe, test, expect } from 'vitest';
import { stripAnsi } from './utils.js';



describe('stripAnsi', () => {
    test('returns a plain string unchanged', () => {
        expect(stripAnsi('Hello, world!')).toBe('Hello, world!');
    });

    test('removes a basic color sequence', () => {
        expect(stripAnsi('\u001B[31mHello\u001B[0m')).toBe('Hello');
    });

    test('removes multiple ANSI sequences', () => {
        expect(
            stripAnsi('\u001B[31mRed\u001B[0m and \u001B[32mGreen\u001B[0m')
        ).toBe('Red and Green');
    });

    test('removes ANSI sequence at the beginning', () => {
        expect(stripAnsi('\u001B[31mHello')).toBe('Hello');
    });

    test('removes ANSI sequence at the end', () => {
        expect(stripAnsi('Hello\u001B[0m')).toBe('Hello');
    });

    test('removes bold sequence', () => {
        expect(stripAnsi('\u001B[1mBold\u001B[0m')).toBe('Bold');
    });

    test('removes background color sequence', () => {
        expect(stripAnsi('\u001B[41mRed background\u001B[0m'))
            .toBe('Red background');
    });

    test('removes 256-color sequence', () => {
        expect(stripAnsi('\u001B[38;5;208mOrange\u001B[0m'))
            .toBe('Orange');
    });

    test('removes RGB color sequence', () => {
        expect(stripAnsi('\u001B[38;2;255;128;0mOrange\u001B[0m'))
            .toBe('Orange');
    });

    test('removes multiple formatting parameters', () => {
        expect(stripAnsi('\u001B[1;31;42mHello\u001B[0m'))
            .toBe('Hello');
    });

    test('removes cursor movement sequences', () => {
        expect(stripAnsi('Hello\u001B[2JWorld'))
            .toBe('HelloWorld');
    });

    test('removes erase line sequence', () => {
        expect(stripAnsi('Hello\u001B[2KWorld'))
            .toBe('HelloWorld');
    });

    test('removes CSI sequence using \\u009B', () => {
        expect(stripAnsi('\u009B31mHello\u009B0m'))
            .toBe('Hello');
    });

    test('does not remove normal brackets', () => {
        expect(stripAnsi('Hello [31m world')).toBe('Hello [31m world');
    });

    test('does not modify an empty string', () => {
        expect(stripAnsi('')).toBe('');
    });

    test('handles Unicode text', () => {
        expect(stripAnsi('\u001B[31mשלום 👋 世界\u001B[0m'))
            .toBe('שלום 👋 世界');
    });

    test('removes adjacent ANSI sequences', () => {
        expect(stripAnsi('\u001B[31m\u001B[1mHello\u001B[0m\u001B[0m'))
            .toBe('Hello');
    });
});