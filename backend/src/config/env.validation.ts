import * as Joi from 'joi';

const isTest = process.env.NODE_ENV === 'test';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5200),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  OPENAI_API_KEY: isTest
    ? Joi.string().default('test-openai-key')
    : Joi.string().required(),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
  REDIS_HOST: Joi.string().optional().allow(''),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_TLS: Joi.string().valid('true', 'false').default('false'),
  AWS_REGION: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  ADMIN_SECRET: Joi.string().optional().allow(''),
  SENTRY_DSN: Joi.string().uri().optional().allow(''),
});
