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

export default router;
