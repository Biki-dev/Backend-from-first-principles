import express from "express";
import productcontroller from "../controllers/product.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, productcontroller.createProduct);
router.get("/", productcontroller.getAllProducts);
router.get("/:id", productcontroller.getProductById);
router.put("/:id", authMiddleware, adminMiddleware, productcontroller.updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, productcontroller.deleteProduct);

export default router;
