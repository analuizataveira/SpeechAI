import { describe, it, expect } from 'vitest';
import { centsToDouble, doubleToCents, formatBRL } from './currency';

describe('Utils: Currency', () => {
  describe('centsToDouble', () => {
    it('deve converter centavos para decimal', () => {
      expect(centsToDouble(1050)).toBe(10.5);
      expect(centsToDouble(100)).toBe(1);
    });

    it('deve lidar com 0 ou undefined', () => {
      expect(centsToDouble(0)).toBe(0);
      expect(centsToDouble(undefined)).toBe(0);
    });
  });

  describe('doubleToCents', () => {
    it('deve converter decimal para centavos', () => {
      expect(doubleToCents(10.5)).toBe(1050);
      expect(doubleToCents(1)).toBe(100);
    });

    it('deve lidar com 0 ou undefined', () => {
      expect(doubleToCents(0)).toBe(0);
      expect(doubleToCents(undefined)).toBe(0);
    });
  });

  describe('formatBRL', () => {
    it('deve formatar número para moeda Brasileira', () => {
      const result = formatBRL(1500.50);
      expect(result).toContain('R$');
      expect(result).toContain('1.500,50');
    });
  });
});