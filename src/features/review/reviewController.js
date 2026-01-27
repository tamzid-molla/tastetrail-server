import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Review } from "./reviewModel.js";

export const createReview = asyncHandler(async (req, res, next) => {
    if(!req.body) return next(new ErrorHandler("Please provide a review", 400));
    const { user, recipe, rating, comment } = req.body;
    if(!user || !recipe || !rating || !comment)
        return next(new ErrorHandler("Please provide all required fields", 400));
    //check already reviewed
    const isReviewed = await Review.findOne({ user, recipe });
    if (isReviewed) return next(new ErrorHandler("You have already reviewed this recipe", 400));
    const review = await Review.create({ user, recipe, rating, comment });
    res.status(201).json({
        success: true,
        message: "Review created successfully",
        review
    });
})