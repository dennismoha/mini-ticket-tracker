import { z } from "zod";

export const ticketStatusSchema = z.enum(["open", "in_progress", "closed"]);
export const ticketPrioritySchema = z.enum(["low", "medium", "high"]);

export const createTicketSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  description: z.string().trim().max(5000).optional().nullable(),
  category: z.string().trim().min(1).max(60).default("coding"),
  status: ticketStatusSchema.default("open"),
  priority: ticketPrioritySchema.default("medium"),
});

export const updateTicketSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  category: z.string().trim().min(1).max(60).optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "Provide at least one field to update.",
});

export const listTicketsQuerySchema = z.object({
  status: ticketStatusSchema.optional(),
  category: z.string().trim().min(1).max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
