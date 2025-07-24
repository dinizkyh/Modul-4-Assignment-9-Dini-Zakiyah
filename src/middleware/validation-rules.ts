// Validation rules
import Joi from 'joi';

export const emailValidation = Joi.string().email();
export const passwordValidation = Joi.string().min(8).regex(/[A-Z]/).regex(/[0-9]/);
export const listNameValidation = Joi.string().min(3).max(50);
export const taskTitleValidation = Joi.string().min(3).max(100);
export const taskDescriptionValidation = Joi.string().max(500);
export const deadlineValidation = Joi.date().iso();
