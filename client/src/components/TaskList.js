import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

export default function TaskList({ tasks, refresh }) {
  const [editingTask, setEditingTask] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (task) => {
    setEditingTask(task._id);
    setEditData({
      ...task,
      sharedWith: task.sharedWith?.join(", ") || "",
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditData({});
  };

  const handleUpdate = async () => {
    try {
      const updatedData = {
        ...editData,
        sharedWith: editData.sharedWith
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email),
      };

      await api.put(`/tasks/${editingTask}`, updatedData);
      toast.success("Task updated");
      cancelEdit();
      refresh();
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      refresh();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-white p-4 rounded shadow border-l-4 border-blue-500"
        >
          {editingTask === task._id ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full border px-2 py-1"
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full border px-2 py-1"
              />
              <input
                type="text"
                placeholder="Share with emails"
                value={editData.sharedWith}
                onChange={(e) => setEditData({ ...editData, sharedWith: e.target.value })}
                className="w-full border px-2 py-1"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={editData.dueDate?.slice(0, 10)}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="border px-2 py-1"
                />
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="border px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdate} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                <button onClick={cancelEdit} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p>{task.description}</p>
              <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>

              {task.sharedWith && task.sharedWith.length > 0 && (
                <p className="text-sm text-indigo-600 mt-1">
                  Shared with: {task.sharedWith.join(", ")}
                </p>
              )}

              <span className={`text-xs inline-block px-2 py-1 rounded mt-1
                ${task.status === "completed" ? "bg-green-100 text-green-700" :
                  task.status === "in-progress" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-600"}`}>
                {task.status.toUpperCase()}
              </span>

              <div className="mt-2 flex gap-2">
                <button onClick={() => startEdit(task)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => handleDelete(task._id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
