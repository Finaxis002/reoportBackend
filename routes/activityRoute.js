// routes/activityRoute.js
const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const mongoose = require("mongoose");
const FormData = require("../models/formdatas");

router.post("/activity/log", async (req, res) => {
  try {
    const { action, reportId, reportTitle, performedBy, reportOwner } = req.body;


    if (!["create", "update", "download", "check_profit" , "generated_pdf"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const safeReportId = mongoose.Types.ObjectId.isValid(reportId)
      ? new mongoose.Types.ObjectId(reportId)
      : undefined; // skip if not valid

    const safeUserId = mongoose.Types.ObjectId.isValid(performedBy.userId)
      ? new mongoose.Types.ObjectId(performedBy.userId)
      : undefined;

    const newActivity = new Activity({
      action,
      reportTitle,
      reportOwner, // ✅ <-- ADD THIS LINE
      ...(safeReportId && { reportId: safeReportId }),
      performedBy: {
        ...performedBy,
        ...(safeUserId && { userId: safeUserId }),
      },
    });

    await newActivity.save();

    res.status(201).json({ message: "Activity logged" });
  } catch (err) {
    console.error("Error logging activity:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET /api/activity/history (no auth, but you can filter by role manually)
router.get("/activity/history", async (req, res) => {
  try {
    const activities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(activities);
  } catch (err) {
    console.error("Error fetching activity history:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/activity/get-report-id", async (req, res) => {
  try {
    const { sessionId } = req.query;
    const report = await FormData.findOne({ sessionId });

    if (!report) return res.status(404).json({ message: "Report not found" });

    return res.json({ reportId: report._id });
  } catch (err) {
    console.error("Error fetching reportId:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
