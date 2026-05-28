import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            nameSnapshot: {
                type: String,
                required: true,
                trim: true
            },
            priceSnapshot: {
                type: Number,
                required: true,
                min: 0
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            subtotal: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    fulfillmentStatus: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum: ["created", "processing", "shipped", "delivered", "cancelled"],
        default: "created"
    },
    razorpayOrderId: {
        type: String,
        unique: true,
        sparse: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true
    },
    razorpaySignature: {
        type: String
    },
    shippingAddress: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            default: "India",
            trim: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        }
    },
    notes: {
        type: String,
        trim: true
    },
    paidAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

export default Order;