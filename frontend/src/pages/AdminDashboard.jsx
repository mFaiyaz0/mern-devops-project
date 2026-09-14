import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ConfirmModal from "../components/ConfirmModal";
import SkeletonLoader from "../components/SkeletonLoader";

const API_URL = "/api";

export default function AdminDashboard() {
  const { user, isAdmin, getAuthConfig, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "user",
    id: null,
    title: "",
  });

  const handleAuthError = useCallback(
    (error) => {
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      if (error.response?.status === 403) {
        toast.error("Admin access denied");
        navigate("/dashboard");
        return;
      }
      toast.error("Unable to load admin data");
    },
    [logout, navigate, toast]
  );

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users`,
        getAuthConfig()
      );
      setUsers(response.data);
    } catch (error) {
      handleAuthError(error);
    }
  }, [getAuthConfig, handleAuthError]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/tasks`,
        getAuthConfig()
      );
      setTasks(response.data);
    } catch (error) {
      handleAuthError(error);
    }
  }, [getAuthConfig, handleAuthError]);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    let ignore = false;
    async function loadData() {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          axios.get(`${API_URL}/admin/users`, getAuthConfig()),
          axios.get(`${API_URL}/admin/tasks`, getAuthConfig()),
        ]);
        if (!ignore) {
          setUsers(usersRes.data);
          setTasks(tasksRes.data);
        }
      } catch (error) {
        handleAuthError(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();

    return () => {
      ignore = true;
    };
  }, [isAdmin, navigate, getAuthConfig, handleAuthError]);

  const triggerDeleteUser = (id, name) => {
    setDeleteModal({
      isOpen: true,
      type: "user",
      id,
      title: name || "User",
    });
  };

  const triggerDeleteTask = (id, title) => {
    setDeleteModal({
      isOpen: true,
      type: "task",
      id,
      title: title || "Task",
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id, title } = deleteModal;
    if (!id) return;

    try {
      if (type === "user") {
        await axios.delete(`${API_URL}/admin/users/${id}`, getAuthConfig());
        toast.success(`Deleted user "${title}" and their associated tasks`);
        await Promise.all([fetchUsers(), fetchTasks()]);
      } else {
        await axios.delete(`${API_URL}/admin/tasks/${id}`, getAuthConfig());
        toast.success(`Deleted task "${title}"`);
        await fetchTasks();
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setDeleteModal({ isOpen: false, type: "user", id: null, title: "" });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return (
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, userRoleFilter, userSearch]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskStatusFilter === "completed" && !t.completed) return false;
      if (taskStatusFilter === "pending" && t.completed) return false;
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchOwner =
          t.user?.name?.toLowerCase().includes(q) ||
          t.user?.email?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchOwner;
      }
      return true;
    });
  }, [tasks, taskStatusFilter, taskSearch]);

  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const regularUsers = totalUsers - adminUsers;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="tf-app-layout">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="tf-body-layout">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          taskStats={{
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
          }}
        />

        <main className="tf-main-content">
          <div className="tf-content-container">
            {/* Admin Header */}
            <section className="tf-dashboard-header">
              <div>
                <div className="tf-admin-status-badge">
                  <span className="tf-status-dot-green"></span>
                  <span>System Online • MERN Docker Cluster</span>
                </div>
                <h1 className="tf-greeting-title">
                  System Administration Console ⚡
                </h1>
                <p className="tf-greeting-sub">
                  Oversee registered accounts, audit user tasks, and monitor platform performance.
                </p>
              </div>

              <div className="tf-admin-header-actions">
                <button
                  className="tf-btn tf-btn-secondary"
                  onClick={() => {
                    fetchUsers();
                    fetchTasks();
                  }}
                  disabled={loading}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </section>

            {/* KPI Stats */}
            <section className="tf-stats-grid">
              <StatCard
                title="Total Users"
                value={totalUsers}
                subtitle={`${regularUsers} members · ${adminUsers} admins`}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                variant="primary"
              />

              <StatCard
                title="Total System Tasks"
                value={totalTasks}
                subtitle="Tasks across all accounts"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
                variant="default"
              />

              <StatCard
                title="Total Completed"
                value={completedTasks}
                subtitle={`${completionPercentage}% platform completion rate`}
                trend={`${completionPercentage}%`}
                trendType="positive"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                variant="success"
              />

              <StatCard
                title="Pending Tasks"
                value={pendingTasks}
                subtitle="Active user tasks"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                variant="warning"
              />
            </section>

            {/* Admin Management Tabs */}
            <section className="tf-view-container">
              <div className="tf-admin-tab-nav">
                <button
                  className={`tf-admin-tab-btn ${adminTab === "users" ? "active" : ""}`}
                  onClick={() => setAdminTab("users")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  User Management ({users.length})
                </button>

                <button
                  className={`tf-admin-tab-btn ${adminTab === "tasks" ? "active" : ""}`}
                  onClick={() => setAdminTab("tasks")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  Global Task Oversight ({tasks.length})
                </button>
              </div>

              {loading ? (
                <SkeletonLoader type="table" />
              ) : adminTab === "users" ? (
                /* ================= USER MANAGEMENT ================= */
                <div className="tf-admin-table-card">
                  <div className="tf-table-toolbar">
                    <div className="tf-search-box">
                      <svg
                        className="tf-search-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        className="tf-search-input"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                      {userSearch && (
                        <button
                          className="tf-search-clear"
                          onClick={() => setUserSearch("")}
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    <div className="tf-filter-pills">
                      <button
                        className={`tf-pill-btn ${userRoleFilter === "all" ? "active" : ""}`}
                        onClick={() => setUserRoleFilter("all")}
                      >
                        All ({users.length})
                      </button>
                      <button
                        className={`tf-pill-btn ${userRoleFilter === "user" ? "active" : ""}`}
                        onClick={() => setUserRoleFilter("user")}
                      >
                        Members ({regularUsers})
                      </button>
                      <button
                        className={`tf-pill-btn ${userRoleFilter === "admin" ? "active" : ""}`}
                        onClick={() => setUserRoleFilter("admin")}
                      >
                        Admins ({adminUsers})
                      </button>
                    </div>
                  </div>

                  <div className="tf-table-responsive">
                    <table className="tf-modern-table">
                      <thead>
                        <tr>
                          <th>User Profile</th>
                          <th>Email Address</th>
                          <th>Role</th>
                          <th>Registered</th>
                          <th className="th-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="td-empty">
                              No users match your criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((item) => {
                            const isCurrentUser =
                              item._id === user?.id || item._id === user?._id;

                            return (
                              <tr key={item._id}>
                                <td>
                                  <div className="tf-user-cell">
                                    <div
                                      className={`tf-avatar ${item.role === "admin"
                                          ? "tf-avatar-admin"
                                          : ""
                                        }`}
                                    >
                                      {item.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                      <strong className="tf-cell-name">
                                        {item.name}
                                      </strong>
                                      {isCurrentUser && (
                                        <span className="tf-badge tf-badge-current">
                                          You
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="tf-cell-muted">{item.email}</td>

                                <td>
                                  <span
                                    className={`tf-badge ${item.role === "admin"
                                        ? "tf-badge-admin"
                                        : "tf-badge-user"
                                      }`}
                                  >
                                    {item.role === "admin"
                                      ? "⚡ Administrator"
                                      : "✓ Member"}
                                  </span>
                                </td>

                                <td className="tf-cell-date">
                                  {item.createdAt
                                    ? new Date(item.createdAt).toLocaleDateString(
                                      undefined,
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )
                                    : "—"}
                                </td>

                                <td className="th-right">
                                  {!isCurrentUser ? (
                                    <button
                                      className="tf-btn-del-action"
                                      onClick={() =>
                                        triggerDeleteUser(item._id, item.name)
                                      }
                                      title="Delete user and associated tasks"
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete User
                                    </button>
                                  ) : (
                                    <span className="tf-badge tf-badge-protected">
                                      Protected
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ================= GLOBAL TASK MANAGEMENT ================= */
                <div className="tf-admin-table-card">
                  <div className="tf-table-toolbar">
                    <div className="tf-search-box">
                      <svg
                        className="tf-search-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        className="tf-search-input"
                        placeholder="Search tasks by title, notes, or owner..."
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                      />
                      {taskSearch && (
                        <button
                          className="tf-search-clear"
                          onClick={() => setTaskSearch("")}
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    <div className="tf-filter-pills">
                      <button
                        className={`tf-pill-btn ${taskStatusFilter === "all" ? "active" : ""}`}
                        onClick={() => setTaskStatusFilter("all")}
                      >
                        All ({tasks.length})
                      </button>
                      <button
                        className={`tf-pill-btn ${taskStatusFilter === "pending" ? "active" : ""}`}
                        onClick={() => setTaskStatusFilter("pending")}
                      >
                        Pending ({pendingTasks})
                      </button>
                      <button
                        className={`tf-pill-btn ${taskStatusFilter === "completed" ? "active" : ""}`}
                        onClick={() => setTaskStatusFilter("completed")}
                      >
                        Completed ({completedTasks})
                      </button>
                    </div>
                  </div>

                  <div className="tf-table-responsive">
                    <table className="tf-modern-table">
                      <thead>
                        <tr>
                          <th>Task Title</th>
                          <th>Description</th>
                          <th>Owner</th>
                          <th>Status</th>
                          <th className="th-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="td-empty">
                              No tasks match your criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredTasks.map((t) => (
                            <tr key={t._id}>
                              <td>
                                <div className="tf-task-title-cell">
                                  <span
                                    className={`tf-status-indicator ${t.completed ? "done" : "active"
                                      }`}
                                  >
                                    {t.completed ? "✓" : "•"}
                                  </span>
                                  <strong>{t.title}</strong>
                                </div>
                              </td>

                              <td className="tf-cell-desc">
                                {t.description || (
                                  <span className="tf-dimmed">No description</span>
                                )}
                              </td>

                              <td>
                                {t.user ? (
                                  <div className="tf-owner-pill">
                                    <div className="tf-avatar tf-avatar-xs">
                                      {t.user.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                      <strong>{t.user.name}</strong>
                                      <span className="tf-owner-email">{t.user.email}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="tf-dimmed">Unknown Owner</span>
                                )}
                              </td>

                              <td>
                                <span
                                  className={`tf-badge ${t.completed
                                      ? "tf-badge-success"
                                      : "tf-badge-warning"
                                    }`}
                                >
                                  {t.completed ? "Completed" : "In Progress"}
                                </span>
                              </td>

                              <td className="th-right">
                                <button
                                  className="tf-btn-del-action"
                                  onClick={() => triggerDeleteTask(t._id, t.title)}
                                  title="Delete task permanently"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.type === "user"
            ? "Delete User Account"
            : "Delete Task"
        }
        message={
          deleteModal.type === "user"
            ? `Are you sure you want to delete user "${deleteModal.title}" and all tasks owned by this account? This action cannot be reversed.`
            : `Are you sure you want to permanently delete task "${deleteModal.title}"?`
        }
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteModal({ isOpen: false, type: "user", id: null, title: "" })
        }
      />
    </div>
  );
}