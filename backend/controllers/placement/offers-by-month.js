const PlacementData = require('../../models/Placement'); 

const getOffersByMonth = async (req, res) => {
  try {
    const result = await PlacementData.aggregate([
      { $match: { roleStatus: { $in: ['Placed', 'Intern'] } } },
      {
        $group: {
          _id: { $month: '$offerDate' },
          offers: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $arrayElemAt: [
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              { $subtract: ['$_id', 1] },
            ],
          },
          offers: 1,
          _id: 0,
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Ensure all months (Jul to Jun) are included, even with zero offers
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const fullResult = months.map(month => ({
      month,
      offers: (result.find(r => r.month === month) || { offers: 0 }).offers,
    }));

    res.json(fullResult);
  } catch (error) {
    console.error('Error fetching offers by month:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getOffersByMonth;