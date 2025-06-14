// models/Activity.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["create", "update", "download", "check_profit" , "generated_pdf"],
      required: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
    reportTitle: String,

    // ✅ ADD THIS LINE:
    reportOwner: String, // <- This will now allow you to store the owner name

    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "performedBy.role",
      },
      name: String,
      role: {
        type: String,
        enum: ["admin", "employee", "client"],
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Activity", activitySchema);
