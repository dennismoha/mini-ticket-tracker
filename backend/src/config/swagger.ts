import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Mini Ticket Tracker API",
      version: "1.0.0",
      description: "REST API for creating and managing support tickets.",
    },
    servers: [{ url: "/api", description: "Current server" }],
    tags: [{ name: "Tickets", description: "Ticket management" }],
  },
  apis: ["./src/routes/*.ts", "src/routes/*.ts", "dist/routes/*.js"],
});
