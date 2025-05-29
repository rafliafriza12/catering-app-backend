import { Router } from "express";
import CartController from "../controllers/CartController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all cart routes
router.use(authenticateToken);

// Cart routes
router.post("/add", CartController.addToCart);
router.get("/", CartController.getCart);
router.put("/update", CartController.updateCartItem);
router.delete("/remove/:mealId", CartController.removeFromCart);
router.delete("/clear", CartController.clearCart);

export default router;
