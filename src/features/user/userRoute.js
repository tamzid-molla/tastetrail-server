import express from "express";
import { registerUser,loginUser,getCurrentUser,logoutUser } from "./userController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";
const router = express.Router();

router.post("/auth/register",upload.single("profilePhoto"), registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/me", isAuthenticated, getCurrentUser);
router.get("/auth/logout", isAuthenticated, logoutUser);



export default router;