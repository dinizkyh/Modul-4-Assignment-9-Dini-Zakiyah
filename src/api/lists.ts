import { Router, Response } from 'express';
import { ListService } from '../services';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { createRateLimit } from '../middleware/rateLimit';
import {
  createValidationMiddleware,
  createListSchema,
  updateListSchema,
  uuidParamSchema
} from '../middleware/validation';
import { ApiResponse } from '../types';


const router = Router();
const listService = new ListService();

/**
 * @swagger
 * components:
 *   schemas:
 *     List:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the list
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Name of the list
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Optional description of the list
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who owns the list
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the list was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the list was last updated
 *     
 *     ListWithTasks:
 *       allOf:
 *         - $ref: '#/components/schemas/List'
 *         - type: object
 *           properties:
 *             tasks:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *     
 *     CreateListRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of the list
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Optional description of the list
 *     
 *     UpdateListRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of the list
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Optional description of the list
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Apply authentication to all list routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/lists:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get all lists
 *     description: Retrieve all lists belonging to the authenticated user with their tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     lists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ListWithTasks'
 *                 message:
 *                   type: string
 *                   example: "Lists retrieved successfully"
 *       401:
 *         description: Unauthorized - Bearer token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lists = await listService.getUserLists(req.user!.userId);
    
    const response: ApiResponse = {
      success: true,
      data: { lists },
      message: 'Lists retrieved successfully',
    };

    res.status(200).json(response);
  })
);

/**
 * @swagger
 * /api/lists:
 *   post:
 *     tags:
 *       - Lists
 *     summary: Create a new list
 *     description: Create a new task list for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListRequest'
 *           example:
 *             name: "Work Tasks"
 *             description: "Tasks related to work projects"
 *     responses:
 *       201:
 *         description: List created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/List'
 *                 message:
 *                   type: string
 *                   example: "List created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: List name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  createRateLimit,
  createValidationMiddleware(createListSchema, 'body'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const list = await listService.createList(req.user!.userId, req.body);
    
    const response: ApiResponse = {
      success: true,
      data: { list },
      message: 'List created successfully',
    };

    res.status(201).json(response);
  })
);

/**
 * @swagger
 * /api/lists/{id}:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get a specific list
 *     description: Retrieve a specific list with its tasks by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: List ID
 *     responses:
 *       200:
 *         description: List retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/ListWithTasks'
 *                 message:
 *                   type: string
 *                   example: "List retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:id',
  createValidationMiddleware(uuidParamSchema, 'params'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const list = await listService.getListById(req.params.id, req.user!.userId);
    
    const response: ApiResponse = {
      success: true,
      data: { list },
      message: 'List retrieved successfully',
    };

    res.status(200).json(response);
  })
);

/**
 * @swagger
 * /api/lists/{id}:
 *   put:
 *     tags:
 *       - Lists
 *     summary: Update a list
 *     description: Update a list's name and/or description
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: List ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListRequest'
 *           example:
 *             name: "Updated Work Tasks"
 *             description: "Updated description for work tasks"
 *     responses:
 *       200:
 *         description: List updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/List'
 *                 message:
 *                   type: string
 *                   example: "List updated successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: List name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id',
  createValidationMiddleware(uuidParamSchema, 'params'),
  createValidationMiddleware(updateListSchema, 'body'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const list = await listService.updateList(req.params.id, req.user!.userId, req.body);
    
    const response: ApiResponse = {
      success: true,
      data: { list },
      message: 'List updated successfully',
    };

    res.status(200).json(response);
  })
);

/**
 * @swagger
 * /api/lists/{id}:
 *   delete:
 *     tags:
 *       - Lists
 *     summary: Delete a list
 *     description: Delete a list and all its tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: List ID
 *     responses:
 *       200:
 *         description: List deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "List deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: List not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:id',
  createValidationMiddleware(uuidParamSchema, 'params'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await listService.deleteList(req.params.id, req.user!.userId);
    
    const response: ApiResponse = {
      success: true,
      message: 'List deleted successfully',
    };

    res.status(200).json(response);
  })
);

export default router;
