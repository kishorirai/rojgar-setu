const PlacementData = require('../../models/Placement'); 
const getTopRecruiters = async (req, res) => {
  try {
    const result = await PlacementData.aggregate([
      { $match: { roleStatus: { $in: ['Placed', 'Intern'] } } },
      {
        $group: {
          _id: '$companyName',
          offers: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          offers: 1,
          _id: 0,
        },
      },
      { $sort: { offers: -1 } },
      { $limit: 5 },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching top recruiters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getTopRecruiters;