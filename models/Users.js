const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    AccountInformation: { type: Object, default: {} },
    MeansOfFinance: { type: Object, default: {} },
    CostOfProject: { type: Object, default: {} },
    ProjectReportSetting: { type: Object, default: {} },
    Expenses: { type: Object, default: {} },
    Revenue: { type: Object, default: {} },
    MoreDetails: { type: Object, default: {} },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
