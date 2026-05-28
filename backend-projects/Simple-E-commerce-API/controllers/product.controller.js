import Product from "../models/Product.model.js";

const productcontroller = {
  createProduct: async (req, res) => {
    try {
      const { name, description, price, stock, category } = req.body;
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const newProduct = new Product({
        name,
        slug,
        description,
        price,
        stock,
        category,
        createdBy: req.user._id
      });
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: 'Error creating product', error: error.message });
    }
  },
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find().populate('createdBy', 'name email');
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate('createdBy', 'name email');
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { name, description, price, stock, category } = req.body;
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { name, slug, description, price, stock, category },
        { returnDocument: 'after' }
      );
      if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Error updating product', error: error.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
  }
};

export default productcontroller;