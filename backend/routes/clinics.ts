import { Router } from "express";
import {
  getClinics,
  getClinicById,
  addReview,
} from "../controllers/clinicsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", getClinics);
router.get("/:id", getClinicById);
router.post("/:id/reviews", authMiddleware, addReview);

export default router;