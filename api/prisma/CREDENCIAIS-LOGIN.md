# 🔐 Credenciais para Login

## Usuários Criados

### 👨‍⚕️ Médico
- **Email:** `medico@teste.com`
- **Senha:** `senha123`
- **Role:** DOCTOR
- **Nome:** Dr. Teste

### 👤 Paciente
- **Email:** `paciente@teste.com`
- **Senha:** `senha123`
- **Role:** PATIENT
- **Nome:** Paciente Teste

## 🚀 Como Fazer Login

### Opção 1: Via Frontend (Recomendado)

1. Acesse a aplicação web (geralmente `http://localhost:5173` ou a porta configurada)
2. Vá para a página de login (`/login`)
3. Use uma das credenciais acima
4. Clique em "Entrar"

### Opção 2: Via API (Postman, Insomnia, etc)

**Endpoint:** `POST http://localhost:3000/auth/login`

**Body (JSON):**
```json
{
  "email": "paciente@teste.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "paciente@teste.com",
    "role": "PATIENT"
  }
}
```

## 📝 Criar Novos Usuários

### Via API

**Endpoint:** `POST http://localhost:3000/users`

**Body para Paciente:**
```json
{
  "email": "novo@paciente.com",
  "password": "senha123",
  "role": "PATIENT",
  "name": "Nome do Paciente",
  "birthDate": "2000-01-01",
  "phone": "11999999999"
}
```

**Body para Médico:**
```json
{
  "email": "novo@medico.com",
  "password": "senha123",
  "role": "DOCTOR",
  "name": "Dr. Novo",
  "birthDate": "1990-01-01",
  "phone": "11999999999",
  "specialty": "Fonoaudiologia"
}
```

### Via SQL

Execute o script `create-users.sql` e modifique os dados conforme necessário.

## ⚠️ Importante

- As senhas são hasheadas com bcrypt (10 rounds)
- O hash da senha `senha123` é: `$2b$10$RYPXlB17yPrVxp35aB1VruY9k5bBxpROpnLaZVsC25J7qPGJZIe9i`
- Para gerar um novo hash, use:
  ```bash
  node -e "const bcrypt = require('bcrypt'); bcrypt.hash('sua_senha', 10).then(hash => console.log(hash));"
  ```

## 🔄 Atualizar Senha de um Usuário

```sql
UPDATE users 
SET password_hash = '$2b$10$SEU_HASH_AQUI'
WHERE email = 'email@exemplo.com';
```

