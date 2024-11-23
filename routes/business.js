const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// Create a new business
router.post('/business', async (req, res) => {
  try {
      const { b_name, description, coordinates, category } = req.body;

      // Validate request data
      if (!b_name || !description || !coordinates || !category) {
          return res.status(400).json({ error: 'All fields are required!' });
      }

      // Create a new business
      const newBusiness = new Business({ b_name, description, coordinates, category });
      const savedBusiness = await newBusiness.save();

      res.status(201).json(savedBusiness); // Respond with the saved business
  } catch (error) {
      console.error('Error saving business:', error);
      res.status(500).json({ error: 'Internal server error.' });
  }
});


// Read the businesses
router.get('/businesses', async (req, res) => {
  try {
      const { category } = req.query;
      const filter = category ? { category } : {}; // Filter by category if provided
      const businesses = await Business.find(filter);
      res.json(businesses);
  } catch (error) {
      console.error('Error fetching businesses:', error);
      res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/reviews/:businessId', async (req, res) => {
  try {
      const { businessId } = req.params;

      const business = await Business.findById(businessId);
      if (!business) {
          return res.status(404).json({ message: "Business not found." });
      }

      res.status(200).json(business.reviews);
  } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "An error occurred while fetching reviews." });
  }
});



// POST: Add a review for a specific business
router.post('/businesses/:businessId/reviews', async (req, res) => {
  const { businessId } = req.params;
  const { reviewText, starRating } = req.body;
  console.log(req.body)

  if (!reviewText || !starRating) {
      return res.status(400).json({ message: 'Review text and star rating are required.' });
  }


  try {
      // Find the business by ID
      const business = await Business.findById(businessId);
      if (!business) {
          return res.status(404).json({ message: 'Business not found.' });
      }

      // Add the review to the business's reviews array
      business.reviews.push({ reviewText, starRating });

      // Save changes
      await business.save();

      res.status(201).json({ message: 'Review added successfully.' });
  } catch (error) {
      console.error('Error adding review:', error.message);
      res.status(500).json({ message: 'Failed to add review.', error: error.message });
  }
});







// Update a business
router.put('/business/:id', async (req, res) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedBusiness);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a business
router.delete('/business/:id', async (req, res) => {
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
