import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../../middleware/auth.middleware";
import { validateBody } from "../../../middleware/validate.middleware";
import * as authController from "../auth.controller";
import { googleAuthSchema, loginSchema, registerSchema } from "../validation/auth.validation";

const router = Router();

// Tighter limits on credential-guessing-prone endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later", error: {} },
});

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/google", authLimiter, validateBody(googleAuthSchema), authController.googleAuth);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
