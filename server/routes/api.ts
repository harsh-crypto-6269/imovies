import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as movieController from '../controllers/movieController.js';
import * as cinemaController from '../controllers/cinemaController.js';
import * as showController from '../controllers/showController.js';
import * as bookingController from '../controllers/bookingController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as adminController from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Auth Endpoints
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.getCurrentUser);
router.put('/auth/profile', requireAuth, authController.updateProfile);

// Movies
router.get('/movies', movieController.getMovies);
router.get('/movies/featured/hero', movieController.getFeaturedHero);
router.get('/movies/:id', movieController.getMovieById);

// Cinemas
router.get('/cinemas', cinemaController.getCinemas);
router.get('/cinemas/:id', cinemaController.getCinemaById);

// Shows & Seats
router.get('/shows', showController.getShows);
router.get('/shows/:id', showController.getShowById);
router.get('/shows/:id/seats', showController.getShowById);

// Bookings
router.post('/bookings/hold', requireAuth, bookingController.holdSeats);
router.post('/bookings/release', requireAuth, bookingController.releaseSeats);
router.post('/bookings/confirm', requireAuth, bookingController.confirmBooking);
router.get('/bookings/my-bookings', requireAuth, bookingController.getMyBookings);
router.get('/bookings/:id', requireAuth, bookingController.getBookingById);
router.get('/bookings/verify/:ref', bookingController.verifyTicketReference);

// Payments
router.post('/payments/create-order', requireAuth, paymentController.createOrder);
router.post('/payments/verify', requireAuth, paymentController.verifyPayment);

// Admin Endpoints
router.get('/admin/stats', requireAuth, requireAdmin, adminController.getAdminStats);
router.post('/admin/movies', requireAuth, requireAdmin, adminController.createMovie);
router.put('/admin/movies/:id', requireAuth, requireAdmin, adminController.updateMovie);
router.delete('/admin/movies/:id', requireAuth, requireAdmin, adminController.deleteMovie);
router.post('/admin/shows', requireAuth, requireAdmin, adminController.createShow);
router.get('/admin/bookings', requireAuth, requireAdmin, adminController.getAllBookings);
router.post('/admin/reset', requireAuth, requireAdmin, adminController.resetDatabase);

export default router;
