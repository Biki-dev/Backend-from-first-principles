import express from "express";
import Userouter from "./routes/user.route.js";
import Productrouter from "./routes/product.route.js";
import Cartrouter from "./routes/cart.route.js";
import Orderouter from "./routes/order.route.js";
import Paymentrouter from "./routes/payment.route.js";
const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use("/api/users", Userouter);
app.use("/api/products", Productrouter);
app.use("/api/cart", Cartrouter);
app.use("/api/orders", Orderouter);
app.use("/api/payments", Paymentrouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Simple E-commerce API!");
});

export default app;