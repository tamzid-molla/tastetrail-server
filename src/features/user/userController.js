import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import generateToken from "../../utils/generateToken.js";
import { User } from "./userModel.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide all required information", 400));

  const { fullName, email, password, profilePhoto } = req.body;
  if (!fullName || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }
  //find user
  const isUserExists = await User.findOne({ email });
  if (isUserExists) return next(new ErrorHandler("User already exists", 400));
  //create user
  const newUser = await User.create({ fullName, email, password, profilePhoto: profilePhoto || "" });
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
