const express = require('express');
const router = express.Router();

router.route('/overview').get(require('../controllers/placement/overview'));
router.route('/by-department').get(require('../controllers/placement/by-department'));
router.route('/salary-distribution').get(require('../controllers/placement/salary-distribution'));
router.route('/trend').get(require('../controllers/placement/trend'));
router.route('/top-recruiters').get(require('../controllers/placement/top-recruiters'));
router.route('/offers-by-month').get(require('../controllers/placement/offers-by-month'));

module.exports = router;