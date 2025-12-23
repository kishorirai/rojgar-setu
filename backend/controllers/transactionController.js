const Transaction = require('../models/Transaction');

// Get all transactions with pagination and filtering
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerEmail, correlationId, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (customerEmail) filter.customerEmail = { $regex: customerEmail, $options: 'i' };
    if (correlationId) filter.correlationId = correlationId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(filter)
      .populate('correlationId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('correlationId', 'name email phone college');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// Get transactions by student
const getTransactionsByStudent = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const transactions = await Transaction.find({ correlationId: req.params.studentId })
      .populate('correlationId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Transaction.countDocuments({ correlationId: req.params.studentId });
    
    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching student transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student transactions',
      error: error.message
    });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const stats = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    const totalTransactions = await Transaction.countDocuments(dateFilter);
    const successfulTransactions = await Transaction.countDocuments({
      ...dateFilter,
      status: { $in: ['success', 'completed'] }
    });
    
    const totalAmount = await Transaction.aggregate([
      { $match: { ...dateFilter, status: { $in: ['success', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Monthly trends
    const monthlyTrends = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      success: true,
      stats: {
        byStatus: stats,
        total: totalTransactions,
        successful: successfulTransactions,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions * 100).toFixed(2) : 0,
        totalAmount: totalAmount[0]?.total || 0,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction statistics',
      error: error.message
    });
  }
};

// Retry failed transaction
const retryTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (!transaction.isFailed()) {
      return res.status(400).json({
        success: false,
        message: 'Only failed transactions can be retried'
      });
    }
    
    // Update retry information
    transaction.retryCount += 1;
    transaction.lastRetryAt = new Date();
    transaction.status = 'pending';
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Transaction retry initiated',
      transaction
    });
  } catch (error) {
    console.error('Error retrying transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrying transaction',
      error: error.message
    });
  }
};

// Export transaction data
const exportTransactions = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, status } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (status) filter.status = status;
    
    const transactions = await Transaction.find(filter)
      .populate('correlationId', 'name email')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = transactions.map(t => ({
        ID: t._id,
        'Payomatix ID': t.payomatixId,
        'Student Name': t.correlationId?.name || 'N/A',
        'Student Email': t.correlationId?.email || 'N/A',
        'Customer Email': t.customerEmail,
        'Customer Name': t.customerName || 'N/A',
        'Amount': t.amount,
        'Currency': t.currency,
        'Status': t.status,
        'Message': t.message || 'N/A',
        'Created At': t.createdAt,
        'Processed At': t.processedAt
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      
      // Simple CSV conversion
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');
      
      return res.send(csv);
    }
    
    res.json({
      success: true,
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting transactions',
      error: error.message
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  getTransactionsByStudent,
  getTransactionStats,
  retryTransaction,
  exportTransactions
}; 