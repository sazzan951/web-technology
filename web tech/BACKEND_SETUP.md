# EventFlow Backend Setup Guide

Complete guide to set up and run the EventFlow backend API.

## 🎯 Quick Start

### 1. Install MongoDB

**Windows:**
- Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Run the installer
- MongoDB will start automatically as a service

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Or use MongoDB Atlas (Cloud - Recommended for beginners):**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Use it in your `.env` file

### 2. Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Configure Environment

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventflow
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_EMAIL=admin@eventflow.com
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflow?retryWrites=true&w=majority
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

This creates:
- Admin user: `admin@eventflow.com` / `admin123`
- 2 test users
- 3 sample events
- 2 sample bookings

### 5. Start Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server runs at: `http://localhost:5000`

## 🧪 Test the API

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventflow.com","password":"admin123"}'
```

**Get Events:**
```bash
curl http://localhost:5000/api/events
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API collection (create requests manually)
3. Test each endpoint

## 🔗 Connect Frontend to Backend

### Update Frontend API Configuration

Create `js/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API helper function
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

// Auth API
const authAPI = {
  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  getMe: () => apiRequest('/auth/me')
};

// Events API
const eventsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/events?${query}`);
  },
  
  getOne: (id) => apiRequest(`/events/${id}`),
  
  create: (eventData) =>
    apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    }),
  
  update: (id, eventData) =>
    apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    }),
  
  delete: (id) =>
    apiRequest(`/events/${id}`, { method: 'DELETE' })
};

// Bookings API
const bookingsAPI = {
  create: (bookingData) =>
    apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }),
  
  getMy: () => apiRequest('/bookings/my'),
  
  cancel: (id, reason) =>
    apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    })
};
```

### Update HTML Files

Add before closing `</body>` tag:

```html
<script src="js/api.js"></script>
```

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Check if MongoDB is running: `mongod --version`
- Start MongoDB service
- Verify connection string in `.env`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

### JWT Secret Error

**Error:** `secretOrPrivateKey must have a value`

**Solution:**
- Ensure `JWT_SECRET` is set in `.env`
- Generate a strong secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### CORS Error

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- For development, use `CORS_ORIGIN=*` (not recommended for production)

## 📊 Database Management

### View Database

**Using MongoDB Compass (GUI):**
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse `eventflow` database

**Using MongoDB Shell:**
```bash
mongosh
use eventflow
db.users.find()
db.events.find()
db.bookings.find()
```

### Reset Database

```bash
# Drop database
mongosh eventflow --eval "db.dropDatabase()"

# Re-seed
npm run seed
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://yourdomain.com
```

### Security Checklist

- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set proper CORS_ORIGIN
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable MongoDB authentication

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

## 💡 Tips

1. **Use nodemon for development** - Auto-restarts server on file changes
2. **Test with Postman** - Save requests in collections
3. **Check server logs** - Helpful for debugging
4. **Use MongoDB Atlas** - Free tier, no local setup needed
5. **Keep .env secure** - Never commit to git

## 🎓 Next Steps

1. Test all API endpoints
2. Connect frontend to backend
3. Replace localStorage with API calls
4. Add error handling in frontend
5. Implement loading states
6. Add authentication persistence

Need help? Check the server logs or open an issue!
