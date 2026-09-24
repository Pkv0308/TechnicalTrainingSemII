const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// GET /api/jobs - Fetch all job listings
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }); // Newest first
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// POST /api/jobs - Create a new job listing
router.post('/', async (req, res) => {
  try {
    const { title, company, location, type, description } = req.body;
    
    const newJob = new Job({ title, company, location, type, description });
    await newJob.save();
    
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating job' });
  }
});

module.exports = router;