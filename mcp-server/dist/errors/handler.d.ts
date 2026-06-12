export declare enum ErrorCode {
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
    DATABASE_ERROR = "DATABASE_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    DISABLED_TOOL = "DISABLED_TOOL"
}
export interface MCPErrorResult {
    [x: string]: unknown;
    content: [{
        type: 'text';
        text: string;
    }];
    isError: true;
}
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare class NotFoundError extends Error {
    constructor(resource: string, id: string);
}
export declare class ConflictError extends Error {
    constructor(message: string);
}
export declare class BusinessRuleError extends Error {
    constructor(message: string);
}
export declare function formatError(error: unknown): MCPErrorResult;
//# sourceMappingURL=handler.d.ts.map