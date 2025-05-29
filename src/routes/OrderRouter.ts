import { Router } from "express";
import OrderController from "../controllers/OrderController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all order routes
router.use(authenticateToken);

// Order routes
router.post("/create", OrderController.createOrder);
router.get("/", OrderController.getOrders);
router.get("/:orderId", OrderController.getOrderById);
router.put("/:orderId/status", OrderController.updateOrderStatus);
router.put("/:orderId/cancel", OrderController.cancelOrder);

export default router;
