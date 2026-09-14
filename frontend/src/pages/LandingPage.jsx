import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Interactive Live Studio State
  const [studioView, setStudioView] = useState("list"); // 'list' | 'board' | 'matrix'
  const [activeMockupTab, setActiveMockupTab] = useState("today");
  const [mockupInput, setMockupInput] = useState("");
  const [mockupTasks, setMockupTasks] = useState([
    { id: 1, title: "Review quarterly project roadmap & task updates", completed: false, project: "Work", priority: "p1" },
    { id: 2, title: "Update team documentation and project notes", completed: true, project: "Work", priority: "p1" },
    { id: 3, title: "Design clean dashboard layouts for mobile and tablet", completed: false, project: "Design", priority: "p2" },
    { id: 4, title: "Check user permissions and system settings", completed: true, project: "Admin", priority: "p3" },
    { id: 5, title: "Organize daily priorities and plan tomorrow's tasks", completed: false, project: "Personal", priority: "p4" },
  ]);

  // Live Focus Timer demo in hero
  const [demoTimer, setDemoTimer] = useState(25 * 60);
  const [isDemoTimerRunning, setIsDemoTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isDemoTimerRunning && demoTimer > 0) {
      interval = setInterval(() => setDemoTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isDemoTimerRunning, demoTimer]);

  const toggleMockupTask = (id) => {
    setMockupTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addMockupTask = (e) => {
    e.preventDefault();
    if (!mockupInput.trim()) return;
    const newTask = {
      id: Date.now(),
      title: mockupInput.trim(),
      completed: false,
      project: "General",
      priority: "p1",
    };
    setMockupTasks((prev) => [newTask, ...prev]);
    setMockupInput("");
  };

  const completedCount = mockupTasks.filter((t) => t.completed).length;

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="tf-landing-page">
      {/* Top Navigation */}
      <nav className="tf-landing-nav">
        <div className="tf-landing-nav-inner">
          <Link to="/" className="tf-brand">
            <div className="tf-brand-icon" title="Taskora">
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

          <div className="tf-landing-links">
            <a href="#features" className="tf-landing-link">Features</a>
            <a href="#studio" className="tf-landing-link">Product Preview</a>
            <a href="#workflows" className="tf-landing-link">Get Started</a>
          </div>

          <div className="tf-nav-right">
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

            {user ? (
              <Link to="/dashboard" className="tf-btn tf-btn-primary tf-btn-sm">
                Open Workspace
              </Link>
            ) : (
              <>
                <Link to="/login" className="tf-btn tf-btn-ghost tf-btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="tf-btn tf-btn-primary tf-btn-sm">
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="tf-landing-hero">
        <div className="tf-landing-hero-container">
          <div className="tf-hero-pill-badge">
            <span className="tf-badge-sparkle">⚡</span>
            <span>Taskora — Simple Task Management</span>
          </div>

          <h1 className="tf-landing-headline">
            Plan your work. <br />
            Stay organized. Get things done.
          </h1>

          <p className="tf-landing-sub">
            Manage tasks, set priorities, organize projects, and stay on top of your daily work in one simple workspace.
          </p>

          <div className="tf-hero-cta-wrap">
            <div className="tf-hero-btn-group">
              <Link to="/register" className="tf-btn tf-btn-primary tf-btn-lg">
                Create Free Workspace
              </Link>
              <Link to="/login" className="tf-btn tf-btn-secondary tf-btn-lg">
                Explore Demo Dashboard
              </Link>
            </div>
          </div>

          {/* Interactive Product Preview Studio */}
          <div className="tf-mockup-frame" id="studio">
            <div className="tf-mockup-header">
              <div className="tf-mockup-dots">
                <span className="mockup-dot mockup-dot-red"></span>
                <span className="mockup-dot mockup-dot-yellow"></span>
                <span className="mockup-dot mockup-dot-green"></span>
              </div>

              {/* View Mode Switcher in Live Studio */}
              <div className="tf-studio-view-picker">
                <button
                  className={`tf-studio-pill ${studioView === "list" ? "active" : ""}`}
                  onClick={() => setStudioView("list")}
                >
                  <span>📝 My Tasks</span>
                </button>
                <button
                  className={`tf-studio-pill ${studioView === "board" ? "active" : ""}`}
                  onClick={() => setStudioView("board")}
                >
                  <span>📋 Task Board</span>
                </button>
                <button
                  className={`tf-studio-pill ${studioView === "matrix" ? "active" : ""}`}
                  onClick={() => setStudioView("matrix")}
                >
                  <span>⚡ Priorities</span>
                </button>
              </div>

              {/* Interactive Focus timer in demo */}
              <div
                className="tf-mockup-streak-badge"
                onClick={() => setIsDemoTimerRunning(!isDemoTimerRunning)}
                style={{ cursor: "pointer" }}
                title="Click to toggle focus timer"
              >
                ⏱️ {formatTimer(demoTimer)} {isDemoTimerRunning ? "(Running)" : "(Paused)"}
              </div>
            </div>

            <div className="tf-mockup-body">
              {/* Studio Sidebar */}
              <div className="tf-mockup-sidebar">
                <button
                  className={`mockup-item ${activeMockupTab === "today" ? "active" : ""}`}
                  onClick={() => setActiveMockupTab("today")}
                >
                  <span>📅</span> Today
                </button>
                <button
                  className={`mockup-item ${activeMockupTab === "inbox" ? "active" : ""}`}
                  onClick={() => setActiveMockupTab("inbox")}
                >
                  <span>📥</span> Inbox
                </button>
                <button
                  className={`mockup-item ${activeMockupTab === "matrix" ? "active" : ""}`}
                  onClick={() => {
                    setActiveMockupTab("matrix");
                    setStudioView("matrix");
                  }}
                >
                  <span>⚡</span> Priorities
                </button>

                <div className="mockup-section-label">PROJECTS</div>

                <div className="mockup-item">
                  <span className="tf-color-dot dot-red"></span> Daily Work
                </div>
                <div className="mockup-item">
                  <span className="tf-color-dot dot-blue"></span> Design Tasks
                </div>
                <div className="mockup-item">
                  <span className="tf-color-dot dot-green"></span> Personal Goals
                </div>
              </div>

              {/* Studio Content */}
              <div className="tf-mockup-content">
                <div className="tf-mockup-content-header">
                  <div>
                    <h3 className="tf-mockup-heading">
                      {studioView === "matrix"
                        ? "Priorities"
                        : studioView === "board"
                        ? "Task Board"
                        : "My Tasks"}
                    </h3>
                    <span className="tf-mockup-subtitle">
                      Interactive Preview · Click items to toggle or add new tasks below
                    </span>
                  </div>
                  <span className="tf-studio-xp-badge">
                    {completedCount}/{mockupTasks.length} Completed
                  </span>
                </div>

                {/* Quick Add Form in Studio */}
                <form onSubmit={addMockupTask} className="tf-mockup-quick-add">
                  <span className="tf-quick-plus">+</span>
                  <input
                    type="text"
                    placeholder="Add a new task and press Enter (e.g. 'Complete project review')..."
                    value={mockupInput}
                    onChange={(e) => setMockupInput(e.target.value)}
                  />
                </form>

                {/* 1. LIST VIEW */}
                {studioView === "list" && (
                  <div className="tf-task-list">
                    {mockupTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`tf-task-row ${t.completed ? "completed" : ""}`}
                        onClick={() => toggleMockupTask(t.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className={`tf-checkbox ${t.completed ? "checked" : ""} ${t.priority}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>

                        <div className="tf-task-body">
                          <span className="tf-task-title">{t.title}</span>
                          <div className="tf-task-metadata">
                            <span className="tf-due-date">Today</span>
                            <span>•</span>
                            <span className="tf-project-tag">{t.project}</span>
                            <span>•</span>
                            <span className={`tf-priority-tag ${t.priority}`}>
                              {t.priority === "p1" ? "🚩 P1" : t.priority === "p2" ? "🚩 P2" : "🚩 P3"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. BOARD VIEW */}
                {studioView === "board" && (
                  <div className="tf-studio-board-grid">
                    <div className="tf-studio-board-col">
                      <div className="tf-column-header">
                        <strong>To Do</strong>
                        <span>{mockupTasks.filter((t) => !t.completed).length}</span>
                      </div>
                      <div className="tf-board-cards">
                        {mockupTasks
                          .filter((t) => !t.completed)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="tf-board-card"
                              onClick={() => toggleMockupTask(t.id)}
                            >
                              <strong style={{ fontSize: "0.85rem" }}>{t.title}</strong>
                              <span className="tf-project-tag" style={{ marginTop: "4px" }}>
                                {t.project}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="tf-studio-board-col">
                      <div className="tf-column-header">
                        <strong>Completed</strong>
                        <span>{completedCount}</span>
                      </div>
                      <div className="tf-board-cards">
                        {mockupTasks
                          .filter((t) => t.completed)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="tf-board-card completed"
                              onClick={() => toggleMockupTask(t.id)}
                            >
                              <strong style={{ fontSize: "0.85rem", textDecoration: "line-through" }}>
                                {t.title}
                              </strong>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. MATRIX VIEW */}
                {studioView === "matrix" && (
                  <div className="tf-studio-matrix-grid">
                    <div className="tf-studio-quadrant quad-q1">
                      <div className="tf-studio-quad-header">
                        <strong>⚡ Q1: Urgent & Important (P1)</strong>
                      </div>
                      <div className="tf-studio-quad-tasks">
                        {mockupTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={`tf-studio-card ${t.completed ? "completed" : ""}`}
                            onClick={() => toggleMockupTask(t.id)}
                          >
                            <div className={`tf-checkbox ${t.completed ? "checked" : ""} p1`}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tf-studio-quadrant quad-q2">
                      <div className="tf-studio-quad-header">
                        <strong>📅 Q2: Important (P2)</strong>
                      </div>
                      <div className="tf-studio-quad-tasks">
                        {mockupTasks.slice(2, 4).map((t) => (
                          <div
                            key={t.id}
                            className={`tf-studio-card ${t.completed ? "completed" : ""}`}
                            onClick={() => toggleMockupTask(t.id)}
                          >
                            <div className={`tf-checkbox ${t.completed ? "checked" : ""} p2`}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES Section */}
      <section className="tf-landing-features" id="features">
        <div className="tf-features-container">
          <div className="tf-section-header">
            <span className="tf-section-tag">CORE FEATURES</span>
            <h2 className="tf-section-title">Everything you need to stay organized</h2>
            <p className="tf-section-sub">
              Taskora gives you simple tools to plan your day, manage tasks, organize projects, and stay focused.
            </p>
          </div>

          <div className="tf-features-grid">
            <div className="tf-todoist-feat-card">
              <div className="tf-feat-icon red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Quick Task Creation</h3>
              <p>
                Add tasks quickly, set priorities, and keep your work organized without unnecessary steps.
              </p>
            </div>

            <div className="tf-todoist-feat-card">
              <div className="tf-feat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3>Task Views</h3>
              <p>
                Switch between My Tasks, Task Board, and Priorities views to manage your work the way you prefer.
              </p>
            </div>

            <div className="tf-todoist-feat-card">
              <div className="tf-feat-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Focus Timer</h3>
              <p>
                Use a simple focus timer to work in focused sessions and take regular breaks.
              </p>
            </div>

            <div className="tf-todoist-feat-card">
              <div className="tf-feat-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3>Task & Project Management</h3>
              <p>
                Create projects, organize tasks, track progress, and keep your work in one place.
              </p>
            </div>

            <div className="tf-todoist-feat-card">
              <div className="tf-feat-icon red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3>Admin Management</h3>
              <p>
                Admins can manage users and monitor tasks and activities through the existing admin features.
              </p>
            </div>

            <div className="tf-todoist-feat-card">
              <div className="tf-feat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
                </svg>
              </div>
              <h3>Priorities & Organization</h3>
              <p>
                Set task priorities and organize important work so you always know what to focus on next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct CTA Banner */}
      <section className="tf-cta-banner" id="workflows">
        <div className="tf-cta-inner">
          <h2>Ready to get organized?</h2>
          <p>
            Get started with Taskora today. Simple, fast, and easy to use.
          </p>
          <div className="tf-cta-actions">
            <Link to="/register" className="tf-btn tf-btn-primary tf-btn-lg">
              Start Free Workspace
            </Link>
            <Link to="/login" className="tf-btn tf-btn-ghost tf-btn-lg" style={{ color: "#ffffff" }}>
              Sign in with existing account →
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Taskora Footer */}
      <footer className="tf-landing-footer">
        <div className="tf-footer-inner">
          <div className="tf-brand">
            <div className="tf-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="tf-brand-name">Taskora</span>
            <span className="tf-brand-badge">workspace</span>
          </div>

          <div className="tf-footer-links">
            <a href="#features">Features</a>
            <a href="#studio">Product Preview</a>
            <a href="#workflows">Get Started</a>
          </div>

          <p className="tf-copyright">
            © {new Date().getFullYear()} Taskora. Simple task management workspace.
          </p>
        </div>
      </footer>
    </div>
  );
}
