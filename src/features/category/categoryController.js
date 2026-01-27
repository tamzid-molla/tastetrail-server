import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Category } from "./categoryModel.js";

export const createCategory = asyncHandler(async (req, res, next) => {
    if (!req.body) return next(new ErrorHandler("Please provide a name for the category", 400));
    const { name } = req.body;
    if (!name) return next(new ErrorHandler("Please provide a name for the category", 400));
    const isExists = await Category.findOne({ name });
    if (isExists) return next(new ErrorHandler("Category already exists", 400));
    const category = await Category.create({ name });
    res.status(201).json({
        success: true,
        message: "Category created successfully",
        category
    });
});

// Get all categories
export const allCategory = asyncHandler(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        categories
    });
});
