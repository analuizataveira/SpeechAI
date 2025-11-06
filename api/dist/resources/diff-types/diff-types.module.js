"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffTypesModule = void 0;
const common_1 = require("@nestjs/common");
const diff_types_service_1 = require("./diff-types.service");
const diff_types_controller_1 = require("./diff-types.controller");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let DiffTypesModule = class DiffTypesModule {
};
exports.DiffTypesModule = DiffTypesModule;
exports.DiffTypesModule = DiffTypesModule = __decorate([
    (0, common_1.Module)({
        controllers: [diff_types_controller_1.DiffTypesController],
        providers: [diff_types_service_1.DiffTypesService, prisma_provider_1.PrismaService],
        exports: [diff_types_service_1.DiffTypesService],
    })
], DiffTypesModule);
//# sourceMappingURL=diff-types.module.js.map