import { Router } from "express";
import FavoriteController from "../controllers/FavoriteController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all favorite routes
router.use(authenticateToken);

// Favorite routes
router.post("/add", FavoriteController.addFavorite);
router.get("/", FavoriteController.getFavorites);
router.delete("/remove/:mealId", FavoriteController.removeFavorite);
router.get("/check/:mealId", FavoriteController.checkFavorite);

export default router;
