/// <reference types="cypress" />

describe('Fluxo de Cadastro', () => {
  const timestamp = Date.now();
  const novoUsuario = {
    nome: 'Cypress',
    sobrenome: 'Tester',
    email: `cypress.new.${timestamp}@teste.com`,
    phone: '11999999999',
    password: 'senha123'
  };

  beforeEach(() => {
    cy.visit('http://localhost:5173/register');
  });

  it('deve exibir erro se as senhas não coincidirem', () => {
    cy.get('#password').type('senha123');
    cy.get('#confirmPassword').type('senha456');
    cy.get('button[type="submit"]').click();

    cy.contains('As senhas não coincidem').should('be.visible');
  });

  it('deve realizar cadastro com sucesso', () => {
    cy.get('#firstName').type(novoUsuario.nome);
    cy.get('#lastName').type(novoUsuario.sobrenome);
    cy.get('#email').type(novoUsuario.email);
    cy.get('#phone').type(novoUsuario.phone);
    cy.contains('Selecione sua idade').click(); 
    cy.contains('Adulto').click();
    cy.contains('Selecione o tipo').click();
    cy.contains('Gagueira').click();
    cy.get('#password').type(novoUsuario.password);
    cy.get('#confirmPassword').type(novoUsuario.password);
    cy.get('button[role="checkbox"]').click(); 
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    cy.contains(`Olá, ${novoUsuario.nome} ${novoUsuario.sobrenome}!`).should('be.visible');
  });
});