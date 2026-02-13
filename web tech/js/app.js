// Event Management System - Shared logic and data

const STORAGE_KEY = 'eventManagement_events';
const USERS_KEY = 'eventManagement_users';
const SESSION_KEY = 'eventManagement_session';
const BOOKINGS_KEY = 'eventManagement_bookings';

// Default placeholder when event has no image
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';

// ---------- Bookings ----------
function getBookings() {
  try {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.warn(e); }
  return [];
}

function saveBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return true;
  } catch (e) { return false; }
}

function addBooking(eventId, userId, bookingData) {
  const bookings = getBookings();
  const booking = {
    id: String(Date.now()),
    eventId,
    userId,
    userName: bookingData.userName || '',
    userEmail: bookingData.userEmail || '',
    userPhone: bookingData.userPhone || '',
    numberOfTickets: bookingData.numberOfTickets || 1,
    totalAmount: bookingData.totalAmount || 0,
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
    ...bookingData
  };
  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

function getBookingsByUser(userId) {
  return getBookings().filter(b => b.userId === userId);
}

function getBookingsByEvent(eventId) {
  return getBookings().filter(b => b.eventId === eventId);
}

function getAllBookingsWithDetails() {
  const bookings = getBookings();
  const events = getEvents();
  const users = getUsers();
  
  return bookings.map(booking => {
    const event = events.find(e => e.id === booking.eventId);
    const user = users.find(u => u.id === booking.userId);
    return {
      ...booking,
      event,
      user
    };
  });
}

function cancelBooking(bookingId) {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index !== -1) {
    bookings[index].status = 'cancelled';
    saveBookings(bookings);
    return true;
  }
  return false;
}

function getEventStats(eventId) {
  const bookings = getBookingsByEvent(eventId);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalTickets = confirmedBookings.reduce((sum, b) => sum + (b.numberOfTickets || 1), 0);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  
  return {
    totalBookings: confirmedBookings.length,
    totalTickets,
    totalRevenue,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length
  };
}

// ---------- Auth ----------
function getUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.warn(e); }
  const defaultUsers = [
    { id: 'admin1', name: 'Admin', email: 'admin@eventflow.com', password: 'admin123', role: 'admin' }
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (e) { return false; }
}

function getSession() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

function setSession(user) {
  if (!user) { localStorage.removeItem(SESSION_KEY); return; }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }));
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.id === session.id) || null;
}

function isLoggedIn() { return !!getSession(); }

function isAdmin() { return getSession()?.role === 'admin'; }

function register(name, email, password) {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, message: 'Email already registered.' };
  const user = { 
    id: String(Date.now()), 
    name: (name || '').trim(), 
    email: email.trim().toLowerCase(), 
    password, 
    role: 'user' // All registered users are regular users
  };
  users.push(user);
  saveUsers(users);
  setSession(user);
  return { ok: true, user };
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  if (!user) return { ok: false, message: 'Invalid email or password.' };
  setSession(user);
  return { ok: true, user };
}

function logout() { setSession(null); }

// ---------- Events ----------
function getEvents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.warn(e); }
  return getDefaultEvents();
}

function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (e) { return false; }
}

function getDefaultEvents() {
  return [
    { 
      id: '1', 
      title: 'Tech Summit 2025', 
      description: 'Annual technology conference bringing together innovators and industry leaders. Keynotes, workshops, and networking.', 
      date: '2025-03-15', 
      time: '09:00', 
      endTime: '18:00',
      venue: 'Brikutimandap Convention Hall', 
      location: 'Kathmandu, Nepal', 
      category: 'Conference', 
      capacity: 500, 
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop', 
      createdBy: 'admin1',
      price: 2500,
      currency: 'NPR',
      organizer: 'Nepal Tech Association',
      organizerEmail: 'info@nepaltech.org',
      organizerPhone: '+977-1-4567890',
      website: 'https://techsummit2025.com',
      tags: ['Technology', 'Innovation', 'Networking', 'AI', 'Startups'],
      agenda: [
        { time: '09:00', title: 'Registration & Welcome Coffee' },
        { time: '10:00', title: 'Keynote: Future of Technology in Nepal' },
        { time: '11:30', title: 'Panel: AI and Machine Learning Trends' },
        { time: '13:00', title: 'Lunch Break' },
        { time: '14:00', title: 'Workshop: Building Scalable Applications' },
        { time: '16:00', title: 'Startup Pitch Session' },
        { time: '17:30', title: 'Networking & Closing Remarks' }
      ],
      speakers: [
        { name: 'Dr. Rajesh Sharma', title: 'CTO, TechCorp Nepal', bio: 'Leading AI researcher with 15+ years experience' },
        { name: 'Priya Maharjan', title: 'Founder, InnovateLab', bio: 'Serial entrepreneur and startup mentor' },
        { name: 'Amit Thapa', title: 'VP Engineering, CloudTech', bio: 'Expert in cloud architecture and scalable systems' }
      ],
      requirements: ['Laptop recommended for workshops', 'Business cards for networking', 'Valid ID for registration'],
      amenities: ['Free WiFi', 'Lunch included', 'Coffee breaks', 'Parking available', 'Live streaming'],
      cancellationPolicy: 'Full refund available up to 7 days before event. 50% refund up to 3 days before.',
      contactInfo: {
        email: 'support@techsummit2025.com',
        phone: '+977-1-4567890',
        address: 'Brikutimandap Convention Hall, Kathmandu'
      }
    },
    { 
      id: '2', 
      title: 'Design Workshop', 
      description: 'Hands-on UI/UX design workshop. Learn modern design systems and prototyping tools.', 
      date: '2025-03-22', 
      time: '14:00', 
      endTime: '17:00',
      venue: 'Creative Studio, Thamel', 
      location: 'Kathmandu, Nepal', 
      category: 'Workshop', 
      capacity: 30, 
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', 
      createdBy: 'admin1',
      price: 1500,
      currency: 'NPR',
      organizer: 'Design Collective Nepal',
      organizerEmail: 'hello@designcollective.np',
      organizerPhone: '+977-1-2345678',
      website: 'https://designworkshop.np',
      tags: ['Design', 'UI/UX', 'Prototyping', 'Figma', 'Adobe'],
      agenda: [
        { time: '14:00', title: 'Welcome & Introduction to Design Thinking' },
        { time: '14:30', title: 'Hands-on: User Research Methods' },
        { time: '15:30', title: 'Coffee Break' },
        { time: '15:45', title: 'Wireframing & Prototyping in Figma' },
        { time: '16:30', title: 'Design System Creation' },
        { time: '17:00', title: 'Q&A and Wrap-up' }
      ],
      speakers: [
        { name: 'Sarah Chen', title: 'Senior UX Designer, Google', bio: 'Award-winning designer with expertise in mobile UX' },
        { name: 'Bikash Shrestha', title: 'Creative Director, PixelStudio', bio: 'Leading design agency founder and mentor' }
      ],
      requirements: ['Laptop with Figma account', 'Basic design knowledge helpful', 'Notebook and pen'],
      amenities: ['Design software licenses provided', 'Refreshments', 'Take-home resources', 'Certificate of completion'],
      cancellationPolicy: 'Full refund available up to 48 hours before workshop.',
      contactInfo: {
        email: 'workshop@designcollective.np',
        phone: '+977-1-2345678',
        address: 'Creative Studio, Thamel, Kathmandu'
      }
    },
    { 
      id: '3', 
      title: 'Startup Networking Night', 
      description: 'Connect with founders, investors, and mentors. Pitches and casual networking.', 
      date: '2025-04-05', 
      time: '18:30', 
      endTime: '22:00',
      venue: 'The Loft, Durbarmarg', 
      location: 'Kathmandu, Nepal', 
      category: 'Networking', 
      capacity: 100, 
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop', 
      createdBy: 'admin1',
      price: 500,
      currency: 'NPR',
      organizer: 'Startup Nepal',
      organizerEmail: 'events@startupnepal.org',
      organizerPhone: '+977-1-9876543',
      website: 'https://startupnepal.org/networking',
      tags: ['Startups', 'Networking', 'Investment', 'Entrepreneurship', 'Mentorship'],
      agenda: [
        { time: '18:30', title: 'Registration & Welcome Drinks' },
        { time: '19:00', title: 'Opening Remarks & Introductions' },
        { time: '19:30', title: '5-Minute Startup Pitches (Open Mic)' },
        { time: '20:30', title: 'Networking Session with Refreshments' },
        { time: '21:30', title: 'Investor Panel Q&A' },
        { time: '22:00', title: 'Closing & Exchange Contacts' }
      ],
      speakers: [
        { name: 'Ravi Agrawal', title: 'Managing Partner, Venture Capital Nepal', bio: 'Early-stage investor with 20+ portfolio companies' },
        { name: 'Sunita Dangol', title: 'Serial Entrepreneur', bio: 'Founded 3 successful startups, now angel investor' },
        { name: 'Michael Johnson', title: 'Startup Mentor', bio: 'International business advisor and growth strategist' }
      ],
      requirements: ['Business cards essential', 'Elevator pitch prepared', 'Professional attire recommended'],
      amenities: ['Welcome drinks', 'Light refreshments', 'Business card exchange area', 'Photo booth', 'Live music'],
      cancellationPolicy: 'Tickets are transferable but non-refundable.',
      contactInfo: {
        email: 'networking@startupnepal.org',
        phone: '+977-1-9876543',
        address: 'The Loft, Durbarmarg, Kathmandu'
      }
    },
    { id: '4', title: 'Developer Meetup', description: 'Monthly meetup for developers. Talks on web technologies and open source.', date: '2025-04-12', time: '19:00', venue: 'Innovation Hub, Pulchowk', location: 'Lalitpur, Nepal', category: 'Meetup', capacity: 80, image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '5', title: 'AI & Machine Learning Conference', description: 'Explore the latest in artificial intelligence and ML. Keynote speakers, hands-on labs, and industry use cases.', date: '2025-04-18', time: '08:30', venue: 'Tech Park, Sanepa', location: 'Lalitpur, Nepal', category: 'Conference', capacity: 350, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '6', title: 'Photography Masterclass', description: 'Full-day workshop on composition, lighting, and post-processing. Bring your camera and laptop.', date: '2025-04-20', time: '10:00', venue: 'Art Space Gallery, Bhaktapur', location: 'Bhaktapur, Nepal', category: 'Workshop', capacity: 25, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '7', title: 'Women in Tech Brunch', description: 'Networking brunch for women in technology. Share experiences, find mentors, and build your network.', date: '2025-04-26', time: '11:00', venue: 'Garden Terrace, Lakeside', location: 'Pokhara, Nepal', category: 'Networking', capacity: 60, image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '8', title: 'Frontend Fridays Meetup', description: 'Casual meetup for frontend developers. Lightning talks, demos, and pizza.', date: '2025-05-02', time: '18:00', venue: 'Code & Coffee, Biratnagar', location: 'Biratnagar, Nepal', category: 'Meetup', capacity: 50, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '9', title: 'Digital Marketing Summit', description: 'Learn SEO, content strategy, and paid campaigns from industry experts. Full-day conference with workshops.', date: '2025-05-10', time: '09:00', venue: 'Bharatpur Conference Center', location: 'Bharatpur, Nepal', category: 'Conference', capacity: 400, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '10', title: 'Podcasting 101 Workshop', description: 'Start your own podcast. We cover gear, editing, and distribution in this hands-on session.', date: '2025-05-15', time: '13:00', venue: 'Media Lab, Dharan', location: 'Dharan, Nepal', category: 'Workshop', capacity: 20, image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '11', title: 'Investor Mixer', description: 'Connect with angel investors and VCs. Short pitch slots available. Dress code: business casual.', date: '2025-05-22', time: '17:30', venue: 'Sky Lounge, Hetauda', location: 'Hetauda, Nepal', category: 'Networking', capacity: 75, image: 'https://images.unsplash.com/photo-1560472354-33dc0f0e6c3e?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '12', title: 'Data Science Community Meetup', description: 'Monthly meetup: talks on data engineering, ML ops, and visualization. Open to all levels.', date: '2025-05-28', time: '19:00', venue: 'Data Campus, Butwal', location: 'Butwal, Nepal', category: 'Meetup', capacity: 90, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '13', title: 'Sharma–Karki Wedding', description: 'Traditional Nepali wedding ceremony. Venue decorated for the big day. All family and friends welcome.', date: '2025-06-08', time: '10:00', venue: 'Wedding Palace, Baneshwor', location: 'Kathmandu, Nepal', category: 'Marriage', capacity: 400, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '14', title: 'Rai–Gurung Engagement Ceremony', description: 'Engagement ceremony and ring exchange. Lunch and cultural program. Invitation only.', date: '2025-06-14', time: '11:30', venue: 'Grand Hall, Lalitpur', location: 'Lalitpur, Nepal', category: 'Engagement', capacity: 150, image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '15', title: 'Poudel–Shrestha Reception', description: 'Wedding reception dinner. Music, dance, and celebration. Formal attire requested.', date: '2025-06-20', time: '18:00', venue: 'Soaltee Crowne Plaza, Tahachal', location: 'Kathmandu, Nepal', category: 'Reception', capacity: 300, image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '16', title: 'Adhikari–Bhattarai Marriage', description: 'Wedding ceremony followed by lunch. Traditional and modern elements. All invited.', date: '2025-06-25', time: '09:00', venue: 'City Banquet, Pokhara', location: 'Pokhara, Nepal', category: 'Marriage', capacity: 350, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '17', title: 'K.C.–Magar Engagement', description: 'Engagement function with tilak and exchange of gifts. Dinner and entertainment.', date: '2025-07-05', time: '12:00', venue: 'Annapurna Banquet, Biratnagar', location: 'Biratnagar, Nepal', category: 'Engagement', capacity: 120, image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '18', title: 'Wedding Reception – Thapa & Limbu', description: 'Evening reception with dinner, cake cutting, and party. RSVP required.', date: '2025-07-12', time: '19:00', venue: 'Yak & Yeti Hotel, Durbar Marg', location: 'Kathmandu, Nepal', category: 'Reception', capacity: 250, image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '19', title: 'Blockchain & Cryptocurrency Summit', description: 'Explore the future of digital finance. Expert panels on DeFi, NFTs, and blockchain technology. Networking with crypto enthusiasts.', date: '2025-07-18', time: '09:30', venue: 'Tech Hub, Durbarmarg', location: 'Kathmandu, Nepal', category: 'Conference', capacity: 300, image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '20', title: 'Mobile App Development Bootcamp', description: 'Intensive 3-day bootcamp covering React Native and Flutter. Build your first mobile app from scratch.', date: '2025-07-25', time: '10:00', venue: 'Code Academy, Pulchowk', location: 'Lalitpur, Nepal', category: 'Workshop', capacity: 40, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '21', title: 'Startup Pitch Competition', description: 'Present your startup idea to investors and win funding. Cash prizes and mentorship opportunities available.', date: '2025-08-02', time: '14:00', venue: 'Innovation Center, Banepa', location: 'Banepa, Nepal', category: 'Networking', capacity: 200, image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '22', title: 'Cloud Computing Workshop', description: 'Hands-on AWS and Azure training. Learn cloud architecture, deployment, and best practices. Certification preparation included.', date: '2025-08-08', time: '09:00', venue: 'Digital Campus, Chitwan', location: 'Bharatpur, Nepal', category: 'Workshop', capacity: 35, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '23', title: 'Gaming & Esports Meetup', description: 'Connect with fellow gamers and esports enthusiasts. Tournaments, demos, and discussions about the gaming industry.', date: '2025-08-15', time: '16:00', venue: 'Gaming Lounge, Pokhara', location: 'Pokhara, Nepal', category: 'Meetup', capacity: 80, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '24', title: 'Cybersecurity Awareness Conference', description: 'Learn about latest security threats and protection strategies. Expert talks on ethical hacking and data privacy.', date: '2025-08-22', time: '08:30', venue: 'Security Institute, Janakpur', location: 'Janakpur, Nepal', category: 'Conference', capacity: 250, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '25', title: 'Content Creation Workshop', description: 'Master video editing, social media content, and personal branding. Tools, techniques, and monetization strategies.', date: '2025-08-28', time: '11:00', venue: 'Creative Studio, Bhairahawa', location: 'Bhairahawa, Nepal', category: 'Workshop', capacity: 30, image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '26', title: 'Renewable Energy Summit', description: 'Sustainable energy solutions for Nepal. Solar, wind, and hydroelectric power discussions with industry leaders.', date: '2025-09-05', time: '09:00', venue: 'Green Energy Center, Dhangadhi', location: 'Dhangadhi, Nepal', category: 'Conference', capacity: 180, image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '27', title: 'E-commerce Business Meetup', description: 'Online selling strategies, digital marketing, and logistics. Network with successful e-commerce entrepreneurs.', date: '2025-09-12', time: '18:30', venue: 'Business Hub, Nepalgunj', location: 'Nepalgunj, Nepal', category: 'Meetup', capacity: 60, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '28', title: 'Artificial Intelligence Ethics Workshop', description: 'Explore the ethical implications of AI. Bias, privacy, and responsible AI development practices.', date: '2025-09-18', time: '13:30', venue: 'Ethics Institute, Birgunj', location: 'Birgunj, Nepal', category: 'Workshop', capacity: 45, image: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '29', title: 'Music Production Masterclass', description: 'Learn beat making, mixing, and mastering. Professional studio techniques and software training included.', date: '2025-09-25', time: '15:00', venue: 'Sound Studio, Itahari', location: 'Itahari, Nepal', category: 'Workshop', capacity: 25, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '30', title: 'Health Tech Innovation Conference', description: 'Digital health solutions, telemedicine, and medical device innovations. Healthcare professionals and tech experts unite.', date: '2025-10-02', time: '08:00', venue: 'Medical College, Dhulikhel', location: 'Dhulikhel, Nepal', category: 'Conference', capacity: 320, image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '31', title: 'Virtual Reality Experience Day', description: 'Try the latest VR technology. Gaming, education, and business applications. Hands-on demos and development workshops.', date: '2025-10-08', time: '12:00', venue: 'VR Lab, Damak', location: 'Damak, Nepal', category: 'Meetup', capacity: 50, image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '32', title: 'Sustainable Agriculture Workshop', description: 'Modern farming techniques, organic practices, and agri-tech solutions. For farmers and agricultural entrepreneurs.', date: '2025-10-15', time: '10:30', venue: 'Agriculture Center, Tulsipur', location: 'Tulsipur, Nepal', category: 'Workshop', capacity: 70, image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '33', title: 'Fintech & Digital Banking Summit', description: 'Future of banking in Nepal. Mobile payments, digital wallets, and financial inclusion through technology.', date: '2025-10-22', time: '09:15', venue: 'Banking Institute, Kathmandu', location: 'Kathmandu, Nepal', category: 'Conference', capacity: 280, image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '34', title: 'Robotics & Automation Expo', description: 'Latest in robotics technology. Industrial automation, AI robots, and hands-on programming workshops.', date: '2025-10-28', time: '11:00', venue: 'Tech Expo Center, Biratnagar', location: 'Biratnagar, Nepal', category: 'Conference', capacity: 400, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '35', title: 'Social Media Marketing Bootcamp', description: 'Master Instagram, TikTok, and Facebook marketing. Content strategy, analytics, and influencer collaboration.', date: '2025-11-05', time: '14:30', venue: 'Marketing Hub, Butwal', location: 'Butwal, Nepal', category: 'Workshop', capacity: 55, image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '36', title: 'Quantum Computing Seminar', description: 'Introduction to quantum computing principles. Future applications and current research developments.', date: '2025-11-12', time: '16:00', venue: 'Physics Department, Tribhuvan University', location: 'Kathmandu, Nepal', category: 'Conference', capacity: 120, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '37', title: 'Travel & Tourism Tech Meetup', description: 'Digital transformation in tourism. Booking platforms, virtual tours, and travel app development.', date: '2025-11-18', time: '17:30', venue: 'Tourism Board, Pokhara', location: 'Pokhara, Nepal', category: 'Meetup', capacity: 85, image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '38', title: 'Mental Health Awareness Workshop', description: 'Workplace wellness, stress management, and mental health resources. Creating supportive work environments.', date: '2025-11-25', time: '13:00', venue: 'Wellness Center, Hetauda', location: 'Hetauda, Nepal', category: 'Workshop', capacity: 40, image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '39', title: 'Space Technology Conference', description: 'Satellite technology, space exploration, and Nepal\'s space program. Inspiring the next generation of space scientists.', date: '2025-12-02', time: '10:00', venue: 'Science Museum, Kathmandu', location: 'Kathmandu, Nepal', category: 'Conference', capacity: 200, image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop', createdBy: 'admin1' },
    { id: '40', title: 'Year-End Tech Celebration', description: 'Celebrate the year\'s achievements in technology. Awards ceremony, networking, and preview of 2026 trends.', date: '2025-12-15', time: '19:00', venue: 'Grand Ballroom, Hotel Annapurna', location: 'Kathmandu, Nepal', category: 'Networking', capacity: 500, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop', createdBy: 'admin1' },
  ];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m || '00'} ${ampm}`;
}

function getEventById(id) {
  return getEvents().find(e => e.id === id) || null;
}

function addEvent(event) {
  const user = getCurrentUser();
  const events = getEvents();
  const newId = String(Date.now());
  
  // Process tags
  const tags = event.tags ? event.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  
  // Process requirements and amenities
  const requirements = event.requirements ? event.requirements.split('\n').map(req => req.trim()).filter(req => req) : [];
  const amenities = event.amenities ? event.amenities.split('\n').map(amenity => amenity.trim()).filter(amenity => amenity) : [];
  
  const newEvent = { 
    ...event, 
    id: newId, 
    createdBy: user ? user.id : null,
    tags,
    requirements,
    amenities,
    price: event.price ? parseInt(event.price, 10) : 0,
    currency: 'NPR'
  };
  events.unshift(newEvent);
  saveEvents(events);
  return newEvent;
}

function updateEvent(id, data) {
  const events = getEvents();
  const i = events.findIndex(e => e.id === id);
  if (i === -1) return null;
  events[i] = { ...events[i], ...data };
  saveEvents(events);
  return events[i];
}

function deleteEvent(id) {
  const events = getEvents().filter(e => e.id !== id);
  saveEvents(events);
  return true;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---------- Form validation (client-side) ----------
function validateEmail(value) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return value && re.test(String(value).trim());
}

function validateRequired(value) { return value != null && String(value).trim().length > 0; }

function validateMinLength(value, min) { return String(value).trim().length >= min; }

function validatePassword(value) { return validateMinLength(value, 6); }

function setFieldError(inputOrId, message) {
  const el = typeof inputOrId === 'string' ? document.getElementById(inputOrId) || document.querySelector(`[name="${inputOrId}"]`) : inputOrId;
  if (!el) return;
  const group = el.closest('.form-group');
  if (group) {
    group.classList.add('has-error');
    let err = group.querySelector('.field-error');
    if (!err) { err = document.createElement('span'); err.className = 'field-error'; group.appendChild(err); }
    err.textContent = message || '';
  }
}

function clearFieldErrors(form) {
  if (!form) return;
  form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
  form.querySelectorAll('.field-error').forEach(e => e.remove());
}

// ---------- Render helpers ----------
function canEditEvent(event) {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === 'admin' || event.createdBy === user.id;
}

function renderEventCards(events, containerSelector, limit = 0, options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const list = limit ? events.slice(0, limit) : events;
  const showActions = options.showActions !== false && isLoggedIn();
  const canEdit = (e) => canEditEvent(e);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3>No events found</h3>
        <p>Create your first event or try different filters.</p>
      </div>`;
    return;
  }
  container.innerHTML = list.map(e => {
    const imgSrc = e.image || DEFAULT_EVENT_IMAGE;
    const actions = showActions && canEdit(e) ? `
      <div class="event-card-actions">
        <a href="edit-event.html?id=${e.id}" class="btn btn-ghost btn-sm">Edit</a>
        <button type="button" class="btn btn-ghost btn-sm btn-danger" data-delete-id="${e.id}">Delete</button>
      </div>` : '';
    return `
    <article class="event-card">
      <div class="event-card-image"><img src="${imgSrc}" alt="${e.title}" loading="lazy"></div>
      <div class="event-card-body">
        <div class="event-card-date">${formatDate(e.date)} · ${e.category}</div>
        <h2 class="event-card-title"><a href="event-detail.html?id=${e.id}">${e.title}</a></h2>
        ${actions}
      </div>
    </article>`;
  }).join('');

  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-delete-id');
      if (id && confirm('Delete this event?')) { deleteEvent(id); showToast('Event deleted.'); initEventsPage && initEventsPage(); if (typeof initDashboard === 'function') initDashboard(); }
    });
  });
}

function initEventsPage() {
  const events = getEvents();
  const search = (document.querySelector('#search') || {}).value || '';
  const category = (document.querySelector('#category') || {}).value || '';
  const locationFilter = (document.querySelector('#location') || {}).value || '';
  let filtered = events.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase()) || (e.location || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || e.category === category;
    const matchLocation = !locationFilter || (e.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    return matchSearch && matchCategory && matchLocation;
  });
  renderEventCards(filtered, '#events-grid');
}

function initEventDetail() {
  const id = getQueryParam('id');
  if (!id) { window.location.href = 'events.html'; return; }
  const event = getEventById(id);
  if (!event) { window.location.href = 'events.html'; return; }
  const container = document.querySelector('#event-detail-root');
  if (!container) return;
  const detailImage = event.image || DEFAULT_EVENT_IMAGE;
  const editDelete = canEditEvent(event) ? `
    <div class="event-detail-actions">
      <a href="edit-event.html?id=${event.id}" class="btn btn-secondary">Edit event</a>
      <button type="button" class="btn btn-danger" id="delete-event-btn">Delete event</button>
    </div>` : '';

  // Format price
  const priceInfo = event.price ? `${event.currency || 'NPR'} ${event.price.toLocaleString()}` : 'Free';
  
  // Format time range
  const timeRange = event.endTime ? `${formatTime(event.time)} - ${formatTime(event.endTime)}` : formatTime(event.time);

  container.innerHTML = `
    <div class="event-detail-container">
      <div class="event-detail-header">
        <div class="event-detail-image-wrap">
          <img src="${detailImage}" alt="${event.title}" class="event-detail-image">
          <div class="event-detail-overlay">
            <div class="event-detail-category">${event.category}</div>
            <div class="event-detail-price">${priceInfo}</div>
          </div>
        </div>
        <div class="event-detail-main">
          <h1 class="event-detail-title">${event.title}</h1>
          <div class="event-detail-meta">
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span>${formatDate(event.date)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">🕐</span>
              <span>${timeRange}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span>${event.location}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👥</span>
              <span>${event.capacity || '—'} attendees</span>
            </div>
          </div>
          ${event.tags ? `
            <div class="event-tags">
              ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          ${editDelete}
          <div class="event-detail-actions-user">
            <button type="button" class="btn btn-primary btn-large" id="register-btn">
              <span>Register for Event</span>
              <small>${priceInfo}</small>
            </button>
            <button type="button" class="btn btn-ghost" id="share-btn">Share Event</button>
          </div>
        </div>
      </div>

      <div class="event-detail-content">
        <div class="event-detail-main-content">
          <section class="content-section">
            <h2>About this event</h2>
            <div class="event-description">${event.description || 'No description available.'}</div>
          </section>

          ${event.agenda ? `
            <section class="content-section">
              <h2>Event Agenda</h2>
              <div class="agenda-list">
                ${event.agenda.map(item => `
                  <div class="agenda-item">
                    <div class="agenda-time">${item.time}</div>
                    <div class="agenda-title">${item.title}</div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${event.speakers ? `
            <section class="content-section">
              <h2>Speakers & Presenters</h2>
              <div class="speakers-grid">
                ${event.speakers.map(speaker => `
                  <div class="speaker-card">
                    <div class="speaker-info">
                      <h3 class="speaker-name">${speaker.name}</h3>
                      <div class="speaker-title">${speaker.title}</div>
                      <p class="speaker-bio">${speaker.bio}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          ${event.requirements ? `
            <section class="content-section">
              <h2>What to bring</h2>
              <ul class="requirements-list">
                ${event.requirements.map(req => `<li>${req}</li>`).join('')}
              </ul>
            </section>
          ` : ''}

          ${event.amenities ? `
            <section class="content-section">
              <h2>What's included</h2>
              <ul class="amenities-list">
                ${event.amenities.map(amenity => `<li>✓ ${amenity}</li>`).join('')}
              </ul>
            </section>
          ` : ''}

          ${event.cancellationPolicy ? `
            <section class="content-section">
              <h2>Cancellation Policy</h2>
              <p class="cancellation-policy">${event.cancellationPolicy}</p>
            </section>
          ` : ''}
        </div>

        <aside class="event-detail-sidebar">
          <div class="sidebar-section">
            <h3>Event Details</h3>
            <div class="sidebar-info">
              <div class="info-item">
                <strong>Venue</strong>
                <span>${event.venue}</span>
              </div>
              <div class="info-item">
                <strong>Location</strong>
                <span>${event.location}</span>
              </div>
              <div class="info-item">
                <strong>Date & Time</strong>
                <span>${formatDate(event.date)}</span>
                <span>${timeRange}</span>
              </div>
              <div class="info-item">
                <strong>Capacity</strong>
                <span>${event.capacity || '—'} attendees</span>
              </div>
              <div class="info-item">
                <strong>Price</strong>
                <span>${priceInfo}</span>
              </div>
            </div>
          </div>

          ${event.organizer ? `
            <div class="sidebar-section">
              <h3>Organizer</h3>
              <div class="organizer-info">
                <div class="organizer-name">${event.organizer}</div>
                ${event.organizerEmail ? `<div class="organizer-contact">📧 ${event.organizerEmail}</div>` : ''}
                ${event.organizerPhone ? `<div class="organizer-contact">📞 ${event.organizerPhone}</div>` : ''}
                ${event.website ? `<div class="organizer-contact">🌐 <a href="${event.website}" target="_blank">Event Website</a></div>` : ''}
              </div>
            </div>
          ` : ''}

          ${event.contactInfo ? `
            <div class="sidebar-section">
              <h3>Contact Information</h3>
              <div class="contact-info">
                ${event.contactInfo.email ? `<div class="contact-item">📧 ${event.contactInfo.email}</div>` : ''}
                ${event.contactInfo.phone ? `<div class="contact-item">📞 ${event.contactInfo.phone}</div>` : ''}
                ${event.contactInfo.address ? `<div class="contact-item">📍 ${event.contactInfo.address}</div>` : ''}
              </div>
            </div>
          ` : ''}

          <div class="sidebar-actions">
            <a href="events.html" class="btn btn-secondary btn-block">← Back to Events</a>
          </div>
        </aside>
      </div>
    </div>`;

  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) registerBtn.addEventListener('click', () => {
    if (!isLoggedIn()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
      return;
    }
    showBookingModal(event);
  });
  
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) shareBtn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Event link copied to clipboard!');
    }
  });
  
  const delBtn = document.getElementById('delete-event-btn');
  if (delBtn) delBtn.addEventListener('click', () => { if (confirm('Delete this event?')) { deleteEvent(event.id); showToast('Event deleted.'); window.location.href = 'events.html'; } });
}

function showBookingModal(event) {
  const user = getCurrentUser();
  if (!user) return;
  
  const pricePerTicket = event.price || 0;
  const existingModal = document.querySelector('.booking-modal');
  if (existingModal) existingModal.remove();
  
  const stats = getEventStats(event.id);
  const spotsLeft = event.capacity ? event.capacity - stats.totalTickets : null;
  const isFull = event.capacity && stats.totalTickets >= event.capacity;
  
  if (isFull) {
    showToast('Sorry, this event is sold out!', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'booking-modal';
  modal.innerHTML = `
    <div class="booking-modal-overlay"></div>
    <div class="booking-modal-content">
      <div class="booking-modal-header">
        <div>
          <h2>🎫 Book Your Tickets</h2>
          <p class="modal-subtitle">Complete your booking in just a few steps</p>
        </div>
        <button type="button" class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="booking-modal-body">
        <div class="booking-event-info">
          <div class="booking-event-image">
            <img src="${event.image || DEFAULT_EVENT_IMAGE}" alt="${event.title}">
          </div>
          <div class="booking-event-details">
            <h3>${event.title}</h3>
            <div class="booking-event-meta">
              <span>📅 ${formatDate(event.date)}</span>
              <span>🕐 ${formatTime(event.time)}</span>
              <span>📍 ${event.location}</span>
            </div>
            ${spotsLeft ? `<div class="spots-remaining">⚡ Only ${spotsLeft} spots remaining!</div>` : ''}
          </div>
        </div>
        
        <form id="booking-form">
          <div class="form-section-title">
            <span class="step-number">1</span>
            <h4>Your Information</h4>
          </div>
          
          <div class="form-group">
            <label for="booking-name">Full Name *</label>
            <input type="text" id="booking-name" name="userName" value="${user.name}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="booking-email">Email *</label>
              <input type="email" id="booking-email" name="userEmail" value="${user.email}" required>
            </div>
            <div class="form-group">
              <label for="booking-phone">Phone Number *</label>
              <input type="tel" id="booking-phone" name="userPhone" required placeholder="+977-9812345678">
            </div>
          </div>
          
          <div class="form-section-title">
            <span class="step-number">2</span>
            <h4>Select Tickets</h4>
          </div>
          
          <div class="form-group">
            <label for="booking-tickets">Number of Tickets *</label>
            <div class="ticket-selector">
              <button type="button" class="ticket-btn" id="decrease-tickets">−</button>
              <input type="number" id="booking-tickets" name="numberOfTickets" value="1" min="1" max="${spotsLeft || 10}" required readonly>
              <button type="button" class="ticket-btn" id="increase-tickets">+</button>
            </div>
            ${spotsLeft && spotsLeft <= 10 ? `<small class="form-help">Maximum ${spotsLeft} tickets available</small>` : ''}
          </div>
          
          <div class="booking-summary">
            <h4>Booking Summary</h4>
            <div class="summary-row">
              <span>Price per ticket:</span>
              <span class="price-value">NPR ${pricePerTicket.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Number of tickets:</span>
              <span id="ticket-count">1</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>Total Amount:</span>
              <span class="price-value total-price" id="total-amount">NPR ${pricePerTicket.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="booking-notes">Special Requirements (optional)</label>
            <textarea id="booking-notes" name="notes" rows="3" placeholder="Any dietary restrictions, accessibility needs, or special requests..."></textarea>
          </div>
          
          <div class="booking-modal-actions">
            <button type="button" class="btn btn-secondary" id="cancel-booking">Cancel</button>
            <button type="submit" class="btn btn-primary btn-large">
              <span class="btn-icon">✓</span>
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Ticket selector functionality
  const ticketsInput = modal.querySelector('#booking-tickets');
  const totalAmountEl = modal.querySelector('#total-amount');
  const ticketCountEl = modal.querySelector('#ticket-count');
  const decreaseBtn = modal.querySelector('#decrease-tickets');
  const increaseBtn = modal.querySelector('#increase-tickets');
  
  const updateTotal = () => {
    const count = parseInt(ticketsInput.value, 10) || 1;
    const total = count * pricePerTicket;
    totalAmountEl.textContent = `NPR ${total.toLocaleString()}`;
    ticketCountEl.textContent = count;
  };
  
  decreaseBtn.addEventListener('click', () => {
    const current = parseInt(ticketsInput.value, 10) || 1;
    if (current > 1) {
      ticketsInput.value = current - 1;
      updateTotal();
    }
  });
  
  increaseBtn.addEventListener('click', () => {
    const current = parseInt(ticketsInput.value, 10) || 1;
    const max = spotsLeft || 10;
    if (current < max) {
      ticketsInput.value = current + 1;
      updateTotal();
    }
  });
  
  ticketsInput.addEventListener('input', updateTotal);
  
  // Close modal
  const closeModal = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('#cancel-booking').addEventListener('click', closeModal);
  modal.querySelector('.booking-modal-overlay').addEventListener('click', closeModal);
  
  // Handle form submission
  modal.querySelector('#booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const numberOfTickets = parseInt(formData.get('numberOfTickets'), 10) || 1;
    const totalAmount = numberOfTickets * pricePerTicket;
    
    const bookingData = {
      userName: formData.get('userName'),
      userEmail: formData.get('userEmail'),
      userPhone: formData.get('userPhone'),
      numberOfTickets,
      totalAmount,
      notes: formData.get('notes') || ''
    };
    
    addBooking(event.id, user.id, bookingData);
    closeModal();
    
    // Show success message with animation
    showToast('🎉 Booking confirmed! Check your dashboard for details.');
    
    // Redirect to bookings tab after a short delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  });
}

function initCreateEventForm() {
  const form = document.getElementById('create-event-form');
  if (!form) return;
  if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent('create-event.html');
    return;
  }
  
  // Check if user is admin - only admins can create events
  const user = getCurrentUser();
  if (user && user.role !== 'admin') {
    showToast('Only administrators can create events.', 'error');
    setTimeout(() => {
      window.location.href = 'events.html';
    }, 2000);
    return;
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const title = (form.querySelector('[name="title"]') || {}).value || '';
    const date = (form.querySelector('[name="date"]') || {}).value || '';
    const venue = (form.querySelector('[name="venue"]') || {}).value || '';
    const location = (form.querySelector('[name="location"]') || {}).value || '';
    let valid = true;
    if (!validateRequired(title)) { setFieldError('title', 'Title is required.'); valid = false; }
    if (!validateRequired(date)) { setFieldError('date', 'Date is required.'); valid = false; }
    if (!validateRequired(venue)) { setFieldError('venue', 'Venue is required.'); valid = false; }
    if (!validateRequired(location)) { setFieldError('location', 'Location is required.'); valid = false; }
    if (!valid) return;
    const formData = new FormData(form);
    const event = {
      title: formData.get('title') || '',
      description: formData.get('description') || '',
      date: formData.get('date') || '',
      time: formData.get('time') || '',
      endTime: formData.get('endTime') || '',
      venue: formData.get('venue') || '',
      location: formData.get('location') || '',
      category: formData.get('category') || 'Other',
      capacity: parseInt(formData.get('capacity'), 10) || 0,
      price: formData.get('price') || '',
      image: formData.get('image') || '',
      organizer: formData.get('organizer') || '',
      organizerEmail: formData.get('organizerEmail') || '',
      organizerPhone: formData.get('organizerPhone') || '',
      website: formData.get('website') || '',
      tags: formData.get('tags') || '',
      requirements: formData.get('requirements') || '',
      amenities: formData.get('amenities') || '',
      cancellationPolicy: formData.get('cancellationPolicy') || '',
    };
    addEvent(event);
    showToast('Event created successfully!');
    form.reset();
    setTimeout(() => { window.location.href = 'events.html'; }, 1500);
  });
}

function initEditEventForm() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    return;
  }
  
  const user = getCurrentUser();
  
  // Check if user is admin - only admins can edit events
  if (user && user.role !== 'admin') {
    showToast('Only administrators can edit events.', 'error');
    setTimeout(() => {
      window.location.href = 'events.html';
    }, 2000);
    return;
  }
  
  const id = getQueryParam('id');
  if (!id) { window.location.href = 'events.html'; return; }
  const event = getEventById(id);
  if (!event || !canEditEvent(event)) { showToast('You cannot edit this event.', 'error'); window.location.href = 'event-detail.html?id=' + id; return; }
  const form = document.getElementById('edit-event-form');
  if (!form) return;
  form.querySelector('[name="title"]').value = event.title;
  form.querySelector('[name="description"]').value = event.description || '';
  form.querySelector('[name="date"]').value = event.date || '';
  form.querySelector('[name="time"]').value = event.time || '09:00';
  form.querySelector('[name="venue"]').value = event.venue || '';
  form.querySelector('[name="location"]').value = event.location || '';
  form.querySelector('[name="category"]').value = event.category || 'Other';
  form.querySelector('[name="capacity"]').value = event.capacity || '';
  form.querySelector('[name="image"]').value = event.image || '';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const title = (form.querySelector('[name="title"]') || {}).value || '';
    const date = (form.querySelector('[name="date"]') || {}).value || '';
    const venue = (form.querySelector('[name="venue"]') || {}).value || '';
    const location = (form.querySelector('[name="location"]') || {}).value || '';
    let valid = true;
    if (!validateRequired(title)) { setFieldError('title', 'Title is required.'); valid = false; }
    if (!validateRequired(date)) { setFieldError('date', 'Date is required.'); valid = false; }
    if (!validateRequired(venue)) { setFieldError('venue', 'Venue is required.'); valid = false; }
    if (!validateRequired(location)) { setFieldError('location', 'Location is required.'); valid = false; }
    if (!valid) return;
    const formData = new FormData(form);
    updateEvent(id, {
      title: formData.get('title') || '',
      description: formData.get('description') || '',
      date: formData.get('date') || '',
      time: formData.get('time') || '',
      venue: formData.get('venue') || '',
      location: formData.get('location') || '',
      category: formData.get('category') || 'Other',
      capacity: parseInt(formData.get('capacity'), 10) || 0,
      image: formData.get('image') || '',
    });
    showToast('Event updated!');
    setTimeout(() => { window.location.href = 'event-detail.html?id=' + id; }, 800);
  });
}

// ---------- Auth forms ----------
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const name = (form.querySelector('[name="name"]') || {}).value || '';
    const email = (form.querySelector('[name="email"]') || {}).value || '';
    const password = (form.querySelector('[name="password"]') || {}).value || '';
    const confirmPassword = (form.querySelector('[name="confirmPassword"]') || {}).value || '';
    
    let valid = true;
    if (!validateRequired(name)) { setFieldError('name', 'Name is required.'); valid = false; }
    if (!validateRequired(email)) { setFieldError('email', 'Email is required.'); valid = false; }
    else if (!validateEmail(email)) { setFieldError('email', 'Enter a valid email.'); valid = false; }
    if (!validatePassword(password)) { setFieldError('password', 'Password must be at least 6 characters.'); valid = false; }
    if (password !== confirmPassword) { setFieldError('confirmPassword', 'Passwords do not match.'); valid = false; }
    if (!valid) return;
    
    const result = register(name, email, password);
    if (!result.ok) { setFieldError('email', result.message); return; }
    showToast('Account created successfully!');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  });
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const email = (form.querySelector('[name="email"]') || {}).value || '';
    const password = (form.querySelector('[name="password"]') || {}).value || '';
    let valid = true;
    if (!validateRequired(email)) { setFieldError('email', 'Email is required.'); valid = false; }
    if (!validateRequired(password)) { setFieldError('password', 'Password is required.'); valid = false; }
    if (!valid) return;
    const result = login(email, password);
    if (!result.ok) { setFieldError('password', result.message); return; }
    showToast('Welcome back!');
    const redirect = getQueryParam('redirect') || document.querySelector('input[name="redirect"]')?.value || 'dashboard.html';
    setTimeout(() => { window.location.href = redirect; }, 800);
  });
}

// ---------- Profile ----------
function initProfileForm() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html?redirect=' + encodeURIComponent('profile.html'); return; }
  const form = document.getElementById('profile-form');
  if (!form) return;
  form.querySelector('[name="name"]').value = user.name;
  form.querySelector('[name="email"]').value = user.email;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const name = (form.querySelector('[name="name"]') || {}).value || '';
    const email = (form.querySelector('[name="email"]') || {}).value || '';
    const newPassword = (form.querySelector('[name="newPassword"]') || {}).value || '';
    const currentPassword = (form.querySelector('[name="currentPassword"]') || {}).value || '';
    let valid = true;
    if (!validateRequired(name)) { setFieldError('name', 'Name is required.'); valid = false; }
    if (!validateRequired(email)) { setFieldError('email', 'Email is required.'); valid = false; }
    else if (!validateEmail(email)) { setFieldError('email', 'Enter a valid email.'); valid = false; }
    const users = getUsers();
    if (email.toLowerCase() !== user.email && users.some(u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase())) { setFieldError('email', 'Email already in use.'); valid = false; }
    if (newPassword && !validatePassword(newPassword)) { setFieldError('newPassword', 'New password must be at least 6 characters.'); valid = false; }
    if (newPassword && currentPassword !== user.password) { setFieldError('currentPassword', 'Current password is incorrect.'); valid = false; }
    if (!valid) return;
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return;
  users[idx].name = name.trim();
  users[idx].email = email.trim().toLowerCase();
  if (newPassword) users[idx].password = newPassword;
  saveUsers(users);
  setSession(users[idx]);
  showToast('Profile updated!');
  });
}

// ---------- Contact form ----------
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const name = (form.querySelector('[name="name"]') || {}).value || '';
    const email = (form.querySelector('[name="email"]') || {}).value || '';
    const subject = (form.querySelector('[name="subject"]') || {}).value || '';
    const message = (form.querySelector('[name="message"]') || {}).value || '';
    let valid = true;
    if (!validateRequired(name)) { setFieldError('name', 'Name is required.'); valid = false; }
    if (!validateRequired(email)) { setFieldError('email', 'Email is required.'); valid = false; }
    else if (!validateEmail(email)) { setFieldError('email', 'Enter a valid email.'); valid = false; }
    if (!validateRequired(subject)) { setFieldError('subject', 'Subject is required.'); valid = false; }
    if (!validateRequired(message)) { setFieldError('message', 'Message is required.'); valid = false; }
    if (!validateMinLength(message, 10)) { setFieldError('message', 'Message must be at least 10 characters.'); valid = false; }
    if (!valid) return;
    showToast('Message sent! We will get back to you soon.');
    form.reset();
  });
}

// ---------- Dashboard ----------
function initDashboard() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html?redirect=' + encodeURIComponent('dashboard.html'); return; }
  const container = document.getElementById('dashboard-root');
  if (!container) return;
  
  if (user.role === 'admin') {
    renderAdminDashboard(container, user);
  } else {
    renderUserDashboard(container, user);
  }
}

function renderUserDashboard(container, user) {
  const events = getEvents();
  const adminEvents = events.filter(e => {
    const creator = getUsers().find(u => u.id === e.createdBy);
    return creator && creator.role === 'admin';
  });
  const myBookings = getBookingsByUser(user.id);
  const confirmedBookings = myBookings.filter(b => b.status === 'confirmed');
  
  // Get booking details with event info
  const bookingsWithDetails = myBookings.map(booking => {
    const event = events.find(e => e.id === booking.eventId);
    return { ...booking, event };
  });
  
  container.innerHTML = `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Welcome back, ${user.name}!</h1>
          <p class="dashboard-subtitle">
            <span class="user-type-badge user">🎫 Event Attendee</span>
            Browse and book amazing events
          </p>
        </div>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">🎉</div>
          <div class="stat-info">
            <span class="stat-value">${adminEvents.length}</span>
            <span class="stat-label">Available Events</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎫</div>
          <div class="stat-info">
            <span class="stat-value">${confirmedBookings.length}</span>
            <span class="stat-label">My Bookings</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-value">NPR ${confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}</span>
            <span class="stat-label">Total Spent</span>
          </div>
        </div>
      </div>

      <div class="dashboard-tabs">
        <button class="tab-btn active" data-tab="admin-events">Browse Events</button>
        <button class="tab-btn" data-tab="bookings">My Bookings</button>
      </div>

      <div class="tab-content active" id="tab-admin-events">
        <div class="section-header">
          <h2>Available Events to Book</h2>
          <p class="section-description">Click "Book Now" to reserve your spot at any event</p>
        </div>
        
        <div class="booking-info-banner">
          <div class="banner-icon">🎫</div>
          <div class="banner-content">
            <h3>How to Book an Event</h3>
            <ol class="booking-steps">
              <li><strong>Browse</strong> available events below</li>
              <li><strong>Click "Book Now"</strong> on any event you like</li>
              <li><strong>Fill in your details</strong> and select number of tickets</li>
              <li><strong>Confirm booking</strong> and view it in "My Bookings" tab</li>
            </ol>
          </div>
        </div>
        
        ${adminEvents.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎉</div>
            <h3>No events available</h3>
            <p>Check back later for new events!</p>
          </div>
        ` : `
          <div class="admin-events-grid">
            ${adminEvents.map(event => {
              const userBooking = myBookings.find(b => b.eventId === event.id && b.status === 'confirmed');
              const stats = getEventStats(event.id);
              const spotsLeft = event.capacity ? event.capacity - stats.totalTickets : '∞';
              const isFull = event.capacity && stats.totalTickets >= event.capacity;
              return `
                <div class="admin-event-card ${isFull ? 'event-full' : ''}">
                  <div class="admin-event-image">
                    <img src="${event.image || DEFAULT_EVENT_IMAGE}" alt="${event.title}">
                    ${userBooking ? '<span class="booked-badge">✓ Booked</span>' : ''}
                    ${isFull && !userBooking ? '<span class="full-badge">SOLD OUT</span>' : ''}
                    ${event.price ? `<span class="price-badge">NPR ${event.price.toLocaleString()}</span>` : '<span class="price-badge free">Free</span>'}
                  </div>
                  <div class="admin-event-content">
                    <div class="admin-event-category">${event.category}</div>
                    <h3>${event.title}</h3>
                    <p class="admin-event-description">${event.description ? event.description.substring(0, 120) + '...' : 'No description available'}</p>
                    <div class="admin-event-info">
                      <div class="info-row">
                        <span class="info-icon">📅</span>
                        <span>${formatDate(event.date)}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-icon">🕐</span>
                        <span>${formatTime(event.time)}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-icon">📍</span>
                        <span>${event.location}</span>
                      </div>
                      <div class="info-row ${isFull ? 'text-danger' : ''}">
                        <span class="info-icon">👥</span>
                        <span>${stats.totalTickets}/${event.capacity || '∞'} ${isFull ? '(Full)' : 'attending'}</span>
                      </div>
                      ${event.capacity && !isFull ? `
                        <div class="info-row spots-left">
                          <span class="info-icon">✨</span>
                          <span>${spotsLeft} spots left!</span>
                        </div>
                      ` : ''}
                    </div>
                    <div class="admin-event-actions">
                      <a href="event-detail.html?id=${event.id}" class="btn btn-secondary btn-sm">View Details</a>
                      ${userBooking ? 
                        `<button class="btn btn-success btn-sm" disabled>✓ Already Booked</button>` : 
                        isFull ?
                        `<button class="btn btn-ghost btn-sm" disabled>Sold Out</button>` :
                        `<button class="btn btn-primary btn-sm btn-book-now" onclick="quickBookEvent('${event.id}')">
                          <span class="btn-icon">🎫</span> Book Now
                        </button>`
                      }
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <div class="tab-content" id="tab-bookings">
        <div class="section-header">
          <h2>My Bookings</h2>
        </div>
        ${bookingsWithDetails.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎫</div>
            <h3>No bookings yet</h3>
            <p>Browse events and book your first event!</p>
            <a href="events.html" class="btn btn-primary">Browse Events</a>
          </div>
        ` : `
          <div class="bookings-list">
            ${bookingsWithDetails.map(booking => `
              <div class="booking-card ${booking.status === 'cancelled' ? 'cancelled' : ''}">
                <div class="booking-card-image">
                  <img src="${booking.event?.image || DEFAULT_EVENT_IMAGE}" alt="${booking.event?.title || 'Event'}">
                  <span class="booking-status status-${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-card-content">
                  <h3>${booking.event?.title || 'Event Not Found'}</h3>
                  <div class="booking-details">
                    <div class="booking-detail-item">
                      <span class="detail-icon">📅</span>
                      <span>${booking.event ? formatDate(booking.event.date) : 'N/A'}</span>
                    </div>
                    <div class="booking-detail-item">
                      <span class="detail-icon">🕐</span>
                      <span>${booking.event ? formatTime(booking.event.time) : 'N/A'}</span>
                    </div>
                    <div class="booking-detail-item">
                      <span class="detail-icon">📍</span>
                      <span>${booking.event?.location || 'N/A'}</span>
                    </div>
                    <div class="booking-detail-item">
                      <span class="detail-icon">🎫</span>
                      <span>${booking.numberOfTickets} ticket(s)</span>
                    </div>
                    <div class="booking-detail-item">
                      <span class="detail-icon">💰</span>
                      <span>NPR ${booking.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div class="booking-meta">
                    <small>Booked on ${new Date(booking.bookedAt).toLocaleDateString()}</small>
                    <small>Booking ID: ${booking.id}</small>
                  </div>
                  <div class="booking-actions">
                    ${booking.event ? `<a href="event-detail.html?id=${booking.event.id}" class="btn btn-ghost btn-sm">View Event</a>` : ''}
                    ${booking.status === 'confirmed' ? `<button class="btn btn-danger btn-sm" onclick="handleCancelBooking('${booking.id}')">Cancel Booking</button>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  
  initDashboardTabs();
}

function renderAdminDashboard(container, user) {
  const events = getEvents();
  const users = getUsers();
  const allBookings = getAllBookingsWithDetails();
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalTickets = confirmedBookings.reduce((sum, b) => sum + (b.numberOfTickets || 1), 0);
  const adminBookings = getBookingsByUser(user.id);
  const adminConfirmedBookings = adminBookings.filter(b => b.status === 'confirmed');
  
  container.innerHTML = `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="dashboard-subtitle">Overview of all events, bookings, and users</p>
        </div>
        <a href="create-event.html" class="btn btn-primary">
          <span>+ Create New Event</span>
        </a>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <span class="stat-value">${events.length}</span>
            <span class="stat-label">Total Events</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <span class="stat-value">${users.length}</span>
            <span class="stat-label">Total Users</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎫</div>
          <div class="stat-info">
            <span class="stat-value">${confirmedBookings.length}</span>
            <span class="stat-label">Total Bookings</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎟️</div>
          <div class="stat-info">
            <span class="stat-value">${totalTickets}</span>
            <span class="stat-label">Tickets Sold</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-value">NPR ${totalRevenue.toLocaleString()}</span>
            <span class="stat-label">Total Revenue</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎉</div>
          <div class="stat-info">
            <span class="stat-value">${adminConfirmedBookings.length}</span>
            <span class="stat-label">My Bookings</span>
          </div>
        </div>
      </div>

      <div class="dashboard-tabs">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="all-events">All Events & Bookings</button>
        <button class="tab-btn" data-tab="all-bookings">All Bookings</button>
        <button class="tab-btn" data-tab="booking-details">Booking Details</button>
        <button class="tab-btn" data-tab="my-bookings">My Bookings</button>
        <button class="tab-btn" data-tab="all-users">All Users</button>
      </div>

      <div class="tab-content active" id="tab-overview">
        <div class="section-header">
          <h2>Dashboard Overview</h2>
          <p class="section-description">Complete statistics and insights</p>
        </div>
        
        <div class="dashboard-stats" style="margin-bottom: 32px;">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <span class="stat-value">${events.length}</span>
              <span class="stat-label">Total Events</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <span class="stat-value">${users.filter(u => u.role !== 'admin').length}</span>
              <span class="stat-label">Regular Users</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎫</div>
            <div class="stat-info">
              <span class="stat-value">${confirmedBookings.length}</span>
              <span class="stat-label">Total Bookings</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎟️</div>
            <div class="stat-info">
              <span class="stat-value">${totalTickets}</span>
              <span class="stat-label">Tickets Sold</span>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 32px;">
          <div class="stat-card" style="padding: 24px;">
            <h3 style="margin-bottom: 16px; font-size: 1.125rem;">Revenue Breakdown</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary);">Total Revenue:</span>
                <strong style="font-size: 1.5rem; color: var(--accent);">NPR ${totalRevenue.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary);">Average per Booking:</span>
                <strong>NPR ${confirmedBookings.length > 0 ? Math.round(totalRevenue / confirmedBookings.length).toLocaleString() : 0}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary);">Average per Ticket:</span>
                <strong>NPR ${totalTickets > 0 ? Math.round(totalRevenue / totalTickets).toLocaleString() : 0}</strong>
              </div>
            </div>
          </div>

          <div class="stat-card" style="padding: 24px;">
            <h3 style="margin-bottom: 16px; font-size: 1.125rem;">Booking Statistics</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary);">Confirmed:</span>
                <strong style="color: var(--success);">${confirmedBookings.length}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary);">Cancelled:</span>
                <strong style="color: var(--danger);">${allBookings.filter(b => b.status === 'cancelled').length}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary);">Cancellation Rate:</span>
                <strong>${allBookings.length > 0 ? Math.round((allBookings.filter(b => b.status === 'cancelled').length / allBookings.length) * 100) : 0}%</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="section-header" style="margin-top: 32px;">
          <h3>Top Events by Bookings</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Bookings</th>
                <th>Tickets Sold</th>
                <th>Revenue</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              ${events.sort((a, b) => {
                const aStats = getEventStats(a.id);
                const bStats = getEventStats(b.id);
                return bStats.totalBookings - aStats.totalBookings;
              }).slice(0, 10).map(event => {
                const stats = getEventStats(event.id);
                const capacityPercent = event.capacity ? Math.round((stats.totalTickets / event.capacity) * 100) : 0;
                return `
                  <tr>
                    <td><strong>${event.title}</strong></td>
                    <td>${event.category}</td>
                    <td>${formatDate(event.date)}</td>
                    <td><strong>${stats.totalBookings}</strong></td>
                    <td><strong>${stats.totalTickets}</strong></td>
                    <td><strong>NPR ${stats.totalRevenue.toLocaleString()}</strong></td>
                    <td>
                      ${stats.totalTickets}/${event.capacity || '∞'}
                      ${event.capacity ? `<small style="color: var(--text-muted);">(${capacityPercent}%)</small>` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section-header" style="margin-top: 32px;">
          <h3>Top Users by Bookings</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Total Bookings</th>
                <th>Total Tickets</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              ${users.filter(u => u.role !== 'admin').sort((a, b) => {
                const aBookings = getBookingsByUser(a.id).filter(b => b.status === 'confirmed');
                const bBookings = getBookingsByUser(b.id).filter(b => b.status === 'confirmed');
                return bBookings.length - aBookings.length;
              }).slice(0, 10).map(u => {
                const userBookings = getBookingsByUser(u.id).filter(b => b.status === 'confirmed');
                const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                const totalUserTickets = userBookings.reduce((sum, b) => sum + (b.numberOfTickets || 1), 0);
                return `
                  <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td><strong>${userBookings.length}</strong></td>
                    <td><strong>${totalUserTickets}</strong></td>
                    <td><strong>NPR ${totalSpent.toLocaleString()}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="tab-content" id="tab-all-events">
        <div class="section-header">
          <h2>All Events with Booking Details</h2>
          <a href="create-event.html" class="btn btn-secondary">+ Create Event</a>
        </div>
        ${events.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3>No events yet</h3>
            <p>Create your first event to get started!</p>
            <a href="create-event.html" class="btn btn-primary">Create Event</a>
          </div>
        ` : `
          <div class="admin-events-detailed">
            ${events.map(event => {
              const stats = getEventStats(event.id);
              const eventBookings = getBookingsByEvent(event.id).filter(b => b.status === 'confirmed');
              const adminBooked = adminBookings.find(b => b.eventId === event.id && b.status === 'confirmed');
              const creator = users.find(u => u.id === event.createdBy);
              return `
                <div class="admin-event-detail-card">
                  <div class="event-detail-header-row">
                    <div class="event-detail-left">
                      <div class="event-detail-image-small">
                        <img src="${event.image || DEFAULT_EVENT_IMAGE}" alt="${event.title}">
                      </div>
                      <div class="event-detail-info">
                        <h3>${event.title}</h3>
                        <div class="event-detail-meta">
                          <span>📅 ${formatDate(event.date)}</span>
                          <span>📍 ${event.location}</span>
                          <span>🏷️ ${event.category}</span>
                          <span>👤 By ${creator?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div class="event-detail-stats-row">
                      <div class="stat-mini">
                        <span class="stat-mini-value">${stats.totalBookings}</span>
                        <span class="stat-mini-label">Bookings</span>
                      </div>
                      <div class="stat-mini">
                        <span class="stat-mini-value">${stats.totalTickets}</span>
                        <span class="stat-mini-label">Tickets</span>
                      </div>
                      <div class="stat-mini">
                        <span class="stat-mini-value">NPR ${stats.totalRevenue.toLocaleString()}</span>
                        <span class="stat-mini-label">Revenue</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="event-bookings-section">
                    <div class="bookings-header">
                      <h4>Bookings (${eventBookings.length})</h4>
                      <div class="event-actions-inline">
                        <a href="event-detail.html?id=${event.id}" class="btn btn-ghost btn-xs">View</a>
                        <a href="edit-event.html?id=${event.id}" class="btn btn-ghost btn-xs">Edit</a>
                        ${adminBooked ? 
                          `<button class="btn btn-ghost btn-xs" disabled>✓ Booked</button>` : 
                          `<button class="btn btn-primary btn-xs" onclick="quickBookEvent('${event.id}')">Book</button>`
                        }
                      </div>
                    </div>
                    ${eventBookings.length === 0 ? `
                      <p class="no-bookings">No bookings yet for this event</p>
                    ` : `
                      <div class="bookings-table-mini">
                        <table>
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Contact</th>
                              <th>Tickets</th>
                              <th>Amount</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${eventBookings.slice(0, 5).map(booking => {
                              const bookingUser = users.find(u => u.id === booking.userId);
                              return `
                                <tr>
                                  <td><strong>${bookingUser?.name || booking.userName}</strong></td>
                                  <td>
                                    <small>${booking.userEmail}</small><br>
                                    <small>${booking.userPhone}</small>
                                  </td>
                                  <td>${booking.numberOfTickets}</td>
                                  <td>NPR ${booking.totalAmount.toLocaleString()}</td>
                                  <td><small>${new Date(booking.bookedAt).toLocaleDateString()}</small></td>
                                </tr>
                              `;
                            }).join('')}
                          </tbody>
                        </table>
                        ${eventBookings.length > 5 ? `<p class="more-bookings">+ ${eventBookings.length - 5} more bookings</p>` : ''}
                      </div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <div class="tab-content" id="tab-all-bookings">
        <div class="section-header">
          <h2>All Bookings</h2>
          <div class="filter-group">
            <select id="booking-status-filter" class="filter-select">
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        ${allBookings.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎫</div>
            <h3>No bookings yet</h3>
            <p>Bookings will appear here once users start registering for events.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Event</th>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Tickets</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Booked On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allBookings.map(booking => `
                  <tr class="booking-row-${booking.status}">
                    <td><code>${booking.id.substring(0, 8)}</code></td>
                    <td>
                      <div class="table-event-info">
                        <strong>${booking.event?.title || 'N/A'}</strong>
                        <small>${booking.event ? formatDate(booking.event.date) : ''}</small>
                      </div>
                    </td>
                    <td>${booking.user?.name || booking.userName}</td>
                    <td>
                      <div class="table-contact-info">
                        <small>${booking.userEmail}</small>
                        <small>${booking.userPhone}</small>
                      </div>
                    </td>
                    <td>${booking.numberOfTickets}</td>
                    <td>NPR ${booking.totalAmount.toLocaleString()}</td>
                    <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                    <td>${new Date(booking.bookedAt).toLocaleDateString()}</td>
                    <td>
                      ${booking.event ? `<a href="event-detail.html?id=${booking.event.id}" class="btn btn-ghost btn-xs">View Event</a>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <div class="tab-content" id="tab-booking-details">
        <div class="section-header">
          <h2>Detailed Booking Information</h2>
          <p class="section-description">See who booked which events with complete details</p>
        </div>
        
        ${events.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3>No events yet</h3>
            <p>Create events to see booking details!</p>
          </div>
        ` : `
          ${events.map(event => {
            const eventBookings = getBookingsByEvent(event.id);
            const confirmedEventBookings = eventBookings.filter(b => b.status === 'confirmed');
            const stats = getEventStats(event.id);
            
            if (eventBookings.length === 0) return '';
            
            return `
              <div class="admin-event-detail-card" style="margin-bottom: 32px;">
                <div class="event-detail-header-row">
                  <div class="event-detail-left">
                    <div class="event-detail-image-small">
                      <img src="${event.image || DEFAULT_EVENT_IMAGE}" alt="${event.title}">
                    </div>
                    <div class="event-detail-info">
                      <h3>${event.title}</h3>
                      <div class="event-detail-meta">
                        <span>📅 ${formatDate(event.date)}</span>
                        <span>🕐 ${formatTime(event.time)}</span>
                        <span>📍 ${event.location}</span>
                        <span>🏷️ ${event.category}</span>
                      </div>
                    </div>
                  </div>
                  <div class="event-detail-stats-row">
                    <div class="stat-mini">
                      <span class="stat-mini-value">${stats.totalBookings}</span>
                      <span class="stat-mini-label">Bookings</span>
                    </div>
                    <div class="stat-mini">
                      <span class="stat-mini-value">${stats.totalTickets}</span>
                      <span class="stat-mini-label">Tickets</span>
                    </div>
                    <div class="stat-mini">
                      <span class="stat-mini-value">${event.capacity || '∞'}</span>
                      <span class="stat-mini-label">Capacity</span>
                    </div>
                    <div class="stat-mini">
                      <span class="stat-mini-value">NPR ${stats.totalRevenue.toLocaleString()}</span>
                      <span class="stat-mini-label">Revenue</span>
                    </div>
                  </div>
                </div>
                
                <div class="event-bookings-section">
                  <div class="bookings-header">
                    <h4>Who Booked This Event (${confirmedEventBookings.length} ${confirmedEventBookings.length === 1 ? 'person' : 'people'})</h4>
                  </div>
                  
                  ${confirmedEventBookings.length === 0 ? `
                    <p class="no-bookings">No confirmed bookings yet</p>
                  ` : `
                    <div class="table-responsive">
                      <table class="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Tickets</th>
                            <th>Amount Paid</th>
                            <th>Booking Date</th>
                            <th>Booking ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${confirmedEventBookings.map((booking, index) => {
                            const bookingUser = users.find(u => u.id === booking.userId);
                            return `
                              <tr>
                                <td><strong>${index + 1}</strong></td>
                                <td>
                                  <strong>${bookingUser?.name || booking.userName}</strong>
                                  ${bookingUser?.role === 'admin' ? '<span class="role-badge role-admin" style="margin-left: 8px;">Admin</span>' : ''}
                                </td>
                                <td>${booking.userEmail}</td>
                                <td>${booking.userPhone}</td>
                                <td><strong>${booking.numberOfTickets}</strong></td>
                                <td><strong>NPR ${booking.totalAmount.toLocaleString()}</strong></td>
                                <td>${new Date(booking.bookedAt).toLocaleDateString()} ${new Date(booking.bookedAt).toLocaleTimeString()}</td>
                                <td><code>${booking.id.substring(0, 10)}</code></td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                        <tfoot>
                          <tr style="background: var(--bg-secondary); font-weight: 600;">
                            <td colspan="4" style="text-align: right;"><strong>TOTALS:</strong></td>
                            <td><strong>${stats.totalTickets} tickets</strong></td>
                            <td><strong>NPR ${stats.totalRevenue.toLocaleString()}</strong></td>
                            <td colspan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  `}
                  
                  ${eventBookings.filter(b => b.status === 'cancelled').length > 0 ? `
                    <div style="margin-top: 24px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius); border-left: 4px solid var(--danger);">
                      <h5 style="margin-bottom: 12px; color: var(--danger);">Cancelled Bookings (${eventBookings.filter(b => b.status === 'cancelled').length})</h5>
                      <div class="table-responsive">
                        <table class="data-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Tickets</th>
                              <th>Amount</th>
                              <th>Cancelled On</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${eventBookings.filter(b => b.status === 'cancelled').map(booking => {
                              const bookingUser = users.find(u => u.id === booking.userId);
                              return `
                                <tr>
                                  <td>${bookingUser?.name || booking.userName}</td>
                                  <td>${booking.numberOfTickets}</td>
                                  <td>NPR ${booking.totalAmount.toLocaleString()}</td>
                                  <td>${new Date(booking.bookedAt).toLocaleDateString()}</td>
                                </tr>
                              `;
                            }).join('')}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        `}
      </div>

      <div class="tab-content" id="tab-my-bookings">
        <div class="section-header">
          <h2>My Personal Bookings</h2>
          <p class="section-description">Events you have booked as an admin</p>
        </div>
        ${adminBookings.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎫</div>
            <h3>No personal bookings yet</h3>
            <p>Book events to attend them yourself!</p>
            <a href="events.html" class="btn btn-primary">Browse Events</a>
          </div>
        ` : `
          <div class="bookings-list">
            ${adminBookings.map(booking => {
              const event = events.find(e => e.id === booking.eventId);
              return `
                <div class="booking-card ${booking.status === 'cancelled' ? 'cancelled' : ''}">
                  <div class="booking-card-image">
                    <img src="${event?.image || DEFAULT_EVENT_IMAGE}" alt="${event?.title || 'Event'}">
                    <span class="booking-status status-${booking.status}">${booking.status}</span>
                  </div>
                  <div class="booking-card-content">
                    <h3>${event?.title || 'Event Not Found'}</h3>
                    <div class="booking-details">
                      <div class="booking-detail-item">
                        <span class="detail-icon">📅</span>
                        <span>${event ? formatDate(event.date) : 'N/A'}</span>
                      </div>
                      <div class="booking-detail-item">
                        <span class="detail-icon">🕐</span>
                        <span>${event ? formatTime(event.time) : 'N/A'}</span>
                      </div>
                      <div class="booking-detail-item">
                        <span class="detail-icon">📍</span>
                        <span>${event?.location || 'N/A'}</span>
                      </div>
                      <div class="booking-detail-item">
                        <span class="detail-icon">🎫</span>
                        <span>${booking.numberOfTickets} ticket(s)</span>
                      </div>
                      <div class="booking-detail-item">
                        <span class="detail-icon">💰</span>
                        <span>NPR ${booking.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div class="booking-meta">
                      <small>Booked on ${new Date(booking.bookedAt).toLocaleDateString()}</small>
                      <small>Booking ID: ${booking.id}</small>
                    </div>
                    <div class="booking-actions">
                      ${event ? `<a href="event-detail.html?id=${event.id}" class="btn btn-ghost btn-sm">View Event</a>` : ''}
                      ${booking.status === 'confirmed' ? `<button class="btn btn-danger btn-sm" onclick="handleCancelBooking('${booking.id}')">Cancel Booking</button>` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <div class="tab-content" id="tab-all-users">
        <div class="section-header">
          <h2>Registered Users</h2>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Events Created</th>
                <th>Bookings Made</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => {
                const userEvents = events.filter(e => e.createdBy === u.id);
                const userBookings = getBookingsByUser(u.id).filter(b => b.status === 'confirmed');
                const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                return `
                  <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td><span class="role-badge role-${u.role}">${u.role}</span></td>
                    <td>${userEvents.length}</td>
                    <td>${userBookings.length}</td>
                    <td>NPR ${totalSpent.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  initDashboardTabs();
}

function initDashboardTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

function handleCancelBooking(bookingId) {
  if (confirm('Are you sure you want to cancel this booking?')) {
    cancelBooking(bookingId);
    showToast('Booking cancelled successfully.');
    initDashboard();
  }
}

function handleDeleteEvent(eventId) {
  if (confirm('Delete this event? This will also affect all bookings.')) {
    deleteEvent(eventId);
    showToast('Event deleted.');
    initDashboard();
  }
}

function quickBookEvent(eventId) {
  const event = getEventById(eventId);
  if (!event) {
    showToast('Event not found.', 'error');
    return;
  }
  if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=dashboard.html';
    return;
  }
  showBookingModal(event);
}

// ---------- Nav/Footer (auth-aware) ----------
function initNav() {
  const guest = document.querySelector('.nav-guest');
  const authed = document.querySelector('.nav-authed');
  if (guest) guest.style.display = isLoggedIn() ? 'none' : 'flex';
  if (authed) authed.style.display = isLoggedIn() ? 'flex' : 'none';
  const userSpan = document.querySelector('.nav-user-name');
  if (userSpan && getCurrentUser()) userSpan.textContent = getCurrentUser().name;
  
  // Hide/show Create Event link based on user role (only admins can create)
  const user = getCurrentUser();
  const createEventLinks = document.querySelectorAll('a[href="create-event.html"]');
  if (user && user.role !== 'admin') {
    createEventLinks.forEach(link => {
      // Hide navigation and footer links for non-admin users
      if (link.closest('.nav-links') || link.closest('.footer-links')) {
        link.style.display = 'none';
      }
    });
  }
  
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('is-open'));
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); window.location.href = 'index.html'; });
}

// ---------- Page init ----------
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  if (document.querySelector('#events-grid')) {
    initEventsPage();
    ['#search', '#category', '#location'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.addEventListener('input', initEventsPage).addEventListener('change', initEventsPage);
    });
  }
  if (document.querySelector('#event-detail-root')) initEventDetail();
  if (document.getElementById('create-event-form')) initCreateEventForm();
  if (document.getElementById('edit-event-form')) initEditEventForm();
  if (document.getElementById('register-form')) initRegisterForm();
  if (document.getElementById('login-form')) initLoginForm();
  if (document.getElementById('profile-form')) initProfileForm();
  if (document.getElementById('contact-form')) initContactForm();
  if (document.getElementById('dashboard-root')) initDashboard();
});
