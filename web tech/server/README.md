# EventFlow Backend API

RESTful API for EventFlow Event Management System built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Event Management**: CRUD operations for events with advanced filtering
- **Booking System**: Complete booking lifecycle management
- **User Management**: User profiles and admin controls
- **Security**: Helmet, rate limiting, CORS, password hashing
- **Validation**: Input validation and error handling
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/eventflow
   JWT_SECRET=your-super-secret-jwt-key
   ADMIN_EMAIL=admin@eventflow.com
   ADMIN_PASSWORD=admin123
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env with your Atlas connection string
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be running at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+977-9800000000"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@eventflow.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@eventflow.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+977-9800000001"
}
```

### Event Endpoints

#### Get All Events
```http
GET /api/events?search=tech&category=Conference&page=1&limit=20
```

Query Parameters:
- `search`: Search in title, description, location
- `category`: Filter by category
- `location`: Filter by location
- `date`: Filter by date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Get Single Event
```http
GET /api/events/:id
```

#### Create Event (Admin Only)
```http
POST /api/events
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Tech Conference 2025",
  "description": "Amazing tech event",
  "category": "Conference",
  "date": "2025-03-15",
  "time": "09:00 AM",
  "venue": "Convention Center",
  "location": "Kathmandu, Nepal",
  "capacity": 500,
  "price": 2500,
  "image": "https://example.com/image.jpg",
  "organizer": {
    "name": "Tech Events",
    "email": "info@techevents.com",
    "phone": "+977-9800000000"
  },
  "tags": ["Technology", "Innovation"]
}
```

#### Update Event
```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "capacity": 600
}
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

#### Get My Events
```http
GET /api/events/my/events
Authorization: Bearer <token>
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event_id_here",
  "numberOfTickets": 2,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userPhone": "+977-9800000000",
  "notes": "Special requirements"
}
```

#### Get My Bookings
```http
GET /api/bookings/my
Authorization: Bearer <token>
```

#### Get All Bookings (Admin Only)
```http
GET /api/bookings
Authorization: Bearer <admin-token>
```

#### Get Event Bookings
```http
GET /api/bookings/event/:eventId
Authorization: Bearer <token>
```

#### Cancel Booking
```http
PUT /api/bookings/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Cannot attend"
}
```

#### Get Booking Statistics (Admin Only)
```http
GET /api/bookings/stats
Authorization: Bearer <admin-token>
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token from the login/register response and include it in subsequent requests.

## 👥 User Roles

- **User**: Can view events, create bookings, manage own bookings
- **Admin**: Full access to all resources, can create/edit/delete events, view all bookings

## 📊 Database Models

### User
- name, email, password (hashed)
- role (user/admin)
- phone, avatar
- timestamps

### Event
- title, description, category
- date, time, venue, location
- capacity, price, image
- organizer details
- tags, agenda, speakers
- requirements, amenities
- cancellation policy
- createdBy (User reference)
- status, timestamps

### Booking
- event (Event reference)
- user (User reference)
- userName, userEmail, userPhone
- numberOfTickets, totalAmount
- status (confirmed/cancelled/pending)
- bookingReference (unique)
- timestamps

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- CORS configuration
- Input validation
- Error handling

## 📝 Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## 🧪 Testing

Test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL
- Your frontend application

## 📦 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── eventController.js   # Event logic
│   └── bookingController.js # Booking logic
├── middleware/
│   ├── auth.js              # JWT verification
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Event.js             # Event schema
│   └── Booking.js           # Booking schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── events.js            # Event routes
│   └── bookings.js          # Booking routes
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── seed.js                  # Database seeder
├── server.js                # Entry point
└── README.md
```

## 🚀 Deployment

### Heroku
```bash
heroku create eventflow-api
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

### Railway
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### DigitalOcean/AWS
1. Setup Node.js environment
2. Install dependencies
3. Configure environment variables
4. Use PM2 for process management
5. Setup nginx as reverse proxy

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
