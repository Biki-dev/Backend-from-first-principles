import express from "express";
import usercontroller from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", usercontroller.register);
router.post("/login", usercontroller.login);

export default router;