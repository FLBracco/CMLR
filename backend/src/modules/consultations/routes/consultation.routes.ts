import { Router } from "express";
import { ConsultationController } from "../controllers/consultation.controller.js";
import { UpdateConsultationDto } from "../dto/update-consultation.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";

const router = Router();
const controller = new ConsultationController();

router.use(authenticate);

router.get("/stats", (req, res) => controller.getStats(req, res));

router.patch("/:id", validateDto(UpdateConsultationDto), (req, res) =>
  controller.update(req, res)
);

export default router;
