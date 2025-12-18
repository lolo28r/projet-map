const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: {
        type: String,
        enum:
            [
                'poubelle',
                'banc',
                'point de vue',
                'toilettes',
                'fontaine'
            ]
    },
    image: String,
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number }],
    averageRating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Index géospatial
placeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Place', placeSchema);
