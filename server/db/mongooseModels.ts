import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUserDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    phone: { type: String, trim: true }
  },
  { timestamps: true }
);

// Movie Schema
export interface IMovieDoc extends Document {
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  trailerUrl: string;
  genres: string[];
  language: string;
  durationMinutes: number;
  releaseDate: Date;
  status: 'now_showing' | 'coming_soon';
  rating: number;
  certification: string;
  director: string;
  cast: string[];
  formats: string[];
}

export const MovieSchema = new Schema<IMovieDoc>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    poster: { type: String, required: true },
    backdrop: { type: String, required: true },
    trailerUrl: { type: String, required: true },
    genres: [{ type: String, index: true }],
    language: { type: String, required: true, index: true },
    durationMinutes: { type: Number, required: true },
    releaseDate: { type: Date, required: true },
    status: { type: String, enum: ['now_showing', 'coming_soon'], default: 'now_showing', index: true },
    rating: { type: Number, default: 8.5 },
    certification: { type: String, default: 'UA' },
    director: { type: String, required: true },
    cast: [{ type: String }],
    formats: [{ type: String }]
  },
  { timestamps: true }
);

// Cinema Schema
export interface ICinemaDoc extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  contactPhone: string;
  amenities: string[];
}

export const CinemaSchema = new Schema<ICinemaDoc>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    contactPhone: { type: String, required: true },
    amenities: [{ type: String }]
  },
  { timestamps: true }
);

// Screen Schema
export interface IScreenDoc extends Document {
  cinemaId: mongoose.Types.ObjectId;
  screenName: string;
  format: string;
  rows: string[];
  cols: number;
  categories: {
    name: string;
    price: number;
    rows: string[];
  }[];
}

export const ScreenSchema = new Schema<IScreenDoc>(
  {
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
    screenName: { type: String, required: true },
    format: { type: String, default: '2D' },
    rows: [{ type: String }],
    cols: { type: Number, default: 12 },
    categories: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        rows: [{ type: String }]
      }
    ]
  },
  { timestamps: true }
);

// Show Schema
export interface IShowDoc extends Document {
  movieId: mongoose.Types.ObjectId;
  cinemaId: mongoose.Types.ObjectId;
  screenId: mongoose.Types.ObjectId;
  date: string;
  startTime: string;
  format: string;
  language: string;
  pricing: { category: string; price: number }[];
  bookedSeats: string[];
  heldSeats: { seatId: string; userId: string; expiresAt: Date }[];
}

export const ShowSchema = new Schema<IShowDoc>(
  {
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
    screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    format: { type: String, required: true },
    language: { type: String, required: true },
    pricing: [
      {
        category: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    bookedSeats: [{ type: String }],
    heldSeats: [
      {
        seatId: { type: String, required: true },
        userId: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: { expires: '10m' } }
      }
    ]
  },
  { timestamps: true }
);

// Booking Schema
export interface IBookingDoc extends Document {
  referenceCode: string;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  showId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  movieTitle: string;
  moviePoster: string;
  cinemaId: mongoose.Types.ObjectId;
  cinemaName: string;
  screenName: string;
  showDate: string;
  showTime: string;
  seatNumbers: string[];
  seatDetails: { seatId: string; category: string; price: number }[];
  ticketQuantity: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  bookingStatus: 'confirmed' | 'cancelled' | 'pending';
  paymentId?: string;
  paymentMethod?: string;
  qrPayload: string;
}

export const BookingSchema = new Schema<IBookingDoc>(
  {
    referenceCode: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    movieTitle: { type: String, required: true },
    moviePoster: { type: String, required: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    cinemaName: { type: String, required: true },
    screenName: { type: String, required: true },
    showDate: { type: String, required: true },
    showTime: { type: String, required: true },
    seatNumbers: [{ type: String }],
    seatDetails: [
      {
        seatId: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    ticketQuantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'confirmed', index: true },
    paymentId: { type: String },
    paymentMethod: { type: String },
    qrPayload: { type: String, required: true }
  },
  { timestamps: true }
);

// Payment Schema
export interface IPaymentDoc extends Document {
  bookingReference: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  method: string;
  signature?: string;
}

export const PaymentSchema = new Schema<IPaymentDoc>(
  {
    bookingReference: { type: String, required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
    method: { type: String, required: true },
    signature: { type: String }
  },
  { timestamps: true }
);
