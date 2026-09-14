import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({
  onOpenTaskModal,
  onToggleSidebar,
  isSidebarOpen,
  onSearchChange,
  searchQuery = "",
}) {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [focusTimerOpen, setFocusTimerOpen] = useState(false);

  // Focus Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const focusRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (focusRef.current && !focusRef.current.contains(e.target)) {
        setFocusTimerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="tf-navbar">
      <div className="tf-nav-left">
        <button
          className="tf-mobile-toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <Link to={user ? "/dashboard" : "/"} className="tf-brand">
          <div className="tf-brand-icon" title="Taskora Workspace">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="tf-brand-text">
            <span className="tf-brand-name">Taskora</span>
            <span className="tf-brand-badge">workspace</span>
          </div>
        </Link>

        {user && onSearchChange && (
          <div className="tf-nav-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search or jump to... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="tf-nav-right">
        {onOpenTaskModal && (
          <button
            className="tf-nav-create-btn"
            onClick={onOpenTaskModal}
            title="Add task (N)"
          >
            <span>+</span>
            <span>New Task</span>
          </button>
        )}

        {/* Focus Timer Widget */}
        {user && (
          <div className="tf-relative" ref={focusRef}>
            <button
              className={`tf-zen-timer-btn ${isTimerRunning ? "running" : ""}`}
              onClick={() => setFocusTimerOpen((prev) => !prev)}
              title="Focus Timer"
            >
              <span className="tf-timer-icon">⏱️</span>
              <span className="tf-timer-display">{formatTimer(timerSeconds)}</span>
            </button>

            {focusTimerOpen && (
              <div className="tf-popover tf-focus-popover">
                <div className="tf-popover-header">
                  <strong>Focus Timer</strong>
                  <span className="tf-timer-badge">Focus Sessions</span>
                </div>
                <div className="tf-focus-timer-body">
                  <div className="tf-focus-countdown">
                    {formatTimer(timerSeconds)}
                  </div>
                  <p className="tf-focus-quote">
                    {isTimerRunning
                      ? "Focus session active. Stay focused on your work."
                      : "Ready to start your focus session?"}
                  </p>
                  <div className="tf-focus-timer-actions">
                    <button
                      className={`tf-btn tf-btn-sm ${
                        isTimerRunning ? "tf-btn-secondary" : "tf-btn-primary"
                      }`}
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                    >
                      {isTimerRunning ? "Pause" : "Start Focus"}
                    </button>
                    <button
                      className="tf-btn tf-btn-ghost tf-btn-sm"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(25 * 60);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Productivity Focus Points Pill */}
        {user && (
          <div className="tf-karma-pill" title="Productivity Progress">
            <span className="tf-karma-spark">🔥</span>
            <span>Level 4 · 920 XP</span>
          </div>
        )}

        {/* Theme switcher */}
        <button
          className="tf-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="tf-relative" ref={notifRef}>
          <button
            className="tf-icon-btn"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {notificationsOpen && (
            <div className="tf-popover tf-notif-popover">
              <div className="tf-popover-header">
                <strong>Notifications</strong>
                <span className="tf-notif-badge">Live</span>
              </div>
              <div className="tf-notif-list">
                <div className="tf-notif-item">
                  <div className="tf-notif-dot"></div>
                  <div>
                    <p className="tf-notif-title">Taskora Workspace Ready</p>
                    <span className="tf-notif-time">Docker • EC2 Deployment Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        {user ? (
          <div className="tf-relative" ref={dropdownRef}>
            <button
              className="tf-user-trigger"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
            >
              <div className={`tf-avatar ${isAdmin ? "tf-avatar-admin" : ""}`}>
                {userInitial}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="tf-popover tf-user-popover">
                <div className="tf-user-popover-header">
                  <div className="tf-avatar tf-avatar-lg">{userInitial}</div>
                  <div>
                    <strong className="tf-dropdown-name">{user.name}</strong>
                    <span className="tf-dropdown-email">{user.email}</span>
                    <span className={`tf-role-pill ${isAdmin ? "pill-admin" : "pill-user"}`}>
                      {isAdmin ? "⚡ Administrator" : "✓ Workspace Member"}
                    </span>
                  </div>
                </div>

                <div className="tf-dropdown-divider"></div>

                <div className="tf-dropdown-links">
                  <Link
                    to="/dashboard"
                    className={`tf-dropdown-item ${location.pathname === "/dashboard" ? "active" : ""}`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Workspace Tasks
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`tf-dropdown-item ${location.pathname === "/admin" ? "active" : ""}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Admin Console
                    </Link>
                  )}
                </div>

                <div className="tf-dropdown-divider"></div>

                <button className="tf-dropdown-item tf-logout-btn" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="tf-auth-nav-links">
            <Link to="/login" className="tf-btn tf-btn-ghost tf-btn-sm">
              Log in
            </Link>
            <Link to="/register" className="tf-btn tf-btn-primary tf-btn-sm">
              Start for free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
