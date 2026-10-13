import { configureStore } from "@reduxjs/toolkit";
import { ticketsApi } from "../features/tickets/tickets-api";
import ticketsUiReducer from "../features/tickets/tickets-slice";

export const store = configureStore({
  reducer: { [ticketsApi.reducerPath]: ticketsApi.reducer, ticketsUi: ticketsUiReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ticketsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
