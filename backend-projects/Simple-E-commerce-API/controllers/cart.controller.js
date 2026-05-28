import ProductModel from "../models/Product.model.js";
import CartModel from "../models/Cart.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validation
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }
    
    // Check if product exists and is available
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.isActive === false) {
      return res.status(400).json({ message: "Product is not available for purchase" });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });
    }
    
    // Find or create cart for the user
    let cart = await CartModel.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = new CartModel({ 
        userId: req.user._id, 
        items: [] 
      });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex >= 0) {
      // Check if total quantity exceeds stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          message: `Cannot add ${quantity} more. Only ${product.stock - cart.items[existingItemIndex].quantity} available` 
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    await cart.save();
    
    // Populate product details for response
    const populatedCart = await cart.populate('items.productId');
    
    res.status(200).json({ 
      success: true,
      message: "Product added to cart", 
      cart: populatedCart 
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: "Error adding product to cart", error: error.message });
  }
};

export const getCartItems = async (req, res) => {
  try {
    let cart = await CartModel.findOne({ userId: req.user._id })
      .populate('items.productId');
    
    if (!cart) {
      // Return empty cart if none exists
      return res.status(200).json({ 
        success: true,
        message: "Cart is empty", 
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }
    
    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity);
    }, 0);
    
    res.status(200).json({ 
      success: true,
      message: "Cart items retrieved", 
      items: cart.items,
      totalItems,
      totalPrice
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: "Error retrieving cart items", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    const cart = await CartModel.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { items: { productId: productId } } },
      { returnDocument: 'after'}
    ).populate('items.productId');
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + (item.productId?.price || 0) * item.quantity;
    }, 0);
    
    res.status(200).json({ 
      success: true,
      message: "Product removed from cart", 
      items: cart.items,
      totalItems,
      totalPrice
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: "Error removing product from cart", error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }
    
    // Check product stock
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${product.stock} available` 
      });
    }
    
    const cart = await CartModel.findOneAndUpdate(
      { userId: req.user._id, "items.productId": productId },
      { $set: { "items.$.quantity": quantity } },
      { returnDocument: 'after' }
    ).populate('items.productId');
    
    if (!cart) {
      return res.status(404).json({ message: "Cart or product not found" });
    }
    
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity);
    }, 0);
    
    res.status(200).json({ 
      success: true,
      message: "Cart item updated", 
      items: cart.items,
      totalItems,
      totalPrice
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: "Error updating cart item", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await CartModel.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } },
      { returnDocument: 'after' }
    );
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Cart cleared successfully", 
      items: []
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};