const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const mongoose = require('mongoose');

// app.get('/api/company/roles') .....get all roles
// app.get('/api/company/roles/:id') .....get role by ID (optional if used elsewhere)
// (currently implemented in company routes) .....Add POST endpoint for creating a new role
// (currently implemented in company routes) .....Add PUT endpoint for updating a role
// app.put('/api/company/roles/:id') .....put roles by roles Id

router.get('/', async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('companyId', 'name logo profileImage')
      .sort({ createdAt: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid role ID format');
      return res.status(400).json({ error: 'Invalid role ID format' });
    }
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Error deleting role:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;