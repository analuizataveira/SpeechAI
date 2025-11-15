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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TranscriptionResponseDto {
}
exports.TranscriptionResponseDto = TranscriptionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Score from 0 to 100',
        example: 85,
    }),
    __metadata("design:type", Number)
], TranscriptionResponseDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transcribed text from audio',
        example: 'hello',
        required: false,
    }),
    __metadata("design:type", String)
], TranscriptionResponseDto.prototype, "transcribedText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Feedback message',
        example: 'Good pronunciation!',
        required: false,
    }),
    __metadata("design:type", String)
], TranscriptionResponseDto.prototype, "feedback", void 0);
//# sourceMappingURL=transcription-response.dto.js.map