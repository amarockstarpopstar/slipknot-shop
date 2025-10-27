import { describe, expect, it } from 'vitest';
import {
  SUPPORTED_COUNTRIES,
  getCitiesByCountry,
  isRussianCountry,
  normalizeCountry,
} from './location';

describe('location utilities', () => {
  it('returns known Russian cities when Россия is selected', () => {
    expect(getCitiesByCountry('Россия')).toEqual([
      'Москва',
      'Санкт-Петербург',
      'Новосибирск',
      'Екатеринбург',
      'Казань',
    ]);
  });

  it('normalizes country names in a resilient way', () => {
    expect(normalizeCountry('  КаЗаХсТаН  ')).toBe('казахстан');
    expect(normalizeCountry(null)).toBe('');
    expect(normalizeCountry(undefined)).toBe('');
  });

  it('correctly identifies Russian countries regardless of letter case', () => {
    for (const candidate of ['РОССИЯ', '  Россия  ', 'россия']) {
      expect(isRussianCountry(candidate)).toBe(true);
    }

    const nonRussianCountries = SUPPORTED_COUNTRIES.filter((country) => country !== 'Россия');
    for (const country of nonRussianCountries) {
      expect(isRussianCountry(country)).toBe(false);
    }
  });
});
