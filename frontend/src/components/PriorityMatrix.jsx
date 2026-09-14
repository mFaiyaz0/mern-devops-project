export default function PriorityMatrix({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenTaskModal,
}) {
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Divide into 4 quadrants based on index or heuristic priority
  const q1Tasks = pendingTasks.filter((_, idx) => idx % 4 === 0);
  const q2Tasks = pendingTasks.filter((_, idx) => idx % 4 === 1);
  const q3Tasks = pendingTasks.filter((_, idx) => idx % 4 === 2);
  const q4Tasks = pendingTasks.filter((_, idx) => idx % 4 === 3);

  const quadrants = [
    {
      id: "q1",
      code: "Q1",
      title: "Do First",
      subtitle: "Urgent & Important (P1)",
      color: "var(--p1-red)",
      badgeBg: "rgba(244, 63, 94, 0.12)",
      tasks: q1Tasks,
      priorityClass: "p1",
      icon: "⚡",
    },
    {
      id: "q2",
      code: "Q2",
      title: "Schedule",
      subtitle: "Important, Not Urgent (P2)",
      color: "var(--p2-orange)",
      badgeBg: "rgba(249, 115, 22, 0.12)",
      tasks: q2Tasks,
      priorityClass: "p2",
      icon: "📅",
    },
    {
      id: "q3",
      code: "Q3",
      title: "Fast-Track",
      subtitle: "Urgent, Less Critical (P3)",
      color: "var(--p3-blue)",
      badgeBg: "rgba(59, 130, 246, 0.12)",
      tasks: q3Tasks,
      priorityClass: "p3",
      icon: "🚀",
    },
    {
      id: "q4",
      code: "Q4",
      title: "Backlog / Low",
      subtitle: "Neither Urgent Nor Critical (P4)",
      color: "var(--p4-grey)",
      badgeBg: "rgba(100, 116, 139, 0.12)",
      tasks: q4Tasks,
      priorityClass: "p4",
      icon: "🧘",
    },
  ];

  return (
    <div className="tf-matrix-view">
      <div className="tf-matrix-info-bar">
        <div>
          <h3 className="tf-matrix-main-title">Priorities</h3>
          <p className="tf-matrix-sub">
            Organize and manage your tasks based on priority and urgency.
          </p>
        </div>
        <button
          className="tf-btn tf-btn-primary tf-btn-sm"
          onClick={onOpenTaskModal}
        >
          <span>+</span> Add Task
        </button>
      </div>

      <div className="tf-matrix-grid">
        {quadrants.map((q) => (
          <div key={q.id} className={`tf-matrix-quadrant quad-${q.id}`}>
            <div className="tf-quadrant-header">
              <div className="tf-quadrant-title-group">
                <span
                  className="tf-quadrant-code"
                  style={{ color: q.color, background: q.badgeBg }}
                >
                  {q.icon} {q.code}
                </span>
                <div>
                  <strong className="tf-quadrant-name">{q.title}</strong>
                  <span className="tf-quadrant-desc">{q.subtitle}</span>
                </div>
              </div>
              <span className="tf-quadrant-count">{q.tasks.length}</span>
            </div>

            <div className="tf-quadrant-body">
              {q.tasks.length === 0 ? (
                <div className="tf-quadrant-empty">
                  <span>No tasks in this quadrant</span>
                </div>
              ) : (
                q.tasks.map((task) => (
                  <div key={task._id} className="tf-matrix-card">
                    <button
                      className={`tf-checkbox ${q.priorityClass}`}
                      onClick={() => onToggleTask(task)}
                      aria-label="Mark complete"
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

                    <div className="tf-matrix-card-content">
                      <span className="tf-matrix-card-title">{task.title}</span>
                      {task.description && (
                        <p className="tf-matrix-card-desc">{task.description}</p>
                      )}
                    </div>

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
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
