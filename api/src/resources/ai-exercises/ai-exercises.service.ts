import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../providers/database/prisma.provider';
import { OpenAI } from 'openai';
import { IAiExercisesService } from './interfaces/ai-exercises.service.interface';
import { GenerateExercisesResponseDto } from './dtos/generate-exercises.dto';
import { ExerciseListResponseDto } from '../exercise-lists/dtos/exercise-list-response.dto';

@Injectable()
export class AiExercisesService implements IAiExercisesService {
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('app.openaiApiKey');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateExercises(
    patientId: string,
    userId: string,
  ): Promise<GenerateExercisesResponseDto> {
    // Verify patient exists and get profile
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        difficulties: {
          include: {
            diffType: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify user has access (patient can only generate for themselves, doctors can for their patients)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        doctorProfile: {
          include: {
            patientDoctors: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check access: patient can only access their own, doctors can access their patients
    if (user.role === 'PATIENT') {
      if (user.patientProfile?.id !== patientId) {
        throw new UnauthorizedException(
          'Patients can only generate exercises for themselves',
        );
      }
    } else if (user.role === 'DOCTOR') {
      const hasAccess = user.doctorProfile?.patientDoctors.some(
        (pd) => pd.patientId === patientId && pd.active,
      );
      if (!hasAccess) {
        throw new UnauthorizedException(
          'Doctor does not have access to this patient',
        );
      }
    } else if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized');
    }

    // Calculate age
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const adjustedAge =
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    // Get difficulty types
    const difficulties = patient.difficulties.map(
      (d) => d.diffType.description,
    );
    const difficultyText =
      difficulties.length > 0
        ? difficulties.join(', ')
        : 'dificuldades gerais de pronúncia';

    // Build prompt for OpenAI
    const prompt = `Você é um fonoaudiólogo especializado em terapia da fala. Gere uma lista de 10-15 palavras ou frases curtas (máximo 3 palavras) para exercícios de pronúncia considerando:

- Idade do paciente: ${adjustedAge} anos
- Dificuldades de fala: ${difficultyText}
- Nível de dificuldade apropriado para a idade do paciente
- Palavras devem ser relevantes, motivadoras e adequadas ao contexto brasileiro
- Foque nas dificuldades específicas mencionadas
- Para crianças menores, use palavras mais simples e familiares
- Para adolescentes/adultos, pode usar palavras mais complexas

Retorne APENAS um JSON válido no seguinte formato, sem texto adicional:
{"exercises": ["palavra1", "palavra2", "palavra3", ...]}

Exemplo de resposta esperada:
{"exercises": ["rato", "carro", "porta", "casa", "árvore"]}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Você é um fonoaudiólogo especializado. Retorne apenas JSON válido, sem texto adicional.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Failed to generate exercises');
      }

      // Parse JSON response
      let parsedContent;
      try {
        // Remove markdown code blocks if present
        const cleanedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        parsedContent = JSON.parse(cleanedContent);
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new BadRequestException(
          'Invalid response format from AI service',
        );
      }

      if (!parsedContent.exercises || !Array.isArray(parsedContent.exercises)) {
        throw new BadRequestException('Invalid exercises format');
      }

      // Get primary difficulty type ID if available
      const primaryDiffTypeId =
        patient.difficulties.length > 0
          ? patient.difficulties[0].diffTypeId
          : undefined;

      return {
        exercises: parsedContent.exercises,
        diffTypeId: primaryDiffTypeId,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to generate exercises: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async generateExercisesAndCreateList(
    patientId: string,
    userId: string,
  ): Promise<ExerciseListResponseDto> {
    // Generate exercises
    const { exercises, diffTypeId } = await this.generateExercises(
      patientId,
      userId,
    );

    // Get patient to determine doctor
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        doctors: {
          where: { active: true },
          include: {
            doctor: true,
          },
          take: 1,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Patient must have an active doctor to create exercise lists
    if (!patient.doctors || patient.doctors.length === 0) {
      throw new BadRequestException(
        'Patient must be assigned to a doctor to create exercise lists',
      );
    }

    const doctorId = patient.doctors[0].doctorId;

    // Get or use default diff type
    let finalDiffTypeId = diffTypeId;
    if (!finalDiffTypeId) {
      // Get first available diff type
      const defaultDiffType = await this.prisma.diffType.findFirst();
      if (!defaultDiffType) {
        throw new BadRequestException('No difficulty types available');
      }
      finalDiffTypeId = defaultDiffType.id;
    }

    // Create exercises in database
    const createdExercises = await Promise.all(
      exercises.map((text) =>
        this.prisma.exercise.create({
          data: {
            text,
            diffTypeId: finalDiffTypeId,
          },
        }),
      ),
    );

    // Create exercise list
    const exerciseList = await this.prisma.exerciseList.create({
      data: {
        doctorId,
        diffTypeId: finalDiffTypeId,
        title: `Exercícios Personalizados por IA - ${new Date().toLocaleDateString('pt-BR')}`,
        difficultyLevel: 'personalizado',
        items: {
          create: createdExercises.map((exercise, index) => ({
            exerciseId: exercise.id,
            order: index,
          })),
        },
      },
      include: {
        items: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        diffType: true,
      },
    });

    return exerciseList;
  }
}
