const mongoose = require("mongoose");



const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    designation: { type: String, required: true },
    password: { type: String, required: true }, // In production, store a hashed password!
    permissions: {
      generateReport: { type: Boolean, default: false },
      updateReport: { type: Boolean, default: false },
      createNewWithExisting: { type: Boolean, default: false },
      downloadPDF: { type: Boolean, default: false },
      exportData: { type: Boolean, default: false },
       generateWord: {type: Boolean, default: false},
       advanceReport: {type: Boolean, default: false},
      generateGraph: {type: Boolean, default: false},
      cmaData: {type: Boolean, default: false},
    },
    // In your Mongoose schema
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "employees", // Use a separate collection for employees
  }
);

module.exports = mongoose.model("Employee", EmployeeSchema);