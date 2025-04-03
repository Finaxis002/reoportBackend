const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  clientName: { type: String, required: true }, // Client Name
  contactNo: { type: String, required: true },  // Mobile Number
  emailId: { type: String, required: true, unique: true }, // Email ID
  address: { type: String, required: true },    // Address
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
