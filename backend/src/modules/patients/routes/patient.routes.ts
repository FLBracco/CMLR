import { Router } from "express";
import { PatientController } from "../controllers/patient.controller.js";
import { CreatePatientDto } from "../dto/create-patient.dto.js";
import { UpdatePatientDto } from "../dto/update-patient.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";
import { requireActiveSubscription } from "../../../shared/middlewares/require-active-subscription.js";

const router = Router();
const controller = new PatientController();

router.use(authenticate);
router.use(requireActiveSubscription());

router.post("/", validateDto(CreatePatientDto), (req, res) =>
  controller.create(req, res)
);

router.get("/", (req, res) => controller.list(req, res));

router.get("/:id", (req, res) => controller.getById(req, res));

router.patch("/:id", validateDto(UpdatePatientDto), (req, res) =>
  controller.update(req, res)
);

export default router;
