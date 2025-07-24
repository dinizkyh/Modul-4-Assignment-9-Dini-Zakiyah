import Joi from 'joi';

/**
 * Validation schemas for API requests using Joi
 */

/**
 * User registration validation schema
 */
export const registerUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required',
    }),
});

/**
 * User login validation schema
 */
export const loginUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

/**
 * Create list validation schema
 */
export const createListSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'List name cannot be empty',
      'string.min': 'List name cannot be empty',
      'string.max': 'List name cannot exceed 100 characters',
      'any.required': 'List name is required',
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
});

/**
 * Update list validation schema
 */
export const updateListSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'List name cannot be empty',
      'string.min': 'List name cannot be empty',
      'string.max': 'List name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Create task validation schema
 */
export const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Task title cannot be empty',
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title cannot exceed 255 characters',
      'any.required': 'Task title is required',
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  deadline: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Deadline must be a valid ISO date string',
    }),
});

/**
 * Update task validation schema
 */
export const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.empty': 'Task title cannot be empty',
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title cannot exceed 255 characters',
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  deadline: Joi.string()
    .isoDate()
    .allow(null)
    .optional()
    .messages({
      'string.isoDate': 'Deadline must be a valid ISO date string',
    }),
  isCompleted: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isCompleted must be a boolean value',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Task query parameters validation schema
 */
export const taskQuerySchema = Joi.object({
  sort: Joi.string()
    .valid('deadline', '-deadline')
    .optional()
    .messages({
      'any.only': 'Sort parameter must be either "deadline" or "-deadline"',
    }),
  completed: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Completed parameter must be a boolean value',
    }),
  listId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.uuid': 'List ID must be a valid UUID',
    }),
});

/**
 * UUID parameter validation schema
 */
export const uuidParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'ID must be a valid UUID',
      'any.required': 'ID is required',
    }),
});

/**
 * List ID parameter validation schema
 */
export const listIdParamSchema = Joi.object({
  listId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'List ID must be a valid UUID',
      'any.required': 'List ID is required',
    }),
});

/**
 * Validation middleware factory
 */
export function createValidationMiddleware(schema: Joi.ObjectSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: any, res: any, next: any) => {
    const dataToValidate = source === 'body' ? req.body : 
                          source === 'params' ? req.params : 
                          req.query;

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    }

    // Replace the original data with validated and sanitized data
    if (source === 'body') {
      req.body = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.query = value;
    }

    next();
  };
}
