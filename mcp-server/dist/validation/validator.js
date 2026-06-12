import { ValidationError } from '../errors/handler.js';
export function validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const messages = result.error.issues
            .map((issue) => `${issue.path.length ? issue.path.join('.') + ': ' : ''}${issue.message}`)
            .join('; ');
        throw new ValidationError(messages);
    }
    return result.data;
}
//# sourceMappingURL=validator.js.map