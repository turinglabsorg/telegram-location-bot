import mongoose from 'mongoose'

export const reportSchema = new mongoose.Schema({
    photo: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    timestamp: Number,
    approved: Boolean,
    evalued: Boolean
});

export const adminSchema = new mongoose.Schema({
    username: String,
    approved: Boolean,
    chatId: String
});