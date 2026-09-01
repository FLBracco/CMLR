import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { RegisterProfessionalDto } from "../dto/register.dto.js";
import { LoginDto } from "../dto/login.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";
import { createLoginRateLimiter } from "../../../shared/middlewares/rate-limit.js";

const router = Router();
const controller = new AuthController();

router.post("/register", validateDto(RegisterProfessionalDto), (req, res) =>
  controller.register(req, res)
);

router.post(
  "/login",
  createLoginRateLimiter(),
  validateDto(LoginDto),
  (req, res) => controller.login(req, res)
);

router.post("/logout", authenticate, (req, res) => controller.logout(req, res));

export default router;
