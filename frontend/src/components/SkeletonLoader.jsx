export function SkeletonCard() {
  return (
    <div className="tf-skeleton tf-skeleton-card">
      <div className="tf-skeleton-line tf-skeleton-title"></div>
      <div className="tf-skeleton-line tf-skeleton-text"></div>
      <div className="tf-skeleton-line tf-skeleton-text short"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="tf-skeleton-table">
      <div className="tf-skeleton-header">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="tf-skeleton-line th-skeleton"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="tf-skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="tf-skeleton-line td-skeleton"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="tf-stats-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="tf-stat-card tf-skeleton-stat">
          <div className="tf-skeleton-line tf-skeleton-label"></div>
          <div className="tf-skeleton-line tf-skeleton-number"></div>
          <div className="tf-skeleton-line tf-skeleton-sub"></div>
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = "card", count = 3 }) {
  if (type === "table") return <SkeletonTable />;
  if (type === "stats") return <SkeletonStats />;

  return (
    <div className="tf-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
