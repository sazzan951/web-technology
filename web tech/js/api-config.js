// EventFlow API Configuration
// Toggle between localStorage (frontend-only) and backend API

const API_CONFIG = {
  // Set to true to use backend API, false for localStorage
  USE_BACKEND: false,
  
  // Backend API URL
  API_BASE_URL: 'http://localhost:5000/api',
  
  // Token storage key
  TOKEN_KEY: 'eventflow_token'
};

// Get authentication token
function getAuthToken() {
  return localStorage.getItem(API_CONFIG.TOKEN_KEY);
}

// Set authentication token
function setAuthToken(token) {
  localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
}

// Remove authentication token
function removeAuthToken() {
  localStorage.removeItem(API_CONFIG.TOKEN_KEY);
}

// Generic API request handler
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== AUTH API ====================

const AuthAPI = {
  // Login user
  async login(email, password) {
    if (!API_CONFIG.USE_BACKEND) {
      // Use existing localStorage login
      return loginUser(email, password);
    }
    
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
      setAuthToken(response.data.token);
      setCurrentUser(response.data.user);
    }
    
    return response;
  },
  
  // Register user
  async register(userData) {
    if (!API_CONFIG.USE_BACKEND) {
      // Use existing localStorage registration
      return registerUser(userData);
    }
    
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success) {
      setAuthToken(response.data.token);
      setCurrentUser(response.data.user);
    }
    
    return response;
  },
  
  // Get current user
  async getMe() {
    if (!API_CONFIG.USE_BACKEND) {
      return getCurrentUser();
    }
    
    const response = await apiRequest('/auth/me');
    return response.data;
  },
  
  // Update profile
  async updateProfile(profileData) {
    if (!API_CONFIG.USE_BACKEND) {
      // Use existing localStorage update
      const user = getCurrentUser();
      const updatedUser = { ...user, ...profileData };
      setCurrentUser(updatedUser);
      return updatedUser;
    }
    
    const response = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    return response.data;
  },
  
  // Logout
  logout() {
    removeAuthToken();
    logoutUser();
  }
};

// ==================== EVENTS API ====================

const EventsAPI = {
  // Get all events
  async getAll(filters = {}) {
    if (!API_CONFIG.USE_BACKEND) {
      // Use existing localStorage events
      let events = getEvents();
      
      // Apply filters
      if (filters.search) {
        const search = filters.search.toLowerCase();
        events = events.filter(e => 
          e.title.toLowerCase().includes(search) ||
          e.description.toLowerCase().includes(search) ||
          e.location.toLowerCase().includes(search)
        );
      }
      
      if (filters.category) {
        events = events.filter(e => e.category === filters.category);
      }
      
      if (filters.location) {
        events = events.filter(e => 
          e.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      return events;
    }
    
    const query = new URLSearchParams(filters).toString();
    const response = await apiRequest(`/events?${query}`);
    return response.data;
  },
  
  // Get single event
  async getOne(id) {
    if (!API_CONFIG.USE_BACKEND) {
      return getEvents().find(e => e.id === id);
    }
    
    const response = await apiRequest(`/events/${id}`);
    return response.data;
  },
  
  // Create event
  async create(eventData) {
    if (!API_CONFIG.USE_BACKEND) {
      return addEvent(eventData);
    }
    
    const response = await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    
    return response.data;
  },
  
  // Update event
  async update(id, eventData) {
    if (!API_CONFIG.USE_BACKEND) {
      return updateEvent(id, eventData);
    }
    
    const response = await apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
    
    return response.data;
  },
  
  // Delete event
  async delete(id) {
    if (!API_CONFIG.USE_BACKEND) {
      return deleteEvent(id);
    }
    
    await apiRequest(`/events/${id}`, {
      method: 'DELETE'
    });
    
    return true;
  },
  
  // Get my events
  async getMyEvents() {
    if (!API_CONFIG.USE_BACKEND) {
      const user = getCurrentUser();
      return getEvents().filter(e => e.createdBy === user.id);
    }
    
    const response = await apiRequest('/events/my/events');
    return response.data;
  }
};

// ==================== BOOKINGS API ====================

const BookingsAPI = {
  // Create booking
  async create(bookingData) {
    if (!API_CONFIG.USE_BACKEND) {
      const user = getCurrentUser();
      return addBooking(bookingData.eventId, user.id, bookingData);
    }
    
    const response = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
    
    return response.data;
  },
  
  // Get my bookings
  async getMy() {
    if (!API_CONFIG.USE_BACKEND) {
      const user = getCurrentUser();
      return getBookingsByUser(user.id);
    }
    
    const response = await apiRequest('/bookings/my');
    return response.data;
  },
  
  // Get all bookings (admin)
  async getAll() {
    if (!API_CONFIG.USE_BACKEND) {
      return getAllBookingsWithDetails();
    }
    
    const response = await apiRequest('/bookings');
    return response.data;
  },
  
  // Get event bookings
  async getEventBookings(eventId) {
    if (!API_CONFIG.USE_BACKEND) {
      return getBookingsByEvent(eventId);
    }
    
    const response = await apiRequest(`/bookings/event/${eventId}`);
    return response.data;
  },
  
  // Cancel booking
  async cancel(bookingId, reason = '') {
    if (!API_CONFIG.USE_BACKEND) {
      return cancelBooking(bookingId);
    }
    
    const response = await apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
    
    return response.data;
  },
  
  // Get booking statistics (admin)
  async getStats() {
    if (!API_CONFIG.USE_BACKEND) {
      const bookings = getBookings();
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
      
      return {
        totalBookings: confirmedBookings.length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        totalTickets: confirmedBookings.reduce((sum, b) => sum + (b.numberOfTickets || 1), 0)
      };
    }
    
    const response = await apiRequest('/bookings/stats');
    return response.data;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, AuthAPI, EventsAPI, BookingsAPI };
}
