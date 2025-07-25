const express = require("express");
const router = express.Router();
const FormData = require('../models/formdatas');

router.get("/", async (req, res) => {
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

router.get("/get-report-data/:sessionId", async (req, res) => {
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

router.delete("/delete-report/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await FormData.findByIdAndDelete(id);

    if (!deletedReport) {
      console.log(`❌ Report with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    console.log(`✅ Report with ID ${id} deleted successfully`);
    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("🔥 Error deleting report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
});

module.exports = router;

// router.get("/get-report", async (req, res) => {
//   try {
//     const { sessionId } = req.query;

//     if (sessionId) {
//       console.log(`🔎 Fetching report with sessionId: ${sessionId}`);

//       const report = await FormData.findOne({ sessionId: String(sessionId) });

//       if (!report) {
//         console.log(`❌ Report not found for sessionId: ${sessionId}`);
//         return res.status(404).json({
//           success: false,
//           message: "Report not found",
//         });
//       }

//       console.log("✅ Report fetched successfully:", report);
//       return res.status(200).json({
//         success: true,
//         data: report,
//       });
//     } else {
//       console.log("🔎 Fetching all reports...");

//       const reports = await FormData.find();

//       if (!reports.length) {
//         console.log("❌ No reports found");
//         return res.status(404).json({
//           success: false,
//           message: "No reports found",
//         });
//       }

//       console.log(`✅ Fetched ${reports.length} reports`);
//       return res.status(200).json({
//         success: true,
//         totalReports: reports.length,
//         data: reports,
//       });
//     }
//   } catch (error) {
//     console.error("🔥 Error in /get-report API:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// router.get("/get-report-data/:sessionId", async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     if (!sessionId) {
//       return res.status(400).json({ message: "Session ID is required" });
//     }

//     const report = await FormData.findOne({ sessionId: String(sessionId) });

//     if (!report) {
//       return res.status(404).json({ message: "Report not found" });
//     }

//     res.status(200).json(report);
//   } catch (error) {
//     console.error("🔥 Error fetching report data:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// });

// router.delete("/delete-report/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedReport = await FormData.findByIdAndDelete(id);

//     if (!deletedReport) {
//       console.log(`❌ Report with ID ${id} not found`);
//       return res.status(404).json({
//         success: false,
//         message: "Report not found",
//       });
//     }

//     console.log(`✅ Report with ID ${id} deleted successfully`);
//     return res.status(200).json({
//       success: true,
//       message: "Report deleted successfully",
//     });
//   } catch (error) {
//     console.error("🔥 Error deleting report:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete report",
//       error: error.message,
//     });
//   }
// });
