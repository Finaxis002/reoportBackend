const mongoose = require('mongoose');

const consultantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  logo: {  // Changed from logo to logo for consistency
    type: String,
    default: null
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better search performance
consultantSchema.index({ name: 'text', email: 'text', mobile: 'text' });

// Static method to search consultants
consultantSchema.statics.searchConsultants = function(searchTerm) {
  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { mobile: { $regex: searchTerm, $options: 'i' } },
      { address: { $regex: searchTerm, $options: 'i' } }
    ],
    isActive: true
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Consultant', consultantSchema);