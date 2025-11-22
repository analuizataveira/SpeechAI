/// <reference types="cypress" />

describe('Fluxo de Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('deve exibir erro visual (Toast) ao tentar logar com senha errada', () => {
    cy.get('#email').type('paciente@teste.com');
    cy.get('#password').type('senhaerrada123');
    cy.get('button[type="submit"]').click();
    cy.contains('Erro no login').should('be.visible');
  });

  it('deve realizar login com sucesso e ir para o dashboard', () => {
    cy.get('#email').type('paciente@teste.com');
    cy.get('#password').type('senha123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Olá,').should('be.visible');
  });
});