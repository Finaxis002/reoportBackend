const mongoose = require('mongoose');

const BankDetailsSchema = new mongoose.Schema(
  {
    businessName: String,
    clientName: String,
    bankName: { type: String, required: true },
    managerName: { type: String, required: true },
    post: String,
    contactNo: { type: String, required: true },
    emailId: String,
    ifscCode: String,
    city: { type: String, required: true },
    branchAddress: String,
  },
  { timestamps: true }
);

const BankDetails = mongoose.model('BankDetails', BankDetailsSchema);

module.exports = BankDetails;
