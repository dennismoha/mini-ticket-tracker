import { Circle, CircleDashed, CheckCircle2, Plus } from "lucide-react";
import type { Ticket, TicketStatus } from "../../features/tickets/tickets-types";
import { TicketCard } from "./TicketCard";

const columns: { status: TicketStatus; title: string; icon: typeof Circle; className: string }[] = [
  { status: "open", title: "Open", icon: Circle, className: "open-column" },
  { status: "in_progress", title: "In progress", icon: CircleDashed, className: "progress-column" },
  { status: "closed", title: "Closed", icon: CheckCircle2, className: "closed-column" },
];

interface Props { status: TicketStatus; tickets: Ticket[]; onCreate: () => void; onEdit: (ticket: Ticket) => void; onDelete: (ticket: Ticket) => void; onMove: (ticket: Ticket, status: TicketStatus) => void }

export function KanbanColumn({ status, tickets, onCreate, onEdit, onDelete, onMove }: Props) {
  const column = columns.find((item) => item.status === status)!;
  const Icon = column.icon;
  return <section className={`kanban-column ${column.className}`} aria-label={`${column.title} tickets`}>
    <header className="column-header"><div className="column-title"><Icon size={17} /><h2>{column.title}</h2><span className="column-count">{tickets.length}</span></div>{status === "open" && <button className="icon-button add-card" onClick={onCreate} aria-label="Create ticket"><Plus size={17} /></button>}</header>
    <div className="column-content">{tickets.length ? tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />) : <div className="empty-column"><div className="empty-column-icon"><Icon size={19} /></div><p>No {column.title.toLowerCase()} tickets</p><span>Tickets will appear here</span></div>}</div>
  </section>;
}
