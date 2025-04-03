const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true // Plain text password
  },
  caSign: {
    type: String,
    required: false
  },
  permissions: {
    generateReport: { type: Boolean, default: false },
    updateReport: { type: Boolean, default: false },
    createNewWithExisting: { type: Boolean, default: false },
    downloadPDF: { type: Boolean, default: false },
    exportData: {type: Boolean , default: false},
  },
});

// ❌ Remove bcrypt pre-save hook
// ❌ Remove password comparison method

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
