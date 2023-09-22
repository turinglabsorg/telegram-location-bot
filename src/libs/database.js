import mongoose from 'mongoose'

export const reportSchema = new mongoose.Schema({
    photo: String,
    from: Number,
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
    evalued: Boolean,
    source: String
});

export const adminSchema = new mongoose.Schema({
    username: String,
    approved: Boolean,
    whatsapp_phone_number: Number,
    whatsapp_user: Number,
    chatId: String
});