import { Router } from "express";
import { ProfessionalSpecialityController } from "../controllers/professional-speciality.controller.js";

const router = Router();
const controller = new ProfessionalSpecialityController();

router.get("/", (req, res) => controller.list(req, res));

export default router;
