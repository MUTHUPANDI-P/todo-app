const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    // ✅ NEW FIELD
    sharedWith: [{ type: String }], // store emails
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
