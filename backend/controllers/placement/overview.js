const PlacementData = require('../../models/Placement'); 

const getOverview = async (req, res) => {
  try {
    const result = await PlacementData.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          placed: { $sum: { $cond: [{ $eq: ['$roleStatus', 'Placed'] }, 1, 0] } },
          intern: { $sum: { $cond: [{ $eq: ['$roleStatus', 'Intern'] }, 1, 0] } },
          unplaced: { $sum: { $cond: [{ $eq: ['$roleStatus', 'NotPlaced'] }, 1, 0] } },
          averageSalary: { $avg: { $cond: [{ $eq: ['$roleStatus', 'Placed'] }, '$salary', null] } },
          highestSalary: { $max: { $cond: [{ $eq: ['$roleStatus', 'Placed'] }, '$salary', null] } },
          companiesVisited: { $addToSet: '$companyName' },
          offersGenerated: { $sum: { $cond: [{ $in: ['$roleStatus', ['Placed', 'Intern']] }, 1, 0] } },
        },
      },
      {
        $project: {
          totalStudents: 1,
          placed: 1,
          intern: 1,
          unplaced: 1,
          averageSalary: { 
            $cond: [
              { $eq: ['$averageSalary', null] },
              '0 LPA',
              { $concat: [{ $toString: { $round: ['$averageSalary', 1] } }, ' LPA'] }
            ]
          },
          highestSalary: { 
            $cond: [
              { $eq: ['$highestSalary', null] },
              '0 LPA',
              { $concat: [{ $toString: '$highestSalary' }, ' LPA'] }
            ]
          },
          companiesVisited: { $size: '$companiesVisited' },
          offersGenerated: 1,
          _id: 0,
        },
      },
    ]);

    res.json(result[0] || {
      totalStudents: 0,
      placed: 0,
      intern: 0,
      unplaced: 0,
      averageSalary: '0 LPA',
      highestSalary: '0 LPA',
      companiesVisited: 0,
      offersGenerated: 0,
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getOverview;