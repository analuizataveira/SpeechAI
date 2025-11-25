"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./resources/auth/auth.module");
const users_module_1 = require("./resources/users/users.module");
const doctor_patients_module_1 = require("./resources/doctor-patients/doctor-patients.module");
const diff_types_module_1 = require("./resources/diff-types/diff-types.module");
const difficulties_module_1 = require("./resources/difficulties/difficulties.module");
const exercises_module_1 = require("./resources/exercises/exercises.module");
const exercise_lists_module_1 = require("./resources/exercise-lists/exercise-lists.module");
const sessions_module_1 = require("./resources/sessions/sessions.module");
const transcription_module_1 = require("./resources/transcription/transcription.module");
const configuration_1 = __importDefault(require("./config/configuration"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            doctor_patients_module_1.DoctorPatientsModule,
            diff_types_module_1.DiffTypesModule,
            difficulties_module_1.DifficultiesModule,
            exercises_module_1.ExercisesModule,
            exercise_lists_module_1.ExerciseListsModule,
            sessions_module_1.SessionsModule,
            transcription_module_1.TranscriptionModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map