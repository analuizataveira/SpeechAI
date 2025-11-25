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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
let TranscriptionService = class TranscriptionService {
    constructor(configService) {
        this.configService = configService;
        this.n8nWebhookUrl =
            this.configService.get('N8N_WEBHOOK_URL') ||
                'https://speechai.app.n8n.cloud/webhook-test/audio-to-transcribe';
    }
    async transcribeAudio(audioFile, targetWord) {
        if (!audioFile) {
            throw new common_1.BadRequestException('Audio file is required');
        }
        try {
            const formData = new form_data_1.default();
            formData.append('audio', audioFile.buffer, {
                filename: audioFile.originalname || 'audio.webm',
                contentType: audioFile.mimetype || 'audio/webm',
            });
            formData.append('targetWord', targetWord);
            const response = await axios_1.default.post(this.n8nWebhookUrl, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 30000,
            });
            const responseData = response.data;
            console.log('📥 Raw response from n8n webhook:', JSON.stringify(responseData, null, 2));
            if (typeof responseData === 'number') {
                return {
                    score: responseData,
                };
            }
            if (typeof responseData === 'object') {
                let score = 0;
                if (responseData.pontuacao !== undefined) {
                    if (typeof responseData.pontuacao === 'string') {
                        score = parseFloat(responseData.pontuacao.replace('%', '').trim()) || 0;
                    }
                    else {
                        score = responseData.pontuacao;
                    }
                }
                else if (responseData.score !== undefined) {
                    score = typeof responseData.score === 'string'
                        ? parseFloat(responseData.score.replace('%', '')) || 0
                        : responseData.score;
                }
                else if (responseData.note !== undefined) {
                    score = typeof responseData.note === 'string'
                        ? parseFloat(responseData.note.replace('%', '')) || 0
                        : responseData.note;
                }
                else if (responseData.grade !== undefined) {
                    score = typeof responseData.grade === 'string'
                        ? parseFloat(responseData.grade.replace('%', '')) || 0
                        : responseData.grade;
                }
                score = Math.max(0, Math.min(100, score));
                const feedback = responseData.analise
                    ?? responseData.feedback
                    ?? responseData.message
                    ?? responseData.analysis
                    ?? '';
                const transcribedText = responseData.transcribedText
                    ?? responseData.text
                    ?? responseData.transcricao
                    ?? '';
                const result = {
                    score: Math.round(score),
                    transcribedText,
                    feedback: feedback.trim(),
                };
                console.log('✅ Processed transcription result:', JSON.stringify(result, null, 2));
                return result;
            }
            return {
                score: 0,
                feedback: 'Unable to parse response from transcription service',
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new common_1.BadRequestException(`Transcription service error: ${error.message}`);
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new common_1.BadRequestException(`Failed to transcribe audio: ${errorMessage}`);
        }
    }
};
exports.TranscriptionService = TranscriptionService;
exports.TranscriptionService = TranscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TranscriptionService);
//# sourceMappingURL=transcription.service.js.map