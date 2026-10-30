export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMovie {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  trailerUrl: string;
  genres: string[];
  language: string;
  durationMinutes: number;
  releaseDate: string;
  status: 'now_showing' | 'coming_soon';
  rating: number; // e.g. 8.9
  certification: string; // e.g. "UA", "A", "PG-13"
  director: string;
  cast: string[];
  formats: string[]; // ["IMAX 3D", "2D", "4DX", "Dolby Atmos"]
}

export interface ICinema {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactPhone: string;
  amenities: string[];
}

export interface ISeatCategory {
  name: 'Standard' | 'Premium' | 'Recliner';
  price: number;
  rows: string[]; // e.g. ["A"], ["B", "C", "D"], ["E", "F", "G", "H"]
}

export interface IScreen {
  id: string;
  cinemaId: string;
  screenName: string;
  format: string;
  rows: string[];
  cols: number;
  categories: ISeatCategory[];
}

export interface IHeldSeat {
  seatId: string;
  userId: string;
  expiresAt: number; // timestamp in ms
}

export interface IShow {
  id: string;
  movieId: string;
  cinemaId: string;
  screenId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "10:30 AM", "02:15 PM"
  format: string;
  language: string;
  pricing: { category: string; price: number }[];
  bookedSeats: string[]; // ["A1", "A2"]
  heldSeats: IHeldSeat[];
}

export interface IBooking {
  id: string;
  referenceCode: string;
  userId: string;
  userEmail: string;
  userName: string;
  showId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  cinemaId: string;
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
  createdAt: string;
}

export interface IPayment {
  id: string;
  bookingReference: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  method: string;
  signature?: string;
  createdAt: string;
}
