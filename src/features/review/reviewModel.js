import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: [5,"Comment must be at least 5 characters long"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

//validate that one user can review only once for one recipe
reviewSchema.index({ user: 1, recipe: 1 }, { unique: true });


export const Review = mongoose.model("Review", reviewSchema);
