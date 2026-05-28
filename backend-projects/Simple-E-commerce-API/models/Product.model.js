import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative']
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String }
      }
    ],
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);