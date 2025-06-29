const express = require("express");
const Task = require("../models/Task");
const verifyJWT = require("../middleware/auth");

const router = express.Router();

// Create a task
router.post("/", verifyJWT, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user.id });

    // Emit event to all connected clients
    const io = req.app.get("io");
    io.emit("task:created", task);

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get all tasks for a user
router.get("/", verifyJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Update a task
router.put("/:id", verifyJWT, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Task not found" });

    // Emit update event
    const io = req.app.get("io");
    io.emit("task:updated", updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete a task
router.delete("/:id", verifyJWT, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) return res.status(404).json({ error: "Task not found" });

    // Emit delete event
    const io = req.app.get("io");
    io.emit("task:deleted", { _id: req.params.id });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
