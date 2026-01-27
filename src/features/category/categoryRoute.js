import express from "express";
import { createCategory } from "./categoryController.js";

const router = express.Router();

router.post("/", createCategory);

export default router;
