import { useMemo, useState } from "react";
import { Activity, ArrowDownUp, Bug, CircleHelp, Code2, FileText, LayoutGrid, Plus, RefreshCw, Search, Ticket as TicketIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { setCategoryFilter, setSearch } from "../features/tickets/tickets-slice";
import type { Ticket, TicketInput, TicketStatus } from "../features/tickets/tickets-types";
import { useCreateTicketMutation, useDeleteTicketMutation, useGetTicketStatsQuery, useGetTicketsQuery, useUpdateTicketMutation } from "../features/tickets/tickets-api";
import { KanbanColumn } from "../components/tickets/KanbanColumn";
import { TicketForm } from "../components/tickets/TicketForm";

export function TicketsPage() {
  const dispatch = useAppDispatch();
  const { categoryFilter, search } = useAppSelector((state) => state.ticketsUi);
  const { data, isLoading, isError, refetch } = useGetTicketsQuery({ category: categoryFilter, page: 1, limit: 100 });
  const { data: stats, isLoading: statsLoading } = useGetTicketStatsQuery();
  const [createTicket, createState] = useCreateTicketMutation();
  const [updateTicket, updateState] = useUpdateTicketMutation();
  const [deleteTicket] = useDeleteTicketMutation();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [apiError, setApiError] = useState("");
  const tickets = data?.items ?? [];
  const categories = useMemo(() => Array.from(new Set(tickets.map((ticket) => ticket.category))).sort(), [tickets]);
  const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.title} ${ticket.description ?? ""} ${ticket.category}`.toLowerCase().includes(search.toLowerCase())), [tickets, search]);

  async function handleSubmit(input: TicketInput) {
    setApiError("");
    if (editing) await updateTicket({ id: editing.id, changes: input }).unwrap();
    else await createTicket(input).unwrap();
    setFormOpen(false);
    setEditing(null);
  }

  function openEdit(ticket: Ticket) { setEditing(ticket); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); }

  async function moveTicket(ticket: Ticket, status: TicketStatus) {
    setApiError("");
    try { await updateTicket({ id: ticket.id, changes: { status } }).unwrap(); }
    catch { setApiError("Couldn't update ticket status. Please try again."); }
  }

  async function removeTicket(ticket: Ticket) {
    if (!window.confirm(`Delete “${ticket.title}”? This action cannot be undone.`)) return;
    setApiError("");
    try { await deleteTicket(ticket.id).unwrap(); }
    catch { setApiError("Couldn't delete this ticket. Please try again."); }
  }

  const columns: TicketStatus[] = ["open", "in_progress", "closed"];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><TicketIcon size={20} /></div><div><strong>Mini Tracker</strong><span>ISSUE MANAGEMENT</span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav"><a className="nav-item active" href="#board"><LayoutGrid size={17} /><span>Ticket board</span><span className="nav-count">{tickets.length}</span></a><a className="nav-item" href="#stats"><Activity size={17} /><span>Overview</span></a><a className="nav-item" href="/api-docs" target="_blank" rel="noreferrer"><FileText size={17} /><span>API documentation</span></a></nav>
      <div className="sidebar-bottom"><div className="sidebar-help-icon"><CircleHelp size={17} /></div><div><strong>Built for clarity</strong><p>A lightweight place to track the work that matters.</p></div></div>
      <div className="sidebar-version">MINI TICKET TRACKER <span>v1.0</span></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Ticket board</strong></div><div className="topbar-right"><span className={`api-status ${isError ? "api-status-error" : ""}`}><span className="status-pulse" /> {isError ? "API unavailable" : isLoading ? "Connecting…" : "API connected"}</span><button className="icon-button refresh-button" onClick={() => { void refetch(); }} aria-label="Refresh tickets"><RefreshCw size={16} /></button><div className="avatar">MT</div></div></header>
      <div className="page-wrap">
        <section className="page-heading"><div><div className="heading-kicker"><Code2 size={14} /> CODING WORKSPACE</div><h1>Ticket board <span className="heading-spark">✳</span></h1><p className="page-subtitle">A clear view of what needs attention, what's moving, and what's done.</p></div><button className="button button-primary create-top-button" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={17} /> New ticket</button></section>

        <section className="stats-grid" id="stats">
          <div className="stat-card"><div className="stat-top"><span>Total tickets</span><span className="stat-icon stat-icon-blue"><TicketIcon size={17} /></span></div><div className="stat-number">{statsLoading ? "—" : stats?.total ?? 0}</div><div className="stat-foot"><span className="stat-foot-dot blue-dot" /> Across all statuses</div></div>
          <div className="stat-card"><div className="stat-top"><span>Open</span><span className="stat-icon stat-icon-amber"><Bug size={17} /></span></div><div className="stat-number">{statsLoading ? "—" : stats?.open ?? 0}</div><div className="stat-foot"><span className="stat-foot-dot amber-dot" /> Waiting to be picked up</div></div>
          <div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon stat-icon-violet"><Activity size={17} /></span></div><div className="stat-number">{statsLoading ? "—" : stats?.in_progress ?? 0}</div><div className="stat-foot"><span className="stat-foot-dot violet-dot" /> Work underway</div></div>
          <div className="stat-card"><div className="stat-top"><span>Closed</span><span className="stat-icon stat-icon-green"><ArrowDownUp size={17} /></span></div><div className="stat-number">{statsLoading ? "—" : stats?.closed ?? 0}</div><div className="stat-foot"><span className="stat-foot-dot green-dot" /> Completed tickets</div></div>
        </section>

        <section className="board-section" id="board"><div className="board-toolbar"><div><h2>All tickets <span className="total-pill">{filtered.length}</span></h2><p>Move tickets through your workflow.</p></div><div className="toolbar-controls"><label className="search-box"><Search size={16} /><input aria-label="Search tickets" placeholder="Search tickets…" value={search} onChange={(event) => dispatch(setSearch(event.target.value))} /></label><label className="category-select"><span className="sr-only">Filter by category</span><select value={categoryFilter} onChange={(event) => dispatch(setCategoryFilter(event.target.value))}><option value="all">All categories</option><option value="coding">Coding</option>{categories.filter((category) => category.toLowerCase() !== "coding").map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div></div>
          {apiError && <div className="inline-error" role="alert">{apiError}</div>}
          {isLoading ? <div className="loading-state"><span className="spinner" />Loading tickets…</div> : isError ? <div className="error-state"><h3>Couldn't load tickets</h3><p>Check that the API is running and VITE_API_URL is configured correctly.</p><button className="button button-secondary" onClick={() => void refetch()}>Try again</button></div> : <div className="kanban-board">{columns.map((status) => <KanbanColumn key={status} status={status} tickets={filtered.filter((ticket) => ticket.status === status)} onCreate={() => { setEditing(null); setFormOpen(true); }} onEdit={openEdit} onDelete={(ticket) => void removeTicket(ticket)} onMove={(ticket, nextStatus) => void moveTicket(ticket, nextStatus)} />)}</div>}
        </section>
        <footer className="page-footer"><span><span className="footer-dot" /> All changes sync with the API</span><span>Keep it moving, one ticket at a time.</span></footer>
      </div>
    </main>
    {formOpen && <TicketForm key={editing?.id ?? "new"} ticket={editing} onClose={closeForm} onSubmit={handleSubmit} busy={createState.isLoading || updateState.isLoading} />}
  </div>;
}
