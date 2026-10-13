import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TicketStatus } from "./tickets-types";

interface TicketsUiState {
  statusFilter: TicketStatus | "all";
  categoryFilter: string;
  search: string;
}

const initialState: TicketsUiState = { statusFilter: "all", categoryFilter: "all", search: "" };

const ticketsSlice = createSlice({
  name: "ticketsUi",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<TicketStatus | "all">) { state.statusFilter = action.payload; },
    setCategoryFilter(state, action: PayloadAction<string>) { state.categoryFilter = action.payload; },
    setSearch(state, action: PayloadAction<string>) { state.search = action.payload; },
  },
});

export const { setStatusFilter, setCategoryFilter, setSearch } = ticketsSlice.actions;
export default ticketsSlice.reducer;
