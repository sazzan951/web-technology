# EventFlow Backend - Features & Architecture

Complete overview of the backend implementation.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                   │
│  HTML + CSS + JavaScript (Vanilla) + API Integration    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │ JWT Authentication
┌────────────────────▼────────────────────────────────────┐
│                   Express.js Server                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                 │  │
│  │  • CORS • Helmet • Rate Limiting • Auth          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes Layer                                     │  │
│  │  /api/auth  /api/events  /api/bookings          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Controllers Layer                                │  │
│  │  Business Logic & Validation                     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Models Layer (Mongoose)                         │  │
│  │  User • Event • Booking                          │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────────────┐
│                   MongoDB Database                       │
│  Collections: users, events, bookings                   │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Security Features

### 1. Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: User and Admin roles
- **Token Expiry**: 30-day expiration
- **Protected Routes**: Middleware verification

### 2. Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Express-validator
- **Error Handling**: Centralized error management

### 3. Data Protection
- **Password Never Exposed**: Excluded from responses
- **Soft Deletes**: Data preservation
- **Validation**: Schema-level and route-level
- **Sanitization**: Input cleaning

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required, max 100 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6 chars),
  role: String (enum: ['user', 'admin'], default: 'user'),
  phone: String,
  avatar: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- email (unique)

**Methods:**
- `comparePassword(candidatePassword)`: Verify password
- `toJSON()`: Remove password from response

### Event Model
```javascript
{
  title: String (required, max 200 chars),
  description: String (required, max 5000 chars),
  category: String (enum: Conference, Workshop, etc.),
  date: Date (required),
  time: String (required),
  venue: String (required),
  location: String (required),
  capacity: Number (required, min 1),
  price: Number (default: 0, min 0),
  image: String (default: placeholder),
  organizer: {
    name: String,
    email: String,
    phone: String,
    website: String
  },
  tags: [String],
  agenda: [{
    time: String,
    title: String,
    description: String
  }],
  speakers: [{
    name: String,
    title: String,
    bio: String
  }],
  requirements: [String],
  amenities: [String],
  cancellationPolicy: String,
  contactInfo: {
    email: String,
    phone: String
  },
  createdBy: ObjectId (ref: User, required),
  status: String (enum: draft, published, cancelled, completed),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Text index on: title, description, location
- Compound index: date, category

**Virtuals:**
- `availableSpots`: capacity - bookedTickets

### Booking Model
```javascript
{
  event: ObjectId (ref: Event, required),
  user: ObjectId (ref: User, required),
  userName: String (required),
  userEmail: String (required),
  userPhone: String (required),
  numberOfTickets: Number (required, min 1),
  totalAmount: Number (required, min 0),
  status: String (enum: confirmed, cancelled, pending),
  bookingReference: String (unique, auto-generated),
  notes: String (max 500 chars),
  cancelledAt: Date,
  cancellationReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- user + status
- event + status
- bookingReference (unique)

**Pre-save Hook:**
- Auto-generate booking reference: `BK{timestamp}{random}`

## 🛣️ API Routes

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user |
| PUT | `/profile` | Private | Update profile |

### Event Routes (`/api/events`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all events (with filters) |
| GET | `/:id` | Public | Get single event |
| GET | `/my/events` | Private | Get my events |
| POST | `/` | Admin | Create event |
| PUT | `/:id` | Private | Update event |
| DELETE | `/:id` | Private | Delete event |

**Query Parameters for GET /:**
- `search`: Text search
- `category`: Filter by category
- `location`: Filter by location
- `date`: Filter by date
- `page`: Pagination
- `limit`: Items per page

### Booking Routes (`/api/bookings`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Create booking |
| GET | `/my` | Private | Get my bookings |
| GET | `/` | Admin | Get all bookings |
| GET | `/event/:eventId` | Private | Get event bookings |
| GET | `/stats` | Admin | Get statistics |
| PUT | `/:id/cancel` | Private | Cancel booking |

## 🔄 Request/Response Flow

### Example: Create Booking

**1. Client Request:**
```javascript
POST /api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "eventId": "65abc123...",
  "numberOfTickets": 2,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userPhone": "+977-9800000000"
}
```

**2. Middleware Processing:**
- CORS check
- Rate limit check
- JWT verification
- User extraction

**3. Controller Logic:**
- Validate input
- Check event exists
- Check capacity
- Calculate total amount
- Create booking
- Generate reference

**4. Database Operation:**
- Insert booking document
- Populate event details

**5. Server Response:**
```javascript
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "65def456...",
    "event": {
      "title": "Tech Conference 2025",
      "date": "2025-03-15",
      ...
    },
    "bookingReference": "BK1234567890ABCDE",
    "numberOfTickets": 2,
    "totalAmount": 5000,
    "status": "confirmed",
    "createdAt": "2025-02-08T..."
  }
}
```

## 🎯 Key Features

### 1. Advanced Filtering
```javascript
// Search events
GET /api/events?search=tech&category=Conference&location=Kathmandu

// Pagination
GET /api/events?page=2&limit=10

// Date filtering
GET /api/events?date=2025-03-15
```

### 2. Capacity Management
- Real-time capacity checking
- Prevents overbooking
- Calculates available spots
- Booking validation

### 3. Booking System
- Unique booking references
- Status tracking (confirmed/cancelled/pending)
- Cancellation with reason
- Revenue calculation
- Ticket counting

### 4. Statistics & Analytics
```javascript
GET /api/bookings/stats

Response:
{
  "totalBookings": 150,
  "cancelledBookings": 5,
  "totalRevenue": 375000,
  "totalTickets": 300
}
```

### 5. Role-Based Access Control
```javascript
// Admin only routes
POST /api/events (create event)
GET /api/bookings (all bookings)
GET /api/bookings/stats

// User routes
GET /api/bookings/my (own bookings)
POST /api/bookings (create booking)

// Public routes
GET /api/events (view events)
GET /api/events/:id (view event details)
```

## 🔧 Middleware Stack

### 1. Security Middleware
```javascript
helmet()                    // Security headers
cors()                      // CORS configuration
rateLimit()                 // Rate limiting
```

### 2. Parsing Middleware
```javascript
express.json()              // JSON body parser
express.urlencoded()        // URL-encoded parser
```

### 3. Custom Middleware
```javascript
protect                     // JWT verification
adminOnly                   // Admin access check
errorHandler                // Error handling
```

## 📈 Performance Optimizations

### 1. Database Indexes
- Text search index on events
- Compound indexes for common queries
- Unique indexes for constraints

### 2. Query Optimization
- Selective field population
- Pagination support
- Efficient filtering

### 3. Caching Strategy
- JWT token caching (client-side)
- Static asset caching
- API response caching (future)

## 🧪 Testing Strategy

### Manual Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventflow.com","password":"admin123"}'

# Get events
curl http://localhost:5000/api/events
```

### Automated Testing (Future)
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Cypress

## 🚀 Deployment Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use production MongoDB URI
- [ ] Enable HTTPS
- [ ] Configure proper CORS
- [ ] Set NODE_ENV=production
- [ ] Enable MongoDB authentication
- [ ] Setup monitoring (PM2, New Relic)
- [ ] Configure logging
- [ ] Setup backup strategy
- [ ] Enable rate limiting
- [ ] Review security headers

## 📊 Monitoring & Logging

### Recommended Tools
- **PM2**: Process management
- **Morgan**: HTTP request logging
- **Winston**: Application logging
- **New Relic**: Performance monitoring
- **Sentry**: Error tracking

### Key Metrics to Monitor
- Response times
- Error rates
- Database query performance
- Memory usage
- CPU usage
- Active connections

## 🔮 Future Enhancements

### Phase 1: Core Features
- [ ] Email notifications (SendGrid/Nodemailer)
- [ ] File upload (Multer + Cloudinary)
- [ ] Payment integration (Stripe/Khalti)
- [ ] QR code generation
- [ ] PDF ticket generation

### Phase 2: Advanced Features
- [ ] Real-time updates (Socket.io)
- [ ] Event reminders (Cron jobs)
- [ ] Analytics dashboard
- [ ] Export functionality (CSV/PDF)
- [ ] Social media integration

### Phase 3: Scalability
- [ ] Redis caching
- [ ] Message queue (Bull/RabbitMQ)
- [ ] Microservices architecture
- [ ] Load balancing
- [ ] CDN integration

## 📚 Technology Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express.js | Web framework |
| Database | MongoDB | NoSQL database |
| ODM | Mongoose | Object modeling |
| Auth | JWT | Token-based auth |
| Security | Helmet, bcrypt | Security layers |
| Validation | express-validator | Input validation |
| Rate Limiting | express-rate-limit | API protection |

## 🎓 Learning Resources

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB University](https://university.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/docs/guide.html)
- [JWT Introduction](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net/)

---

**Built with ❤️ for EventFlow**
