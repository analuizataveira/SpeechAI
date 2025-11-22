import { render, screen, fireEvent } from '@testing-library/react';
import { CustomInput } from './custom-input';
import { useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Wrapper necessário porque o CustomInput usa useForm internamente (via Controller)
const InputWrapper = (props: any) => {
  const { control } = useForm();
  return <CustomInput control={control} {...props} />;
};

describe('Component: CustomInput', () => {
  it('deve renderizar o input com o label correto', () => {
    render(<InputWrapper name="email" label="Endereço de E-mail" />);
    
    expect(screen.getByLabelText('Endereço de E-mail')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('deve alternar a visibilidade da senha ao clicar no ícone', () => {
    render(<InputWrapper name="password" label="Senha" type="password" fill="neutral-500" />);
    
    const input = screen.getByLabelText('Senha');
    
    // 1. Estado inicial: tipo password
    expect(input).toHaveAttribute('type', 'password');
    
    // 2. Encontrar o botão de toggle (Show password)
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    // 3. Clicar no botão
    fireEvent.click(toggleButton);
    
    // 4. Estado alterado: tipo text (visível)
    expect(input).toHaveAttribute('type', 'text');
    
    // 5. Botão mudou o aria-label para 'Hide password'
    const hideButton = screen.getByRole('button', { name: /hide password/i });
    expect(hideButton).toBeInTheDocument();
    
    // 6. Clicar novamente para esconder
    fireEvent.click(hideButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('deve exibir mensagem de erro quando fornecida', () => {
    render(<InputWrapper name="email" errorMessage="Campo obrigatório" />);
    
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Campo obrigatório')).toHaveClass('text-red-500');
  });

  it('deve chamar onChangeInputValue quando digitado', () => {
    const handleChange = vi.fn();
    render(<InputWrapper name="test" onChangeInputValue={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'novo valor' } });
    
    expect(handleChange).toHaveBeenCalledWith('novo valor');
  });
});