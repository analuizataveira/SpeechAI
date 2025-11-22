import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import React from "react"

const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock('@/hooks/user-provider', () => ({
  useUser: () => ({
    login: mockLogin,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const PageWrapper = () => (
  <BrowserRouter>
    <LoginPage />
  </BrowserRouter>
);

describe('Page: Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de login corretamente', () => {
    render(<PageWrapper />);
    
    expect(screen.getByText('Entrar no SpeechAI')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve chamar a função de login com os dados corretos', async () => {
    mockLogin.mockResolvedValue(true);

    render(<PageWrapper />);

    // Preenche os campos
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'teste@email.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: '123456' } });

    // Clica no botão
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('teste@email.com', '123456');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Login realizado com sucesso!",
      }));
    });
  });

  it('deve exibir erro se o login falhar', async () => {
    mockLogin.mockResolvedValue(false);

    render(<PageWrapper />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'erro@email.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senhaerrada' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Erro no login",
        variant: "destructive",
      }));
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});