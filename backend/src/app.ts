import express from "express";
import { errorHandler } from "./shared/middlewares/error-handler.js";

export const app = express();

app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({
    message: "Hello CMLR API 🚀",
  });
});

app.use(errorHandler);
