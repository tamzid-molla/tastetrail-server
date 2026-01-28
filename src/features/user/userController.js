import cloudinary from "../../config/cloudinary.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import generateToken from "../../utils/generateToken.js";
import { User } from "./userModel.js";
import fs from "fs"

export const registerUser = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide all required information", 400));

  const { fullName, email, password, } = req.body;
  if (!fullName || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

   let imageUrl = "";
  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "TasteTrailUsers",
      quality: "auto",
      fetch_format: "auto",
    });
    imageUrl = result.secure_url;
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });
  }

  //find user
  const isUserExists = await User.findOne({ email });
  if (isUserExists) return next(new ErrorHandler("User already exists", 400));
  //create user
  const newUser = await User.create({ fullName, email, password, profilePhoto: imageUrl || "" });
  if (!newUser) return next(new ErrorHandler("Something went wrong Please try again later", 500));
  res.status(201).json({
    success: true,
    message: "User created successfully",
  });
});

//login user
export const loginUser = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide all required information", 400));
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorHandler("Please provide all required information", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 400));
  //compare password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) return next(new ErrorHandler("Invalid email or password", 400));
  user.password = undefined;
  generateToken(user, 200, "Login successful", res);
});

//get current user
export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({
    success: true,
    user,
  });
});


//logout user
export const logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});
