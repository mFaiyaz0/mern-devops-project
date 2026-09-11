import { useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

const API_URL = "/api";

/* =========================
   Protected Route
========================= */

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   User Dashboard
========================= */

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  /* Get tasks */

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* Add task */

  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/tasks`,
        {
          title,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setDescription("");

      fetchTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  /* Complete / undo task */

  const toggleTask = async (task) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/tasks/${task._id}`,
        {
          completed: !task.completed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  /* Delete task */

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  /* Logout */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* Statistics */

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const completionPercentage =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  return (
    <div className="dashboard-page">

      {/* =========================
          Header
      ========================= */}

      <header className="dashboard-header">

        <div className="brand">
          <div className="brand-icon">✓</div>

          <div>
            <h1>TaskFlow</h1>
            <span>Task Management</span>
          </div>
        </div>

        <div className="header-user">

          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="user-details">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email}</span>
          </div>

          {user?.role === "admin" && (
            <button
              className="admin-nav-button"
              onClick={() => navigate("/admin")}
            >
              Admin
            </button>
          )}

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =========================
          Main Content
      ========================= */}

      <main className="dashboard-content">

        {/* Welcome */}

        <section className="welcome-section">

          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>

            <h2>
              Good to see you,{" "}
              <span>{user?.name?.split(" ")[0] || "there"}</span> 👋
            </h2>

            <p>
              Stay organized, track your progress, and get things done.
            </p>
          </div>

          <div className="progress-ring">

            <div
              className="progress-circle"
              style={{
                background: `conic-gradient(
                  #6366f1 ${completionPercentage * 3.6}deg,
                  #e2e8f0 ${completionPercentage * 3.6}deg
                )`,
              }}
            >
              <div className="progress-inner">
                <strong>{completionPercentage}%</strong>
                <span>Done</span>
              </div>
            </div>

          </div>

        </section>

        {/* =========================
            Statistics
        ========================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon total-icon">
              📋
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{totalTasks}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon completed-icon">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon pending-icon">
              ◷
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
            </div>

          </div>

        </section>

        {/* =========================
            Add Task
        ========================= */}

        <section className="create-task-card">

          <div className="section-heading">

            <div>
              <p className="eyebrow">NEW TASK</p>
              <h3>Create a task</h3>
            </div>

          </div>

          <form
            onSubmit={addTask}
            className="task-form"
          >

            <div className="input-group">

              <label>Task title</label>

              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

            </div>

            <div className="input-group">

              <label>Description</label>

              <textarea
                placeholder="Add some details about this task..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

            </div>

            <button
              type="submit"
              className="primary-button"
            >
              <span>+</span>
              Add Task
            </button>

          </form>

        </section>

        {/* =========================
            Tasks
        ========================= */}

        <section className="tasks-section">

          <div className="section-heading">

            <div>
              <p className="eyebrow">YOUR WORK</p>

              <h3>
                My Tasks
                <span className="task-count">
                  {totalTasks}
                </span>
              </h3>
            </div>

          </div>

          {loading ? (

            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading your tasks...</p>
            </div>

          ) : tasks.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>No tasks yet</h3>

              <p>
                Create your first task above and start
                getting things done.
              </p>

            </div>

          ) : (

            <div className="tasks-list">

              {tasks.map((task) => (

                <div
                  className={`task-card ${
                    task.completed
                      ? "task-completed"
                      : ""
                  }`}
                  key={task._id}
                >

                  <button
                    className={`task-check ${
                      task.completed
                        ? "checked"
                        : ""
                    }`}
                    onClick={() =>
                      toggleTask(task)
                    }
                    aria-label="Toggle task"
                  >
                    {task.completed && "✓"}
                  </button>

                  <div className="task-content">

                    <h4>{task.title}</h4>

                    {task.description && (
                      <p>{task.description}</p>
                    )}

                    <span
                      className={`status-badge ${
                        task.completed
                          ? "completed-badge"
                          : "pending-badge"
                      }`}
                    >
                      {task.completed
                        ? "Completed"
                        : "In Progress"}
                    </span>

                  </div>

                  <button
                    className="delete-task"
                    onClick={() =>
                      deleteTask(task._id)
                    }
                    title="Delete task"
                  >
                    🗑
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* Footer */}

      <footer className="dashboard-footer">
        <span>TaskFlow</span>
        <span>•</span>
        <span>MERN DevOps Project</span>
      </footer>

    </div>
  );
}

/* =========================
   Application Routes
========================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;