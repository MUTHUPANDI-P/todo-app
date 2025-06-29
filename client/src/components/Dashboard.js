import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // change if deployed

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Store JWT token from URL (on first Google login)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard"); // Clean up URL
    }
  }, [location, navigate]);

  // ✅ Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ Real-time listeners via Socket.IO
  useEffect(() => {
    socket.on("task:created", () => {
      toast.info("📥 A new task was added");
      fetchTasks();
    });

    socket.on("task:updated", () => {
      toast.info("🔄 A task was updated");
      fetchTasks();
    });

    socket.on("task:deleted", () => {
      toast.info("🗑️ A task was deleted");
      fetchTasks();
    });

    return () => {
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
    };
  }, []);

  // ✅ Apply filtering
  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    const due = new Date(task.dueDate);
    if (filter === "today") return due.toDateString() === now.toDateString();
    if (filter === "overdue") return due < now && task.status !== "completed";
    if (filter === "completed") return task.status === "completed";
    return true;
  });

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">📋 Your Tasks</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* Task Form */}
      <TaskForm onTaskCreated={fetchTasks} />

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-4">
        {["all", "today", "overdue", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded ${
              filter === f ? "bg-blue-600 text-white" : "bg-white border"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading / Error / Empty states */}
      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && filteredTasks.length === 0 && <p>No tasks to show.</p>}

      {/* Task List */}
      <TaskList tasks={filteredTasks} refresh={fetchTasks} />
    </div>
  );
}
