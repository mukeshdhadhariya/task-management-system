import express from "express"
import cors from  "cors"
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";
import { openApiSpec } from "./docs/openapi";

const app=express();
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tasks",taskRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/health", (_, res) => {
  res.json({ success: true, message: "API running" });
});

export default app;