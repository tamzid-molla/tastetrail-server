import express from "express";
import { registerUser,loginUser,getCurrentUser } from "./userController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/me",isAuthenticated, getCurrentUser);


export default router;