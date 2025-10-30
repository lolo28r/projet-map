const mongoose = require("mongoose");
const placesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['poubelle', 'banc', 'point de vue', 'toilettes', 'fontaine'],
        required: true
    },
    image: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

// Pour faciliter les recherches géographiques
placesSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Place', placesSchema);