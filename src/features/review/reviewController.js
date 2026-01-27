import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Recipe } from "../recipe/recipeModel.js";
import { Review } from "./reviewModel.js";

export const createReview = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide a review", 400));
  const { recipe, rating, comment } = req.body;
  if (!recipe || !rating || !comment) return next(new ErrorHandler("Please provide all required fields", 400));

  //check recipe exists
  const recipeExists = await Recipe.findById(recipe);
  if (!recipeExists) return next(new ErrorHandler("Please provide a valid recipe", 400));
  const userId = req.user?._id;
  if (!userId) return next(new ErrorHandler("Please login to create a review", 401));

  //check already reviewed
  const isReviewed = await Review.findOne({ user: userId, recipe });
  if (isReviewed) return next(new ErrorHandler("You have already reviewed this recipe", 400));

  const review = await Review.create({ user: userId, recipe, rating, comment });
  res.status(201).json({
    success: true,
    message: "Review created successfully",
    review,
  });
});

export const getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find()
    .populate("user", "fullName email")
    .populate("recipe", "title")
    .sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    reviews,
  });
});

//get reviews by recipe
export const getReviewsByRecipe = asyncHandler(async (req, res, next) => {
  const { recipeID } = req.params;
  if (!recipeID) return next(new ErrorHandler("cannot find reviews for this recipe", 400));
  const reviews = await Review.find({ recipe: recipeID, status: "approved" })
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    reviews,
  });
});
