# EventFlow - Event Management System

**A comprehensive, full-stack event management platform for creating, managing, and booking events with ease.**

## 📖 About EventFlow

EventFlow is a modern event management system that bridges the gap between event organizers and attendees. Built with cutting-edge web technologies, it provides a seamless experience for discovering events, managing bookings, and tracking event performance.

### 🎯 What Makes EventFlow Special?

- **Dual Mode Operation:** Works as a standalone frontend app OR full-stack application
- **Professional Design:** Modern dark theme with smooth animations and responsive layout
- **Complete Feature Set:** Everything you need from event creation to revenue analytics
- **Production Ready:** Secure, scalable, and well-documented
- **Easy to Deploy:** Multiple deployment options for any use case

### 💡 Perfect For

- 🎓 **Students** learning full-stack development
- 💼 **Businesses** managing corporate events
- 🎪 **Event Planners** organizing conferences and workshops
- 🚀 **Startups** building event platforms
- 📚 **Educators** hosting academic events

## 🌟 Key Features

### 🎨 Professional UI/UX
- **Modern Dark Theme:** Sophisticated design with indigo/purple gradient accents
- **Beautiful Loading Animation:** SVG animations with progress bar and dynamic status
- **Smooth Transitions:** 60 FPS GPU-accelerated animations
- **Fully Responsive:** Optimized for desktop, tablet, and mobile devices
- **Inter Typography:** Professional font family for excellent readability

### 🎫 Event Booking System
- Users can browse and book events
- Real-time booking confirmation
- Ticket quantity selection
- Booking management (view and cancel bookings)
- Booking history tracking

### 👤 User Dashboard
- **My Bookings**: View all event bookings with status
- **My Events**: Manage events created by the user
- **Statistics**: Track total events, bookings, and spending
- **Event Management**: Create, edit, and delete own events
- **Revenue Tracking**: See bookings and revenue for created events

### 👨‍💼 Admin Dashboard
- **All Bookings**: Complete overview of all event bookings
- **All Events**: Manage all events in the system
- **User Management**: View all registered users and their activity
- **Analytics**: 
  - Total events, users, and bookings
  - Total tickets sold
  - Total revenue generated
- **Detailed Reports**: User spending, event performance, booking trends

### 📅 Enhanced Event Information
- Detailed event descriptions
- Event agenda with time-based schedule
- Speaker/presenter information
- Requirements (what to bring)
- Amenities (what's included)
- Pricing information
- Organizer contact details
- Cancellation policies
- Event tags for better categorization

### 🔐 Authentication
- User registration and login
- Role-based access (Admin/User)
- Session management
- Protected routes

## Default Credentials

### Admin Account
- **Email**: admin@eventflow.com
- **Password**: admin123

### Test User
Create a new account via the registration page.

## How to Use

### For Users:
1. **Register/Login**: Create an account or login
2. **Browse Events**: View all available events with filters
3. **Book Events**: Click on an event and use the "Register for Event" button
4. **Manage Bookings**: View and manage your bookings in the dashboard
5. **Create Events**: Create your own events and track attendees

### For Admins:
1. **Login**: Use admin credentials
2. **View Analytics**: See comprehensive statistics on the dashboard
3. **Manage Bookings**: View all bookings across all events
4. **Manage Events**: Create, edit, or delete any event
5. **User Overview**: Monitor user activity and engagement

## Event Categories
- Conference
- Workshop
- Networking
- Meetup
- Marriage
- Engagement
- Reception
- Other

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcrypt, rate limiting, CORS
- **Storage**: MongoDB with Mongoose ODM
- **Design**: Modern dark theme with professional indigo/purple gradient accents
- **Typography**: Inter font family for optimal readability
- **Icons**: Emoji-based icons for simplicity
- **UI**: Responsive layout with smooth animations and transitions

## 🚀 Getting Started

### Frontend Only (LocalStorage)
1. Open `index.html` in your browser
2. No setup required - works immediately!

### Full Stack (with Backend API)
See [BACKEND_SETUP.md](BACKEND_SETUP.md) for complete backend setup instructions.

**Quick Start:**
```bash
# Install MongoDB
# See BACKEND_SETUP.md for installation instructions

# Setup backend
cd server
npm install
cp .env.example .env
# Edit .env with your configuration

# Seed database (optional)
npm run seed

# Start server
npm run dev
```

Backend API runs at: `http://localhost:5000`

## File Structure
```
├── index.html              # Landing page
├── events.html             # Event listing page
├── event-detail.html       # Detailed event view
├── create-event.html       # Event creation form
├── edit-event.html         # Event editing form
├── dashboard.html          # User/Admin dashboard
├── login.html              # Login page
├── register.html           # Registration page
├── profile.html            # User profile
├── contact.html            # Contact page
├── about.html              # About page
├── css/
│   └── styles.css          # All styles
├── js/
│   └── app.js              # Application logic
├── server/                 # Backend API
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & error handling
│   ├── models/             # Database schemas
│   ├── routes/             # API routes
│   ├── .env.example        # Environment template
│   ├── package.json        # Dependencies
│   ├── seed.js             # Database seeder
│   └── server.js           # Entry point
├── BACKEND_SETUP.md        # Backend setup guide
└── README.md
```

## Key Features Explained

### Booking System
- Users must be logged in to book events
- Booking modal with form validation
- Real-time price calculation based on ticket quantity
- Booking confirmation with unique booking ID
- Status tracking (confirmed/cancelled)

### Dashboard Tabs
- **User Dashboard**:
  - My Bookings tab: All user bookings
  - My Events tab: Events created by user
  
- **Admin Dashboard**:
  - All Bookings tab: System-wide booking overview
  - All Events tab: All events with management options
  - All Users tab: User statistics and activity

### Event Statistics
- Total bookings per event
- Total tickets sold
- Revenue generated
- Cancellation tracking

## Future Enhancements
- Payment gateway integration
- Email notifications
- Event reminders
- QR code tickets
- Event check-in system
- Advanced analytics and reports
- Export functionality (PDF/CSV)
- Social media sharing
- Event reviews and ratings

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes
- **Frontend Mode**: All data stored in browser LocalStorage (no backend required)
- **Backend Mode**: Full API with MongoDB database (see BACKEND_SETUP.md)
- Clearing browser data will reset the application (frontend mode only)
- Backend provides persistent storage, authentication, and advanced features
- Fully functional offline after initial load (frontend mode)

## License
MIT License - Feel free to use and modify for your projects.
