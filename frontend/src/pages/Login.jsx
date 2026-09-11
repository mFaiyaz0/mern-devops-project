import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left side */}

      <div className="auth-hero">

        <div className="auth-brand">
          <div className="brand-icon">✓</div>

          <div>
            <h1>TaskFlow</h1>
            <span>Task Management</span>
          </div>
        </div>

        <div className="hero-content">

          <div className="hero-badge">
            ✦ Smart task management
          </div>

          <h2>
            Turn your plans
            <br />
            into <span>progress.</span>
          </h2>

          <p>
            Organize your work, track your tasks,
            and stay focused on what matters.
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <div>✓</div>
              <span>Organize tasks effortlessly</span>
            </div>

            <div className="feature-item">
              <div>✓</div>
              <span>Track your progress</span>
            </div>

            <div className="feature-item">
              <div>✓</div>
              <span>Stay productive every day</span>
            </div>

          </div>

        </div>

        <div className="hero-decoration decoration-one"></div>
        <div className="hero-decoration decoration-two"></div>

      </div>

      {/* Right side */}

      <div className="auth-form-section">

        <div className="auth-card">

          <div className="mobile-brand">
            <div className="brand-icon">✓</div>
            <h1>TaskFlow</h1>
          </div>

          <div className="auth-heading">

            <p className="eyebrow">
              WELCOME BACK
            </p>

            <h2>Sign in to your account</h2>

            <p>
              Enter your details to continue.
            </p>

          </div>

          {error && (
            <div className="error-message">
              <span>!</span>
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="auth-form"
          >

            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          <div className="auth-divider">
            <span>New to TaskFlow?</span>
          </div>

          <Link
            to="/register"
            className="secondary-auth-button"
          >
            Create an account
          </Link>

          <p className="auth-footer">
            MERN DevOps Project
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;