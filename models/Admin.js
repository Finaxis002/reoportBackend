const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  caSign: {
    type: String, // Save file path or base64 data
    required: false
  },
  roles: {
    createNew: { type: Boolean, default: false },
    createFromExisting: { type: Boolean, default: false },
    updateReport: { type: Boolean, default: false },
    generateReport: { type: Boolean, default: false },
    checkPDF: { type: Boolean, default: false },
  },
});

// ✅ Hash the password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Method to compare passwords during login
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Export the model
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
