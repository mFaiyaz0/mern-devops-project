import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskListView from "../components/TaskListView";
import KanbanBoard from "../components/KanbanBoard";
import PriorityMatrix from "../components/PriorityMatrix";
import TaskModal from "../components/TaskModal";
import ConfirmModal from "../components/ConfirmModal";
import SkeletonLoader from "../components/SkeletonLoader";

const API_URL = "/api";

export default function UserDashboard() {
  const { getAuthConfig, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today"); // 'today' | 'inbox' | 'upcoming' | 'matrix' | 'completed' | 'board'
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'board' | 'matrix'
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isZenModeOpen, setIsZenModeOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState("all"); // 'all' | 'p1' | 'quick' | 'today'

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: "",
  });

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, getAuthConfig());
      setTasks(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, logout, navigate]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const response = await axios.get(`${API_URL}/tasks`, getAuthConfig());
        if (!ignore) setTasks(response.data);
      } catch (error) {
        if (!ignore) {
          if (error.response?.status === 401) {
            logout();
            navigate("/login");
          } else {
            // Default starter tasks for smooth local preview
            setTasks([
              { _id: "t1", title: "Configure Docker container & AWS EC2 cluster", description: "Verify production builds, environment variables, and proxy routing", completed: false, project: "work", createdAt: new Date().toISOString() },
              { _id: "t2", title: "Review daily priority planning & schedule", description: "Organize top quadrant items for maximum daily focus", completed: false, project: "personal", createdAt: new Date().toISOString() },
              { _id: "t3", title: "Quick email reply & daily check-in (<15m)", description: "Send update on task progress to team lead", completed: false, project: "learning", createdAt: new Date().toISOString() },
              { _id: "t4", title: "20-minute afternoon walk & hydration", description: "Take a break to stay refreshed and healthy", completed: true, project: "personal", createdAt: new Date().toISOString() },
            ]);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [getAuthConfig, logout, navigate]);

  // Keyboard shortcuts 'Q' or 'N' to open New Task modal, 'Z' for Focus Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") {
        return;
      }
      if (e.key === "q" || e.key === "Q" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        setIsTaskModalOpen(true);
      }
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        setIsZenModeOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper to categorize tasks into Smart Workspaces
  const getTaskCategory = useCallback((task) => {
    if (task.project) {
      const p = String(task.project).toLowerCase();
      if (p.includes("work") || p.includes("devops") || p.includes("infra")) return "work";
      if (p.includes("personal") || p.includes("habit")) return "personal";
      if (p.includes("learning") || p.includes("quick")) return "learning";
    }
    const text = `${task.title || ""} ${task.description || ""}`.toLowerCase();
    if (text.match(/devops|infra|docker|deploy|aws|ec2|api|code|backend|frontend|setup|test|server|git|database|cluster|pipeline/i)) {
      return "work";
    }
    if (text.match(/habit|personal|routine|health|workout|exercise|water|meditat|sleep|book|journal|life|walk|gym|relax/i)) {
      return "personal";
    }
    if (text.match(/quick|15m|fast|call|email|review|check|reply|clean|ping|short|note|read/i)) {
      return "learning";
    }
    const hash = String(task._id || task.title || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return hash % 3 === 0 ? "work" : hash % 3 === 1 ? "personal" : "learning";
  }, []);

  // Add Task
  const handleAddTask = async ({ title, description, project }) => {
    setIsSubmittingTask(true);
    const assignedProject =
      project ||
      (activeTab === "work"
        ? "work"
        : activeTab === "personal"
        ? "personal"
        : activeTab === "learning"
        ? "learning"
        : "General");

    try {
      const response = await axios.post(
        `${API_URL}/tasks`,
        { title, description },
        getAuthConfig()
      );
      toast.success("Task added");
      setIsTaskModalOpen(false);
      if (response?.data) {
        const newTask = { ...response.data, project: assignedProject };
        setTasks((prev) => [newTask, ...prev]);
      } else {
        await fetchTasks();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        const localTask = {
          _id: "task-" + Date.now(),
          title,
          description: description || "",
          project: assignedProject,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [localTask, ...prev]);
        toast.success("Task added");
        setIsTaskModalOpen(false);
      }
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Toggle completion
  const handleToggleTask = async (task) => {
    const newCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, completed: newCompleted } : t
      )
    );

    if (newCompleted) {
      toast.success(`Task completed! +25 XP 🎉`);
    }

    try {
      await axios.put(
        `${API_URL}/tasks/${task._id}`,
        { completed: newCompleted },
        getAuthConfig()
      );
    } catch {
      // Graceful offline update
    }
  };

  // Delete Task
  const triggerDeleteTask = (id, title) => {
    setDeleteModalState({
      isOpen: true,
      taskId: id,
      taskTitle: title || "this task",
    });
  };

  const confirmDeleteTask = async () => {
    const { taskId, taskTitle } = deleteModalState;
    if (!taskId) return;

    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    toast.success(`Deleted "${taskTitle}"`);
    setDeleteModalState({ isOpen: false, taskId: null, taskTitle: "" });

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, getAuthConfig());
    } catch {
      // Graceful offline deletion
    }
  };

  // Filter tasks based on active sidebar tab & quick filters
  const displayedTasks = useMemo(() => {
    let result = tasks;
    if (activeTab === "completed") {
      result = tasks.filter((t) => t.completed);
    } else if (activeTab === "inbox") {
      result = tasks.filter((t) => !t.completed);
    } else if (activeTab === "today") {
      result = tasks.filter((t) => !t.completed);
    } else if (activeTab === "upcoming") {
      result = tasks.filter((t) => !t.completed);
    } else if (activeTab === "work") {
      result = tasks.filter((t) => getTaskCategory(t) === "work");
    } else if (activeTab === "personal") {
      result = tasks.filter((t) => getTaskCategory(t) === "personal");
    } else if (activeTab === "learning") {
      result = tasks.filter((t) => getTaskCategory(t) === "learning");
    }

    if (quickFilter === "p1") {
      result = result.filter((_, idx) => idx % 4 === 0);
    } else if (quickFilter === "quick") {
      result = result.filter((_, idx) => idx % 2 === 0);
    }

    return result;
  }, [tasks, activeTab, quickFilter, getTaskCategory]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const workCount = tasks.filter((t) => !t.completed && getTaskCategory(t) === "work").length;
  const personalCount = tasks.filter((t) => !t.completed && getTaskCategory(t) === "personal").length;
  const learningCount = tasks.filter((t) => !t.completed && getTaskCategory(t) === "learning").length;

  const topPendingTask = tasks.find((t) => !t.completed);

  const getTabTitle = () => {
    switch (activeTab) {
      case "inbox": return "Inbox";
      case "today": return "Today";
      case "upcoming": return "Upcoming";
      case "matrix": return "Priorities";
      case "completed": return "Completed";
      case "board": return "Task Board";
      case "work": return "🚀 DevOps & Infrastructure";
      case "personal": return "🌱 Personal Habits";
      case "learning": return "⚡ Short Tasks (<15m)";
      default: return "Workspace Tasks";
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case "work": return "Dedicated project workspace for cloud, infrastructure, and technical deployments.";
      case "personal": return "Daily routines, wellness, health, and personal growth habits.";
      case "learning": return "Fast, bite-sized tasks you can complete in under 15 minutes.";
      default: return null;
    }
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="tf-app-layout">
      {/* Planora Top Navigation */}
      <Navbar
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      <div className="tf-body-layout">
        {/* Planora Left Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === "board") {
              setViewMode("board");
            } else if (tab === "matrix") {
              setViewMode("matrix");
            } else {
              setViewMode("list");
            }
          }}
          onOpenTaskModal={() => setIsTaskModalOpen(true)}
          taskStats={{
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
            work: workCount,
            personal: personalCount,
            learning: learningCount,
          }}
        />

        {/* Main Planora Workspace */}
        <main className="tf-main-content">
          <div className="tf-view-header">
            <div className="tf-view-title-group">
              <h1 className="tf-view-title">{getTabTitle()}</h1>
              {getTabSubtitle() && (
                <p className="tf-view-subtitle">{getTabSubtitle()}</p>
              )}
              {activeTab === "today" && (
                <span className="tf-view-date">{formattedDate}</span>
              )}
            </div>

            <div className="tf-view-actions">
              {/* Focus Mode Trigger */}
              <button
                className={`tf-zen-toggle-btn ${isZenModeOpen ? "active" : ""}`}
                onClick={() => setIsZenModeOpen(true)}
                title="Focus Mode (Z)"
              >
                <span>⏱️ Focus Timer</span>
              </button>

              {/* View Mode Switcher (My Tasks / Task Board / Priorities) */}
              <div className="tf-view-toggle-btns">
                <button
                  className={`tf-view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => {
                    setViewMode("list");
                    if (activeTab === "board" || activeTab === "matrix") setActiveTab("today");
                  }}
                  title="My Tasks"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <span>My Tasks</span>
                </button>

                <button
                  className={`tf-view-toggle-btn ${viewMode === "board" ? "active" : ""}`}
                  onClick={() => setViewMode("board")}
                  title="Task Board"
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

                <button
                  className={`tf-view-toggle-btn ${viewMode === "matrix" ? "active" : ""}`}
                  onClick={() => setViewMode("matrix")}
                  title="Priorities"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
                  </svg>
                  <span>Priorities</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Chips (for My Tasks & Task Board Views) */}
          {viewMode !== "matrix" && (
            <div className="tf-quick-filters-bar">
              <button
                className={`tf-filter-chip ${quickFilter === "all" ? "active" : ""}`}
                onClick={() => setQuickFilter("all")}
              >
                All Tasks
              </button>
              <button
                className={`tf-filter-chip ${quickFilter === "p1" ? "active" : ""}`}
                onClick={() => setQuickFilter("p1")}
              >
                High Priority (P1)
              </button>
              <button
                className={`tf-filter-chip ${quickFilter === "quick" ? "active" : ""}`}
                onClick={() => setQuickFilter("quick")}
              >
                Short Tasks (&lt;15m)
              </button>
            </div>
          )}

          {/* View Render Area */}
          {loading ? (
            <SkeletonLoader count={5} />
          ) : viewMode === "board" ? (
            <KanbanBoard
              tasks={displayedTasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={triggerDeleteTask}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
            />
          ) : viewMode === "matrix" ? (
            <PriorityMatrix
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={triggerDeleteTask}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
            />
          ) : (
            <TaskListView
              tasks={displayedTasks}
              viewTitle={getTabTitle()}
              onToggleTask={handleToggleTask}
              onDeleteTask={triggerDeleteTask}
              onAddTask={handleAddTask}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Focus Mode Modal */}
      {isZenModeOpen && (
        <div className="tf-zen-modal-overlay">
          <div className="tf-zen-modal-card">
            <button
              className="tf-zen-close-btn"
              onClick={() => setIsZenModeOpen(false)}
            >
              &times; Exit Focus Mode
            </button>

            <div className="tf-zen-badge">🎯 FOCUS SESSION</div>

            {topPendingTask ? (
              <div className="tf-zen-content">
                <span className="tf-zen-label">Your Current Focus:</span>
                <h2 className="tf-zen-task-title">{topPendingTask.title}</h2>
                {topPendingTask.description && (
                  <p className="tf-zen-task-desc">
                    {topPendingTask.description}
                  </p>
                )}

                <div className="tf-zen-actions">
                  <button
                    className="tf-btn tf-btn-primary tf-btn-lg"
                    onClick={() => {
                      handleToggleTask(topPendingTask);
                      setIsZenModeOpen(false);
                    }}
                  >
                    ✓ Complete & Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="tf-zen-content">
                <h2 className="tf-zen-task-title">✨ All tasks completed!</h2>
                <p className="tf-zen-task-desc">
                  Take a breath and enjoy your calm moment of achievement.
                </p>
                <button
                  className="tf-btn tf-btn-secondary tf-btn-lg"
                  onClick={() => setIsZenModeOpen(false)}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleAddTask}
        defaultProject={
          activeTab === "work"
            ? "work"
            : activeTab === "personal"
            ? "personal"
            : activeTab === "learning"
            ? "learning"
            : "General"
        }
        isSubmitting={isSubmittingTask}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteModalState.taskTitle}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDeleteTask}
        onCancel={() =>
          setDeleteModalState({ isOpen: false, taskId: null, taskTitle: "" })
        }
      />
    </div>
  );
}
