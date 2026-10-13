import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Ticket, TicketInput, TicketPriority, TicketStatus } from "../../features/tickets/tickets-types";

interface Props {
  ticket?: Ticket | null;
  onClose: () => void;
  onSubmit: (input: TicketInput) => Promise<unknown>;
  busy: boolean;
}

export function TicketForm({ ticket, onClose, onSubmit, busy }: Props) {
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [category, setCategory] = useState(ticket?.category ?? "coding");
  const [priority, setPriority] = useState<TicketPriority>(ticket?.priority ?? "medium");
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? "open");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) { setError("A title is required."); return; }
    setError("");
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined, category: category.trim() || "coding", priority, status });
    } catch {
      setError("Couldn't save this ticket. Check the API connection and try again.");
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="ticket-form-title">
      <div className="modal-header"><div><p className="eyebrow">TICKET DETAILS</p><h2 id="ticket-form-title">{ticket ? "Edit ticket" : "Create a ticket"}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close form"><X size={18} /></button></div>
      <form onSubmit={handleSubmit} className="form-stack">
        <label>Title <span className="required">*</span><input autoFocus maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fix login validation" /></label>
        <label>Description<textarea rows={4} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add context, steps to reproduce, or expected behaviour…" /></label>
        <div className="form-grid">
          <label>Category<input maxLength={60} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="coding" /></label>
          <label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          {ticket && <label className="full-span">Status<select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}><option value="open">Open</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select></label>}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Saving…" : ticket ? "Save changes" : "Create ticket"}</button></div>
      </form>
    </section>
  </div>;
}
