import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import ticketRoutes from "./routes/ticket.routes.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.corsOrigin.split(",").map((value) => value.trim()), credentials: false }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/api/tickets", ticketRoutes);
app.use(notFound);
app.use(errorHandler);
