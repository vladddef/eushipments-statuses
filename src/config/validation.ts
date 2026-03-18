import * as Joi from 'joi';

export const validationSchema = Joi.object({
  EUSHIPMENTS_API_URL: Joi.string().uri().required(),
  EUSHIPMENTS_API_VERSION: Joi.string().required(),
  EUSHIPMENTS_API_KEY: Joi.string().required(),
  EUSHIPMENTS_CABINET_URL: Joi.string().uri().required(),
  EUSHIPMENTS_CABINET_USERNAME: Joi.string().required(),
  EUSHIPMENTS_CABINET_PASSWORD: Joi.string().required(),
  EUSHIPMENTS_TG_BOT_TOKEN: Joi.string().required(),
});