import { Document } from "mongoose";

// Review interface
export interface IReview {
  reviewDescription: string;
}

// Main Meal interface
export interface TMeal extends Document {
  _id: any;
  mealName: string;
  imgURL: string;
  rating: number;
  calories: number;
  categories: "regular food" | "seafood" | "salad";
  servingTime: string;
  description: string;
  ingredient: string;
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
  __v: any;
}

// Base interface without Document methods
export interface IMealBase {
  mealName: string;
  rating: number;
  calories: number;
  categories: "regular food" | "seafood" | "salad";
  servingTime: string;
  description: string;
  ingredient: string;
  reviews: IReview[];
}

// For meal creation (without imgURL as it's handled separately)
export type OmitMeal = IMealBase;

// For meal creation with imgURL
export type CreateMeal = IMealBase & { imgURL: string };

// For partial updates
export type UpdateMeal = Partial<OmitMeal>;

// For API responses
export interface MealResponse {
  status: number;
  data?: TMeal | TMeal[] | any;
  message: string;
  errors?: string[];
}

// For pagination
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedMealResponse {
  status: number;
  data: {
    meals: TMeal[];
    pagination: PaginationInfo;
  };
  message: string;
}

// For statistics
export interface MealStats {
  totalMeals: number;
  averageRating: number;
  averageCalories: number;
  highestRatedMeal: TMeal | null;
  lowestCalorieMeal: TMeal | null;
}

// Query parameters for filtering
export interface MealQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  minRating?: string;
  maxCalories?: string;
  categories?: "regular food" | "seafood" | "salad";
}
