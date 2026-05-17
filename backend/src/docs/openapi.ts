export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "assignment endpoint",
    version: "1.0.0",
    description: "documentation for the assignment backend API.",
  },
  servers: [{ url: "http://localhost:5000" }],
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: { 200: { description: "API is running" } },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "user@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Registered" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@gamil.com" },
                  password: { type: "string", example: "admin1234" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Logged in" } },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        responses: { 200: { description: "Users list" } },
      },
      post: {
        tags: ["Users"],
        summary: "Create user",
        requestBody: { required: true },
        responses: { 201: { description: "User created" } },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User details" } },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true },
        responses: { 200: { description: "User updated" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User deleted" } },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        responses: { 200: { description: "Tasks list" } },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task",
        requestBody: { required: true },
        responses: { 200: { description: "Task created" } },
      },
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Task details" } },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update task",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true },
        responses: { 200: { description: "Task updated" } },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Task deleted" } },
      },
    },
    "/api/tasks/{taskId}/documents": {
      post: {
        tags: ["Documents"],
        summary: "Upload documents for a task",
        parameters: [{ name: "taskId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true },
        responses: { 201: { description: "Documents uploaded" } },
      },
    },
    "/api/tasks/{taskId}/documents/{attachmentId}/download": {
      get: {
        tags: ["Documents"],
        summary: "Download a document",
        parameters: [
          { name: "taskId", in: "path", required: true, schema: { type: "string" } },
          { name: "attachmentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 302: { description: "File redirect" } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
} as const;
