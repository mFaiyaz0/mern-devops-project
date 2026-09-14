import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onOpenTaskModal,
  taskStats = { total: 0, completed: 0, pending: 0 },
}) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const completionPercent =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  const handleTabClick = (tabKey) => {
    if (onTabChange) onTabChange(tabKey);
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const todayDateNum = new Date().getDate();

  return (
    <>
      {isOpen && <div className="tf-sidebar-backdrop" onClick={onClose} />}

      <aside className={`tf-sidebar ${isOpen ? "open" : ""}`}>
        {/* Planora Aurora New Task Action */}
        {onOpenTaskModal && (
          <button className="tf-sidebar-add-btn" onClick={onOpenTaskModal}>
            <span className="tf-sidebar-add-icon">+</span>
            <span>New Task</span>
            <span className="tf-shortcut-pill">N</span>
          </button>
        )}

        <nav className="tf-sidebar-nav">
          {/* Inbox */}
          <button
            className={`tf-sidebar-link icon-inbox ${
              location.pathname === "/dashboard" && activeTab === "inbox"
                ? "active"
                : ""
            }`}
            onClick={() => handleTabClick("inbox")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <span>Inbox</span>
            <span className="tf-nav-pill">{taskStats.pending}</span>
          </button>

          {/* Today */}
          <button
            className={`tf-sidebar-link icon-today ${
              location.pathname === "/dashboard" && activeTab === "today"
                ? "active"
                : ""
            }`}
            onClick={() => handleTabClick("today")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            <span>Today</span>
            <span className="tf-nav-pill date-pill">{todayDateNum}</span>
          </button>

          {/* Upcoming */}
          <button
            className={`tf-sidebar-link icon-upcoming ${
              location.pathname === "/dashboard" && activeTab === "upcoming"
                ? "active"
                : ""
            }`}
            onClick={() => handleTabClick("upcoming")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Upcoming</span>
          </button>

          {/* Task Board */}
          <button
            className={`tf-sidebar-link icon-board ${
              location.pathname === "/dashboard" && activeTab === "board"
                ? "active"
                : ""
            }`}
            onClick={() => handleTabClick("board")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <span>Task Board</span>
          </button>

          {/* Priorities */}
          <button
            className={`tf-sidebar-link icon-matrix ${
              location.pathname === "/dashboard" && activeTab === "matrix"
                ? "active"
                : ""
            }`}
            onClick={() => handleTabClick("matrix")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="2" strokeWidth="2" />
              <rect x="13" y="3" width="8" height="8" rx="2" strokeWidth="2" />
              <rect x="3" y="13" width="8" height="8" rx="2" strokeWidth="2" />
              <rect x="13" y="13" width="8" height="8" rx="2" strokeWidth="2" />
            </svg>
            <span>Priorities</span>
            <span className="tf-badge-unique">NEW</span>
          </button>

          {/* Completed */}
          <button
            className={`tf-sidebar-link icon-completed ${
              location.pathname === "/dashboard" && activeTab === "completed"
                ? "active"
                : ""
            }`}
            onClick={() => handleTabClick("completed")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Completed</span>
            <span className="tf-nav-pill">{taskStats.completed}</span>
          </button>

          {/* Projects / Workspaces */}
          <div className="tf-projects-header">
            <span>SMART WORKSPACES</span>
          </div>

          <div
            className={`tf-project-item ${activeTab === "work" ? "active" : ""}`}
            onClick={() => handleTabClick("work")}
            role="button"
            tabIndex={0}
            title="DevOps & Infrastructure Tasks"
          >
            <span className="tf-color-dot dot-red"></span>
            <span className="tf-project-title">🚀 DevOps & Infrastructure</span>
            {taskStats.work !== undefined && (
              <span className="tf-nav-pill">{taskStats.work}</span>
            )}
          </div>

          <div
            className={`tf-project-item ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => handleTabClick("personal")}
            role="button"
            tabIndex={0}
            title="Personal Habits & Goals"
          >
            <span className="tf-color-dot dot-green"></span>
            <span className="tf-project-title">🌱 Personal Habits</span>
            {taskStats.personal !== undefined && (
              <span className="tf-nav-pill">{taskStats.personal}</span>
            )}
          </div>

          <div
            className={`tf-project-item ${activeTab === "learning" ? "active" : ""}`}
            onClick={() => handleTabClick("learning")}
            role="button"
            tabIndex={0}
            title="Short Tasks Under 15 Minutes"
          >
            <span className="tf-color-dot dot-blue"></span>
            <span className="tf-project-title">⚡ Short Tasks (&lt;15m)</span>
            {taskStats.learning !== undefined && (
              <span className="tf-nav-pill">{taskStats.learning}</span>
            )}
          </div>

          {/* Administration Section */}
          {isAdmin && (
            <>
              <div className="tf-projects-header">
                <span>SYSTEM CONTROL</span>
              </div>

              <Link
                to="/admin"
                className={`tf-sidebar-link ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
                onClick={onClose}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Admin Console</span>
              </Link>
            </>
          )}
        </nav>

        {/* Daily Momentum & Velocity Widget */}
        <div className="tf-sidebar-widget">
          <div className="tf-widget-header">
            <span>Daily Velocity</span>
            <span>{taskStats.completed}/{taskStats.total || 5} tasks</span>
          </div>
          <div className="tf-progress-bar-wrap">
            <div
              className="tf-progress-bar-fill"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="tf-widget-footer">
            <span className="tf-widget-sub">
              {completionPercent >= 100
                ? "✨ Flow state achieved!"
                : `${completionPercent}% daily target`}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
