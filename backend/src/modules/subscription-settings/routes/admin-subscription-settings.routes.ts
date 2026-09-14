import { Router } from "express";
import { SubscriptionSettingsController } from "../controllers/subscription-settings.controller.js";
import { UpdateSubscriptionSettingsDto } from "../dto/update-subscription-settings.dto.js";
import { validateDto } from "../../../shared/middlewares/validate-dto.js";
import { authenticateAdmin } from "../../../shared/middlewares/authenticate-admin.js";

const router = Router();
const controller = new SubscriptionSettingsController();

router.use(authenticateAdmin);

router.get("/", (req, res) => controller.get(req, res));
router.patch("/", validateDto(UpdateSubscriptionSettingsDto), (req, res) =>
  controller.update(req, res)
);

export default router;
