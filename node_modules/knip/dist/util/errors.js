import { core } from 'zod/mini';
const isZodErrorLike = (error) => error instanceof core.$ZodError;
export class ConfigurationError extends Error {
}
export class LoaderError extends Error {
}
export const isKnownError = (error) => error instanceof ConfigurationError || error instanceof LoaderError || isZodErrorLike(error);
export const hasErrorCause = (error) => !isZodErrorLike(error) && error.cause instanceof Error;
export const isConfigurationError = (error) => error instanceof ConfigurationError;
export const getKnownErrors = (error) => {
    if (isZodErrorLike(error))
        return [...error.issues].map(error => new Error(error.message));
    return [error];
};
