"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const transcription_service_1 = require("./transcription.service");
const transcribe_audio_dto_1 = require("./dtos/transcribe-audio.dto");
const jwt_auth_guard_1 = require("../../framework/guards/jwt-auth.guard");
let TranscriptionController = class TranscriptionController {
    constructor(transcriptionService) {
        this.transcriptionService = transcriptionService;
    }
    async transcribe(audioFile, transcribeDto) {
        return this.transcriptionService.transcribeAudio(audioFile, transcribeDto.targetWord);
    }
};
exports.TranscriptionController = TranscriptionController;
__decorate([
    (0, common_1.Post)('transcribe'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio')),
    (0, swagger_1.ApiOperation)({ summary: 'Transcribe audio and get pronunciation score' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'string',
                    format: 'binary',
                    description: 'Audio file (webm, wav, mp3, etc.)',
                },
                targetWord: {
                    type: 'string',
                    description: 'Target word to compare pronunciation',
                    example: 'hello',
                },
            },
            required: ['audio', 'targetWord'],
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transcribe_audio_dto_1.TranscribeAudioDto]),
    __metadata("design:returntype", Promise)
], TranscriptionController.prototype, "transcribe", null);
exports.TranscriptionController = TranscriptionController = __decorate([
    (0, swagger_1.ApiTags)('Transcription'),
    (0, common_1.Controller)('transcription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [transcription_service_1.TranscriptionService])
], TranscriptionController);
//# sourceMappingURL=transcription.controller.js.map