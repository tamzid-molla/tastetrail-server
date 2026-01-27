import express from "express";
import { addMealPlan, getUserMealPlans, updateMealPlanStatus, deleteMealPlan } from "./mealPlanController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";

const router = express.Router();
router.use(isAuthenticated);

router.post("/", addMealPlan); 
router.get("/", getUserMealPlans);
router.put("/:id", updateMealPlanStatus);
router.delete("/:id", deleteMealPlan);

export default router;
