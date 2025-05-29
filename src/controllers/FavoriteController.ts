import { Request, Response } from "express";
import Favorite from "../models/Favorite";

class FavoriteController {
  public async addFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { mealId } = req.body;
      const userId = req.user!._id;

      const favorite = await Favorite.create({ userId, mealId });
      res.status(201).json(favorite);
    } catch (error) {
      if ((error as any).code === 11000) {
        res.status(400).json({ message: "Meal already in favorites" });
        return;
      }
      res.status(500).json({ message: "Error adding favorite", error });
    }
  }

  public async getFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const favorites = await Favorite.find({ userId }).populate("mealId");
      res.status(200).json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorites", error });
    }
  }

  public async removeFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { mealId } = req.params;
      const userId = req.user!._id;

      const result = await Favorite.findOneAndDelete({ userId, mealId });

      if (!result) {
        res.status(404).json({ message: "Favorite not found" });
        return;
      }

      res.status(200).json({ message: "Favorite removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error removing favorite", error });
    }
  }

  public async checkFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { mealId } = req.params;
      const userId = req.user!._id;

      const favorite = await Favorite.findOne({ userId, mealId });
      res.status(200).json({ isFavorite: !!favorite });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error checking favorite status", error });
    }
  }
}

export default new FavoriteController();
