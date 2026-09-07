import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { authenticate } from "../../../shared/middlewares/authenticate.js";
import { requireActiveSubscription } from "../../../shared/middlewares/require-active-subscription.js";

const router = Router({ mergeParams: true });
const controller = new AppointmentController();

router.use(authenticate);
router.use(requireActiveSubscription());

router.get("/", (req, res) => controller.listByPatient(req, res));

export default router;
