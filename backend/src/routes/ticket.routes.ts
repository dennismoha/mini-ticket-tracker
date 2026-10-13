import { Router } from "express";
import * as ticketController from "../controllers/ticket.controller.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TicketStatus:
 *       type: string
 *       enum: [open, in_progress, closed]
 *     TicketPriority:
 *       type: string
 *       enum: [low, medium, high]
 *     Ticket:
 *       type: object
 *       required: [id, title, category, status, priority, createdAt, updatedAt]
 *       properties:
 *         id: { type: string, format: uuid }
 *         title: { type: string, maxLength: 160 }
 *         description: { type: string, nullable: true }
 *         category: { type: string, example: coding }
 *         status: { $ref: '#/components/schemas/TicketStatus' }
 *         priority: { $ref: '#/components/schemas/TicketPriority' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     TicketInput:
 *       type: object
 *       required: [title]
 *       properties:
 *         title: { type: string, minLength: 1, maxLength: 160 }
 *         description: { type: string, nullable: true }
 *         category: { type: string, default: coding }
 *         status: { $ref: '#/components/schemas/TicketStatus' }
 *         priority: { $ref: '#/components/schemas/TicketPriority' }
 *     TicketUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         title: { type: string, minLength: 1, maxLength: 160 }
 *         description: { type: string, nullable: true }
 *         category: { type: string }
 *         status: { $ref: '#/components/schemas/TicketStatus' }
 *         priority: { $ref: '#/components/schemas/TicketPriority' }
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             code: { type: string }
 *             message: { type: string }
 *             details: { type: object, nullable: true }
 */

/** @openapi
 * /tickets:
 *   post:
 *     summary: Create a ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TicketInput' }
 *     responses:
 *       201: { description: Ticket created }
 *       400: { description: Invalid input, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post("/", ticketController.create);

/** @openapi
 * /tickets:
 *   get:
 *     summary: List tickets with optional filters and pagination
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/TicketStatus' }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200: { description: Paginated ticket list }
 *       400: { description: Invalid query }
 */
router.get("/", ticketController.list);

/** @openapi
 * /tickets/stats:
 *   get:
 *     summary: Get counts grouped by status
 *     tags: [Tickets]
 *     responses:
 *       200: { description: Ticket counts by status }
 */
router.get("/stats", ticketController.stats);

/** @openapi
 * /tickets/{id}:
 *   get:
 *     summary: Get one ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Ticket details }
 *       404: { description: Ticket not found }
 */
router.get("/:id", ticketController.getById);

/** @openapi
 * /tickets/{id}:
 *   patch:
 *     summary: Update ticket content, status, priority, or category
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TicketUpdate' }
 *     responses:
 *       200: { description: Ticket updated }
 *       400: { description: Invalid update }
 *       404: { description: Ticket not found }
 */
router.patch("/:id", ticketController.update);

/** @openapi
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Ticket deleted }
 *       404: { description: Ticket not found }
 */
router.delete("/:id", ticketController.remove);

export default router;
