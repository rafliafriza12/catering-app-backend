import mongoose, { Schema } from "mongoose";
import { TMeal } from "../types/meal.types";

class MealSchema {
  private mealSchema: Schema<TMeal>;

  constructor() {
    this.mealSchema = this.initialSchema();
  }

  private initialSchema = (): Schema<TMeal> => {
    return new Schema<TMeal>(
      {
        mealName: {
          type: String,
          required: true,
        },
        imgURL: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          default: 0,
          min: [0, "Rating must be at least 0"],
          max: [5, "Rating must not exceed 5"],
        },
        calories: {
          type: Number,
          default: 0,
          min: [0, "Kalori tidak boleh dibawah 0"],
        },
        categories: {
          type: String,
          enum: ["regular food", "seafood", "salad"],
          default: "regular food",
        },
        servingTime: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        ingredient: {
          type: String,
          required: true,
        },
        reviews: {
          type: [
            {
              reviewDescription: {
                type: String,
                default: "",
              },
            },
          ],
          default: [
            {
              reviewDescription: "Makanan ini sangat enak",
            },
          ],
        },
      },
      { timestamps: true }
    );
  };

  public getMealSchema = (): mongoose.Model<TMeal> => {
    return mongoose.model("meals", this.mealSchema);
  };
}

export default new MealSchema().getMealSchema();
