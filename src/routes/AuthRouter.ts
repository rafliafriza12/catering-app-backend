import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected routes
router.get("/me", authenticateToken, AuthController.getUser);
router.post("/logout", authenticateToken, AuthController.logout);

export default router;
