export declare class SessionWithDetailsDto {
    id: string;
    patientId: string;
    exerciseListId: string;
    score?: number;
    correctItems?: number;
    errorLog?: string;
    startedAt: Date;
    finishedAt?: Date;
    exerciseList?: any;
    patient?: any;
}
