const mongoose = require("mongoose");


// Define Employee Schema (separate from your User schema)
const EmployeeSchema = new mongoose.Schema(
    {
      employeeId: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      designation: { type: String, required: true },
      password: { type: String, required: true } // In production, store a hashed password!
    },
    {
      collection: "employees" // Using a separate collection for employees
    }
  );
  
  
  
  // Create Employee Model
  const Employee = mongoose.model("Employee", EmployeeSchema);