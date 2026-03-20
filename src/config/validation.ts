import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNC: Joi.boolean().default(false),
  EUSHIPMENTS_API_URL: Joi.string().uri().required(),
  EUSHIPMENTS_API_VERSION: Joi.string().required(),
  EUSHIPMENTS_API_KEY: Joi.string().required(),
  EUSHIPMENTS_CABINET_URL: Joi.string().uri().required(),
  EUSHIPMENTS_CABINET_USERNAME: Joi.string().required(),
  EUSHIPMENTS_CABINET_PASSWORD: Joi.string().required(),
  EUSHIPMENTS_SYNC_START_DATE: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required(),
  EUSHIPMENTS_TG_BOT_TOKEN: Joi.string().required(),
  TG_ADMIN_USER_ID: Joi.number().required(),
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().required(),
  ADMIN_COOKIE_SECRET: Joi.string().min(32).required(),
});