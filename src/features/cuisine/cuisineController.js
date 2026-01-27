import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { capitalizeFirstLetter } from "../../utils/formatText.js";
import { Recipe } from "../recipe/recipeModel.js";
import Cuisine from "./cuisineModel.js";

export const createCuisine = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide a name for the cuisine", 400));
  const { name } = req.body;
  if (!name) return next(new ErrorHandler("Please provide a name for the cuisine", 400));
  //format name
  const formattedName = capitalizeFirstLetter(name);
  const isExists = await Cuisine.findOne({ name: { $regex: `^${formattedName}$`, $options: 'i' } });
  if (isExists) return next(new ErrorHandler("cuisine already exists", 400));
  const cuisine = await Cuisine.create({ name: formattedName });
  res.status(201).json({
    success: true,
    message: "Cuisine created successfully",
    cuisine,
  });
});

// Get all cuisines
export const allCuisines = asyncHandler(async (req, res, next) => {
  const cuisines = await Cuisine.find();
  res.status(200).json({
    success: true,
    message: "cuisines fetched successfully",
    cuisines,
  });
});

//Get single cuisine
export const singleCuisine = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide a cuisine id", 400));
  const cuisine = await Cuisine.findById(id);
  if (!cuisine) return next(new ErrorHandler("Cuisine not found", 404));
  res.status(200).json({
    success: true,
    message: "cuisine fetched successfully",
    cuisine,
  });
});

//update cuisine
export const updateCuisine = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return next(new ErrorHandler("Please provide a new cuisine name", 400));
    if (!id) return next(new ErrorHandler("Please provide a cuisine id", 400));
    //format name
    const formattedName = capitalizeFirstLetter(name);
  //is exists
  const isExists = await Cuisine.findOne({ name: { $regex: `^${formattedName}$`, $options: 'i' } });
  if (isExists) return next(new ErrorHandler("Cuisine already exists", 400));
  const cuisine = await Cuisine.findByIdAndUpdate(id, { name:formattedName }, { new: true, runValidators: true });
  if (!cuisine) return next(new ErrorHandler("Cuisine not found", 404));
  res.status(200).json({
    success: true,
    message: "Cuisine updated successfully",
    cuisine,
  });
});

//delete cuisine
export const deleteCuisine = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide a cuisine id", 400));

  //check recipe exists in this cuisine
  const recipeCount = await Recipe.countDocuments({ cuisine: id });
  if (recipeCount > 0)
    return next(new ErrorHandler("Cannot delete this cuisine because it is associated with existing recipes", 400));

  const cuisine = await Cuisine.findByIdAndDelete(id);
  if (!cuisine) return next(new ErrorHandler("cannot delete cuisine, please try again", 404));
  res.status(200).json({
    success: true,
    message: "Cuisine deleted successfully",
  });
});
