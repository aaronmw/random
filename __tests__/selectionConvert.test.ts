import path from 'path'
import os from 'os'
import { describe, expect, it } from 'vitest'

const converter = require(path.join(
  os.homedir(),
  '.vscode',
  'selection-convert.js',
))

describe('transformSelection', () => {
  describe('curly brace { expression }', () => {
    it('extracts classNames from twJoin and returns double-quoted string', () => {
      const input = `{twJoin(
    'flex',
    'w-full',
    'items-baseline',
    'justify-between',
    'gap-6',
    'py-2',
  )}`
      expect(converter.transformSelection(input)).toBe(
        '"flex w-full items-baseline justify-between gap-6 py-2"',
      )
    })

    it('extracts classNames from array.join expression', () => {
      const input = `{['some', 'classNames'].join(' ')}`
      expect(converter.transformSelection(input)).toBe('"some classNames"')
    })
  })

  describe('double-quoted "..." (className attribute value)', () => {
    it('splits into twJoin with multiple args', () => {
      expect(converter.transformSelection('"flex w-full items-baseline"')).toBe(
        "{twJoin('flex', 'w-full', 'items-baseline')}",
      )
    })

    it('single class returns twJoin with one arg', () => {
      expect(converter.transformSelection('"flex"')).toBe("{twJoin('flex')}")
    })
  })

  describe('join - multiple quoted strings', () => {
    it('selection with quotes and trailing comma returns quoted with comma', () => {
      const input = `'items-baseline',
    'justify-between',`
      expect(converter.transformSelection(input)).toBe(
        "'items-baseline justify-between',",
      )
    })

    it('selection with quotes and no trailing comma returns quoted without comma', () => {
      const input = `'items-baseline',
    'justify-between'`
      expect(converter.transformSelection(input)).toBe(
        "'items-baseline justify-between'",
      )
    })

    it('selection without outer quotes returns unquoted (content only)', () => {
      const input = `items-baseline',
    'justify-between`
      expect(converter.transformSelection(input)).toBe(
        'items-baseline justify-between',
      )
    })
  })

  describe('split - single quoted string with spaces', () => {
    it('full quoted selection returns multiple quoted args', () => {
      const input = "'items-baseline justify-between'"
      expect(converter.transformSelection(input)).toBe(
        "'items-baseline',\n    'justify-between'",
      )
    })

    it('unquoted content returns middle only for wrapping', () => {
      const input = 'items-baseline justify-between'
      expect(converter.transformSelection(input)).toBe(
        "items-baseline',\n    'justify-between",
      )
    })
  })

  describe('single class (no change)', () => {
    it('returns unchanged', () => {
      expect(converter.transformSelection("'flex'")).toBe("'flex'")
      expect(converter.transformSelection('flex')).toBe('flex')
    })
  })
})
