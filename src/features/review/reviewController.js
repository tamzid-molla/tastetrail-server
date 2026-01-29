import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { updateRecipeRating } from "../../utils/updateRecipeRating.js";
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

//get reviews by recipe only approved reviews
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

//admin approve review
export const approveReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler("Please provide review id", 400));
  }
  const review = await Review.findById(id);
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }
  if (review?.status === "approved") {
    return next(new ErrorHandler("Review already approved", 400));
  }
  review.status = "approved";
  await review.save();

  await updateRecipeRating(review.recipe.toString());

  res.status(200).json({
    success: true,
    message: "Review approved successfully",
    review,
  });
});

//get review count
export const getReviewCount = asyncHandler(async (req, res, next) => {
  const count = await Review.countDocuments();

  // Reviews created between last Friday and this Friday (inclusive)
  const now = new Date();
  const end = new Date(now);
  const day = end.getDay(); // 0 = Sun, 5 = Fri
  const diffToFriday = (5 - day + 7) % 7;
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + diffToFriday);

  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const weeklyCount = await Review.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  res.status(200).json({
    success: true,
    count,
    weeklyCount,
  });
});

//reject review
export const rejectReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler("Please provide review id", 400));
  }
  const review = await Review.findById(id);
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }
  review.status = "rejected";
  await review.save();

  res.status(200).json({
    success: true,
    message: "Review rejected successfully",
  });
});
