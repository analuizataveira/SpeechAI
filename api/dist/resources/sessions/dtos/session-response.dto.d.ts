export declare class SessionResponseDto {
    id: string;
    patientId: string;
    exerciseListId: string;
    score?: number;
    correctItems?: number;
    errorLog?: string;
    startedAt: Date;
    finishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
