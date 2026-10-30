const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('imovies_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.getItem('imovies_token');
    localStorage.setItem('imovies_token', token);
  } else {
    localStorage.removeItem('imovies_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    me: () => request<{ success: boolean; user: any }>('/auth/me'),
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: any; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (userData: { name: string; email: string; password: string; phone?: string }) =>
      request<{ success: boolean; token: string; user: any; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    logout: () =>
      request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST'
      }),
    updateProfile: (profile: { name?: string; phone?: string }) =>
      request<{ success: boolean; user: any; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      })
  },
  movies: {
    getAll: (params?: { search?: string; genre?: string; language?: string; status?: string; format?: string }) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v && v !== 'All') query.append(k, v);
        });
      }
      return request<{ success: boolean; count: number; movies: any[] }>(`/movies?${query.toString()}`);
    },
    getById: (id: string) =>
      request<{ success: boolean; movie: any; availableCinemas: any[]; availableDates: string[] }>(`/movies/${id}`),
    getFeaturedHero: () => request<{ success: boolean; movie: any }>('/movies/featured/hero')
  },
  cinemas: {
    getAll: (city?: string) => {
      const query = city && city !== 'All' ? `?city=${encodeURIComponent(city)}` : '';
      return request<{ success: boolean; count: number; cinemas: any[]; cities: string[] }>(`/cinemas${query}`);
    },
    getById: (id: string) => request<{ success: boolean; cinema: any; screens: any[] }>(`/cinemas/${id}`)
  },
  shows: {
    getAll: (params?: { movieId?: string; cinemaId?: string; date?: string }) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) query.append(k, v);
        });
      }
      return request<{ success: boolean; count: number; shows: any[] }>(`/shows?${query.toString()}`);
    },
    getById: (id: string) =>
      request<{
        success: boolean;
        show: any;
        movie: any;
        cinema: any;
        screen: any;
        seats: any[];
      }>(`/shows/${id}`)
  },
  bookings: {
    hold: (showId: string, seatIds: string[]) =>
      request<{ success: boolean; message: string; expiresAt: number }>('/bookings/hold', {
        method: 'POST',
        body: JSON.stringify({ showId, seatIds })
      }),
    release: (showId: string, seatIds: string[]) =>
      request<{ success: boolean; message: string }>('/bookings/release', {
        method: 'POST',
        body: JSON.stringify({ showId, seatIds })
      }),
    confirm: (payload: { showId: string; seatIds: string[]; paymentId?: string; paymentMethod?: string }) =>
      request<{ success: boolean; message: string; booking: any }>('/bookings/confirm', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getMyBookings: () => request<{ success: boolean; count: number; bookings: any[] }>('/bookings/my-bookings'),
    getById: (id: string) => request<{ success: boolean; booking: any }>(`/bookings/${id}`),
    verifyReference: (ref: string) => request<{ success: boolean; valid: boolean; booking: any; message?: string }>(`/bookings/verify/${ref}`)
  },
  payments: {
    createOrder: (payload: { amount: number; currency?: string; showId: string; seatIds: string[] }) =>
      request<{ success: boolean; order: any }>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    verify: (payload: {
      orderId: string;
      paymentId: string;
      signature?: string;
      bookingReference?: string;
      amount: number;
      method?: string;
      simulateFailure?: boolean;
    }) =>
      request<{ success: boolean; status: string; message: string; payment?: any }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },
  admin: {
    getStats: () => request<{ success: boolean; stats: any }>('/admin/stats'),
    createMovie: (data: any) =>
      request<{ success: boolean; movie: any; message: string }>('/admin/movies', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateMovie: (id: string, data: any) =>
      request<{ success: boolean; movie: any; message: string }>(`/admin/movies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    deleteMovie: (id: string) =>
      request<{ success: boolean; message: string }>(`/admin/movies/${id}`, {
        method: 'DELETE'
      }),
    createShow: (data: any) =>
      request<{ success: boolean; show: any; message: string }>('/admin/shows', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getAllBookings: (search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<{ success: boolean; count: number; bookings: any[] }>(`/admin/bookings${q}`);
    },
    resetDb: () =>
      request<{ success: boolean; message: string }>('/admin/reset', {
        method: 'POST'
      })
  }
};
