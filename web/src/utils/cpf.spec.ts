import { describe, it, expect } from 'vitest';
import { validateCPF, maskCPF } from './cpf';

describe('Utils: CPF', () => {
  describe('validateCPF', () => {
    it('deve retornar true para um CPF válido', () => {
      expect(validateCPF('52998224725')).toBe(true);
    });

    it('deve retornar false para um CPF com dígitos repetidos', () => {
      expect(validateCPF('11111111111')).toBe(false);
    });

    it('deve retornar false para um CPF inválido', () => {
      expect(validateCPF('12345678900')).toBe(false);
    });

    it('deve limpar caracteres não numéricos antes de validar', () => {
      expect(validateCPF('529.982.247-25')).toBe(true);
    });
  });

  describe('maskCPF', () => {
    it('deve mascarar o CPF corretamente (padrão visual)', () => {
      const cpf = '12345678900';
      const masked = maskCPF(cpf);
      
      expect(masked).toBe('123.***.***-00');
    });

    it('deve retornar vazio se CPF não for fornecido', () => {
      expect(maskCPF('')).toBe('');
    });
  });
});