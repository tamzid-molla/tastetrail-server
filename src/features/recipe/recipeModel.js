import mongoose from "mongoose";

const recipeModel = new mongoose.Schema({
  title: { type: String, required: true }, 
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  cuisine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cuisine",
    required: true,
  },
  cookingTime: { type: Number }, 
  calories: { type: Number }, 
  image: { type: String },
  isFeatured: { type: Boolean, default: false },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export const Recipe = mongoose.model("Recipe", recipeModel);