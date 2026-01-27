import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { getRecommendedRecipes } from "../../utils/recommendationRecipes.js";

export const recommendations = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) return next(new ErrorHandler("User not found", 404));
  const recipes = await getRecommendedRecipes(userId, 12);

  res.status(200).json({
    success: true,
    message: "Recommended recipes fetched successfully",
    recipes
  });
});
