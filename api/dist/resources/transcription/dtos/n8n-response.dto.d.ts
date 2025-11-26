export interface N8nContentItem {
    type: string;
    text?: string;
    annotations?: any[];
    logprobs?: any[];
}
export interface N8nOutputItem {
    id?: string;
    type?: string;
    status?: string;
    content?: N8nContentItem[];
    role?: string;
}
export interface N8nResponseDto {
    output?: N8nOutputItem[];
    content?: N8nContentItem[];
}
export interface N8nParsedDataDto {
    pontuacao?: string | number;
    analise?: string;
    transcribedText?: string;
    text?: string;
    transcricao?: string;
}
