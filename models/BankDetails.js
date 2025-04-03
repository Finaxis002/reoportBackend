const mongoose = require('mongoose');

const BankDetailsSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    clientName: { type: String, required: true },
    bankName: { type: String, required: true },
    managerName: { type: String, required: true },
    post: { type: String, required: true },
    contactNo: { type: String, required: true },
    emailId: { type: String, required: true },
    ifscCode: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);

const BankDetails = mongoose.model('BankDetails', BankDetailsSchema);

module.exports = BankDetails;
