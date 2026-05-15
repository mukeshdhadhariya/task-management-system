import express from "express"
import cors from  "cors"
import helmet from "helmet";
import morgan from "morgan";

const app=express();

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ success: true, message: "API running" });
});

export default app;