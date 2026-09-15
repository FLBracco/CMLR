import { Router } from "express";
import { ProfessionalController } from "../controllers/professional.controller.js";
import { UpdateProfileDto } from "../dto/update-profile.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";

const router = Router();
const controller = new ProfessionalController();

router.use(authenticate);

router.get("/me", (req, res) => controller.getMe(req, res));
router.patch("/me", validateDto(UpdateProfileDto), (req, res) =>
  controller.updateMe(req, res)
);
// Sin requireActiveSubscription: el guard rechazaría con el mensaje de "no
// tenés acceso" justo cuando el caso de uso es avisar que se está esperando
// la activación. La validación de estado vive en el service, con mensajes
// de dominio (ver ProfessionalService.reportSubscriptionPayment).
router.post("/me/subscription/payment-report", (req, res) =>
  controller.reportSubscriptionPayment(req, res)
);

export default router;
