import { describe, it, expect } from 'vitest';
import { maskName } from './strings';

describe('Utils: Strings', () => {
  describe('maskName', () => {
    it('deve formatar o nome corretamente (Primeiro completo, outros abreviados)', () => {
      expect(maskName('Ana Luiza Taveira')).toBe('Ana L. T.');
    });

    it('deve corrigir a capitalização', () => {
      expect(maskName('joão silva')).toBe('João S.');
    });

    it('deve retornar vazio se não houver nome', () => {
      expect(maskName('')).toBe('');
    });
  });
});