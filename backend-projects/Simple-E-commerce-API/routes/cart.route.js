import express from "express";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  clearCart,
  updateCartItem
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/auth.js"; 
const router = express.Router();

router.post("/add",authMiddleware, addToCart);
router.get("/", authMiddleware, getCartItems);
router.delete("/remove/:productId", authMiddleware, removeFromCart);
router.delete("/clear", authMiddleware, clearCart);
router.patch("/item/:productId", authMiddleware, updateCartItem); 
export default router;