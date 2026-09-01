import { Router } from "express";
import { AdminAuthController } from "../controllers/admin-auth.controller.js";
import { LoginDto } from "../../auth/dto/login.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticateAdmin } from "../../../shared/middlewares/authenticate-admin.js";
import { createLoginRateLimiter } from "../../../shared/middlewares/rate-limit.js";

const router = Router();
const controller = new AdminAuthController();

router.post(
  "/login",
  createLoginRateLimiter(),
  validateDto(LoginDto),
  (req, res) => controller.login(req, res)
);

router.post("/logout", authenticateAdmin, (req, res) =>
  controller.logout(req, res)
);

export default router;
