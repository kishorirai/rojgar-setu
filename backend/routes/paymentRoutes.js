const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
const transactionController = require('../controllers/transactionController');

const Campus_INTERNAL_SECRET = process.env.CAMPUS_INTERNAL_SECRET;

router.post('/', async (req, res) => {
  console.log('🚀 Payment webhook received:', new Date().toISOString());

  // Verify internal secret for security
  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret !== Campus_INTERNAL_SECRET) {
    console.error('❌ Invalid internal secret');
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Invalid internal secret.' 
    });
  }

  try {
    const {
      correlationId,
      payomatixId,
      status,
      message,
      amount,
      currency,
      customerEmail,
      customerName,
      customerPhone,
      receivedAt
    } = req.body;

    // Validate required fields
    if (!correlationId || !payomatixId || !status || !amount || !currency) {
      console.error('❌ Missing required fields in webhook payload');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in webhook payload'
      });
    }

    console.log(`💰 Payment: ${status} - ${amount} ${currency} for ${customerEmail}`);

    // Store transaction data
    let transaction = null;
    try {
      // Check if transaction already exists
      transaction = await Transaction.findOne({ payomatixId });
      
      if (!transaction) {
        // Create new transaction record
        const transactionData = {
          payomatixId,
          correlationId: mongoose.Types.ObjectId.isValid(correlationId) ? correlationId : null,
          status,
          amount: parseFloat(amount),
          currency,
          customerEmail,
          customerName,
          customerPhone,
          message,
          receivedAt: receivedAt ? new Date(receivedAt) : new Date()
        };
        
        // Only save if we have a valid correlationId
        if (transactionData.correlationId) {
          transaction = new Transaction(transactionData);
          await transaction.save();
          console.log(`✅ Transaction created: ${transaction._id}`);
        } else {
          console.log('⚠️ Skipping transaction save - invalid correlationId');
        }
      } else {
        // Update existing transaction
        transaction.status = status;
        transaction.message = message;
        transaction.failureReason = status === 'failed' || status === 'cancelled' ? message : undefined;
        transaction.processedAt = new Date();
        await transaction.save();
        console.log(`✅ Transaction updated: ${transaction._id}`);
      }
    } catch (transactionError) {
      console.error('❌ Transaction storage error:', transactionError.message);
    }

    // Update student payment status
    let student = null;
    try {
      if (correlationId && mongoose.Types.ObjectId.isValid(correlationId)) {
        student = await Student.findById(correlationId);
        
        if (student) {
          if (status === 'success' || status === 'completed') {
            await Student.findByIdAndUpdate(student._id, {
              payment: {
                status: 'paid',
                amount: amount,
                currency: currency,
                date: new Date(),
                payomatixTransactionId: payomatixId
              }
            });
            console.log(`✅ Student payment updated to PAID: ${student.name}`);
          } else if (status === 'failed' || status === 'cancelled') {
            await Student.findByIdAndUpdate(student._id, {
              payment: {
                status: 'failed',
                failureReason: message
              }
            });
            console.log(`❌ Student payment updated to FAILED: ${student.name}`);
          }
        }
      }
    } catch (dbError) {
      console.error('❌ Student update error:', dbError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment update processed successfully',
      receivedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error processing payment update',
      error: error.message
    });
  }
});

// Transaction management routes
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/:id', transactionController.getTransactionById);
router.get('/transactions/student/:studentId', transactionController.getTransactionsByStudent);
router.get('/transactions/stats/summary', transactionController.getTransactionStats);
router.post('/transactions/:id/retry', transactionController.retryTransaction);
router.get('/transactions/export', transactionController.exportTransactions);

module.exports = router; 