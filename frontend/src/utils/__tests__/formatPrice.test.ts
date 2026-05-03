import { describe, it, expect } from 'vitest';
import { formatPrice } from '../formatPrice';

const NBSP = '\u00a0';

describe('formatPrice', () => {
  // Default: EUR, es-ES, inCents=true
  it('should format cents to EUR with default locale', () => {
    expect(formatPrice(9999)).toBe(`99,99${NBSP}€`);
  });

  it('should format cents to USD', () => {
    expect(formatPrice(9999, { currency: 'USD' })).toBe(`99,99${NBSP}US$`);
  });

  it('should format cents to MXN', () => {
    expect(formatPrice(9999, { currency: 'MXN' })).toBe(`99,99${NBSP}MXN`);
  });

  it('should format cents to COP', () => {
    expect(formatPrice(999900, { currency: 'COP' })).toBe(`9999,00${NBSP}COP`);
  });

  it('should format cents to CLP', () => {
    expect(formatPrice(99990, { currency: 'CLP' })).toBe(`999,90${NBSP}CLP`);
  });

  it('should format decimal amount when inCents=false', () => {
    expect(formatPrice(99.99, { inCents: false })).toBe(`99,99${NBSP}€`);
  });

  it('should return formatted zero for zero', () => {
    expect(formatPrice(0)).toBe(`0,00${NBSP}€`);
  });

  it('should return formatted zero for null', () => {
    expect(formatPrice(null)).toBe(`0,00${NBSP}€`);
  });

  it('should return formatted zero for undefined', () => {
    expect(formatPrice(undefined)).toBe(`0,00${NBSP}€`);
  });

  it('should format negative amounts', () => {
    expect(formatPrice(-5000)).toBe(`-50,00${NBSP}€`);
  });

  it('should format cents to GBP', () => {
    expect(formatPrice(9999, { currency: 'GBP' })).toBe(`99,99${NBSP}GBP`);
  });
});
