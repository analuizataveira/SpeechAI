import { describe, it, expect } from 'vitest';
import { maskPhone } from './phone';

describe('Utils: Phone', () => {
  it('deve mascarar um telefone corretamente', () => {
    const result = maskPhone('(35) 99988-7766');
    expect(result).toBe('99*********'); 
  });

  it('deve retornar string vazia se não houver telefone', () => {
    expect(maskPhone('')).toBe('');
  });
});