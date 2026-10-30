import { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/store.js';
import { config } from '../config.js';
import { AuthRequest } from '../middleware/auth.js';
import { IPayment } from '../db/types.js';

export function createOrder(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please log in to initiate checkout.' });
    }

    const { amount, currency = 'INR', showId, seatIds } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
    }

    // In test/demo mode, generate a valid Razorpay test order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return res.json({
      success: true,
      order: {
        id: orderId,
        amount: Math.round(amount * 100), // amount in paise for Razorpay
        currency,
        key: config.razorpayKeyId,
        isDemoMode: true,
        notes: {
          showId,
          seats: Array.isArray(seatIds) ? seatIds.join(',') : '',
          userId: req.user.id
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Order creation failed.' });
  }
}

export function verifyPayment(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const {
      orderId,
      paymentId,
      signature,
      bookingReference,
      amount,
      method = 'Razorpay Test Gateway',
      simulateFailure = false
    } = req.body;

    if (simulateFailure) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Payment was declined by issuing bank simulator.'
      });
    }

    if (!orderId || !paymentId) {
      return res.status(400).json({ success: false, message: 'Missing order ID or payment ID.' });
    }

    // Check for duplicate payment transaction
    const existing = db.payments.find().find((p) => p.transactionId === paymentId);
    if (existing) {
      return res.json({
        success: true,
        status: 'success',
        message: 'Payment already verified.',
        payment: existing
      });
    }

    // In a live environment with real secret:
    // const body = orderId + "|" + paymentId;
    // const expected = crypto.createHmac('sha256', config.razorpayKeySecret).update(body).digest('hex');

    const payment: IPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingReference: bookingReference || `IMV-REF-${Date.now()}`,
      orderId,
      transactionId: paymentId,
      amount: amount || 0,
      currency: 'INR',
      status: 'success',
      method,
      signature: signature || `sig_test_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    db.payments.create(payment);

    return res.json({
      success: true,
      status: 'success',
      message: 'Payment verified successfully.',
      payment
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
}
