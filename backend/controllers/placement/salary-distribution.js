const PlacementData = require('../../models/Placement'); 

const getSalaryDistribution = async (req, res) => {
  try {
    const result = await PlacementData.aggregate([
      { $match: { roleStatus: 'Placed' } },
      {
        $bucket: {
          groupBy: '$salary',
          boundaries: [3, 5, 8, 12, 16, 20, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 3] }, then: '3-5 LPA' },
                { case: { $eq: ['$_id', 5] }, then: '5-8 LPA' },
                { case: { $eq: ['$_id', 8] }, then: '8-12 LPA' },
                { case: { $eq: ['$_id', 12] }, then: '12-16 LPA' },
                { case: { $eq: ['$_id', 16] }, then: '16-20 LPA' },
                { case: { $eq: ['$_id', Infinity] }, then: '>20 LPA' },
              ],
              default: 'Other',
            },
          },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { range: 1 } },
    ]);

    // Ensure all ranges are included, even with zero counts
    const ranges = ['3-5 LPA', '5-8 LPA', '8-12 LPA', '12-16 LPA', '16-20 LPA', '>20 LPA'];
    const fullResult = ranges.map(range => ({
      range,
      count: (result.find(r => r.range === range) || { count: 0 }).count,
    }));

    res.json(fullResult);
  } catch (error) {
    console.error('Error fetching salary distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getSalaryDistribution;