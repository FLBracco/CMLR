import { Router } from "express";
import { ConsultationController } from "../controllers/consultation.controller.js";
import { CreateConsultationDto } from "../dto/create-consultation.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";

const router = Router({ mergeParams: true });
const controller = new ConsultationController();

router.use(authenticate);

router.post("/", validateDto(CreateConsultationDto), (req, res) =>
  controller.create(req, res)
);

router.get("/", (req, res) => controller.listByPatient(req, res));

export default router;
