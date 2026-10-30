export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
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
  rating: number;
  certification: string;
  director: string;
  cast: string[];
  formats: string[];
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
  rows: string[];
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

export interface IShow {
  id: string;
  movieId: string;
  cinemaId: string;
  screenId: string;
  date: string;
  startTime: string;
  format: string;
  language: string;
  cinemaName?: string;
  cinemaCity?: string;
  screenName?: string;
  movieTitle?: string;
  pricing: { category: string; price: number }[];
  bookedSeats: string[];
  heldSeats?: { seatId: string; userId: string; expiresAt: number }[];
}

export interface ISeat {
  seatId: string;
  row: string;
  number: number;
  category: string;
  price: number;
  status: 'available' | 'selected' | 'booked' | 'held';
  heldByMe?: boolean;
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

export interface IAdminStats {
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  moviesCount: number;
  cinemasCount: number;
  showsCount: number;
  usersCount: number;
  recentBookings: IBooking[];
}
