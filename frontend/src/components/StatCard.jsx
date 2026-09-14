export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = "neutral",
  variant = "default",
  onClick,
}) {
  return (
    <div
      className={`tf-stat-card tf-stat-${variant} ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="tf-stat-top">
        <span className="tf-stat-title">{title}</span>
        {icon && <div className="tf-stat-icon-wrap">{icon}</div>}
      </div>

      <div className="tf-stat-middle">
        <h3 className="tf-stat-value">{value}</h3>
      </div>

      {(subtitle || trend) && (
        <div className="tf-stat-bottom">
          {trend && (
            <span className={`tf-stat-trend trend-${trendType}`}>
              {trendType === "positive" ? "↑" : trendType === "negative" ? "↓" : "•"}{" "}
              {trend}
            </span>
          )}
          {subtitle && <span className="tf-stat-sub">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
