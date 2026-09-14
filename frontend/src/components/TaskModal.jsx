import { useState, useEffect, useCallback } from "react";

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  defaultProject = "General",
  isSubmitting = false,
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [project, setProject] = useState(initialData?.project || defaultProject || "General");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setProject(initialData?.project || defaultProject || "General");
      setError("");
    }
  }, [isOpen, initialData, defaultProject]);

  const handleSubmit = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (!title.trim()) {
        setError("Task title is required");
        return;
      }

      onSubmit({
        title: title.trim(),
        description: description.trim(),
        project,
      });
    },
    [title, description, project, onSubmit]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isOpen) {
        handleSubmit(e);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div className="tf-modal-overlay" onClick={onClose}>
      <div
        className="tf-modal-container tf-task-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className="tf-modal-header">
          <div>
            <span className="tf-eyebrow">
              {initialData ? "TASK DETAILS" : "QUICK CREATE"}
            </span>
            <h3 id="task-modal-title" className="tf-modal-title">
              {initialData ? "Task Overview" : "Create New Task"}
            </h3>
          </div>
          <button
            type="button"
            className="tf-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tf-modal-form">
          {error && <div className="tf-alert tf-alert-danger">{error}</div>}

          <div className="tf-form-group">
            <label htmlFor="task-title" className="tf-label">
              Task Title <span className="tf-required">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="tf-input"
              placeholder="e.g. Implement user dashboard analytics"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              autoFocus
              required
            />
          </div>

          <div className="tf-form-group">
            <label htmlFor="task-project" className="tf-label">
              Smart Workspace / Project
            </label>
            <select
              id="task-project"
              className="tf-input tf-select"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="work">🚀 DevOps & Infrastructure</option>
              <option value="personal">🌱 Personal Habits</option>
              <option value="learning">⚡ Short Tasks (&lt;15m)</option>
              <option value="General">📁 General Tasks</option>
            </select>
          </div>

          <div className="tf-form-group">
            <label htmlFor="task-desc" className="tf-label">
              Description / Notes
            </label>
            <textarea
              id="task-desc"
              className="tf-textarea"
              rows={3}
              placeholder="Provide background context, acceptance criteria, or relevant links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="tf-modal-footer">
            <div className="tf-keyboard-hint">
              <span>Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save</span>
            </div>
            <div className="tf-modal-actions">
              <button
                type="button"
                className="tf-btn tf-btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tf-btn tf-btn-primary"
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="tf-spinner-inline"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>+</span>
                    {initialData ? "Save Changes" : "Create Task"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

