import { Router } from "express";
import { ConsultationController } from "../controllers/consultation.controller.js";
import { UpdateConsultationDto } from "../dto/update-consultation.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";
import { requireActiveSubscription } from "../../../shared/middlewares/require-active-subscription.js";

const router = Router();
const controller = new ConsultationController();

router.use(authenticate);
router.use(requireActiveSubscription());

router.get("/stats", (req, res) => controller.getStats(req, res));
router.get("/", (req, res) => controller.list(req, res));

router.patch("/:id", validateDto(UpdateConsultationDto), (req, res) =>
  controller.update(req, res)
);

export default router;
