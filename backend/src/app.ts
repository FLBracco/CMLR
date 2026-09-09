import express from "express";
import cors from "cors";
import { Environment } from "./config/env/environment.js";
import { errorHandler } from "./shared/middlewares/error-handler.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import specialityRoutes from "./modules/professionals/routes/speciality.routes.js";
import professionalRoutes from "./modules/professionals/routes/professional.routes.js";
import patientRoutes from "./modules/patients/routes/patient.routes.js";
import patientConsultationRoutes from "./modules/consultations/routes/patient-consultation.routes.js";
import consultationRoutes from "./modules/consultations/routes/consultation.routes.js";
import adminAuthRoutes from "./modules/admin/routes/admin-auth.routes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import appointmentRoutes from "./modules/appointments/routes/appointment.routes.js";
import patientAppointmentRoutes from "./modules/appointments/routes/patient-appointment.routes.js";

export const app = express();

// Detrás de un proxy (Render, Railway, etc.) llega X-Forwarded-For; sin esto,
// express-rate-limit lanza ERR_ERL_UNEXPECTED_X_FORWARDED_FOR, o peor: si se
// ignora, todas las IPs colapsan en la del proxy y el rate limit de login pasa
// a ser global entre todos los usuarios.
if (Environment.app.isProduction) {
  app.set("trust proxy", 1);
}

app.use(cors({ origin: Environment.app.corsOrigin }));
app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({
    message: "Hello CMLR API 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/patients/:patientId/consultations", patientConsultationRoutes);
app.use("/api/patients/:patientId/appointments", patientAppointmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use(errorHandler);
