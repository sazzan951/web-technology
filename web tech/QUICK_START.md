# EventFlow - Quick Start Guide

Get EventFlow up and running in minutes!

## 🎯 Choose Your Mode

EventFlow can run in two modes:

### 1. Frontend Only (No Setup Required) ⚡
- Uses browser localStorage
- No backend needed
- Perfect for testing and demos
- **Ready to use immediately!**

### 2. Full Stack (Backend + Database) 🚀
- MongoDB database
- RESTful API
- Persistent data storage
- Production-ready

---

## 🌟 Option 1: Frontend Only (Instant Start)

### Step 1: Open the Application
Simply open `index.html` in your web browser!

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Or just double-click index.html
```

### Step 2: Login
Use the demo admin account:
- **Email**: admin@eventflow.com
- **Password**: admin123

### Step 3: Start Using!
- Browse events
- Create new events (admin only)
- Book events
- Manage bookings

**That's it! No installation, no configuration needed.**

---

## 🔥 Option 2: Full Stack Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Step 1: Install MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Skip to Step 2

**Option B: Local MongoDB**

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Run installer
# MongoDB starts automatically
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 3: Configure Environment

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventflow
JWT_SECRET=your-super-secret-key-change-this
ADMIN_EMAIL=admin@eventflow.com
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflow
```

### Step 4: Seed Database

```bash
npm run seed
```

This creates:
- ✅ Admin account
- ✅ Sample users
- ✅ Sample events
- ✅ Sample bookings

### Step 5: Start Backend

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000 in development mode
```

### Step 6: Enable Backend in Frontend

Edit `js/api-config.js`:

```javascript
const API_CONFIG = {
  USE_BACKEND: true,  // Change from false to true
  API_BASE_URL: 'http://localhost:5000/api',
  TOKEN_KEY: 'eventflow_token'
};
```

### Step 7: Start Frontend

```bash
# In project root directory
python -m http.server 8000
# or
npx http-server
```

### Step 8: Open Application

Visit: `http://localhost:8000`

### Step 9: Login

Use seeded credentials:
- **Admin**: admin@eventflow.com / admin123
- **User 1**: john@example.com / password123
- **User 2**: jane@example.com / password123

---

## 🧪 Test the Backend API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventflow.com","password":"admin123"}'
```

### Get Events
```bash
curl http://localhost:5000/api/events
```

---

## 🎓 What's Next?

### For Frontend Only Mode:
1. ✅ Browse events
2. ✅ Create events (as admin)
3. ✅ Book events
4. ✅ Manage bookings
5. ✅ View dashboard

### For Full Stack Mode:
1. ✅ All frontend features
2. ✅ Persistent data storage
3. ✅ API testing with Postman
4. ✅ User authentication with JWT
5. ✅ Advanced filtering and search
6. ✅ Production deployment ready

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem**: Events not showing
- **Solution**: Check browser console for errors
- Clear localStorage: `localStorage.clear()`

**Problem**: Can't login
- **Solution**: Use correct credentials (see above)
- Check if `js/app.js` is loaded

### Backend Issues

**Problem**: MongoDB connection error
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```
- **Solution**: 
  - Check if MongoDB is running: `mongod --version`
  - Verify `MONGODB_URI` in `.env`
  - For Atlas, check connection string

**Problem**: Port already in use
```
EADDRINUSE: address already in use :::5000
```
- **Solution**:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  
  # Or change PORT in .env
  ```

**Problem**: CORS error
```
Access to fetch blocked by CORS policy
```
- **Solution**: Update `CORS_ORIGIN` in `.env` to match your frontend URL

**Problem**: JWT error
```
secretOrPrivateKey must have a value
```
- **Solution**: Set `JWT_SECRET` in `.env`

---

## 📚 Additional Resources

- [Full Backend Setup Guide](BACKEND_SETUP.md)
- [Backend API Documentation](server/README.md)
- [Main README](README.md)

---

## 💡 Pro Tips

1. **Use MongoDB Atlas** for hassle-free database hosting
2. **Use Postman** to test API endpoints
3. **Check server logs** for debugging
4. **Keep .env secure** - never commit to git
5. **Use nodemon** for auto-restart during development

---

## 🎉 Success!

You're all set! EventFlow is now running.

### Frontend Only:
- Open `index.html` in browser
- Login and start managing events

### Full Stack:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:8000`
- API Docs: `http://localhost:5000/api/health`

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review server logs for errors
3. Verify all environment variables
4. Check MongoDB connection
5. Open an issue on GitHub

Happy event managing! 🎊
