const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Conference', 'Workshop', 'Networking', 'Meetup', 'Marriage', 'Engagement', 'Reception', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
  },
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search and filtering
eventSchema.index({ title: 'text', description: 'text', location: 'text' });
eventSchema.index({ date: 1, category: 1 });

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - (this.bookedTickets || 0);
});

module.exports = mongoose.model('Event', eventSchema);
