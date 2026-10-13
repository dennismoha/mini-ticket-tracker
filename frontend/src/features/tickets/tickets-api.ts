import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Ticket, TicketInput, TicketListResponse, TicketResponse, TicketStatsResponse, TicketStatus } from "./tickets-types";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Ticket", "TicketStats"],
  endpoints: (builder) => ({
    getTickets: builder.query<TicketListResponse["data"], { status?: TicketStatus | "all"; category?: string; page?: number; limit?: number }>({
      query: ({ status, category, page = 1, limit = 100 }) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status && status !== "all") params.set("status", status);
        if (category && category !== "all") params.set("category", category);
        return `/tickets?${params.toString()}`;
      },
      transformResponse: (response: TicketListResponse) => response.data,
      providesTags: (result) => result ? ["Ticket", ...result.items.map(({ id }) => ({ type: "Ticket" as const, id }))] : ["Ticket"],
    }),
    getTicket: builder.query<Ticket, string>({
      query: (id) => `/tickets/${id}`,
      transformResponse: (response: TicketResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Ticket", id }],
    }),
    getTicketStats: builder.query<TicketStatsResponse["data"], void>({
      query: () => "/tickets/stats",
      transformResponse: (response: TicketStatsResponse) => response.data,
      providesTags: ["TicketStats"],
    }),
    createTicket: builder.mutation<Ticket, TicketInput>({
      query: (body) => ({ url: "/tickets", method: "POST", body }),
      transformResponse: (response: TicketResponse) => response.data,
      invalidatesTags: ["Ticket", "TicketStats"],
    }),
    updateTicket: builder.mutation<Ticket, { id: string; changes: Partial<TicketInput> }>({
      query: ({ id, changes }) => ({ url: `/tickets/${id}`, method: "PATCH", body: changes }),
      transformResponse: (response: TicketResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket", id }, "Ticket", "TicketStats"],
    }),
    deleteTicket: builder.mutation<void, string>({
      query: (id) => ({ url: `/tickets/${id}`, method: "DELETE" }),
      invalidatesTags: ["Ticket", "TicketStats"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useGetTicketStatsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} = ticketsApi;
