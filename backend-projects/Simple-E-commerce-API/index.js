import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});