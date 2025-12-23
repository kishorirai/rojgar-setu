const PlacementData = require('../../models/Placement'); 

const getPlacementTrend = async (req, res) => {
  try {
    const result = await PlacementData.aggregate([
      {
        $group: {
          _id: '$year',
          total: { $sum: 1 },
          placed: { $sum: { $cond: [{ $eq: ['$roleStatus', 'Placed'] }, 1, 0] } },
        },
      },
      {
        $project: {
          year: '$_id',
          placement: { $round: [{ $multiply: [{ $divide: ['$placed', '$total'] }, 100] }, 0] },
          _id: 0,
        },
      },
      { $sort: { year: 1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching placement trend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getPlacementTrend;