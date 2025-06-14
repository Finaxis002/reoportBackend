const mongoose = require("mongoose");

const connectDB = async () => {
//   if (mongoose.connection.readyState >= 1) {
//     console.log("🔁 Using existing MongoDB connection.");
//     return;
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ MongoDB connected successfully.");
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error.message);
//     process.exit(1); // Exit process with failure
//   }
mongoose
   .connect("mongodb+srv://finaxis-user-31:RK8%28ha7Haa7%23jU%25@cluster0.ykhfs.mongodb.net/test?retryWrites=true&w=majority", {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => console.log("MongoDB Atlas connected"))
   .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));
};

module.exports = connectDB;
