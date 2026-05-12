import { describe, expect, it } from 'vitest'
import {
  exceedsMaxDecimals,
  getDecimalCount,
  truncateToMaxDecimals,
  wouldTruncateAny
} from './decimalValidation'

describe('decimalValidation utilities', () => {
  describe('exceedsMaxDecimals', () => {
    it('should return true for values with more than 7 decimals', () => {
      expect(exceedsMaxDecimals('1.123456789')).toBe(true)
      expect(exceedsMaxDecimals('10.12345678')).toBe(true)
      expect(exceedsMaxDecimals('-5.987654321')).toBe(true)
    })

    it('should return false for values with 7 or fewer decimals', () => {
      expect(exceedsMaxDecimals('1.1234567')).toBe(false)
      expect(exceedsMaxDecimals('10.123456')).toBe(false)
      expect(exceedsMaxDecimals('-5.9876543')).toBe(false)
      expect(exceedsMaxDecimals('100')).toBe(false)
    })

    it('should handle empty strings and whitespace', () => {
      expect(exceedsMaxDecimals('')).toBe(false)
      expect(exceedsMaxDecimals('  ')).toBe(false)
      expect(exceedsMaxDecimals('-')).toBe(false)
    })

    it('should handle scientific notation', () => {
      expect(exceedsMaxDecimals('1.123456789e2')).toBe(false)
      expect(exceedsMaxDecimals('1.123456789e-2')).toBe(true)
      expect(exceedsMaxDecimals('1e10')).toBe(false)
    })

    it('should handle quoted and leading-dot decimals', () => {
      expect(exceedsMaxDecimals('"12.123456789"')).toBe(true)
      expect(exceedsMaxDecimals('.123456789')).toBe(true)
    })
  })

  describe('getDecimalCount', () => {
    it('should return correct decimal count', () => {
      expect(getDecimalCount('1.1')).toBe(1)
      expect(getDecimalCount('1.123456789')).toBe(9)
      expect(getDecimalCount('100')).toBe(0)
      expect(getDecimalCount('')).toBe(0)
      expect(getDecimalCount('"0.123456789"')).toBe(9)
    })
  })

  describe('truncateToMaxDecimals', () => {
    it('should truncate values with more than 7 decimals', () => {
      const result = truncateToMaxDecimals('1.123456789')
      expect(result.value).toBe('1.1234567')
      expect(result.truncated).toBe(true)
    })

    it('should not truncate values with 7 or fewer decimals', () => {
      const result = truncateToMaxDecimals('1.1234567')
      expect(result.value).toBe('1.1234567')
      expect(result.truncated).toBe(false)
    })

    it('should preserve whole numbers', () => {
      const result = truncateToMaxDecimals('100')
      expect(result.value).toBe('100')
      expect(result.truncated).toBe(false)
    })

    it('should handle negative numbers', () => {
      const result = truncateToMaxDecimals('-1.123456789')
      expect(result.value).toBe('-1.1234567')
      expect(result.truncated).toBe(true)
    })

    it('should handle empty strings', () => {
      const result = truncateToMaxDecimals('')
      expect(result.value).toBe('')
      expect(result.truncated).toBe(false)
    })

    it('should truncate quoted and leading-dot decimals', () => {
      expect(truncateToMaxDecimals('"12.123456789"')).toEqual({
        value: '12.1234567',
        truncated: true
      })
      expect(truncateToMaxDecimals('.123456789')).toEqual({
        value: '0.1234567',
        truncated: true
      })
    })
  })

  describe('wouldTruncateAny', () => {
    it('should return true if any value needs truncation', () => {
      const values = ['1.1234567', '1.123456789', '100']
      expect(wouldTruncateAny(values)).toBe(true)
    })

    it('should return false if no values need truncation', () => {
      const values = ['1.1234567', '100', '50.5']
      expect(wouldTruncateAny(values)).toBe(false)
    })

    it('should handle empty arrays', () => {
      expect(wouldTruncateAny([])).toBe(false)
    })

    it('should handle arrays with empty strings', () => {
      const values = ['', '1.1234567']
      expect(wouldTruncateAny(values)).toBe(false)
    })

    it('should detect truncation for quoted numeric strings', () => {
      expect(wouldTruncateAny(['"1.123456789"', '5'])).toBe(true)
    })
  })
})
