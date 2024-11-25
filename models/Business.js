const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewText: { type: String, required: true },
    starRating: { type: Number, required: true },
    sentiment: { 
        type: Object, 
        default: null 
    },
    timestamp: { type: Date, default: Date.now },
});


const businessSchema = new mongoose.Schema({
    b_name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    reviews: [reviewSchema], // Embed reviews as an array
});

module.exports = mongoose.model('Business', businessSchema);
