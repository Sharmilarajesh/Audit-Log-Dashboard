const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceType: { type: String, required: true },
    ipAddress: { type: String, required: true },
    region: { type: String, required: true },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },
    status: { type: String, enum: ["Resolved", "Unresolved"], required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: false },
);

logSchema.index({ actor: "text", action: "text", resource: "text" });
logSchema.index({ severity: 1 });
logSchema.index({ status: 1 });
logSchema.index({ timestamp: -1 });
logSchema.index(
  { actor: 1, action: 1, resource: 1, timestamp: 1 },
  { unique: true }
);

module.exports = mongoose.model("Log", logSchema);
