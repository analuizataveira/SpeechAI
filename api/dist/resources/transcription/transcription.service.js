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
            let parsedData = null;
            let textContent = null;
            if (responseData?.output && Array.isArray(responseData.output) && responseData.output.length > 0) {
                const outputItem = responseData.output[0];
                if (outputItem?.content && Array.isArray(outputItem.content) && outputItem.content.length > 0) {
                    const contentItem = outputItem.content.find(item => item.type === 'output_text');
                    if (contentItem?.text) {
                        textContent = contentItem.text;
                        console.log('📝 Found text content from output format:', textContent);
                    }
                }
            }
            else if (responseData?.content && Array.isArray(responseData.content) && responseData.content.length > 0) {
                const contentItem = responseData.content[0];
                if (contentItem?.text) {
                    textContent = contentItem.text;
                    console.log('📝 Found text content from old format:', textContent);
                }
            }
            if (textContent) {
                console.log('🔍 Attempting to parse text content:', textContent);
                const cleanedText = textContent.trim();
                try {
                    parsedData = JSON.parse(cleanedText);
                    console.log('✅ Successfully parsed entire text as JSON:', parsedData);
                }
                catch (error) {
                    console.log('⚠️ Failed to parse entire text as JSON, attempting to extract JSON...');
                    const jsonRegex = /\{[^{}]*"pontuacao"[^{}]*\}/gs;
                    let match = jsonRegex.exec(cleanedText);
                    if (!match) {
                        const jsonStartIndex = cleanedText.indexOf('{');
                        if (jsonStartIndex !== -1) {
                            let currentIndex = jsonStartIndex;
                            while (currentIndex < cleanedText.length) {
                                let braceCount = 0;
                                let jsonEndIndex = -1;
                                let startIndex = currentIndex;
                                for (let i = currentIndex; i < cleanedText.length; i++) {
                                    if (cleanedText[i] === '{') {
                                        braceCount++;
                                        if (braceCount === 1)
                                            startIndex = i;
                                    }
                                    if (cleanedText[i] === '}') {
                                        braceCount--;
                                        if (braceCount === 0) {
                                            jsonEndIndex = i;
                                            break;
                                        }
                                    }
                                }
                                if (jsonEndIndex !== -1) {
                                    const possibleJson = cleanedText.substring(startIndex, jsonEndIndex + 1);
                                    console.log('🔧 Testing potential JSON:', possibleJson);
                                    try {
                                        const testParsed = JSON.parse(possibleJson);
                                        if (testParsed && (testParsed.pontuacao !== undefined || testParsed.analise !== undefined)) {
                                            parsedData = testParsed;
                                            console.log('✅ Successfully parsed extracted JSON:', parsedData);
                                            break;
                                        }
                                    }
                                    catch (parseError) {
                                        console.log('⚠️ Failed to parse this JSON candidate:', possibleJson);
                                        console.log('⚠️ Parse error:', parseError instanceof Error ? parseError.message : String(parseError));
                                        let fixedJson = possibleJson;
                                        if (possibleJson.includes('"analise":') && !possibleJson.match(/"analise"\s*:\s*"[^"]*"[,}]/)) {
                                            const analiseMatch = possibleJson.match(/"analise"\s*:\s*"([^"]*)/);
                                            if (analiseMatch) {
                                                const afterAnalise = possibleJson.substring(possibleJson.indexOf(analiseMatch[0]) + analiseMatch[0].length);
                                                const nextQuoteIndex = afterAnalise.indexOf('"');
                                                if (nextQuoteIndex === -1) {
                                                    fixedJson = possibleJson.replace(/([^"]}?)$/, '"$1');
                                                    console.log('🔧 Attempted to fix incomplete JSON:', fixedJson);
                                                    try {
                                                        const fixedParsed = JSON.parse(fixedJson);
                                                        if (fixedParsed && (fixedParsed.pontuacao !== undefined || fixedParsed.analise !== undefined)) {
                                                            parsedData = fixedParsed;
                                                            console.log('✅ Successfully parsed fixed JSON:', parsedData);
                                                            break;
                                                        }
                                                    }
                                                    catch (fixError) {
                                                        console.log('⚠️ Failed to parse fixed JSON:', fixError instanceof Error ? fixError.message : String(fixError));
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    currentIndex = jsonEndIndex + 1;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        console.log('🔧 Found JSON with regex:', match[0]);
                        try {
                            parsedData = JSON.parse(match[0]);
                            console.log('✅ Successfully parsed regex-found JSON:', parsedData);
                        }
                        catch (parseError) {
                            console.error('❌ Error parsing regex-found JSON:', parseError);
                        }
                    }
                    if (!parsedData) {
                        console.log('🔧 Attempting manual extraction of values...');
                        const pontuacaoMatch = cleanedText.match(/"pontuacao"\s*:\s*"([^"]*%)"/i) ||
                            cleanedText.match(/"pontuacao"\s*:\s*"([^"]*\d+[^"]*)"/i) ||
                            cleanedText.match(/"pontuacao"\s*:\s*(\d+)/i);
                        const analiseMatch = cleanedText.match(/"analise"\s*:\s*"([^"]*(?:"[^"]*)*)/i);
                        if (pontuacaoMatch || analiseMatch) {
                            parsedData = {
                                pontuacao: pontuacaoMatch ? pontuacaoMatch[1] : undefined,
                                analise: analiseMatch ? analiseMatch[1] : undefined
                            };
                            console.log('✅ Successfully extracted values manually:', parsedData);
                        }
                        else {
                            console.error('❌ Could not extract valid JSON or values from response');
                            console.error('📝 Full text content:', cleanedText);
                        }
                    }
                }
            }
            else if (typeof responseData === 'object') {
                console.log('🔄 Using responseData directly as fallback');
                parsedData = responseData;
            }
            if (parsedData) {
                console.log('🎯 Processing parsed data:', JSON.stringify(parsedData, null, 2));
                let pontuacao = 0;
                if (parsedData.pontuacao !== undefined && parsedData.pontuacao !== null) {
                    if (typeof parsedData.pontuacao === 'string') {
                        const cleanScore = parsedData.pontuacao.replace('%', '').trim();
                        pontuacao = parseFloat(cleanScore) || 0;
                        console.log(`📊 Extracted score from string "${parsedData.pontuacao}": ${pontuacao}`);
                    }
                    else {
                        pontuacao = parsedData.pontuacao;
                        console.log(`📊 Extracted score from number: ${pontuacao}`);
                    }
                }
                else {
                    console.log('⚠️ No pontuacao found in parsed data');
                }
                pontuacao = Math.max(0, Math.min(100, pontuacao));
                const analise = parsedData.analise ?? '';
                console.log(`💬 Extracted feedback: "${analise}"`);
                const transcribedText = parsedData.transcribedText
                    ?? parsedData.text
                    ?? parsedData.transcricao
                    ?? '';
                console.log(`📝 Extracted transcribed text: "${transcribedText}"`);
                const result = {
                    score: Math.round(pontuacao),
                    transcribedText,
                    feedback: analise,
                };
                console.log('✅ Processed transcription result:', JSON.stringify(result, null, 2));
                return result;
            }
            else {
                console.error('❌ parsedData is null or undefined');
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