import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { createTicketSchema, listTicketsQuerySchema, updateTicketSchema } from "../schemas/ticket.schema.js";
import * as ticketService from "../services/ticket.service.js";

function parseId(id: string): string {
  // Prisma's UUID validation is allowed to handle malformed UUIDs consistently below.
  if (!id.trim()) throw new AppError(400, "INVALID_ID", "Ticket ID is required.");
  return id;
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Invalid ticket data.", parsed.error.flatten());
    const ticket = await ticketService.createTicket(parsed.data);
    res.status(201).json({ data: ticket });
  } catch (error) { next(error); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listTicketsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Invalid query parameters.", parsed.error.flatten());
    res.json({ data: await ticketService.listTickets(parsed.data) });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try { res.json({ data: await ticketService.getTicket(parseId(req.params.id)) }); }
  catch (error) { next(error); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateTicketSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "Invalid ticket update.", parsed.error.flatten());
    res.json({ data: await ticketService.updateTicket(parseId(req.params.id), parsed.data) });
  } catch (error) { next(error); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await ticketService.deleteTicket(parseId(req.params.id));
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function stats(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ data: await ticketService.getTicketStats() }); }
  catch (error) { next(error); }
}
