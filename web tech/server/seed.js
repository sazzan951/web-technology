const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@eventflow.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      phone: '+977-9800000000'
    });

    // Create sample users
    console.log('👥 Creating sample users...');
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+977-9800000001'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '+977-9800000002'
    });

    // Create sample events
    console.log('📅 Creating sample events...');
    const events = await Event.create([
      {
        title: 'Tech Conference 2025',
        description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
        category: 'Conference',
        date: new Date('2025-03-15'),
        time: '09:00 AM',
        venue: 'Kathmandu Convention Center',
        location: 'Kathmandu, Nepal',
        capacity: 500,
        price: 2500,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
        organizer: {
          name: 'Tech Events Nepal',
          email: 'info@techevents.com.np',
          phone: '+977-9800000100',
          website: 'https://techevents.com.np'
        },
        tags: ['Technology', 'Innovation', 'Networking'],
        agenda: [
          { time: '09:00 AM', title: 'Registration & Breakfast', description: 'Check-in and networking breakfast' },
          { time: '10:00 AM', title: 'Keynote Speech', description: 'Opening keynote by industry leader' },
          { time: '12:00 PM', title: 'Lunch Break', description: 'Networking lunch' },
          { time: '02:00 PM', title: 'Panel Discussion', description: 'Future of Technology in Nepal' }
        ],
        speakers: [
          { name: 'Dr. Rajesh Kumar', title: 'CTO, Tech Corp', bio: 'Leading expert in AI and Machine Learning' }
        ],
        requirements: ['Laptop', 'Business cards', 'Valid ID'],
        amenities: ['WiFi', 'Lunch', 'Coffee breaks', 'Parking'],
        cancellationPolicy: 'Full refund if cancelled 7 days before the event',
        contactInfo: { email: 'support@techevents.com.np', phone: '+977-9800000100' },
        createdBy: admin._id
      },
      {
        title: 'Digital Marketing Workshop',
        description: 'Learn the latest digital marketing strategies and tools from industry experts.',
        category: 'Workshop',
        date: new Date('2025-03-20'),
        time: '02:00 PM',
        venue: 'Business Hub',
        location: 'Lalitpur, Nepal',
        capacity: 50,
        price: 1500,
        image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop',
        organizer: {
          name: 'Marketing Academy',
          email: 'info@marketingacademy.com.np',
          phone: '+977-9800000101'
        },
        tags: ['Marketing', 'Digital', 'Social Media'],
        createdBy: admin._id
      },
      {
        title: 'Startup Networking Night',
        description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts.',
        category: 'Networking',
        date: new Date('2025-03-25'),
        time: '06:00 PM',
        venue: 'Innovation Hub',
        location: 'Kathmandu, Nepal',
        capacity: 100,
        price: 500,
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop',
        tags: ['Startup', 'Networking', 'Business'],
        createdBy: admin._id
      }
    ]);

    // Create sample bookings
    console.log('🎫 Creating sample bookings...');
    await Booking.create([
      {
        event: events[0]._id,
        user: user1._id,
        userName: user1.name,
        userEmail: user1.email,
        userPhone: user1.phone,
        numberOfTickets: 2,
        totalAmount: 5000,
        status: 'confirmed'
      },
      {
        event: events[1]._id,
        user: user2._id,
        userName: user2.name,
        userEmail: user2.email,
        userPhone: user2.phone,
        numberOfTickets: 1,
        totalAmount: 1500,
        status: 'confirmed'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log(`Admin: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log(`User 1: john@example.com / password123`);
    console.log(`User 2: jane@example.com / password123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedData();
