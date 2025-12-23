const PlacementData = require('../../models/Placement'); 

const getPlacementByDepartment = async (req, res) => {
  try {
    const result = await PlacementData.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          placed: { $sum: { $cond: [{ $eq: ['$roleStatus', 'Placed'] }, 1, 0] } },
        },
      },
      {
        $project: {
          name: '$_id',
          total: 1,
          placed: 1,
          _id: 0,
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching placement by department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getPlacementByDepartment;