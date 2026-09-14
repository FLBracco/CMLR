import { Router } from "express";
import { SubscriptionSettingsController } from "../controllers/subscription-settings.controller.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";

const router = Router();
const controller = new SubscriptionSettingsController();

// Sin `requireActiveSubscription`: un profesional PENDING/DISABLED es
// justamente quien necesita ver cómo pagar para activarse.
router.use(authenticate);

router.get("/", (req, res) => controller.get(req, res));

export default router;
