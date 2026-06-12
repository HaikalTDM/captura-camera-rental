export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AUTHENTICATION_FAILED"] = "AUTHENTICATION_FAILED";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["BUSINESS_RULE_VIOLATION"] = "BUSINESS_RULE_VIOLATION";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["DISABLED_TOOL"] = "DISABLED_TOOL";
})(ErrorCode || (ErrorCode = {}));
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends Error {
    constructor(resource, id) {
        super(`${resource} not found: ${id}`);
        this.name = 'NotFoundError';
    }
}
export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}
export class BusinessRuleError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BusinessRuleError';
    }
}
export function formatError(error) {
    if (error instanceof ValidationError) {
        return {
            content: [{ type: 'text', text: `[${ErrorCode.VALIDATION_ERROR}] ${error.message}` }],
            isError: true,
        };
    }
    if (error instanceof NotFoundError) {
        return {
            content: [{ type: 'text', text: `[${ErrorCode.NOT_FOUND}] ${error.message}` }],
            isError: true,
        };
    }
    if (error instanceof ConflictError) {
        return {
            content: [{ type: 'text', text: `[${ErrorCode.CONFLICT}] ${error.message}` }],
            isError: true,
        };
    }
    if (error instanceof BusinessRuleError) {
        return {
            content: [{ type: 'text', text: `[${ErrorCode.BUSINESS_RULE_VIOLATION}] ${error.message}` }],
            isError: true,
        };
    }
    if (error instanceof Error && error.name === 'AuthError') {
        return {
            content: [{ type: 'text', text: `[${ErrorCode.AUTHENTICATION_FAILED}] ${error.message}` }],
            isError: true,
        };
    }
    // Database errors — log full details but return safe message
    if (error && typeof error === 'object' && 'code' in error) {
        console.error('[DATABASE_ERROR]', error);
        return {
            content: [{ type: 'text', text: `[${ErrorCode.DATABASE_ERROR}] An internal database error occurred. Please try again later.` }],
            isError: true,
        };
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[INTERNAL_ERROR]', error);
    return {
        content: [{ type: 'text', text: `[${ErrorCode.INTERNAL_ERROR}] ${message}` }],
        isError: true,
    };
}
//# sourceMappingURL=handler.js.map