import { Prisma, TicketPriority, TicketStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import type { CreateTicketInput, ListTicketsQuery, UpdateTicketInput } from "../schemas/ticket.schema.js";

export async function createTicket(input: CreateTicketInput) {
  return prisma.ticket.create({ data: input });
}

export async function listTickets(query: ListTicketsQuery) {
  const where: Prisma.TicketWhereInput = {
    ...(query.status ? { status: query.status as TicketStatus } : {}),
    ...(query.category ? { category: { equals: query.category, mode: "insensitive" } } : {}),
  };
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await prisma.$transaction([
    prisma.ticket.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "asc" }], skip, take: query.limit }),
    prisma.ticket.count({ where }),
  ]);
  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getTicket(id: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found.");
  return ticket;
}

export async function updateTicket(id: string, input: UpdateTicketInput) {
  try {
    return await prisma.ticket.update({ where: { id }, data: {
      ...input,
      ...(input.priority ? { priority: input.priority as TicketPriority } : {}),
    } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found.");
    }
    throw error;
  }
}

export async function deleteTicket(id: string) {
  try {
    await prisma.ticket.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found.");
    }
    throw error;
  }
}

export async function getTicketStats() {
  const groups = await prisma.ticket.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: Record<TicketStatus, number> = { open: 0, in_progress: 0, closed: 0 };
  for (const group of groups) counts[group.status] = group._count._all;
  return { ...counts, total: counts.open + counts.in_progress + counts.closed };
}
