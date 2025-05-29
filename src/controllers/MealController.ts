import { Request, Response, NextFunction } from "express";
import Meal from "../models/Meal";
import { TMeal, OmitMeal } from "../types/meal.types";
import mongoose from "mongoose";
import uploadImage from "../utils/upload.image";

declare global {
  namespace Express {
    interface Request {
      files?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

class MealController {
  // Validation helper methods
  private validateMealData(data: Partial<OmitMeal>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.mealName !== undefined) {
      if (
        !data.mealName ||
        typeof data.mealName !== "string" ||
        data.mealName.trim().length === 0
      ) {
        errors.push("Meal name is required and must be a non-empty string");
      }
    }

    if (data.rating !== undefined) {
      if (
        typeof data.rating !== "number" ||
        data.rating < 0 ||
        data.rating > 5
      ) {
        errors.push("Rating must be a number between 0 and 5");
      }
    }

    if (data.calories !== undefined) {
      if (typeof data.calories !== "number" || data.calories < 0) {
        errors.push("Calories must be a non-negative number");
      }
    }

    if (data.categories !== undefined) {
      const validCategories = ["regular food", "seafood", "salad"];
      if (!validCategories.includes(data.categories)) {
        errors.push("Categories must be one of: regular food, seafood, salad");
      }
    }

    if (data.servingTime !== undefined) {
      if (
        !data.servingTime ||
        typeof data.servingTime !== "string" ||
        data.servingTime.trim().length === 0
      ) {
        errors.push("Serving time is required and must be a non-empty string");
      }
    }

    if (data.description !== undefined) {
      if (
        !data.description ||
        typeof data.description !== "string" ||
        data.description.trim().length === 0
      ) {
        errors.push("Description is required and must be a non-empty string");
      }
    }

    if (data.ingredient !== undefined) {
      if (
        !data.ingredient ||
        typeof data.ingredient !== "string" ||
        data.ingredient.trim().length === 0
      ) {
        errors.push("Ingredient is required and must be a non-empty string");
      }
    }

    if (data.reviews !== undefined) {
      if (!Array.isArray(data.reviews)) {
        errors.push("Reviews must be an array");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateRequiredFields(data: OmitMeal): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      !data.mealName ||
      typeof data.mealName !== "string" ||
      data.mealName.trim().length === 0
    ) {
      errors.push("Meal name is required and must be a non-empty string");
    }

    if (data.rating === undefined || data.rating === null) {
      errors.push("Rating is required");
    } else if (
      typeof data.rating !== "number" ||
      data.rating < 0 ||
      data.rating > 5
    ) {
      errors.push("Rating must be a number between 0 and 5");
    }

    if (data.calories === undefined || data.calories === null) {
      errors.push("Calories is required");
    } else if (typeof data.calories !== "number" || data.calories < 0) {
      errors.push("Calories must be a non-negative number");
    }

    if (!data.categories) {
      errors.push("Categories is required");
    } else {
      const validCategories = ["regular food", "seafood", "salad"];
      if (!validCategories.includes(data.categories)) {
        errors.push("Categories must be one of: regular food, seafood, salad");
      }
    }

    if (
      !data.servingTime ||
      typeof data.servingTime !== "string" ||
      data.servingTime.trim().length === 0
    ) {
      errors.push("Serving time is required and must be a non-empty string");
    }

    if (
      !data.description ||
      typeof data.description !== "string" ||
      data.description.trim().length === 0
    ) {
      errors.push("Description is required and must be a non-empty string");
    }

    if (
      !data.ingredient ||
      typeof data.ingredient !== "string" ||
      data.ingredient.trim().length === 0
    ) {
      errors.push("Ingredient is required and must be a non-empty string");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  // CREATE - Create a new meal
  public async createMeal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mealData: OmitMeal = req.body as OmitMeal;

      // // Validate input data
      // const validation = this.validateRequiredFields(mealData);
      // if (!validation.isValid) {
      //   res.status(400).json({
      //     status: 400,
      //     message: "Validation failed",
      //     errors: validation.errors,
      //   });
      //   return;
      // }

      const {
        mealName,
        rating,
        calories,
        categories,
        servingTime,
        description,
        ingredient,
      } = mealData;

      // Handle image upload
      const files = req.files as Express.Multer.File[];
      let imgURL = "-";

      if (files && files.length > 0) {
        try {
          console.log("Uploading to Cloudinary...");
          const uploadResult = await uploadImage.uploadToCloudinary(
            files[0].buffer,
            files[0].originalname
          );
          imgURL = uploadResult.secure_url;
          console.log("Upload successful:", imgURL);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          res.status(500).json({
            status: 500,
            message: "Failed to upload image to cloud storage",
          });
          return;
        }
      }

      // Check if meal with same name already exists
      const existingMeal = await Meal.findOne({
        mealName: { $regex: new RegExp(`^${mealName}$`, "i") },
      });

      if (existingMeal) {
        res.status(409).json({
          status: 409,
          message: "Meal with this name already exists",
        });
        return;
      }

      const newMeal = new Meal({
        mealName: mealName,
        imgURL,
        rating,
        calories,
        categories,
        servingTime: servingTime,
        description: description,
        ingredient: ingredient,
      });

      await newMeal.save();

      res.status(201).json({
        status: 201,
        data: newMeal,
        message: "Meal created successfully",
      });
    } catch (error) {
      console.error("Create meal error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to create meal",
      });
    }
  }

  // READ - Get all meals with pagination and filtering
  public async getAllMeals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const minRating = parseFloat(req.query.minRating as string) || 0;
      const maxCalories =
        parseInt(req.query.maxCalories as string) || Number.MAX_SAFE_INTEGER;
      const categories = req.query.categories as
        | "regular food"
        | "seafood"
        | "salad";

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          status: 400,
          message:
            "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100",
        });
        return;
      }

      // Validate categories parameter
      if (categories) {
        const validCategories = ["regular food", "seafood", "salad"];
        if (!validCategories.includes(categories)) {
          res.status(400).json({
            status: 400,
            message:
              "Invalid categories. Must be one of: regular food, seafood, salad",
          });
          return;
        }
      }

      const skip = (page - 1) * limit;

      // Build filter query
      const filter: any = {
        rating: { $gte: minRating },
        calories: { $lte: maxCalories },
      };

      // Add categories filter
      if (categories) {
        filter.categories = categories;
      }

      // Add search filter
      if (search) {
        filter.$or = [
          { mealName: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { ingredient: { $regex: search, $options: "i" } },
        ];
      }

      const [meals, totalCount] = await Promise.all([
        Meal.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Meal.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        status: 200,
        data: {
          meals,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
          appliedFilters: {
            search: search || null,
            minRating,
            maxCalories:
              maxCalories === Number.MAX_SAFE_INTEGER ? null : maxCalories,
            categories: categories || null,
          },
        },
        message: "Meals retrieved successfully",
      });
    } catch (error) {
      console.error("Get all meals error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to retrieve meals",
      });
    }
  }

  // READ - Get meal by ID
  public async getMealById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId
      // if (!this.validateObjectId(id)) {
      //   res.status(400).json({
      //     status: 400,
      //     message: "Invalid meal ID format",
      //   });
      //   return;
      // }

      const meal = await Meal.findById(id);

      if (!meal) {
        res.status(404).json({
          status: 404,
          message: "Meal not found",
        });
        return;
      }

      res.status(200).json({
        status: 200,
        data: meal,
        message: "Meal retrieved successfully",
      });
    } catch (error) {
      console.error("Get meal by ID error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to retrieve meal",
      });
    }
  }

  // UPDATE - Update meal by ID
  public async updateMeal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<OmitMeal> = req.body;

      // Validate ObjectId
      if (!this.validateObjectId(id)) {
        res.status(400).json({
          status: 400,
          message: "Invalid meal ID format",
        });
        return;
      }

      // Check if meal exists
      const existingMeal = await Meal.findById(id);
      if (!existingMeal) {
        res.status(404).json({
          status: 404,
          message: "Meal not found",
        });
        return;
      }

      // Validate update data if provided
      if (Object.keys(updateData).length > 0) {
        const validation = this.validateMealData(updateData);
        if (!validation.isValid) {
          res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors: validation.errors,
          });
          return;
        }
      }

      // Check for duplicate meal name (excluding current meal)
      if (updateData.mealName) {
        const duplicateMeal = await Meal.findOne({
          _id: { $ne: id },
          mealName: { $regex: new RegExp(`^${updateData.mealName}$`, "i") },
        });

        if (duplicateMeal) {
          res.status(409).json({
            status: 409,
            message: "Meal with this name already exists",
          });
          return;
        }
      }

      // Handle image upload if new image is provided
      const files = req.files as Express.Multer.File[];
      let newImgURL = existingMeal.imgURL;

      if (files && files.length > 0) {
        try {
          console.log("Uploading new image to Cloudinary...");
          const uploadResult = await uploadImage.uploadToCloudinary(
            files[0].buffer,
            files[0].originalname
          );
          newImgURL = uploadResult.secure_url;

          // Delete old image if it exists and is not the default
          if (existingMeal.imgURL && existingMeal.imgURL !== "-") {
            await uploadImage.deleteFromCloudinary(existingMeal.imgURL);
          }

          console.log("New image upload successful:", newImgURL);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          res.status(500).json({
            status: 500,
            message: "Failed to upload new image to cloud storage",
          });
          return;
        }
      }

      // Prepare update object
      const updateObject: any = {
        ...updateData,
        imgURL: newImgURL,
      };

      // Trim string fields if they exist
      if (updateObject.mealName)
        updateObject.mealName = updateObject.mealName.trim();
      if (updateObject.servingTime)
        updateObject.servingTime = updateObject.servingTime.trim();
      if (updateObject.description)
        updateObject.description = updateObject.description.trim();
      if (updateObject.ingredient)
        updateObject.ingredient = updateObject.ingredient.trim();

      const updatedMeal = await Meal.findByIdAndUpdate(id, updateObject, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: 200,
        data: updatedMeal,
        message: "Meal updated successfully",
      });
    } catch (error) {
      console.error("Update meal error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to update meal",
      });
    }
  }

  // DELETE - Delete meal by ID
  public async deleteMeal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!this.validateObjectId(id)) {
        res.status(400).json({
          status: 400,
          message: "Invalid meal ID format",
        });
        return;
      }

      const meal = await Meal.findById(id);

      if (!meal) {
        res.status(404).json({
          status: 404,
          message: "Meal not found",
        });
        return;
      }

      // Delete image from Cloudinary if it exists
      if (meal.imgURL && meal.imgURL !== "-") {
        try {
          await uploadImage.deleteFromCloudinary(meal.imgURL);
          console.log("Image deleted from Cloudinary");
        } catch (deleteError) {
          console.error("Failed to delete image from Cloudinary:", deleteError);
          // Continue with meal deletion even if image deletion fails
        }
      }

      await Meal.findByIdAndDelete(id);

      res.status(200).json({
        status: 200,
        message: "Meal deleted successfully",
      });
    } catch (error) {
      console.error("Delete meal error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to delete meal",
      });
    }
  }

  // BULK DELETE - Delete multiple meals
  public async bulkDeleteMeals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          status: 400,
          message: "IDs array is required and must not be empty",
        });
        return;
      }

      // Validate all ObjectIds
      const invalidIds = ids.filter((id) => !this.validateObjectId(id));
      if (invalidIds.length > 0) {
        res.status(400).json({
          status: 400,
          message: "Invalid meal ID format",
          invalidIds,
        });
        return;
      }

      // Get all meals to delete (for image cleanup)
      const mealsToDelete = await Meal.find({ _id: { $in: ids } });

      if (mealsToDelete.length === 0) {
        res.status(404).json({
          status: 404,
          message: "No meals found with provided IDs",
        });
        return;
      }

      // Delete images from Cloudinary
      const imageDeletePromises = mealsToDelete
        .filter((meal) => meal.imgURL && meal.imgURL !== "-")
        .map((meal) => uploadImage.deleteFromCloudinary(meal.imgURL));

      try {
        await Promise.all(imageDeletePromises);
        console.log("Images deleted from Cloudinary");
      } catch (deleteError) {
        console.error(
          "Some images failed to delete from Cloudinary:",
          deleteError
        );
        // Continue with meal deletion even if some image deletions fail
      }

      // Delete meals from database
      const deleteResult = await Meal.deleteMany({ _id: { $in: ids } });

      res.status(200).json({
        status: 200,
        data: {
          deletedCount: deleteResult.deletedCount,
          requestedCount: ids.length,
        },
        message: `${deleteResult.deletedCount} meals deleted successfully`,
      });
    } catch (error) {
      console.error("Bulk delete meals error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to delete meals",
      });
    }
  }

  // GET MEAL STATS - Get statistics about meals
  public async getMealStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const [
        totalMeals,
        avgRating,
        avgCalories,
        highestRatedMeal,
        lowestCalorieMeal,
        categoriesStats,
      ] = await Promise.all([
        Meal.countDocuments(),
        Meal.aggregate([
          { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]),
        Meal.aggregate([
          { $group: { _id: null, avgCalories: { $avg: "$calories" } } },
        ]),
        Meal.findOne().sort({ rating: -1, createdAt: -1 }).limit(1),
        Meal.findOne().sort({ calories: 1, createdAt: -1 }).limit(1),
        Meal.aggregate([
          {
            $group: {
              _id: "$categories",
              count: { $sum: 1 },
              avgRating: { $avg: "$rating" },
              avgCalories: { $avg: "$calories" },
            },
          },
        ]),
      ]);

      res.status(200).json({
        status: 200,
        data: {
          totalMeals,
          averageRating: avgRating[0]?.avgRating
            ? Number(avgRating[0].avgRating.toFixed(2))
            : 0,
          averageCalories: avgCalories[0]?.avgCalories
            ? Number(avgCalories[0].avgCalories.toFixed(0))
            : 0,
          highestRatedMeal,
          lowestCalorieMeal,
          categoriesBreakdown: categoriesStats.map((stat) => ({
            category: stat._id,
            count: stat.count,
            averageRating: Number(stat.avgRating.toFixed(2)),
            averageCalories: Number(stat.avgCalories.toFixed(0)),
          })),
        },
        message: "Meal statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Get meal stats error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve meal statistics",
      });
    }
  }

  // GET MEALS BY CATEGORY - Get meals filtered by specific category
  public async getMealsByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const minRating = parseFloat(req.query.minRating as string) || 0;
      const maxCalories =
        parseInt(req.query.maxCalories as string) || Number.MAX_SAFE_INTEGER;

      // Validate category parameter
      const validCategories = ["regular food", "seafood", "salad"];
      if (!validCategories.includes(category as any)) {
        res.status(400).json({
          status: 400,
          message:
            "Invalid category. Must be one of: regular food, seafood, salad",
        });
        return;
      }

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          status: 400,
          message:
            "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100",
        });
        return;
      }

      const skip = (page - 1) * limit;

      // Build filter query
      const filter: any = {
        categories: category,
        rating: { $gte: minRating },
        calories: { $lte: maxCalories },
      };

      // Add search filter
      if (search) {
        filter.$or = [
          { mealName: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { ingredient: { $regex: search, $options: "i" } },
        ];
      }

      const [meals, totalCount, categoryStats] = await Promise.all([
        Meal.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Meal.countDocuments(filter),
        Meal.aggregate([
          { $match: { categories: category } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgRating: { $avg: "$rating" },
              avgCalories: { $avg: "$calories" },
              maxRating: { $max: "$rating" },
              minCalories: { $min: "$calories" },
            },
          },
        ]),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        status: 200,
        data: {
          meals,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
          categoryInfo: {
            category,
            totalInCategory: categoryStats[0]?.count || 0,
            averageRating: categoryStats[0]?.avgRating
              ? Number(categoryStats[0].avgRating.toFixed(2))
              : 0,
            averageCalories: categoryStats[0]?.avgCalories
              ? Number(categoryStats[0].avgCalories.toFixed(0))
              : 0,
            highestRating: categoryStats[0]?.maxRating || 0,
            lowestCalories: categoryStats[0]?.minCalories || 0,
          },
          appliedFilters: {
            search: search || null,
            minRating,
            maxCalories:
              maxCalories === Number.MAX_SAFE_INTEGER ? null : maxCalories,
          },
        },
        message: `${category} meals retrieved successfully`,
      });
    } catch (error) {
      console.error("Get meals by category error:", error);
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve meals by category",
      });
    }
  }
}

export default new MealController();
