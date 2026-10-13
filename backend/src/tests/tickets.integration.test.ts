import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { prisma } from "../config/database.js";

const createdIds: string[] = [];

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  if (createdIds.length) await prisma.ticket.deleteMany({ where: { id: { in: createdIds } } });
  await prisma.$disconnect();
});

describe("Tickets API integration", () => {
  it("creates a ticket and returns its generated fields", async () => {
    const response = await request(app).post("/api/tickets").send({
      title: `Integration test ${Date.now()}`,
      description: "Created by Supertest",
      category: "coding",
      priority: "high",
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ category: "coding", status: "open", priority: "high" });
    expect(response.body.data.id).toBeTruthy();
    createdIds.push(response.body.data.id);
  });

  it("rejects a ticket without a title", async () => {
    const response = await request(app).post("/api/tickets").send({ description: "No title" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("updates status and reflects the counts in stats", async () => {
    const created = await request(app).post("/api/tickets").send({ title: `Stats test ${Date.now()}` });
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;
    createdIds.push(id);

    const updated = await request(app).patch(`/api/tickets/${id}`).send({ status: "in_progress", priority: "medium" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("in_progress");

    const stats = await request(app).get("/api/tickets/stats");
    expect(stats.status).toBe(200);
    expect(stats.body.data).toHaveProperty("open");
    expect(stats.body.data).toHaveProperty("in_progress");
    expect(stats.body.data).toHaveProperty("closed");
  });

  it("filters and paginates the ticket list", async () => {
    const response = await request(app).get("/api/tickets?status=open&page=1&limit=5");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("items");
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 5 });
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it("deletes a ticket and returns 404 when it is requested afterward", async () => {
    const created = await request(app).post("/api/tickets").send({ title: `Delete test ${Date.now()}` });
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;
    const deleted = await request(app).delete(`/api/tickets/${id}`);
    expect(deleted.status).toBe(204);
    const missing = await request(app).get(`/api/tickets/${id}`);
    expect(missing.status).toBe(404);
  });
});
