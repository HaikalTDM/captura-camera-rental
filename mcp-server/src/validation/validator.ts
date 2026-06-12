import { z, ZodType } from 'zod';
import { ValidationError } from '../errors/handler.js';

export function validate<T extends ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `${issue.path.length ? issue.path.join('.') + ': ' : ''}${issue.message}`)
      .join('; ');
    throw new ValidationError(messages);
  }
  return result.data;
}
