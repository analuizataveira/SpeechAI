import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/providers/database/prisma.provider';

describe('AppController (E2E) - Fluxo de Autenticação', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Dados dinâmicos para não dar conflito de "Email já existe"
  const uniqueId = Date.now();
  const mockUser = {
    email: `e2e_test_${uniqueId}@speech.ai`,
    password: 'Password123!',
    name: 'E2E Tester',
    phone: '11999999999',
    birthDate: '1990-01-01',
    role: 'PATIENT',
  };

  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Importante: Aplicar os mesmos Pipes (validação) do main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Pegamos o Prisma para limpar a sujeira depois (opcional)
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    // Opcional: Limpar o usuário criado
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  it('/ (GET) - Health Check', () => {
    return request(app.getHttpServer())
      .get('/') // Se você tiver uma rota raiz, senão remova este teste
      .expect(404); // NestJS padrão retorna 404 na raiz se não houver controller lá
  });

  describe('Fluxo de Usuário', () => {
    // 1. REGISTRO
    it('/users (POST) - Deve criar um novo usuário', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(mockUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.role).toBe('PATIENT');
      
      userId = response.body.id; // Guarda o ID para limpar depois
    });

    // 2. LOGIN (Falha)
    it('/auth/login (POST) - Deve rejeitar senha errada', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email, password: 'wrongpassword' })
        .expect(401);
    });

    // 3. LOGIN (Sucesso)
    it('/auth/login (POST) - Deve logar e retornar Token JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email, password: mockUser.password })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(mockUser.email);

      jwtToken = response.body.access_token; // Guarda o token
    });

    // 4. ROTA PROTEGIDA
    it('/auth/me (GET) - Deve acessar dados do perfil com Token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${jwtToken}`) // Envia o token no header
        .expect(200);

      expect(response.body.email).toBe(mockUser.email);
      // Verifica se o perfil de paciente veio junto (Include funcionou)
      expect(response.body).toHaveProperty('patientProfile');
      expect(response.body.patientProfile.name).toBe(mockUser.name);
    });

    // 5. ROTA PROTEGIDA (Sem Token)
    it('/auth/me (GET) - Deve bloquear acesso sem token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});
