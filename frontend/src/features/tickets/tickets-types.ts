export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  data: {
    items: Ticket[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export interface TicketResponse { data: Ticket }
export interface TicketStatsResponse { data: { open: number; in_progress: number; closed: number; total: number } }
export interface TicketInput {
  title: string;
  description?: string;
  category: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}
