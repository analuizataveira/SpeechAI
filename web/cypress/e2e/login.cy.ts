/// <reference types="cypress" />

describe('Fluxo de Login', () => {
  // Antes de cada teste, o robô acessa a página
  beforeEach(() => {
    // Certifique-se que seu front está rodando nesta porta
    cy.visit('http://localhost:5173/login');
  });

  it('deve exibir erro visual (Toast) ao tentar logar com senha errada', () => {
    // 1. Identifica o campo e digita
    cy.get('#email').type('paciente@teste.com');
    
    // 2. Digita senha errada
    cy.get('#password').type('senhaerrada123');
    
    // 3. Clica no botão de entrar (procurando pelo tipo submit)
    cy.get('button[type="submit"]').click();

    // 4. Validação: Espera que o Toast de erro apareça
    // O Cypress aguarda automaticamente alguns segundos até o elemento aparecer
    cy.contains('Erro no login').should('be.visible');
  });

  it('deve realizar login com sucesso e ir para o dashboard', () => {
    // 1. Preenche credenciais corretas (do Seed do banco)
    cy.get('#email').type('paciente@teste.com');
    cy.get('#password').type('senha123');

    // 2. Submete
    cy.get('button[type="submit"]').click();

    // 3. Validação de URL: Deve mudar para /dashboard
    cy.url().should('include', '/dashboard');

    // 4. Validação Visual: Deve ver a mensagem de boas vindas
    // No seu dashboard/page.tsx tem: "Olá, {user.name}!"
    // Vamos buscar por "Olá," para ser genérico
    cy.contains('Olá,').should('be.visible');
  });
});