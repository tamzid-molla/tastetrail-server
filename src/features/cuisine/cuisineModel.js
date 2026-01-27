import mongoose from "mongoose";

const cuisineSchema = new mongoose.Schema(
  {
        name: {
          type: String,
          required: true,
          unique: true,
          minlength: [3, "Name must be at least 3 characters long"],
          trim: true,
        },
  },
  { timestamps: true }
);

const Cuisine = mongoose.model("Cuisine", cuisineSchema);
export default Cuisine;
