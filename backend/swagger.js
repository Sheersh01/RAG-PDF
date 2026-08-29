import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InterviewPilot API",
      version: "1.0.0",
      description: "RAG-powered resume analysis and interview preparation API",
    },
    servers: [
      { url: "http://localhost:5000", description: "Local development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  },
  apis: ["./routes/*.js", "./app.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
