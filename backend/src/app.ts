import express from "express";
import { errorHandler } from "./shared/middlewares/error-handler.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import specialityRoutes from "./modules/professionals/routes/speciality.routes.js";
import patientRoutes from "./modules/patients/routes/patient.routes.js";

export const app = express();

app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({
    message: "Hello CMLR API 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/patients", patientRoutes);

app.use(errorHandler);
