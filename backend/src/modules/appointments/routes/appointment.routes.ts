import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { CreateAppointmentDto } from "../dto/create-appointment.dto.js";
import { UpdateAppointmentDto } from "../dto/update-appointment.dto.js";
import { UpdateAppointmentStatusDto } from "../dto/update-appointment-status.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";
import { requireActiveSubscription } from "../../../shared/middlewares/require-active-subscription.js";

const router = Router();
const controller = new AppointmentController();

router.use(authenticate);
router.use(requireActiveSubscription());

router.post("/", validateDto(CreateAppointmentDto), (req, res) =>
  controller.create(req, res)
);

router.get("/", (req, res) => controller.list(req, res));

// NOTA: cuando se agregue GET /stats (Fase 4), declararlo ANTES de GET /:id
// o Express lo matchea como si "stats" fuera un :id.
router.get("/:id", (req, res) => controller.getById(req, res));

router.patch("/:id", validateDto(UpdateAppointmentDto), (req, res) =>
  controller.update(req, res)
);

router.patch(
  "/:id/status",
  validateDto(UpdateAppointmentStatusDto),
  (req, res) => controller.updateStatus(req, res)
);

export default router;
