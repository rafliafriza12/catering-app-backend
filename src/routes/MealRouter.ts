import express from "express";
import MealController from "../controllers/MealController";
import upload from "../config/multer";

class AuthRouter {
  private authRouter: express.Router;

  constructor() {
    this.authRouter = express.Router();
    this.routes();
  }

  private routes = () => {
    this.authRouter.post(
      "/",
      upload.array("image", 1), // Accept single image with field name 'image'
      MealController.createMeal
    );

    this.authRouter.get("/", MealController.getAllMeals);

    this.authRouter.get("/stats", MealController.getMealStats);

    this.authRouter.get(
      "/category/:category",
      MealController.getMealsByCategory
    );

    this.authRouter.get("/:id", MealController.getMealById);

    this.authRouter.put(
      "/:id",
      upload.array("image", 1), // Accept single image for update
      MealController.updateMeal
    );

    this.authRouter.delete("/:id", MealController.deleteMeal);

    this.authRouter.delete("/", MealController.bulkDeleteMeals);
  };

  public getRouter = (): express.Router => this.authRouter;
}

export default new AuthRouter().getRouter();
