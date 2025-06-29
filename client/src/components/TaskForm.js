import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [sharedWith, setSharedWith] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) {
      toast.error("Title and Due Date are required.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/tasks", {
        title,
        description,
        dueDate,
        status,
        sharedWith: sharedWith
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email),
      });

      toast.success("✅ Task created successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
      setStatus("pending");
      setSharedWith("");

      if (onTaskCreated) onTaskCreated(); // refresh task list
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md mb-6"
    >
      <h3 className="text-xl font-semibold mb-4">➕ Create a Task</h3>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Title *</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Description</label>
        <textarea
          className="w-full border px-3 py-2 rounded"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task details (optional)"
        ></textarea>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Due Date *</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Status</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Share With (Email(s))</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          placeholder="e.g. user@example.com, another@gmail.com"
          value={sharedWith}
          onChange={(e) => setSharedWith(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
      >
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
