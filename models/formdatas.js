const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  AccountInformation: Object,
  MeansOfFinance: Object,
  CostOfProject: Object,
  ProjectReportSetting: Object,
  Expenses: Object,
  Revenue: Object,
  MoreDetails: Object,
  computedData: {
    type: Object,
    default: {},
  },
});

const FormData = mongoose.model("FormData", formSchema); // Model

module.exports = FormData; // Export the Model
