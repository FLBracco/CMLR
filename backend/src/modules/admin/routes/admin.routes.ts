import { Router } from "express";
import { AdminProfessionalController } from "../controllers/admin-professional.controller.js";
import { UpdateSubscriptionStatusDto } from "../dto/update-subscription-status.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticateAdmin } from "../../../shared/middlewares/authenticate-admin.js";

const router = Router();
const controller = new AdminProfessionalController();

router.use(authenticateAdmin);

router.get("/professionals", (req, res) => controller.list(req, res));

router.patch(
  "/professionals/:id/subscription",
  validateDto(UpdateSubscriptionStatusDto),
  (req, res) => controller.updateSubscription(req, res)
);

export default router;
