const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// List jobs (with search/filter/pagination)
router.get('/my', jobController.listJobs);

// Get job details
router.get('/:id', jobController.getJobDetails);

// Job application endpoint -- expects JSON, not multipart/form-data
router.post('/:jobId/apply', jobController.applyToJob);

module.exports = router;