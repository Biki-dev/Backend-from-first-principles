import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
    {
        urlshort: {
            type: String,
            required: true
        },
        shortrendom: {
            type: String,
            required: true
        },
        urllong: {
            type: String,
            required: true,
        },
        traffic: {
            type: Number,
            required: true,
            default: 0
        },
    },
    { timestamps: true }
);

export default mongoose.model('Url', urlSchema);
