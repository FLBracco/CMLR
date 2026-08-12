import express from "express";
import cors from "cors";
import { Environment } from "./config/env/environment.js";
import { errorHandler } from "./shared/middlewares/error-handler.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import specialityRoutes from "./modules/professionals/routes/speciality.routes.js";
import patientRoutes from "./modules/patients/routes/patient.routes.js";
import patientConsultationRoutes from "./modules/consultations/routes/patient-consultation.routes.js";
import consultationRoutes from "./modules/consultations/routes/consultation.routes.js";

export const app = express();

app.use(cors({ origin: Environment.app.corsOrigin }));
app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({
    message: "Hello CMLR API 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/patients/:patientId/consultations", patientConsultationRoutes);
app.use("/api/consultations", consultationRoutes);

app.use(errorHandler);
