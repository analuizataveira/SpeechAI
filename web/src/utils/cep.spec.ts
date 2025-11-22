import { describe, it, expect } from 'vitest';
import { validateCep } from './cep';

describe('Utils: CEP', () => {
  it('deve retornar true para um CEP válido com formatação', () => {
    expect(validateCep('37.500-000')).toBe(true);
  });

  it('deve retornar true para um CEP válido apenas números', () => {
    expect(validateCep('37500000')).toBe(true);
  });

  it('deve retornar false se o tamanho for diferente de 8 dígitos', () => {
    expect(validateCep('37500')).toBe(false);
    expect(validateCep('375000000')).toBe(false);
  });

  it('deve retornar false para padrões inválidos conhecidos (Blacklist)', () => {
    expect(validateCep('00000000')).toBe(false);
    expect(validateCep('11111111')).toBe(false);
    expect(validateCep('99999999')).toBe(false);
  });
});