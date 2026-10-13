import { ArrowRight, CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Ticket, TicketStatus } from "../../features/tickets/tickets-types";

const nextStatus: Record<TicketStatus, TicketStatus> = { open: "in_progress", in_progress: "closed", closed: "open" };
const nextLabel: Record<TicketStatus, string> = { open: "Start work", in_progress: "Close ticket", closed: "Reopen" };

interface Props { ticket: Ticket; onEdit: (ticket: Ticket) => void; onDelete: (ticket: Ticket) => void; onMove: (ticket: Ticket, status: TicketStatus) => void }

export function TicketCard({ ticket, onEdit, onDelete, onMove }: Props) {
  const date = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(ticket.createdAt));
  return <article className="ticket-card">
    <div className="ticket-card-top"><span className={`priority-dot priority-${ticket.priority}`} /><span className={`priority-label priority-text-${ticket.priority}`}>{ticket.priority} priority</span><div className="card-menu-wrap"><button className="icon-button small-icon" aria-label={`Edit ${ticket.title}`} onClick={() => onEdit(ticket)}><Pencil size={15} /></button><button className="icon-button small-icon danger-hover" aria-label={`Delete ${ticket.title}`} onClick={() => onDelete(ticket)}><Trash2 size={15} /></button></div></div>
    <button className="ticket-title-button" onClick={() => onEdit(ticket)}><h3>{ticket.title}</h3></button>
    {ticket.description && <p className="ticket-description">{ticket.description}</p>}
    <div className="ticket-meta"><span className="category-chip">{ticket.category}</span><span className="created-date"><CalendarDays size={13} />{date}</span></div>
    <div className="ticket-card-footer"><span className="ticket-id">#{ticket.id.slice(0, 6).toUpperCase()}</span><button className="move-button" onClick={() => onMove(ticket, nextStatus[ticket.status])}>{nextLabel[ticket.status]} <ArrowRight size={14} /></button></div>
  </article>;
}
