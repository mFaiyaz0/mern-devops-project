export default function EmptyState({
  title = "No items found",
  description = "Get started by creating your first item.",
  icon,
  actionLabel,
  onAction,
}) {
  return (
    <div className="tf-empty-state">
      <div className="tf-empty-icon-wrapper">
        {icon || (
          <svg className="tf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        )}
      </div>
      <h3 className="tf-empty-title">{title}</h3>
      <p className="tf-empty-desc">{description}</p>
      {actionLabel && onAction && (
        <button className="tf-btn tf-btn-primary tf-empty-action" onClick={onAction}>
          <span className="tf-btn-icon">+</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
