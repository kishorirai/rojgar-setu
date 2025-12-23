const express = require('express');
const router = express.Router();
const { getSettings, saveSettings } = require('../../controllers/admin/platformSettingsController');

router.get('/platform-settings', getSettings);
router.post('/platform-settings', saveSettings);

module.exports = router;