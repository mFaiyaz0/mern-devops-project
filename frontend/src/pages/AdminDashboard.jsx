import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  /* =========================
     Authentication Errors
  ========================= */

  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
      return;
    }

    if (error.response?.status === 403) {
      navigate("/dashboard");
      return;
    }

    setError("Unable to load admin data.");
  };

  /* =========================
     Fetch Users
  ========================= */

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users`,
        getAuthConfig()
      );

      setUsers(response.data);
    } catch (error) {
      handleAuthError(error);
    }
  };

  /* =========================
     Fetch Tasks
  ========================= */

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/tasks`,
        getAuthConfig()
      );

      setTasks(response.data);
    } catch (error) {
      handleAuthError(error);
    }
  };

  /* =========================
     Initial Load
  ========================= */

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchUsers(),
        fetchTasks(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  /* =========================
     Delete User
  ========================= */

  const deleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user and all their tasks?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/users/${id}`,
        getAuthConfig()
      );

      await fetchUsers();
      await fetchTasks();
    } catch (error) {
      handleAuthError(error);
    }
  };

  /* =========================
     Delete Task
  ========================= */

  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/tasks/${id}`,
        getAuthConfig()
      );

      await fetchTasks();
    } catch (error) {
      handleAuthError(error);
    }
  };

  /* =========================
     Logout
  ========================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================
     Statistics
  ========================= */

  const totalUsers = users.length;

  const adminUsers = users.filter(
    (item) => item.role === "admin"
  ).length;

  const regularUsers = totalUsers - adminUsers;

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const completionPercentage =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0;

  return (
    <div className="admin-page">

      {/* =========================
          Header
      ========================= */}

      <header className="admin-header">

        <div className="admin-brand">

          <div className="admin-brand-icon">
            ⚡
          </div>

          <div>
            <h1>TaskFlow</h1>
            <span>Administration</span>
          </div>

        </div>

        <div className="admin-header-right">

          <div className="admin-profile">

            <div className="admin-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "A"}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>Administrator</span>
            </div>

          </div>

          <button
            className="admin-dashboard-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="admin-logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =========================
          Main
      ========================= */}

      <main className="admin-content">

        {/* Heading */}

        <section className="admin-welcome">

          <div>

            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h2>
              System Overview
            </h2>

            <p>
              Manage users, monitor tasks, and
              keep your application organized.
            </p>

          </div>

          <div className="admin-status">
            <span className="status-dot"></span>
            System Online
          </div>

        </section>

        {/* =========================
            Statistics
        ========================= */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <div className="admin-stat-icon users-stat">
              👥
            </div>

            <div>
              <span>Total Users</span>
              <strong>{totalUsers}</strong>
              <small>
                {regularUsers} regular · {adminUsers} admin
              </small>
            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon tasks-stat">
              📋
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{totalTasks}</strong>
              <small>
                All user tasks
              </small>
            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon complete-stat">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks}</strong>
              <small>
                {completionPercentage}% completion rate
              </small>
            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon pending-stat">
              ◷
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
              <small>
                Tasks remaining
              </small>
            </div>

          </div>

        </section>

        {error && (
          <div className="error-message">
            <span>!</span>
            {error}
          </div>
        )}

        {/* =========================
            Users
        ========================= */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>

              <p className="eyebrow">
                USER MANAGEMENT
              </p>

              <h3>
                Users
                <span className="admin-count">
                  {totalUsers}
                </span>
              </h3>

            </div>

            <span className="panel-description">
              Manage registered accounts
            </span>

          </div>

          {loading ? (

            <div className="admin-loading">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>

          ) : users.length === 0 ? (

            <div className="admin-empty">
              No users found.
            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="modern-admin-table">

                <thead>

                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {users.map((item) => (

                    <tr key={item._id}>

                      <td>

                        <div className="table-user">

                          <div className="table-avatar">
                            {item.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {item.name}
                          </strong>

                        </div>

                      </td>

                      <td className="email-cell">
                        {item.email}
                      </td>

                      <td>

                        <span
                          className={`role-badge ${
                            item.role === "admin"
                              ? "admin-role"
                              : "user-role"
                          }`}
                        >
                          {item.role === "admin"
                            ? "Administrator"
                            : "User"}
                        </span>

                      </td>

                      <td className="date-cell">
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>

                        {item._id !== user?.id ? (

                          <button
                            className="table-delete"
                            onClick={() =>
                              deleteUser(item._id)
                            }
                          >
                            🗑 Delete
                          </button>

                        ) : (

                          <span className="current-admin">
                            Current Admin
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =========================
            Tasks
        ========================= */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>

              <p className="eyebrow">
                TASK MANAGEMENT
              </p>

              <h3>
                All Tasks
                <span className="admin-count">
                  {totalTasks}
                </span>
              </h3>

            </div>

            <span className="panel-description">
              Monitor all application tasks
            </span>

          </div>

          {loading ? (

            <div className="admin-loading">
              <div className="loading-spinner"></div>
              <p>Loading tasks...</p>
            </div>

          ) : tasks.length === 0 ? (

            <div className="admin-empty">

              <div className="empty-icon">
                ✓
              </div>

              <strong>No tasks yet</strong>

              <p>
                Tasks created by users will
                appear here.
              </p>

            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="modern-admin-table">

                <thead>

                  <tr>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {tasks.map((task) => (

                    <tr key={task._id}>

                      <td>

                        <div className="task-table-title">
                          <span
                            className={
                              task.completed
                                ? "task-status-check done"
                                : "task-status-check"
                            }
                          >
                            {task.completed
                              ? "✓"
                              : ""}
                          </span>

                          <strong>
                            {task.title}
                          </strong>
                        </div>

                      </td>

                      <td className="description-cell">
                        {task.description || "No description"}
                      </td>

                      <td>

                        {task.user ? (

                          <div className="owner-cell">

                            <div className="owner-avatar">
                              {task.user.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {task.user.name}
                              </strong>

                              <span>
                                {task.user.email}
                              </span>
                            </div>

                          </div>

                        ) : (
                          <span className="unknown-owner">
                            Unknown
                          </span>
                        )}

                      </td>

                      <td>

                        <span
                          className={`status-badge ${
                            task.completed
                              ? "completed-badge"
                              : "pending-badge"
                          }`}
                        >
                          {task.completed
                            ? "Completed"
                            : "Pending"}
                        </span>

                      </td>

                      <td>

                        <button
                          className="table-delete"
                          onClick={() =>
                            deleteTask(task._id)
                          }
                        >
                          🗑 Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      <footer className="dashboard-footer">
        <span>TaskFlow Admin</span>
        <span>•</span>
        <span>MERN DevOps Project</span>
      </footer>

    </div>
  );
}

export default AdminDashboard;