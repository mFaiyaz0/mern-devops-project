export default function KanbanBoard({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenTaskModal,
}) {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const todoTasks = pendingTasks.slice(Math.ceil(pendingTasks.length / 2));
  const inProgressTasks = pendingTasks.slice(0, Math.ceil(pendingTasks.length / 2));

  const columns = [
    {
      id: "todo",
      title: "To Do",
      count: todoTasks.length,
      tasks: todoTasks,
    },
    {
      id: "inprogress",
      title: "In Progress",
      count: inProgressTasks.length,
      tasks: inProgressTasks,
    },
    {
      id: "completed",
      title: "Completed",
      count: completedTasks.length,
      tasks: completedTasks,
    },
  ];

  return (
    <div className="tf-todoist-board">
      {columns.map((col) => (
        <div key={col.id} className="tf-board-column">
          <div className="tf-column-header">
            <strong>{col.title}</strong>
            <span className="tf-column-count">{col.count}</span>
          </div>

          <div className="tf-board-cards">
            {col.tasks.map((task, idx) => {
              const taskP = idx % 4 === 0 ? "p1" : idx % 4 === 1 ? "p2" : idx % 4 === 2 ? "p3" : "p4";

              return (
                <div
                  key={task._id}
                  className={`tf-board-card ${task.completed ? "completed" : ""}`}
                >
                  <div className="tf-card-header">
                    <button
                      className={`tf-checkbox ${task.completed ? "checked" : ""} ${taskP}`}
                      onClick={() => onToggleTask(task)}
                      aria-label="Toggle task"
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

                    <strong>{task.title}</strong>

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

                  {task.description && (
                    <p className="tf-card-desc" style={{ margin: "6px 0 0 26px" }}>
                      {task.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="tf-board-add-btn" onClick={onOpenTaskModal}>
            <span>+</span>
            <span>Add task</span>
          </div>
        </div>
      ))}
    </div>
  );
}
