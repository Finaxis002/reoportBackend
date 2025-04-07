const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
// const User = require("./models/User");

const app = express();

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "uploads"); // Ensure 'uploads/' directory exists
      cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Append timestamp to avoid name conflicts
  },
});
const upload = multer({ storage });


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:3000",
}));
app.use(bodyParser.json());



// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/test")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

  const costFieldSchema = new mongoose.Schema({
    amount: { type: Number, default: 0 },
    depreciationRate: { type: Number, default: 15 },
  });
  
  const customFieldSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    depreciationRate: { type: Number, required: true, default: 15 },
  });
// Create a Schema and Model
const UserSchema = new mongoose.Schema(
  {
    clientName: String,
    clientEmail: String,
    clientPhone: String,
    businessDescription: String,
    businessOwner: String,
    businessEmail: String,
    businessContactNumber: String,
    clientDob:  {
      type: Date,
      required: false,
    },
    adhaarNumber: String,
    educationQualification: String,
    businessName: String,
    businessAddress: String,
    pincode: String,
    location: String,
    industryType: String,
    registrationType: String,
    PANNumber: String,
    TANNumber: String,
    UDYAMNumber: String,
    GSTIN: String,
    CIN: String,
    logoOfBusiness: String,
    filePath: String,
    PIN: String,
    numberOfEmployees: Number,
    nameofDirectors: String,
    DIN: String,
    allPartners: [
      {
        partnerName: String,
        partnerAadhar: String,
        partnerDin: String,
      },
    ],
    // Means of Finance
    MeansOfFinance: {
      termLoan: {
        promoterContribution: { type: Number, default: 0 },
        termLoan: { type: Number, default: 0 },
      },
      workingCapital: {
        promoterContribution: { type: Number, default: 0 },
        termLoan: { type: Number, default: 0 },
      },
    },
    // Computed Financial Data
    totalTermLoan: { type: Number, default: 0, set: (v) => Number(v) || 0 },
    totalWorkingCapital: { type: Number, default: 0, set: (v) => Number(v) || 0 },
    totalPC: { type: Number, default: 0, set: (v) => Number(v) || 0 },
    totalTL: { type: Number, default: 0, set: (v) => Number(v) || 0 },
    total: { type: Number, default: 0, set: (v) => Number(v) || 0 },
    TotalPromoterContributionPercent: { type: String, default: "0.00%" },
    TotalTermLoanPercent: { type: String, default: "0.00%" },

    // ✅ Step 3: Cost of Project Schema (Nested Inside UserSchema)
    CostOfProject: {
      Land: { type: costFieldSchema, default: { amount: 0, depreciationRate: 15 } },
      Building: { type: costFieldSchema, default: { amount: 0, depreciationRate: 15 } },
      FurnitureandFittings: { type: costFieldSchema, default: { amount: 0, depreciationRate: 15 } },
      PlantMachinery: { type: costFieldSchema, default: { amount: 0, depreciationRate: 15 } },
      IntangibleAssets: { type: costFieldSchema, default: { amount: 0, depreciationRate: 15 } },
      ComputersPeripherals: { type: costFieldSchema, default: { amount: 0, depreciationRate: 15 } },
      Miscellaneous: { type: costFieldSchema, default: { amount: 0, depreciationRate: 15 } },
      customFields: { type: [customFieldSchema], default: [] }, // ✅ Always an array
    },
  },
  
  {
    collection: "user", // Explicitly set the collection name
  }
);

const User = mongoose.model("User", UserSchema);

// Routes



// app.post("/api/user", upload.single("logoOfBusiness"), async (req, res) => {
//   try {
//     console.log("Request body before parsing:", req.body); // Debugging form data
//     console.log("Uploaded file:", req.file); // Debugging uploaded file

//     // Get the uploaded file path
//     const filePath = req.file ? req.file.path : "";

//     // Dynamically populate `userData` based on schema fields
//     const userData = {};
//     const schemaPaths = User.schema.paths; // Dynamically retrieve schema fields

//     Object.keys(schemaPaths).forEach((key) => {
//       if (key === "logoOfBusiness") {
//         // Handle file path for logo
//         userData[key] = filePath;
//       } else if (key === "allPartners") {
//         // Handle array fields
//         userData[key] = req.body[key] ? JSON.parse(req.body[key]) : [];
//       } else if (key === "clientDob") {
//         // Handle date fields
//         userData[key] = req.body[key] && !isNaN(new Date(req.body[key]))
//           ? new Date(req.body[key])
//           : null;
//       } else if (schemaPaths[key].instance === "Number") {
//         // Handle numeric fields
//         userData[key] = req.body[key] ? parseInt(req.body[key], 10) : 0;
//       } else if (key !== "__v" && key !== "_id") {
//         // Handle all other fields (exclude mongoose defaults like `_id` and `__v`)
//         userData[key] = req.body[key] || "";
//       }
//     });

//     console.log("Parsed user data to save:", userData);
    

//     // Save the combined data to the database
//     const user = new User(userData);
//     await user.save();

//     res.status(201).json({ message: "User created successfully", user });
//   } catch (err) {
//     console.error("Error in file upload and form submission route:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });
app.post("/api/user", async (req, res) => {
  try {
    console.log("🔥 RAW Request Body BEFORE Parsing:", JSON.stringify(req.body, null, 2));

    // ✅ Function to Safely Parse JSON Strings
    const parseJSON = (data) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data; // Return original value if parsing fails
      }
    };

    // ✅ Convert JSON Strings to Objects
    req.body.MeansOfFinance = parseJSON(req.body.MeansOfFinance);

    // ✅ Build Final User Data (Only MOF)
    const userData = {
      ...req.body,
      MeansOfFinance: req.body.MeansOfFinance || {}, // Ensure MOF is structured
      numberOfEmployees: Number(req.body.numberOfEmployees) || 0,
      totalTermLoan: Number(req.body.totalTermLoan) || 0,
      totalWorkingCapital: Number(req.body.totalWorkingCapital) || 0,
      totalPC: Number(req.body.totalPC) || 0,
      totalTL: Number(req.body.totalTL) || 0,
      total: Number(req.body.total) || 0,
    };

    console.log("✅ Parsed User Data Before Saving:", JSON.stringify(userData, null, 2));

    let user;
    if (req.body._id) {
      // Update existing user
      user = await User.findByIdAndUpdate(req.body._id, userData, {
        new: true,
        runValidators: true,
      });
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
    }

    res.status(201).json({ message: "User created/updated successfully", user });
  } catch (err) {
    console.error("❌ Error Saving User:", err.message);
    res.status(500).json({ error: err.message });
  }
});



//updating data from 2nd step
app.post("/api/user/step2", async (req, res) => {
  try {
    const { _id, ...step2Data } = req.body; // Extract _id and other fields

    if (!_id) {
      return res.status(400).json({ error: "Document ID (_id) is required" });
    }

    console.log("🔹 Received Step 2 Data:", step2Data);
    // Find the document by _id and update it with the new data
    const updatedUser = await User.findByIdAndUpdate(
      _id, // The document to update
      { $set: step2Data }, // The fields to update
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json({ message: "Step 2 completed", user: updatedUser });
  } catch (err) {
    console.error("Error in Step 2 route:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// //updating data from 3rd step
// app.post("/api/user/step3", async (req, res) => {
//   try {
//     const { _id, CostOfProject } = req.body;

//     if (!_id) {
//       return res.status(400).json({ error: "Missing document ID (_id)" });
//     }

//      // Ensure CostOfProject is always an object
//      if (!CostOfProject || typeof CostOfProject !== "object") {
//       return res.status(400).json({ error: "Invalid CostOfProject data" });
//     }
//     // Update user document in MongoDB
//     const updatedUser = await User.findByIdAndUpdate(
//       _id,
//       { $set: { CostOfProject } }, // ✅ Only updating Step 3 data
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const newProjectCost = new CostOfProject({
//       Land: req.body.Land.amount || 0,
//       Building: req.body.Building.amount || 0,
//       FurnitureandFittings: req.body.FurnitureandFittings.amount || 0,
//       PlantMachinery: req.body.PlantMachinery.amount || 0,
//       IntangibleAssets: req.body.IntangibleAssets.amount || 0,
//       ComputersPeripherals: req.body.ComputersPeripherals.amount || 0,
//       Miscellaneous: req.body.Miscellaneous.amount || 0,
//       DepreciationRate: req.body.Land.rate || 15, // Adjust if necessary
//       customFields: Object.entries(req.body)
//         .filter(([key, value]) => value.isCustom) // Store dynamic fields separately
//         .map(([key, value]) => ({
//           name: value.name,
//           amount: value.amount || 0,
//           rate: value.rate || 15,
//         })),
//     });
//     const savedData = await newProjectCost.save();
//     res.status(201).json({ message: "Data saved successfully", data: savedData });

//     // res.status(200).json({ message: "Step 3 data saved successfully!", user: updatedUser });
//   } catch (error) {
//     console.error("Error saving Step 3 data:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/api/user/step3", async (req, res) => {
//   try {
//     const { _id, CostOfProject } = req.body;

//     if (!_id) {
//       return res.status(400).json({ error: "Missing document ID (_id)" });
//     }

//     if (!CostOfProject || typeof CostOfProject !== "object") {
//       return res.status(400).json({ error: "Invalid CostOfProject data" });
//     }

//     // ✅ Ensure `customFields` is always an array
//     const customFields = Array.isArray(CostOfProject.customFields)
//       ? CostOfProject.customFields.map((field) => ({
//           name: field.name || "Unnamed Field",
//           amount: field.amount || 0,
//           depreciationRate: field.depreciationRate || 15,
//         }))
//       : [];

//     // ✅ Update each field explicitly
//     const updateData = {
//       "CostOfProject.Land.amount": CostOfProject.Land?.amount || 0,
//       "CostOfProject.Land.depreciationRate": CostOfProject.Land?.depreciationRate || 15,
//       "CostOfProject.Building.amount": CostOfProject.Building?.amount || 0,
//       "CostOfProject.Building.depreciationRate": CostOfProject.Building?.depreciationRate || 15,
//       "CostOfProject.FurnitureandFittings.amount": CostOfProject.FurnitureandFittings?.amount || 0,
//       "CostOfProject.FurnitureandFittings.depreciationRate": CostOfProject.FurnitureandFittings?.depreciationRate || 15,
//       "CostOfProject.PlantMachinery.amount": CostOfProject.PlantMachinery?.amount || 0,
//       "CostOfProject.PlantMachinery.depreciationRate": CostOfProject.PlantMachinery?.depreciationRate || 15,
//       "CostOfProject.IntangibleAssets.amount": CostOfProject.IntangibleAssets?.amount || 0,
//       "CostOfProject.IntangibleAssets.depreciationRate": CostOfProject.IntangibleAssets?.depreciationRate || 15,
//       "CostOfProject.ComputersPeripherals.amount": CostOfProject.ComputersPeripherals?.amount || 0,
//       "CostOfProject.ComputersPeripherals.depreciationRate": CostOfProject.ComputersPeripherals?.depreciationRate || 15,
//       "CostOfProject.Miscellaneous.amount": CostOfProject.Miscellaneous?.amount || 0,
//       "CostOfProject.Miscellaneous.depreciationRate": CostOfProject.Miscellaneous?.depreciationRate || 15,
//       "CostOfProject.customFields": customFields,
//     };

//     console.log("📌 Final Update Data:", JSON.stringify(updateData, null, 2));

//     const updatedUser = await User.findByIdAndUpdate(
//       _id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     console.log("✅ Successfully Updated Document:", updatedUser);
//     res.status(200).json({ message: "Step 3 data saved successfully!", user: updatedUser });
//   } catch (error) {
//     console.error("❌ Error saving Step 3 data:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

app.post("/api/user/step3", async (req, res) => {
  try {
    const { _id, CostOfProject } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Missing document ID (_id)" });
    }

    if (!CostOfProject || typeof CostOfProject !== "object") {
      return res.status(400).json({ error: "Invalid CostOfProject data" });
    }

    // ✅ Ensure `customFields` is always an array
    const customFields = Array.isArray(CostOfProject.customFields)
      ? CostOfProject.customFields.map((field) => ({
          name: field.name || "Unnamed Field",
          amount: field.amount || 0,
          depreciationRate: field.depreciationRate || 15,
        }))
      : [];

    // ✅ Convert empty fields into valid objects before updating MongoDB
    const fixField = (field) =>
      typeof field === "object" && field !== null ? field : { amount: 0, depreciationRate: 15 };

    const updateData = {
      "CostOfProject.Land": fixField(CostOfProject.Land),
      "CostOfProject.Building": fixField(CostOfProject.Building),
      "CostOfProject.FurnitureandFittings": fixField(CostOfProject.FurnitureandFittings),
      "CostOfProject.PlantMachinery": fixField(CostOfProject.PlantMachinery),
      "CostOfProject.IntangibleAssets": fixField(CostOfProject.IntangibleAssets),
      "CostOfProject.ComputersPeripherals": fixField(CostOfProject.ComputersPeripherals),
      "CostOfProject.Miscellaneous": fixField(CostOfProject.Miscellaneous),
      "CostOfProject.customFields": customFields,
    };

    console.log("📌 Step 3 - Final Update Data:", JSON.stringify(updateData, null, 2));

    // ✅ Update MongoDB Document
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Step 3 - Successfully Updated Document:", updatedUser);
    res.status(200).json({ message: "Step 3 data saved successfully!", user: updatedUser });

  } catch (error) {
    console.error("❌ Step 3 - Error saving data:", error.message);
    res.status(500).json({ error: error.message });
  }
});



// Fetch client by ID
app.get("/api/clients/:id", async (req, res) => {
  try {
    const client = await User.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/clients", async (req, res) => {
  try {
    const clients = await User.find({}, "clientName"); // Fetch only clientName from User collection
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User by Client Name
app.get("/api/user/by-name/:clientName", async (req, res) => {
  try {
    const clientName = req.params.clientName; // Extract clientName from the URL
    const user = await User.findOne({ clientName }); // Search the database for this clientName
    if (!user) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(200).json(user); // Return the user data
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Uploaded Files
app.use("/uploads", express.static("uploads"));


// Start the Server  
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

