import { useState, useMemo } from "react";

export default function TaskListView({
  tasks,
  viewTitle = "Inbox",
  onToggleTask,
  onDeleteTask,
  onAddTask,
  searchQuery = "",
}) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("p4"); // p1, p2, p3, p4
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [tasks, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
    });

    setTitle("");
    setDescription("");
    setPriority("p4");
    setIsComposerOpen(false);
  };

  const getPriorityClass = (p) => {
    if (p === "p1") return "p1";
    if (p === "p2") return "p2";
    if (p === "p3") return "p3";
    return "p4";
  };

  const getTaskCategoryTag = (task) => {
    if (task.project === "work") return { label: "DevOps", color: "dot-red" };
    if (task.project === "personal") return { label: "Personal Habits", color: "dot-green" };
    if (task.project === "learning") return { label: "Short Task (<15m)", color: "dot-blue" };

    const text = `${task.title || ""} ${task.description || ""}`.toLowerCase();
    if (text.match(/devops|infra|docker|deploy|aws|ec2|api|code|backend|frontend|setup|test|server|git|database/i)) {
      return { label: "DevOps", color: "dot-red" };
    }
    if (text.match(/habit|personal|routine|health|workout|exercise|water|meditat|sleep|book|journal|life/i)) {
      return { label: "Personal Habits", color: "dot-green" };
    }
    if (text.match(/quick|15m|fast|call|email|review|check|reply|clean|ping|short|note|read/i)) {
      return { label: "Short Task (<15m)", color: "dot-blue" };
    }
    return { label: "General", color: "dot-orange" };
  };

  return (
    <div className="tf-todoist-list-wrapper">
      {/* Todoist Task Rows */}
      <div className="tf-task-list">
        {filteredTasks.length === 0 && !isComposerOpen ? (
          <div className="tf-empty-state">
            <div className="tf-empty-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="tf-empty-title">All clear in {viewTitle}</h3>
            <p className="tf-empty-desc">
              Enjoy your free time or add new tasks to organize your day.
            </p>
          </div>
        ) : (
          filteredTasks.map((task, idx) => {
            // Distribute priority visuals for aesthetic feel
            const taskP = idx % 4 === 0 ? "p1" : idx % 4 === 1 ? "p2" : idx % 4 === 2 ? "p3" : "p4";
            const tag = getTaskCategoryTag(task);

            return (
              <div
                key={task._id}
                className={`tf-task-row ${task.completed ? "completed" : ""}`}
              >
                {/* Round Checkbox */}
                <button
                  className={`tf-checkbox ${task.completed ? "checked" : ""} ${getPriorityClass(taskP)}`}
                  onClick={() => onToggleTask(task)}
                  aria-label={
                    task.completed ? "Mark incomplete" : "Mark complete"
                  }
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>

                {/* Task Body */}
                <div className="tf-task-body">
                  <div className="tf-task-title">{task.title}</div>
                  {task.description && (
                    <div className="tf-task-description">{task.description}</div>
                  )}
                  <div className="tf-task-metadata">
                    <span className="tf-due-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                      </svg>
                      Today
                    </span>
                    <span>•</span>
                    <span className="tf-project-tag">
                      <span className={`tf-color-dot ${tag.color}`}></span>
                      {tag.label}
                    </span>
                  </div>
                </div>

                {/* Hover Action (Delete) */}
                <div className="tf-task-actions-hover">
                  <button
                    className="tf-task-action-btn"
                    onClick={() => onDeleteTask(task._id, task.title)}
                    title="Delete task"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Todoist Inline Task Composer */}
      {!isComposerOpen ? (
        <div
          className="tf-todoist-add-trigger"
          onClick={() => setIsComposerOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add task</span>
        </div>
      ) : (
        <form onSubmit={handleAddSubmit} className="tf-todoist-composer">
          <input
            type="text"
            className="tf-composer-name"
            placeholder="Task name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="tf-composer-desc"
            placeholder="Description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="tf-composer-tags-bar">
            <div className="tf-composer-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
              <span>Today</span>
            </div>

            <div
              className={`tf-composer-pill ${priority}`}
              onClick={() => setShowPriorityDropdown((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
              <span>
                {priority === "p1"
                  ? "Priority 1"
                  : priority === "p2"
                  ? "Priority 2"
                  : priority === "p3"
                  ? "Priority 3"
                  : "Priority 4"}
              </span>
            </div>

            {showPriorityDropdown && (
              <div className="tf-composer-pills-select">
                <button
                  type="button"
                  className="tf-composer-pill p1"
                  onClick={() => {
                    setPriority("p1");
                    setShowPriorityDropdown(false);
                  }}
                >
                  🚩 P1 (Red)
                </button>
                <button
                  type="button"
                  className="tf-composer-pill p2"
                  onClick={() => {
                    setPriority("p2");
                    setShowPriorityDropdown(false);
                  }}
                >
                  🚩 P2 (Orange)
                </button>
                <button
                  type="button"
                  className="tf-composer-pill p3"
                  onClick={() => {
                    setPriority("p3");
                    setShowPriorityDropdown(false);
                  }}
                >
                  🚩 P3 (Blue)
                </button>
              </div>
            )}
          </div>

          <div className="tf-composer-actions">
            <button
              type="button"
              className="tf-btn tf-btn-secondary tf-btn-sm"
              onClick={() => {
                setIsComposerOpen(false);
                setTitle("");
                setDescription("");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tf-btn tf-btn-primary tf-btn-sm"
              disabled={!title.trim()}
            >
              Add task
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
