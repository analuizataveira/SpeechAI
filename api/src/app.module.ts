import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './resources/auth/auth.module';
import { UsersModule } from './resources/users/users.module';
import { DoctorPatientsModule } from './resources/doctor-patients/doctor-patients.module';
import { DiffTypesModule } from './resources/diff-types/diff-types.module';
import { DifficultiesModule } from './resources/difficulties/difficulties.module';
import { ExercisesModule } from './resources/exercises/exercises.module';
import { ExerciseListsModule } from './resources/exercise-lists/exercise-lists.module';
import { SessionsModule } from './resources/sessions/sessions.module';
import { TranscriptionModule } from './resources/transcription/transcription.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    UsersModule,
    DoctorPatientsModule,
    DiffTypesModule,
    DifficultiesModule,
    ExercisesModule,
    ExerciseListsModule,
    SessionsModule,
    TranscriptionModule,
  ],
})
export class AppModule {}
