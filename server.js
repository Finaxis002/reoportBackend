require("dotenv").config();  // ✅ Load environment variables at the start
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const bodyParser = require("body-parser"); // Not needed if using express.json()
const UserfetchModel = require("./models/Users");
const Task = require("./models/Task"); // Create a Task model
const Notification = require("./models/Notification");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid"); // ✅ Correct import
const multer = require("multer");
const path = require("path");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('./models/Admin');
const moment = require('moment');
// const adminRoutes = require('./routes/adminRoutes')
const FormData = require("./models/formdatas")
const bankRoutes = require('./routes/bankRoutes');
const clientRoutes = require('./routes/clientRoute');
const formdatasRoutes = require('./routes/formdatasRoute')
const axios = require('axios');
const connectDB = require("./config/db");
// const http = require('http');
// const { Server } = require("socket.io");



const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/api/admin', adminRoutes)
// app.use(cors({ origin: "http://localhost:3000" }));
// (Note: express.json() is built-in so you don't need bodyParser.json())

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static files from the uploads folder
// ✅ Use Routes
app.use('/api', bankRoutes);

app.use("/api/clients", clientRoutes);

app.use("/api", formdatasRoutes);

// 🔁 4. Create HTTP server and bind Socket.IO
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:3000",
//       "https://frontend-dashboard-liart.vercel.app/"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"]
//   }
// });

// app.set("io", io);

// io.on("connection", (socket) => {
//   console.log("🟢 A user connected: ", socket.id);

//   // ✅ Join specific room based on employeeId
//   socket.on("join", (employeeId) => {
//     console.log(`🔔 Employee ${employeeId} joined notifications room`);
//     socket.join(employeeId);
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 A user disconnected:", socket.id);
//   });
// });


// ✅ Debug: Print the environment variable
console.log("🔍 MongoDB URI:", process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is not defined. Check your .env file!");
  process.exit(1);  // Stop the server if no DB URI is found
}

// ✅ Connect to MongoDB with updated URI
connectDB();
// mongoose
//   .connect("mongodb+srv://finaxis-user-31:RK8%28ha7Haa7%23jU%25@cluster0.ykhfs.mongodb.net/test?retryWrites=true&w=majority", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB Atlas connected"))
//   .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// JWT token authentication
  const JWT_SECRET = process.env.JWT_SECRET; // Get from .env
  
  
  // Connect to MongoDB
// mongoose
//   .connect("mongodb://127.0.0.1:27017/test", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("Error connecting to MongoDB:", err));

/* ============================
     User Schema & Endpoints
   ============================ */

// Define Schema



// Configure Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to the 'uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Unique filename
  },
});

// File Filter (Optional - to allow only specific file types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .png, and .pdf files are allowed"), false);
  }
};

// Set up Multer middleware
const upload = multer({ storage, fileFilter });
// const upload = multer({ storage }).single('caSign');



app.post("/save-step", upload.single("file"), async (req, res) => {
  try {
      console.log("🔹 Incoming Request to /save-step:", req.body);

      const { sessionId, step, data } = req.body;
      let updateData;

      try {
          updateData = data ? JSON.parse(data) : {};
      } catch (jsonError) {
          console.error("🔥 JSON Parsing Error:", jsonError);
          return res.status(400).json({ message: "Invalid JSON data", error: jsonError.message });
      }

      console.log("📌 Parsed Data Before File Processing:", updateData);

      if (!updateData.AccountInformation) {
          updateData.AccountInformation = {};
      }

      if (req.file) {
          console.log("📂 File Uploaded:", req.file);
          updateData.AccountInformation.logoOfBusiness = `/uploads/${req.file.filename}`;
      }

      if (!sessionId || sessionId === "undefined") {
          // 🛑 Step 1 - Check if document already exists before creating a new one
          console.log("🛑 Checking if a report already exists...");

          const existingForm = await FormData.findOne({ step: 1, ...updateData });

          if (existingForm) {
              console.log("⚠️ Report already exists, using existing sessionId:", existingForm.sessionId);
              return res.status(200).json({
                  message: "Report already exists, updating sessionId",
                  sessionId: existingForm.sessionId,
                  filePath: updateData.AccountInformation.logoOfBusiness || null,
              });
          }

          console.log("🆕 Creating New Report...");
          const newSessionId = uuidv4();
          const newForm = new FormData({ sessionId: newSessionId, ...updateData });

          await newForm.save();

          return res.status(201).json({
              message: "New report created successfully",
              sessionId: newSessionId,
              filePath: updateData.AccountInformation.logoOfBusiness || null,
          });
      }

      console.log("🔄 Updating Existing Report for sessionId:", sessionId);

      const updatedForm = await FormData.findOneAndUpdate(
          { sessionId },
          { $set: updateData },
          { new: true, upsert: false }
      );

      if (!updatedForm) {
          console.error("❌ Session ID not found:", sessionId);
          return res.status(404).json({ message: "Session ID not found" });
      }

      console.log("✅ Data Updated Successfully:", updatedForm);
      return res.status(200).json({ message: "Data updated successfully", filePath: updateData.AccountInformation.logoOfBusiness || null });

  } catch (error) {
      console.error("🔥 Error in /save-step API:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.post("/create-new-from-existing", upload.single("file"), async (req, res) => {
  try {
      console.log("🔹 Incoming Request to /create-new-from-existing:", req.body);

      if (!req.body.data) {
          return res.status(400).json({ message: "Missing data in request body" });
      }

      let newData;
      try {
          newData = JSON.parse(req.body.data);
      } catch (jsonError) {
          console.error("🔥 JSON Parsing Error:", jsonError);
          return res.status(400).json({ message: "Invalid JSON format", error: jsonError.message });
      }

      console.log("📌 Parsed Data Before File Processing:", newData);

      // ✅ Ensure `AccountInformation` exists
      if (!newData.AccountInformation) {
          newData.AccountInformation = {};
      }

      // ✅ Handle file upload
      if (req.file) {
          console.log("📂 File Uploaded:", req.file);
          newData.AccountInformation.logoOfBusiness = `/uploads/${req.file.filename}`;
      }

      let sessionToUse = newData.sessionId;

      if (sessionToUse) {
          // ✅ If sessionId exists, update the existing document
          console.log("🔄 Updating existing document for sessionId:", sessionToUse);

          const updatedForm = await FormData.findOneAndUpdate(
              { sessionId: sessionToUse },
              { $set: newData },
              { new: true, upsert: false }
          );

          if (!updatedForm) {
              return res.status(404).json({ message: "Session ID not found" });
          }

          return res.status(200).json({
              message: "Data updated successfully",
              sessionId: sessionToUse,
              filePath: newData.AccountInformation.logoOfBusiness || null,
          });
      }

      // ✅ If no sessionId, create a new document (only for Step 1)
      const newSessionId = uuidv4();
      console.log("🆕 Creating a New Report with sessionId:", newSessionId);

      const newForm = new FormData({ sessionId: newSessionId, ...newData });

      await newForm.save();
      console.log("✅ New Document Saved Successfully:", newSessionId);

      return res.status(201).json({
          message: "New report created successfully",
          sessionId: newSessionId, // ✅ Return sessionId so frontend can store it
          filePath: newData.AccountInformation.logoOfBusiness || null,
      });

  } catch (error) {
      console.error("🔥 Error in /create-new-from-existing API:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.get("/fetch-business-data", async (req, res) => {
  let { businessName, clientName, isCreateReportWithExistingClicked } = req.query;

  if (!businessName?.trim() && !clientName?.trim()) {
    return res.status(400).json({ message: "Either businessName or clientName is required" });
  }

  try {
    let query = {};

    if (businessName?.trim()) {
      query["AccountInformation.businessName"] = { $regex: businessName.trim(), $options: "i" }; // ✅ Partial match
    }

    if (clientName?.trim()) {
      query["AccountInformation.clientName"] = { $regex: clientName.trim(), $options: "i" }; // ✅ Partial match
    }

    console.log("🔍 Query Conditions:", query);

    let selectFields = "-__v"; // ✅ Exclude unnecessary fields
    if (isCreateReportWithExistingClicked === "true") {
      selectFields += " -sessionId"; // ✅ Exclude sessionId when creating new with existing
    }

    console.log("📌 Selected Fields:", selectFields);

    // ✅ Optimize with `.lean()` and dynamically select fields
    const businessData = await FormData.find(query).select(selectFields).lean();

    console.log("✅ Query Result:", businessData);

    if (!businessData.length) {
      return res.status(404).json({ message: "No records found for the given criteria" });
    }

    return res.status(200).json({ message: "Business data fetched successfully", data: businessData });
  } catch (error) {
    console.error("❌ Error fetching business data:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.post("/update-step", async (req, res) => {
  const { sessionId, data } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required for updating." });
    }

    // Find and update the existing document
    const updatedForm = await FormData.findOneAndUpdate(
      { sessionId },
      { $set: data },
      { new: true } // Return the updated document
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Session ID not found. Cannot update." });
    }

    return res.status(200).json({ message: "Data updated successfully." });
  } catch (error) {
    console.error("Error updating form data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/clients", async (req, res) => {
  try {
    // Fetch only client names from AccountInformation field
    const clients = await FormData.find(
      {},
      { "AccountInformation.clientName": 1, _id: 0 }
    );

    // Extract only client names into an array
    const clientNames = clients
      .map((client) => client.AccountInformation?.clientName)
      .filter((name) => name); // Filter out any null or undefined values

    res.status(200).json({ clientNames });
  } catch (error) {
    console.error("Error fetching client names:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/api/businesses", async (req, res) => {
  try {
    // Fetch all business names along with their client names
    const businesses = await FormData.find(
      {},
      { "AccountInformation.clientName": 1, "AccountInformation.businessName": 1, _id: 0 }
    );

    if (!businesses.length) {
      return res.status(404).json({ message: "No businesses found" });
    }

    // Format the result as "BusinessName (ClientName)"
    const formattedBusinessNames = businesses
      .map(({ AccountInformation }) => {
        const clientName = AccountInformation?.clientName || "Unknown Client";
        const businessName = AccountInformation?.businessName || "Unknown Business";
        return `${businessName} (${clientName})`;
      })
      .filter((entry) => entry !== "Unknown Business (Unknown Client)"); // Remove empty entries

    res.status(200).json({ businesses: formattedBusinessNames });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get all users from another model (if needed)
app.get("/api/getUsers", (req, res) => {
  UserfetchModel.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

/* ============================
   Employee Schema & Endpoints
   ============================ */

// Define Employee Schema (separate from your User schema)
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


// Create Employee Model
const Employee = mongoose.model("Employee", EmployeeSchema);



// Endpoint to register (create) a new employee
app.post("/api/employees/register", async (req, res) => {
  const { employeeId, name, email, designation, password, permissions } = req.body;
  
  if (!employeeId || !name || !email || !designation || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newEmployee = await Employee.create({
      employeeId,
      name,
      email,
      designation,
      password,
      permissions,
    });
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: "Failed to create employee" });
  }
});



app.post("/api/employees/login", async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(401).json({ error: "Invalid employee ID" });
    }

    if (employee.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    if (employee.isLoggedIn) {
      return res.status(403).json({ error: "Already logged in from another device" });
    }

    // ✅ Set login status
    employee.isLoggedIn = true;
    await employee.save();

    res.json({ success: true, employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/employees/logout", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    employee.isLoggedIn = false;
    await employee.save();

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get all employees
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE endpoint to remove an employee by employeeId
app.delete("/api/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    // Find and remove the employee by employeeId
    const result = await Employee.findOneAndDelete({ employeeId });
    if (!result) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT endpoint to update an employee by employeeId
// app.put("/api/employees/:employeeId", async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     // Update the employee with the new data from the request body
//     const updatedEmployee = await Employee.findOneAndUpdate(
//       { employeeId },
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!updatedEmployee) {
//       return res.status(404).json({ error: "Employee not found" });
//     }
//     res.status(200).json({
//       message: "Employee updated successfully",
//       employee: updatedEmployee,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


/* ============================
   Fetch Employee on Employee Dashboard
   ============================ */

// GET endpoint to retrieve a single employee by employeeId
app.get("/api/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT endpoint to update an employee by employeeId
app.put("/api/employees/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST endpoint to create a task

// app.post("/api/tasks", async (req, res) => {
//   try {
//     const { employeeId, taskTitle, taskDescription, dueDate } = req.body;

//     const employee = await Employee.findOne({ employeeId });
//     if (!employee) {
//       return res.status(404).json({ error: "Employee not found" });
//     }

//     const newTask = new Task({
//       employeeId,
//       taskTitle,
//       taskDescription,
//       dueDate,
//       createdAt: new Date(),
//     });

//     await newTask.save();

//     const adminNotification = new Notification({
//       employeeId,
//       taskId: newTask._id,
//       message: `You assigned a new task "${taskTitle}" to ${employee.name}.`,
//       employeeName: employee.name,
//       type: 'admin',
//       createdAt: new Date(),
//       read: false,
//     });

//     await adminNotification.save();

//     const employeeNotification = new Notification({
//       employeeId,
//       taskId: newTask._id,
//       message: `Task "${taskTitle}" is assigned to you.`,
//       employeeName: employee.name,
//       type: 'employee',
//       createdAt: new Date(),
//       read: false,
//     });

//     await employeeNotification.save();
//     console.log("✅ Employee Notification Created:", employeeNotification);

//     res.status(201).json({
//       message: "Task assigned successfully",
//       task: newTask,
//     });
//   } catch (err) {
//     console.error("Error assigning task:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
app.post("/api/tasks", async (req, res) => {
  try {
    const { employeeId, taskTitle, taskDescription, dueDate } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      console.error(`❌ Employee not found with ID: ${employeeId}`);
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ Create the task
    const newTask = new Task({
      employeeId,
      taskTitle,
      taskDescription,
      dueDate,
      createdAt: new Date(),
    });

    await newTask.save();

    const formattedDate = moment(newTask.createdAt).format('DD-MM-YYYY'); 

    // ✅ Create an Admin Notification
    const adminNotification = new Notification({
      employeeId,
      taskId: newTask._id,
      message: ` You assigned a new task "${taskTitle}" to ${employee.name} on ${formattedDate}.`,
      employeeName: employee.name,
      type: 'admin',
      createdAt: new Date(),
      read: false,
    });

    await adminNotification.save();

    // ✅ Create an Employee Notification (NEW Change)
    console.log("🚀 Attempting to create Employee Notification...");
    const employeeNotification = new Notification({
      employeeId,
      taskId: newTask._id,
      message: `Task "${taskTitle}" is assigned to you on ${formattedDate}.`,
      employeeName: employee.name,
      type: 'employee', // ✅ Type for employee notification
      createdAt: new Date(),
      read: false,
    });

    console.log("🚀 Created Employee Notification Object:", employeeNotification);

    await employeeNotification.save(); // ✅ SAVE TO DB
    console.log("✅ Employee Notification Created in DB");

//     const io = req.app.get("io"); // 👈 Get socket instance
// io.to(employeeId).emit("new-notification", employeeNotification); // 👈 Emit real-time update

    res.status(201).json({
      message: "Task assigned successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("❌ Error assigning task:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update the route to use a query parameter
app.get("/api/tasks", async (req, res) => {
  try {
    const { employeeId } = req.query; // Note: now using req.query
    if (!employeeId) {
      return res
        .status(400)
        .json({ error: "employeeId query parameter is required" });
    }
    const tasks = await Task.find({ employeeId });
    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ error: "No tasks found for this employee" });
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT endpoint to update task status
app.put("/api/tasks/:taskId", async (req, res) => {
  try {
    const { status, employeeId } = req.body;
    const { taskId } = req.params;

    // ✅ Update Task Status
    const task = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // ✅ Fetch employeeName from Employee schema using employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ If status is changed to Completed – Notify Admin
    if (status === "Completed") {
      const completionNotification = new Notification({
        employeeId,
        taskId: task._id,
        message: `Task "${task.taskTitle}" has been marked as completed by ${employee.name}.`,
        employeeName: employee.name,
        type: 'admin', // ✅ Notify Admin when task is completed
        createdAt: new Date(),
        read: false,
      });

      await completionNotification.save();
//       const io = req.app.get("io");
// io.to(employeeId).emit("new-notification", employeeNotification);

    }

    // ✅ Send Status Update Notification to Employee
    const employeeNotification = new Notification({
      employeeId,
      taskId: task._id,
      message: `Task "${task.taskTitle}" status has been updated to "${status}".`,
      employeeName: employee.name,
      type: 'employee', // ✅ Notify Employee about task status change
      createdAt: new Date(),
      read: false,
    });

    await employeeNotification.save();
    console.log("✅ Employee Notification Saved:", employeeNotification); 
    res.status(200).json({ task });
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET endpoint for admin notifications
// app.get("/api/admin/notifications", async (req, res) => {
//   try {
//     const notifications = await Notification.find({})
//       .sort({ createdAt: -1 })
//       .limit(20); // ✅ Limit to 20 recent notifications

//     res.status(200).json(notifications);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// ✅ GET endpoint for admin notifications

app.get("/api/admin/notifications", async (req, res) => {
  try {
    // ✅ Filter only admin notifications
    const notifications = await Notification.find({ type: 'admin' })
      .sort({ createdAt: -1 })
      .limit(20); // ✅ Limit to 20 recent notifications

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ✅ GET endpoint for fetching employee notifications
app.get("/api/notifications/employee", async (req, res) => {
  try {
    const { employeeId, limit = 20, page = 1, read } = req.query;

    if (!employeeId) {
      console.error("❌ Employee ID is required");
      return res.status(400).json({ error: "Employee ID is required" });
    }

    console.log(`🔎 Fetching notifications for employeeId: ${employeeId}`);

    let query = { 
      employeeId, 
      type: 'employee' 
    };

    if (read !== undefined) query.read = read === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalNotifications = await Notification.countDocuments(query);

    console.log("✅ Retrieved Notifications from DB:", notifications);

    res.status(200).json({
      notifications,
      totalNotifications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalNotifications / limit),
    });
  } catch (err) {
    console.error("❌ Error fetching employee notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET unseen notifications for an employee
app.get("/api/notifications/unseen", async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const unseenNotifications = await Notification.find({
      employeeId,
      type: "employee",
      read: false,
    }).sort({ createdAt: -1 });

    res.status(200).json(unseenNotifications);
  } catch (err) {
    console.error("❌ Error fetching unseen notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ✅ PUT to mark all employee notifications as read
app.put("/api/notifications/mark-seen", async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const result = await Notification.updateMany(
      { employeeId, type: "employee", read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: "All unseen notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("❌ Error marking notifications as seen:", err.message);
    res.status(500).json({ error: err.message });
  }
});




// app.post("/api/mark-notification-read", async (req, res) => {
//   const { notificationId } = req.body;

//   try {
//     await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
//     res.status(200).json({ success: true });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating status" });
//   }
// });


app.post('/api/admin/register', upload.single('caSign'), async (req, res) => {
  const { username, password, roles } = req.body;
  const caSign = req.file ? `/uploads/${req.file.filename}` : null; // Save file path

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new admin
    const admin = new Admin({
      username,
      password,
      caSign,
      roles: JSON.parse(roles), 
    });

    await admin.save();

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(201).json({ message: 'Admin registered successfully', token });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Admin login Route
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({ token,
       message: 'Login successful',
       username: admin.username 
       });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//fetch all admin names
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find({}, 'username caSign roles');
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins' });
  }
});

// Delete Admin by ID
app.delete('/api/admin/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Edit Admin by ID
// app.put('/api/admin/:id', async (req, res) => {
//   const { id } = req.params;
//   const { username, password, roles } = req.body;

//   try {
//     const admin = await Admin.findById(id);
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     if (username) admin.username = username;
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       admin.password = await bcrypt.hash(password, salt);
//     }
//     // ✅ Update roles
//     if (roles) {
//       admin.roles = JSON.parse(roles);
//     }


//     await admin.save();

//     res.status(200).json({ message: 'Admin updated successfully' });
//   } catch (error) {
//     console.error('Error updating admin:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });
app.put('/api/admin/:id', upload.single('caSign'), async (req, res) => {
  const { id } = req.params;
  const { username, password, roles } = req.body;
  console.log('Request body:', req.body); // Debug log to check what is being sent

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (username) admin.username = username;
    
    // ✅ Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    // ✅ Update CA Sign (file upload)
    if (req.file) {
      admin.caSign = `/uploads/${req.file.filename}`;
    }

    // ✅ Update roles
    if (roles) {
      admin.roles = JSON.parse(roles);
    }

    await admin.save();
    console.log('Updated Admin:', admin);
    res.status(200).json({ message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Add a middleware
const protectAdmin = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

app.get("/get-report", async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (sessionId) {
      console.log(`🔎 Fetching report with sessionId: ${sessionId}`);

      const report = await FormData.findOne({ sessionId: String(sessionId) });

      if (!report) {
        console.log(`❌ Report not found for sessionId: ${sessionId}`);
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      console.log("✅ Report fetched successfully:", report);
      return res.status(200).json({
        success: true,
        data: report,
      });
    } else {
      console.log("🔎 Fetching all reports...");

      const reports = await FormData.find();

      if (!reports.length) {
        console.log("❌ No reports found");
        return res.status(404).json({
          success: false,
          message: "No reports found",
        });
      }

      console.log(`✅ Fetched ${reports.length} reports`);
      return res.status(200).json({
        success: true,
        totalReports: reports.length,
        data: reports,
      });
    }
  } catch (error) {
    console.error("🔥 Error in /get-report API:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/get-report-data/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const report = await FormData.findOne({ sessionId: String(sessionId) });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("🔥 Error fetching report data:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

//Bank Details
// Create Schema and Model
const bankDetailsSchema = new mongoose.Schema({
  sessionId: String,
  AccountInformation: {
    clientName: String,
    businessName : String,
  },
  
  ProjectReportSetting: {
    BankDetails: {
      Bank: {
        name: String,
        id: String,
        value: { type: String, default: "" },
        isCustom: Boolean,
      },
      BankManagerName: {
        name: String,
        id: String,
        value: { type: String, default: "" },
        isCustom: Boolean,
      },
      Post: {
        name: String,
        id: String,
        value: { type: String, default: "" },
        isCustom: Boolean,
      },
      ContactNo: {
        name: String,
        id: String,
        value: { type: String, default: "" },
        isCustom: Boolean,
      },
      EmailId: {
        name: String,
        id: String,
        value: { type: String, default: "" },
        isCustom: Boolean,
      },
      IFSCCode: {
        name: String,
        id: String,
        value: { type: String, default: "" },
        isCustom: Boolean,
      },
      City: {
        name: String,
        id: String,
        value: { type: String, default: "" },
        isCustom: Boolean,
      },
    },
  },
});

const BankDetails = mongoose.model('formdatas', bankDetailsSchema);


app.get("/api/bank-details", async (req, res) => {
  try {
    // ✅ Fetch all documents from the collection
    const data = await BankDetails.find();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No bank details found' });
    }

    // ✅ Clean data format
    const result = data
      .filter((item) => item?.ProjectReportSetting?.BankDetails?.IFSCCode?.value) // ✅ Only include available IFSC codes
      .map((item) => ({
        clientName: item.AccountInformation?.clientName || "N/A",
        businessName: item.AccountInformation?.businessName || "N/A",
        bankDetails: {
          Bank: String(item.ProjectReportSetting?.BankDetails?.Bank?.value || ""),
          BankManagerName: String(item.ProjectReportSetting?.BankDetails?.BankManagerName?.value || ""),
          Post: String(item.ProjectReportSetting?.BankDetails?.Post?.value || ""),
          ContactNo: String(item.ProjectReportSetting?.BankDetails?.ContactNo?.value || ""),
          EmailId: String(item.ProjectReportSetting?.BankDetails?.EmailId?.value || ""),
          IFSCCode: String(item.ProjectReportSetting?.BankDetails?.IFSCCode?.value || ""),
          City: String(item.ProjectReportSetting?.BankDetails?.City?.value || "")
        }
      }));

    res.status(200).json(result);
  } catch (error) {
    console.error("🔥 Error fetching bank details:", error);
    res.status(500).json({ error: error.message });
  }
});


// app.get('/api/bank-details', async (req, res) => {
//   try {
//     // Fetch all documents from the collection
//     const data = await BankDetails.find();

//     if (!data || data.length === 0) {
//       return res.status(404).json({ message: 'No bank details found' });
//     }

//     // Map the results to extract clientName and bankDetails
//     const result = data.map((item) => ({
//       clientName: item.AccountInformation?.clientName || "N/A",
//       businessName: item.AccountInformation?.businessName || "N/A",
//       bankDetails: {
//         Bank: item.ProjectReportSetting?.BankDetails?.Bank?.value || "",
//         BankManagerName: item.ProjectReportSetting?.BankDetails?.BankManagerName?.value || "",
//         Post: item.ProjectReportSetting?.BankDetails?.Post?.value || "",
//         ContactNo: item.ProjectReportSetting?.BankDetails?.ContactNo?.value || "",
//         EmailId: item.ProjectReportSetting?.BankDetails?.EmailId?.value || "",
//         IFSCCode: item.ProjectReportSetting?.BankDetails?.IFSCCode?.value || "",
//         City: item.ProjectReportSetting?.BankDetails?.City?.value || "",
//       },
//     }));

//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.get("/api/bank-filters", async (req, res) => {
  try {
    // ✅ Aggregate data from `BankDetails` collection and combine with another collection using `$unionWith`
    const bankData = await BankDetails.aggregate([
      // ✅ Extract from the first collection
      {
        $project: {
          bankName: { $ifNull: ["$ProjectReportSetting.BankDetails.Bank.value", "N/A"] },
          ifscCode: { $ifNull: ["$ProjectReportSetting.BankDetails.IFSCCode.value", "N/A"] },
          managerName: { $ifNull: ["$ProjectReportSetting.BankDetails.BankManagerName.value", "N/A"] }
        }
      },
      // ✅ Combine with another collection
      {
        $unionWith: {
          coll: "bankdetails", // ✅ Name of the second collection
          pipeline: [
            {
              $project: {
                bankName: { $ifNull: ["$bankName", "N/A"] },
                ifscCode: { $ifNull: ["$ifscCode", "N/A"] },
                managerName: { $ifNull: ["$managerName", "N/A"] }
              }
            }
          ]
        }
      },
      // ✅ Group to remove duplicates based on IFSC code
      {
        $group: {
          _id: {
            bankName: "$bankName",
            ifscCode: "$ifscCode"
          },
          managerNames: { $addToSet: "$managerName" }
        }
      }
    ]);

    console.log("✅ Combined Bank Data:", bankData);

    // ✅ Create clean bank options
    const bankOptions = bankData.map((item) => ({
      label: `${String(item._id.bankName)} (${String(item._id.ifscCode)})`,
      value: String(item._id.ifscCode) || String(item._id.bankName)
    }));

    // ✅ Create clean manager options (unique values)
    const managerOptions = bankData.flatMap((item) =>
      item.managerNames.map((manager) => ({
        label: String(manager),
        value: String(manager)
      }))
    );

    res.status(200).json({
      bankOptions,
      managerOptions
    });
  } catch (error) {
    console.error("🔥 Error fetching filter options:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/api/client-filters", async (req, res) => {
//   try {
//     // ✅ Aggregate data from `formdatas` and `clients` collections
//     const clientData = await FormData.aggregate([
//       // ✅ Extract data from the formdatas collection
//       {
//         $project: {
//           clientName: { $ifNull: ["$AccountInformation.clientName", "N/A"] },
//           clientEmail: { $ifNull: ["$AccountInformation.clientEmail", "N/A"] },
//           clientPhone: { $ifNull: ["$AccountInformation.clientPhone", "N/A"] }
//         }
//       },
//       // ✅ Combine data with the clients collection
//       {
//         $unionWith: {
//           coll: "clients", // ✅ Name of the second collection
//           pipeline: [
//             {
//               $project: {
//                 clientName: { $ifNull: ["$clientName", "N/A"] },
//                 clientEmail: { $ifNull: ["$emailId", "N/A"] }, // Assuming `emailId` field in `clients` collection
//                 clientPhone: { $ifNull: ["$contactNo", "N/A"] } // Assuming `contactNo` field in `clients` collection
//               }
//             }
//           ]
//         }
//       },
//       // ✅ Group to remove duplicates based on clientName and clientEmail
//       {
//         $group: {
//           _id: {
//             clientName: "$clientName",
//             clientEmail: "$clientEmail"
//           },
//           clientPhone: { $first: "$clientPhone" }, // Select one phone number for each client
//         }
//       }
//     ]);

//     console.log("✅ Combined Client Data from Both Collections:", clientData);

//     // ✅ Create clean client options (with clientName as label and clientEmail as value)
//     const clientOptions = clientData.map((item) => ({
//       label: item._id.clientName,  // Only the client name
//       value: item._id.clientEmail  // The email as the value
//     }));

//     // Return client options
//     res.status(200).json({
//       clientOptions
//     });
//   } catch (error) {
//     console.error("🔥 Error fetching client data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


app.get("/api/account-details", async (req, res) => {
  try {
    // ✅ Fetch only AccountInformation field from the schema
    const accountDetails = await FormData.find(
      {},
      { AccountInformation: 1, _id: 0 }
    );

    res.status(200).json({ accountDetails });
  } catch (error) {
    console.error("Error fetching account details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// captcha code

app.post('/api/verify-captcha', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: "No CAPTCHA token provided" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await axios.post(verificationURL);
    const data = response.data;

    if (data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "CAPTCHA verification failed" });
    }
  } catch (error) {
    console.error("CAPTCHA verify server error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* ============================
   Start the Server
   ============================ */
// ✅ Export io to use it in route files
// app.set("io", io);
// const PORT = 5000;
const PORT = process.env.PORT || 5000;  // ✅ Use process.env.PORT

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
// server.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );