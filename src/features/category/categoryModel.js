import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: [3, "Name must be at least 3 characters long"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
