export declare enum AccessLevel {
    PUBLIC_READ = "PUBLIC_READ",
    AUTH_READ = "AUTH_READ",
    ADMIN_WRITE = "ADMIN_WRITE"
}
export interface ToolAuthConfig {
    name: string;
    accessLevel: AccessLevel;
}
export declare class AuthError extends Error {
    constructor(message: string);
}
export declare function requireAccess(toolName: string, accessLevel: AccessLevel, apiKey?: string): void;
export declare const AUTH_TOOLS: Record<string, AccessLevel>;
//# sourceMappingURL=guard.d.ts.map