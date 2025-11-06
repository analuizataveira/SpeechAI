"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultiesModule = void 0;
const common_1 = require("@nestjs/common");
const difficulties_service_1 = require("./difficulties.service");
const difficulties_controller_1 = require("./difficulties.controller");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let DifficultiesModule = class DifficultiesModule {
};
exports.DifficultiesModule = DifficultiesModule;
exports.DifficultiesModule = DifficultiesModule = __decorate([
    (0, common_1.Module)({
        controllers: [difficulties_controller_1.DifficultiesController],
        providers: [difficulties_service_1.DifficultiesService, prisma_provider_1.PrismaService],
        exports: [difficulties_service_1.DifficultiesService],
    })
], DifficultiesModule);
//# sourceMappingURL=difficulties.module.js.map