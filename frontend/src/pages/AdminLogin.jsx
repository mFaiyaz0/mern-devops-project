import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, logout, loading } = useAuth();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your administrator credentials.");
      return;
    }

    try {
      const loggedUser = await login(email, password);

      if (loggedUser.role === "admin") {
        toast.success(`Welcome to Admin Console, ${loggedUser.name}!`);
        navigate("/admin");
      } else {
        logout();
        setError("Access Denied: You do not have administrator privileges.");
        toast.error("Access Denied: Administrator account required.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Invalid admin email or password.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const fillAdminDemo = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="tf-auth-page">
      <div className="tf-auth-theme-toggle">
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
      </div>

      <div className="tf-auth-box">
        <div className="tf-auth-header">
          <Link to="/" className="tf-auth-brand-center">
            <div className="tf-brand-icon" style={{ background: "var(--primary)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="tf-brand-name">Taskora</span>
            <span className="tf-badge tf-badge-admin" style={{ marginLeft: "4px" }}>Admin Portal</span>
          </Link>
          <h2>Admin Sign In</h2>
          <p>Restricted access for system administrators and managers.</p>
        </div>

        {/* Admin Demo Fast Fill */}
        <div className="tf-demo-badge-wrap">
          <button
            type="button"
            className="tf-demo-chip"
            onClick={fillAdminDemo}
            title="Auto-fill admin demo credentials"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="tf-demo-chip-icon">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
            </svg>
            <span>Auto-fill Admin Credentials</span>
          </button>
        </div>

        {error && (
          <div className="tf-alert tf-alert-danger" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="tf-form-group">
            <label className="tf-label" htmlFor="admin-email">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="tf-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="tf-form-group">
            <label className="tf-label" htmlFor="admin-password">
              Admin Password
            </label>
            <div className="tf-password-wrap">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className="tf-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="tf-pass-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="tf-btn tf-btn-primary tf-btn-block"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Authenticating Admin..." : "Sign in as Administrator"}
          </button>
        </form>

        <p className="tf-auth-footer-text">
          Looking for student login? <Link to="/login">Student / User Sign In</Link>
        </p>
      </div>
    </div>
  );
}
