declare const _default: (() => {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
}>;
export default _default;
